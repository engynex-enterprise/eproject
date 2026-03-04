import { useState, useEffect, useRef, useCallback } from 'react';
import type { ApiDataSourceConfig, GraphqlDataSourceConfig } from '../types/form-config';

export interface ApiOptionItem {
  value: string;
  label: string;
}

interface UseApiOptionsResult {
  options: ApiOptionItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export type FetchableConfig =
  | { type: 'api'; config: ApiDataSourceConfig }
  | { type: 'graphql'; config: GraphqlDataSourceConfig };

const cache = new Map<string, { data: ApiOptionItem[]; timestamp: number }>();

const PARENT_RE = /\{\{parent\}\}/g;

function resolvePath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce(
      (current: unknown, key: string) =>
        (current as Record<string, unknown> | undefined)?.[key],
      obj,
    );
}

// Replace {{parent}} in URL (URL-encoded) and in body/query/variables/headers (raw)
function replaceTemplateEncoded(str: string, value: string): string {
  return str.replace(PARENT_RE, encodeURIComponent(value));
}

function replaceTemplateRaw(str: string, value: string): string {
  return str.replace(PARENT_RE, value);
}

function replaceHeaders(headers: Record<string, string> | undefined, value: string): Record<string, string> | undefined {
  if (!headers) return headers;
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k, replaceTemplateRaw(v, value)]),
  );
}

function resolveParentInConfig(fc: FetchableConfig, parentValue: string): FetchableConfig {
  if (fc.type === 'api') {
    const c = fc.config;
    return {
      type: 'api',
      config: {
        ...c,
        url: replaceTemplateEncoded(c.url, parentValue),
        body: c.body ? replaceTemplateRaw(c.body, parentValue) : c.body,
        headers: replaceHeaders(c.headers, parentValue),
      },
    };
  }
  const c = fc.config;
  return {
    type: 'graphql',
    config: {
      ...c,
      url: replaceTemplateEncoded(c.url, parentValue),
      query: replaceTemplateRaw(c.query, parentValue),
      variables: c.variables ? replaceTemplateRaw(c.variables, parentValue) : c.variables,
      headers: replaceHeaders(c.headers, parentValue),
    },
  };
}

function configContainsParentTemplate(fc: FetchableConfig): boolean {
  const re = /\{\{parent\}\}/;
  if (fc.type === 'api') {
    const c = fc.config;
    return re.test(c.url) || re.test(c.body ?? '') || Object.values(c.headers ?? {}).some((v) => re.test(v));
  }
  const c = fc.config;
  return re.test(c.url) || re.test(c.query) || re.test(c.variables ?? '') || Object.values(c.headers ?? {}).some((v) => re.test(v));
}

function buildFetchRequest(fc: FetchableConfig): { url: string; init: RequestInit; cacheKey: string; responsePath: string; valueKey: string; labelKey: string; cacheTtl: number } {
  if (fc.type === 'graphql') {
    const c = fc.config;
    const gqlBody: Record<string, unknown> = { query: c.query };
    if (c.variables) {
      try {
        gqlBody.variables = JSON.parse(c.variables);
      } catch {
        // ignore invalid variables JSON
      }
    }
    return {
      url: c.url,
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(c.headers ?? {}),
        },
        body: JSON.stringify(gqlBody),
      },
      cacheKey: `graphql:${c.url}:${c.query}:${c.variables ?? ''}`,
      responsePath: c.responsePath,
      valueKey: c.valueKey,
      labelKey: c.labelKey,
      cacheTtl: c.cacheTtl ?? 300,
    };
  }

  const c = fc.config;
  const init: RequestInit = {
    method: c.method,
    headers: {
      'Content-Type': 'application/json',
      ...(c.headers ?? {}),
    },
  };
  if (c.method === 'POST' && c.body) {
    init.body = c.body;
  }
  return {
    url: c.url,
    init,
    cacheKey: `${c.method}:${c.url}:${c.body ?? ''}`,
    responsePath: c.responsePath,
    valueKey: c.valueKey,
    labelKey: c.labelKey,
    cacheTtl: c.cacheTtl ?? 300,
  };
}

export function useApiOptions(
  fetchable: FetchableConfig | undefined,
  enabled: boolean = true,
  parentValue?: string,
): UseApiOptionsResult {
  const [options, setOptions] = useState<ApiOptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep a ref to fetchable so the callback always sees the latest value
  // without needing the object itself as a dependency (which would cause
  // infinite re-renders since buildFetchableConfig creates a new object each render)
  const fetchableRef = useRef(fetchable);
  fetchableRef.current = fetchable;

  // Stable serialization for deps — only primitives
  const configUrl = fetchable?.config.url;
  const configType = fetchable?.type;
  const responsePath = fetchable?.config.responsePath;
  const valueKey = fetchable?.config.valueKey;
  const labelKey = fetchable?.config.labelKey;
  const cacheTtl = fetchable?.config.cacheTtl;
  const headersJson = JSON.stringify(fetchable?.config.headers ?? null);
  const restBody = fetchable?.type === 'api' ? fetchable.config.body : undefined;
  const gqlQuery = fetchable?.type === 'graphql' ? fetchable.config.query : undefined;
  const gqlVariables = fetchable?.type === 'graphql' ? fetchable.config.variables : undefined;

  const fetchOptions = useCallback(async () => {
    const fc = fetchableRef.current;
    if (!fc || !configUrl || !enabled) return;
    if (fc.type === 'graphql' && !gqlQuery) return;

    // If config uses {{parent}} but no parentValue provided, return empty
    const hasTemplate = configContainsParentTemplate(fc);
    if (hasTemplate && (!parentValue || parentValue.trim() === '')) {
      setOptions([]);
      setError(null);
      return;
    }

    // Resolve {{parent}} template if needed
    const resolved = hasTemplate && parentValue
      ? resolveParentInConfig(fc, parentValue)
      : fc;

    const req = buildFetchRequest(resolved);
    const ttl = req.cacheTtl * 1000;
    const cached = cache.get(req.cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      setOptions(cached.data);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(req.url, { ...req.init, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      // Check for API-level errors (e.g. GraphQL errors)
      const jsonObj = json as Record<string, unknown>;
      if (jsonObj.errors && Array.isArray(jsonObj.errors)) {
        const msgs = (jsonObj.errors as Array<{ message?: string }>)
          .map((e) => e.message ?? 'Error desconocido')
          .join('; ');
        throw new Error(`Error de la API: ${msgs.slice(0, 200)}`);
      }

      const data = resolvePath(json, req.responsePath);

      if (!Array.isArray(data)) {
        if (data && typeof data === 'object') {
          const keys = Object.keys(data as Record<string, unknown>);
          const arrayKeys = keys.filter((k) =>
            Array.isArray((data as Record<string, unknown>)[k]),
          );
          const hint = arrayKeys.length > 0
            ? `Prueba: ${arrayKeys.map((k) => `${req.responsePath}.${k}`).join(', ')}`
            : `Keys: ${keys.slice(0, 5).join(', ')}`;
          throw new Error(`"${req.responsePath}" es un objeto. ${hint}`);
        }
        throw new Error(`"${req.responsePath}" no devuelve un array`);
      }

      const parsed: ApiOptionItem[] = data.map((item: unknown) => {
        const record = item as Record<string, unknown>;
        return {
          value: String(record[req.valueKey] ?? item),
          label: String(
            record[req.labelKey] ?? record[req.valueKey] ?? item,
          ),
        };
      });

      cache.set(req.cacheKey, { data: parsed, timestamp: Date.now() });
      setOptions(parsed);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(
          err instanceof Error ? err.message : 'Error al obtener opciones',
        );
      }
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configUrl, configType, responsePath, valueKey, labelKey, cacheTtl, headersJson, restBody, gqlQuery, gqlVariables, enabled, parentValue]);

  useEffect(() => {
    fetchOptions();
    return () => abortRef.current?.abort();
  }, [fetchOptions]);

  return { options, isLoading, error, refetch: fetchOptions };
}
