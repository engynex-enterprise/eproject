import { useState, useEffect, useRef, useCallback } from 'react';
import type { ApiDataSourceConfig } from '../types/form-config';

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

const cache = new Map<string, { data: ApiOptionItem[]; timestamp: number }>();

function resolvePath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce(
      (current: unknown, key: string) =>
        (current as Record<string, unknown> | undefined)?.[key],
      obj,
    );
}

export function useApiOptions(
  config: ApiDataSourceConfig | undefined,
  enabled: boolean = true,
): UseApiOptionsResult {
  const [options, setOptions] = useState<ApiOptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchOptions = useCallback(async () => {
    if (!config?.url || !enabled) return;

    const cacheKey = `${config.method}:${config.url}`;
    const ttl = (config.cacheTtl ?? 300) * 1000;
    const cached = cache.get(cacheKey);
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
      const fetchOpts: RequestInit = {
        method: config.method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers ?? {}),
        },
      };
      if (config.method === 'POST' && config.body) {
        fetchOpts.body = config.body;
      }

      const res = await fetch(config.url, fetchOpts);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = resolvePath(json, config.responsePath);

      if (!Array.isArray(data)) {
        throw new Error('La ruta de respuesta no devuelve un array');
      }

      const parsed: ApiOptionItem[] = data.map((item: unknown) => {
        const record = item as Record<string, unknown>;
        return {
          value: String(record[config.valueKey] ?? item),
          label: String(
            record[config.labelKey] ?? record[config.valueKey] ?? item,
          ),
        };
      });

      cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
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
  }, [config?.url, config?.method, config?.responsePath, config?.valueKey, config?.labelKey, config?.cacheTtl, config?.headers, config?.body, enabled]);

  useEffect(() => {
    fetchOptions();
    return () => abortRef.current?.abort();
  }, [fetchOptions]);

  return { options, isLoading, error, refetch: fetchOptions };
}
