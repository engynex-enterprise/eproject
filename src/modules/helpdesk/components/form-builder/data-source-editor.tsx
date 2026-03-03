'use client';

import { useState } from 'react';
import {
  Globe,
  Database,
  List,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Braces,
} from 'lucide-react';
import type {
  FormField,
  DataSourceType,
  ApiDataSourceConfig,
  GraphqlDataSourceConfig,
  DatabaseDataSourceConfig,
} from '../../types/form-config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataSourceEditorProps {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  /** When set, the field depends on a parent — show {{parent}} hints */
  parentFieldLabel?: string;
}

const DS_OPTIONS: { value: DataSourceType; label: string; icon: React.ElementType }[] = [
  { value: 'manual', label: 'Manual', icon: List },
  { value: 'bulk', label: 'Texto masivo', icon: FileText },
  { value: 'api', label: 'API REST', icon: Globe },
  { value: 'graphql', label: 'API GraphQL', icon: Braces },
  { value: 'database', label: 'Base de datos', icon: Database },
];

export function DataSourceEditor({ field, onUpdate, parentFieldLabel }: DataSourceEditorProps) {
  const currentType: DataSourceType = field.dataSource?.type ?? 'manual';

  const handleTypeChange = (newType: DataSourceType) => {
    switch (newType) {
      case 'manual':
        onUpdate(field.id, {
          dataSource: { type: 'manual' },
        });
        break;
      case 'bulk':
        onUpdate(field.id, {
          dataSource: {
            type: 'bulk',
            bulkText: (field.options ?? []).join('\n'),
          },
        });
        break;
      case 'api':
        onUpdate(field.id, {
          dataSource: {
            type: 'api',
            apiConfig: {
              url: '',
              method: 'GET',
              responsePath: 'data',
              valueKey: 'value',
              labelKey: 'label',
              cacheTtl: 300,
            },
          },
          options: undefined,
        });
        break;
      case 'graphql':
        onUpdate(field.id, {
          dataSource: {
            type: 'graphql',
            graphqlConfig: {
              url: '',
              query: '',
              responsePath: 'data',
              valueKey: 'id',
              labelKey: 'name',
              cacheTtl: 300,
            },
          },
          options: undefined,
        });
        break;
      case 'database':
        onUpdate(field.id, {
          dataSource: {
            type: 'database',
            databaseConfig: {
              connectionString: '',
              query: '',
              valueColumn: 'id',
              labelColumn: 'name',
            },
          },
          options: undefined,
        });
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Origen de datos</Label>
        <Select
          value={currentType}
          onValueChange={(v) => handleTypeChange(v as DataSourceType)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-muted-foreground" />
                    {opt.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {currentType === 'bulk' && (
        <BulkTextEditor field={field} onUpdate={onUpdate} />
      )}
      {currentType === 'api' && (
        <ApiConfigEditor field={field} onUpdate={onUpdate} parentFieldLabel={parentFieldLabel} />
      )}
      {currentType === 'graphql' && (
        <GraphqlConfigEditor field={field} onUpdate={onUpdate} parentFieldLabel={parentFieldLabel} />
      )}
      {currentType === 'database' && (
        <DatabaseConfigEditor field={field} onUpdate={onUpdate} parentFieldLabel={parentFieldLabel} />
      )}
    </div>
  );
}

// ─── Bulk Text Editor ────────────────────────────────────────────────────────

function BulkTextEditor({
  field,
  onUpdate,
}: {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}) {
  const bulkText = field.dataSource?.bulkText ?? '';

  const handleChange = (text: string) => {
    const parsed = [...new Set(
      text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    )];

    onUpdate(field.id, {
      dataSource: { ...field.dataSource!, type: 'bulk', bulkText: text },
      options: parsed,
    });
  };

  const count = (field.options ?? []).length;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Pegar opciones (una por linea)</Label>
      <Textarea
        value={bulkText}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={"Opcion 1\nOpcion 2\nOpcion 3"}
        rows={6}
        className="text-xs font-mono"
      />
      {count > 0 && (
        <Badge variant="secondary" className="text-[10px]">
          {count} opciones detectadas
        </Badge>
      )}
    </div>
  );
}

// ─── API Config Editor ───────────────────────────────────────────────────────

function ApiConfigEditor({
  field,
  onUpdate,
  parentFieldLabel,
}: {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  parentFieldLabel?: string;
}) {
  const config: ApiDataSourceConfig = field.dataSource?.apiConfig ?? {
    url: '',
    method: 'GET',
    responsePath: 'data',
    valueKey: 'value',
    labelKey: 'label',
    cacheTtl: 300,
  };

  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    count?: number;
    availableKeys?: string[];
    sample?: { value: string; label: string }[];
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [showHeaders, setShowHeaders] = useState(
    () => Object.keys(config.headers ?? {}).length > 0,
  );
  const [testParentValue, setTestParentValue] = useState('');

  const updateConfig = (patch: Partial<ApiDataSourceConfig>) => {
    onUpdate(field.id, {
      dataSource: {
        ...field.dataSource!,
        type: 'api',
        apiConfig: { ...config, ...patch },
      },
    });
  };

  const handleTest = async () => {
    if (!config.url) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Resolve {{parent}} with test value if provided
      const pv = testParentValue.trim();
      const resolveUrl = (s: string) => pv ? s.replace(/\{\{parent\}\}/g, encodeURIComponent(pv)) : s;
      const resolveRaw = (s: string) => pv ? s.replace(/\{\{parent\}\}/g, pv) : s;

      const resolvedUrl = resolveUrl(config.url);
      const resolvedBody = config.body ? resolveRaw(config.body) : config.body;
      const resolvedHeaders = config.headers
        ? Object.fromEntries(Object.entries(config.headers).map(([k, v]) => [k, resolveRaw(v)]))
        : config.headers;

      const fetchOpts: RequestInit = {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...(resolvedHeaders ?? {}),
        },
      };
      if (config.method === 'POST' && resolvedBody) {
        fetchOpts.body = resolvedBody;
      }
      const res = await fetch(resolvedUrl, fetchOpts);
      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${errorBody ? `: ${errorBody.slice(0, 200)}` : ''}`);
      }
      const json = await res.json();

      // Check for API-level errors (e.g. GraphQL errors)
      const jsonObj = json as Record<string, unknown>;
      if (jsonObj.errors && Array.isArray(jsonObj.errors)) {
        const msgs = (jsonObj.errors as Array<{ message?: string }>)
          .map((e) => e.message ?? 'Error desconocido')
          .join('; ');
        setTestResult({
          ok: false,
          message: `Error de la API: ${msgs.slice(0, 300)}`,
        });
        setTesting(false);
        return;
      }

      const data = config.responsePath
        .split('.')
        .reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], json);

      if (Array.isArray(data)) {
        const firstItem = data[0] as Record<string, unknown> | undefined;
        const availableKeys = firstItem && typeof firstItem === 'object'
          ? Object.keys(firstItem)
          : undefined;

        const sample = data.slice(0, 5).map((item: unknown) => {
          const rec = item as Record<string, unknown>;
          return {
            value: String(rec[config.valueKey] ?? item),
            label: String(rec[config.labelKey] ?? rec[config.valueKey] ?? item),
          };
        });

        const valueExists = availableKeys ? availableKeys.includes(config.valueKey) : true;
        const labelExists = availableKeys ? availableKeys.includes(config.labelKey) : true;

        setTestResult({
          ok: true,
          message: valueExists && labelExists
            ? 'Conexion exitosa'
            : `Conexion exitosa — ${!valueExists ? `"${config.valueKey}" no encontrado` : ''}${!valueExists && !labelExists ? ', ' : ''}${!labelExists ? `"${config.labelKey}" no encontrado` : ''}`,
          count: data.length,
          availableKeys,
          sample,
        });
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data as Record<string, unknown>);
        const arrayKeys = keys.filter((k) =>
          Array.isArray((data as Record<string, unknown>)[k]),
        );
        const suggestion = arrayKeys.length > 0
          ? `Prueba: ${arrayKeys.map((k) => `${config.responsePath}.${k}`).join(', ')}`
          : `Keys disponibles: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`;
        setTestResult({
          ok: false,
          message: `La ruta "${config.responsePath}" devuelve un objeto, no un array. ${suggestion}`,
        });
      } else if (data === undefined) {
        const topKeys = Object.keys(jsonObj);
        setTestResult({
          ok: false,
          message: `La ruta "${config.responsePath}" no existe en la respuesta. Keys raiz: ${topKeys.slice(0, 5).join(', ')}${topKeys.length > 5 ? '...' : ''}`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `La ruta "${config.responsePath}" devuelve ${typeof data}, se esperaba un array`,
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Error al conectar',
      });
    }
    setTesting(false);
  };

  // Headers management
  const headers = config.headers ?? {};
  const headerEntries = Object.entries(headers);

  const addHeader = () => {
    updateConfig({
      headers: { ...headers, '': '' },
    });
  };

  const updateHeader = (
    oldKey: string,
    newKey: string,
    newValue: string,
  ) => {
    const next = { ...headers };
    if (oldKey !== newKey) delete next[oldKey];
    next[newKey] = newValue;
    updateConfig({ headers: next });
  };

  const removeHeader = (key: string) => {
    const next = { ...headers };
    delete next[key];
    updateConfig({ headers: next });
  };

  return (
    <div className="space-y-3">
      {/* URL */}
      <div className="space-y-1.5">
        <Label className="text-xs">URL del endpoint</Label>
        <Input
          value={config.url}
          onChange={(e) => updateConfig({ url: e.target.value })}
          placeholder={parentFieldLabel ? 'https://api.com/items?parent={{parent}}' : 'https://api.ejemplo.com/opciones'}
          className="h-8 text-sm font-mono"
        />
        {parentFieldLabel && (
          <p className="text-[10px] text-blue-600 dark:text-blue-400">
            Usa <code className="font-mono bg-blue-50 dark:bg-blue-900/40 px-1 rounded">{'{{parent}}'}</code> para
            insertar el valor de &quot;{parentFieldLabel}&quot;
          </p>
        )}
      </div>

      {/* Method */}
      <div className="space-y-1.5">
        <Label className="text-xs">Metodo HTTP</Label>
        <Select
          value={config.method}
          onValueChange={(v) => updateConfig({ method: v as 'GET' | 'POST' })}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body (POST only) */}
      {config.method === 'POST' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Body (JSON)</Label>
          <Textarea
            value={config.body ?? ''}
            onChange={(e) => updateConfig({ body: e.target.value })}
            placeholder='{"filtro": "activos"}'
            rows={3}
            className="text-xs font-mono"
          />
        </div>
      )}

      <Separator />

      {/* Response mapping */}
      <div className="space-y-1.5">
        <Label className="text-xs">Ruta de respuesta</Label>
        <Input
          value={config.responsePath}
          onChange={(e) => updateConfig({ responsePath: e.target.value })}
          placeholder="data.items"
          className="h-8 text-sm font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          Ruta al array en el JSON (notacion con punto)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Key del valor</Label>
          <Input
            value={config.valueKey}
            onChange={(e) => updateConfig({ valueKey: e.target.value })}
            placeholder="value"
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Key de la etiqueta</Label>
          <Input
            value={config.labelKey}
            onChange={(e) => updateConfig({ labelKey: e.target.value })}
            placeholder="label"
            className="h-8 text-sm font-mono"
          />
        </div>
      </div>

      {/* Cache */}
      <div className="space-y-1.5">
        <Label className="text-xs">Cache (segundos)</Label>
        <Input
          type="number"
          value={config.cacheTtl ?? 300}
          onChange={(e) =>
            updateConfig({
              cacheTtl: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="300"
          className="h-8 text-sm"
          min={0}
        />
      </div>

      {/* Headers (collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowHeaders(!showHeaders)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showHeaders ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
          Headers personalizados
          {headerEntries.length > 0 && (
            <Badge variant="secondary" className="text-[9px]">
              {headerEntries.length}
            </Badge>
          )}
        </button>

        {showHeaders && (
          <div className="mt-2 space-y-1.5">
            {headerEntries.map(([key, val], i) => (
              <div key={i} className="flex items-center gap-1">
                <Input
                  value={key}
                  onChange={(e) => updateHeader(key, e.target.value, val)}
                  placeholder="Key"
                  className="h-6 text-[11px] flex-1 font-mono"
                />
                <Input
                  value={val}
                  onChange={(e) => updateHeader(key, key, e.target.value)}
                  placeholder="Value"
                  className="h-6 text-[11px] flex-1 font-mono"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(key)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[11px] gap-1"
              onClick={addHeader}
            >
              <Plus className="size-3" />
              Agregar header
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Test parent value input */}
      {parentFieldLabel && (
        <div className="space-y-1.5">
          <Label className="text-xs">Valor de prueba para &quot;{parentFieldLabel}&quot;</Label>
          <Input
            value={testParentValue}
            onChange={(e) => setTestParentValue(e.target.value)}
            placeholder="Ej: España, US, 123..."
            className="h-7 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Se usara en lugar de {'{{parent}}'} al probar la conexion
          </p>
        </div>
      )}

      {/* Test button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={handleTest}
        disabled={testing || !config.url}
      >
        {testing ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Globe className="size-3.5" />
        )}
        Probar conexion
      </Button>

      {/* Test result */}
      {testResult && (
        <div className="space-y-2">
          <div
            className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
              testResult.ok
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="size-3.5 shrink-0 mt-0.5" />
            )}
            <span>
              {testResult.message}
              {testResult.count != null && ` (${testResult.count} items)`}
            </span>
          </div>

          {/* Available keys hint */}
          {testResult.ok && testResult.availableKeys && (
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-[10px] text-muted-foreground mb-1.5">
                Keys disponibles en cada item:
              </p>
              <div className="flex flex-wrap gap-1">
                {testResult.availableKeys.map((k) => (
                  <Badge
                    key={k}
                    variant={
                      k === config.valueKey || k === config.labelKey
                        ? 'default'
                        : 'outline'
                    }
                    className="text-[10px] font-mono cursor-pointer"
                    onClick={() => {
                      // Click to copy key name
                      navigator.clipboard.writeText(k).catch(() => {});
                    }}
                  >
                    {k}
                    {k === config.valueKey && ' (valor)'}
                    {k === config.labelKey && ' (etiqueta)'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sample preview */}
          {testResult.ok && testResult.sample && testResult.sample.length > 0 && (
            <div className="rounded-md border overflow-hidden">
              <div className="bg-muted/50 px-3 py-1.5 border-b">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Vista previa del mapeo
                </p>
              </div>
              <div className="divide-y">
                {testResult.sample.map((item, i) => (
                  <div key={i} className="flex items-center px-3 py-1.5 text-[11px] gap-2">
                    <span className="text-muted-foreground font-mono shrink-0 min-w-0 truncate max-w-[80px]" title={item.value}>
                      {item.value}
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
              {(testResult.count ?? 0) > 5 && (
                <div className="px-3 py-1 border-t bg-muted/30 text-[10px] text-muted-foreground">
                  +{(testResult.count ?? 0) - 5} items mas
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GraphQL Config Editor ───────────────────────────────────────────────────

function GraphqlConfigEditor({
  field,
  onUpdate,
  parentFieldLabel,
}: {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  parentFieldLabel?: string;
}) {
  const config: GraphqlDataSourceConfig = field.dataSource?.graphqlConfig ?? {
    url: '',
    query: '',
    responsePath: 'data',
    valueKey: 'id',
    labelKey: 'name',
    cacheTtl: 300,
  };

  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    count?: number;
    availableKeys?: string[];
    sample?: { value: string; label: string }[];
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [showHeaders, setShowHeaders] = useState(
    () => Object.keys(config.headers ?? {}).length > 0,
  );
  const [showVariables, setShowVariables] = useState(
    () => !!config.variables,
  );
  const [testParentValue, setTestParentValue] = useState('');

  const updateConfig = (patch: Partial<GraphqlDataSourceConfig>) => {
    onUpdate(field.id, {
      dataSource: {
        ...field.dataSource!,
        type: 'graphql',
        graphqlConfig: { ...config, ...patch },
      },
    });
  };

  const handleTest = async () => {
    if (!config.url || !config.query) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Resolve {{parent}} with test value if provided
      const pv = testParentValue.trim();
      const resolveRaw = (s: string) => pv ? s.replace(/\{\{parent\}\}/g, pv) : s;
      const resolveUrl = (s: string) => pv ? s.replace(/\{\{parent\}\}/g, encodeURIComponent(pv)) : s;

      const resolvedQuery = resolveRaw(config.query);
      const resolvedVariables = config.variables ? resolveRaw(config.variables) : config.variables;
      const resolvedHeaders = config.headers
        ? Object.fromEntries(Object.entries(config.headers).map(([k, v]) => [k, resolveRaw(v)]))
        : config.headers;

      // Build the GraphQL JSON body automatically
      const gqlBody: Record<string, unknown> = { query: resolvedQuery };
      if (resolvedVariables) {
        try {
          gqlBody.variables = JSON.parse(resolvedVariables);
        } catch {
          setTestResult({
            ok: false,
            message: 'Las variables no son JSON valido',
          });
          setTesting(false);
          return;
        }
      }

      const res = await fetch(resolveUrl(config.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(resolvedHeaders ?? {}),
        },
        body: JSON.stringify(gqlBody),
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${errorBody ? `: ${errorBody.slice(0, 200)}` : ''}`);
      }

      const json = await res.json();
      const jsonObj = json as Record<string, unknown>;

      // Check for GraphQL errors
      if (jsonObj.errors && Array.isArray(jsonObj.errors)) {
        const msgs = (jsonObj.errors as Array<{ message?: string }>)
          .map((e) => e.message ?? 'Error desconocido')
          .join('; ');
        setTestResult({
          ok: false,
          message: `Error GraphQL: ${msgs.slice(0, 300)}`,
        });
        setTesting(false);
        return;
      }

      const data = config.responsePath
        .split('.')
        .reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], json);

      if (Array.isArray(data)) {
        const firstItem = data[0] as Record<string, unknown> | undefined;
        const availableKeys = firstItem && typeof firstItem === 'object'
          ? Object.keys(firstItem)
          : undefined;

        const sample = data.slice(0, 5).map((item: unknown) => {
          const rec = item as Record<string, unknown>;
          return {
            value: String(rec[config.valueKey] ?? item),
            label: String(rec[config.labelKey] ?? rec[config.valueKey] ?? item),
          };
        });

        const valueExists = availableKeys ? availableKeys.includes(config.valueKey) : true;
        const labelExists = availableKeys ? availableKeys.includes(config.labelKey) : true;

        setTestResult({
          ok: true,
          message: valueExists && labelExists
            ? 'Conexion exitosa'
            : `Conexion exitosa — ${!valueExists ? `"${config.valueKey}" no encontrado` : ''}${!valueExists && !labelExists ? ', ' : ''}${!labelExists ? `"${config.labelKey}" no encontrado` : ''}`,
          count: data.length,
          availableKeys,
          sample,
        });
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data as Record<string, unknown>);
        const arrayKeys = keys.filter((k) =>
          Array.isArray((data as Record<string, unknown>)[k]),
        );
        const suggestion = arrayKeys.length > 0
          ? `Prueba: ${arrayKeys.map((k) => `${config.responsePath}.${k}`).join(', ')}`
          : `Keys disponibles: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`;
        setTestResult({
          ok: false,
          message: `La ruta "${config.responsePath}" devuelve un objeto, no un array. ${suggestion}`,
        });
      } else if (data === undefined) {
        const topKeys = Object.keys(jsonObj);
        setTestResult({
          ok: false,
          message: `La ruta "${config.responsePath}" no existe en la respuesta. Keys raiz: ${topKeys.slice(0, 5).join(', ')}${topKeys.length > 5 ? '...' : ''}`,
        });
      } else {
        setTestResult({
          ok: false,
          message: `La ruta "${config.responsePath}" devuelve ${typeof data}, se esperaba un array`,
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Error al conectar',
      });
    }
    setTesting(false);
  };

  // Headers management
  const headers = config.headers ?? {};
  const headerEntries = Object.entries(headers);

  const addHeader = () => {
    updateConfig({ headers: { ...headers, '': '' } });
  };

  const updateHeader = (oldKey: string, newKey: string, newValue: string) => {
    const next = { ...headers };
    if (oldKey !== newKey) delete next[oldKey];
    next[newKey] = newValue;
    updateConfig({ headers: next });
  };

  const removeHeader = (key: string) => {
    const next = { ...headers };
    delete next[key];
    updateConfig({ headers: next });
  };

  return (
    <div className="space-y-3">
      {/* Endpoint URL */}
      <div className="space-y-1.5">
        <Label className="text-xs">URL del endpoint GraphQL</Label>
        <Input
          value={config.url}
          onChange={(e) => updateConfig({ url: e.target.value })}
          placeholder="https://api.ejemplo.com/graphql"
          className="h-8 text-sm font-mono"
        />
      </div>

      {/* GraphQL Query */}
      <div className="space-y-1.5">
        <Label className="text-xs">Query GraphQL</Label>
        <Textarea
          value={config.query}
          onChange={(e) => updateConfig({ query: e.target.value })}
          placeholder={'query {\n  users {\n    id\n    name\n  }\n}'}
          rows={5}
          className="text-xs font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          Se enviara automaticamente como JSON: {'{"query": "...", "variables": {...}'}
        </p>
        {parentFieldLabel && (
          <p className="text-[10px] text-blue-600 dark:text-blue-400">
            Usa <code className="font-mono bg-blue-50 dark:bg-blue-900/40 px-1 rounded">{'{{parent}}'}</code> en
            la query o en variables para filtrar por &quot;{parentFieldLabel}&quot;
          </p>
        )}
      </div>

      {/* Variables (collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowVariables(!showVariables)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showVariables ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
          Variables (opcional)
        </button>

        {showVariables && (
          <div className="mt-2 space-y-1.5">
            <Textarea
              value={config.variables ?? ''}
              onChange={(e) => updateConfig({ variables: e.target.value || undefined })}
              placeholder={'{"limit": 100, "active": true}'}
              rows={3}
              className="text-xs font-mono"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Response mapping */}
      <div className="space-y-1.5">
        <Label className="text-xs">Ruta de respuesta</Label>
        <Input
          value={config.responsePath}
          onChange={(e) => updateConfig({ responsePath: e.target.value })}
          placeholder="data.users"
          className="h-8 text-sm font-mono"
        />
        <p className="text-[10px] text-muted-foreground">
          Ruta al array en el JSON (ej: data.nombre_tabla)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Key del valor</Label>
          <Input
            value={config.valueKey}
            onChange={(e) => updateConfig({ valueKey: e.target.value })}
            placeholder="id"
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Key de la etiqueta</Label>
          <Input
            value={config.labelKey}
            onChange={(e) => updateConfig({ labelKey: e.target.value })}
            placeholder="name"
            className="h-8 text-sm font-mono"
          />
        </div>
      </div>

      {/* Cache */}
      <div className="space-y-1.5">
        <Label className="text-xs">Cache (segundos)</Label>
        <Input
          type="number"
          value={config.cacheTtl ?? 300}
          onChange={(e) =>
            updateConfig({
              cacheTtl: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="300"
          className="h-8 text-sm"
          min={0}
        />
      </div>

      {/* Headers (collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowHeaders(!showHeaders)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showHeaders ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
          Headers personalizados
          {headerEntries.length > 0 && (
            <Badge variant="secondary" className="text-[9px]">
              {headerEntries.length}
            </Badge>
          )}
        </button>

        {showHeaders && (
          <div className="mt-2 space-y-1.5">
            {headerEntries.map(([key, val], i) => (
              <div key={i} className="flex items-center gap-1">
                <Input
                  value={key}
                  onChange={(e) => updateHeader(key, e.target.value, val)}
                  placeholder="Key"
                  className="h-6 text-[11px] flex-1 font-mono"
                />
                <Input
                  value={val}
                  onChange={(e) => updateHeader(key, key, e.target.value)}
                  placeholder="Value"
                  className="h-6 text-[11px] flex-1 font-mono"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(key)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-[11px] gap-1"
              onClick={addHeader}
            >
              <Plus className="size-3" />
              Agregar header
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Test parent value input */}
      {parentFieldLabel && (
        <div className="space-y-1.5">
          <Label className="text-xs">Valor de prueba para &quot;{parentFieldLabel}&quot;</Label>
          <Input
            value={testParentValue}
            onChange={(e) => setTestParentValue(e.target.value)}
            placeholder="Ej: España, US, 123..."
            className="h-7 text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Se usara en lugar de {'{{parent}}'} al probar la conexion
          </p>
        </div>
      )}

      {/* Test button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={handleTest}
        disabled={testing || !config.url || !config.query}
      >
        {testing ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Braces className="size-3.5" />
        )}
        Probar conexion
      </Button>

      {/* Test result */}
      {testResult && (
        <div className="space-y-2">
          <div
            className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
              testResult.ok
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="size-3.5 shrink-0 mt-0.5" />
            )}
            <span>
              {testResult.message}
              {testResult.count != null && ` (${testResult.count} items)`}
            </span>
          </div>

          {/* Available keys hint */}
          {testResult.ok && testResult.availableKeys && (
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-[10px] text-muted-foreground mb-1.5">
                Keys disponibles en cada item:
              </p>
              <div className="flex flex-wrap gap-1">
                {testResult.availableKeys.map((k) => (
                  <Badge
                    key={k}
                    variant={
                      k === config.valueKey || k === config.labelKey
                        ? 'default'
                        : 'outline'
                    }
                    className="text-[10px] font-mono cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(k).catch(() => {});
                    }}
                  >
                    {k}
                    {k === config.valueKey && ' (valor)'}
                    {k === config.labelKey && ' (etiqueta)'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sample preview */}
          {testResult.ok && testResult.sample && testResult.sample.length > 0 && (
            <div className="rounded-md border overflow-hidden">
              <div className="bg-muted/50 px-3 py-1.5 border-b">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Vista previa del mapeo
                </p>
              </div>
              <div className="divide-y">
                {testResult.sample.map((item, i) => (
                  <div key={i} className="flex items-center px-3 py-1.5 text-[11px] gap-2">
                    <span className="text-muted-foreground font-mono shrink-0 min-w-0 truncate max-w-[80px]" title={item.value}>
                      {item.value}
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
              {(testResult.count ?? 0) > 5 && (
                <div className="px-3 py-1 border-t bg-muted/30 text-[10px] text-muted-foreground">
                  +{(testResult.count ?? 0) - 5} items mas
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Database Config Editor (Placeholder) ────────────────────────────────────

function DatabaseConfigEditor({
  field,
  onUpdate,
  parentFieldLabel,
}: {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  parentFieldLabel?: string;
}) {
  const config: DatabaseDataSourceConfig = field.dataSource?.databaseConfig ?? {
    connectionString: '',
    query: '',
    valueColumn: 'id',
    labelColumn: 'name',
  };

  const updateConfig = (patch: Partial<DatabaseDataSourceConfig>) => {
    onUpdate(field.id, {
      dataSource: {
        ...field.dataSource!,
        type: 'database',
        databaseConfig: { ...config, ...patch },
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Coming soon banner */}
      <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 px-3 py-2.5">
        <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Proximamente
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            La conexion a base de datos estara disponible pronto. La configuracion se guardara para uso futuro.
          </p>
        </div>
      </div>

      {/* Connection string */}
      <div className="space-y-1.5">
        <Label className="text-xs">Cadena de conexion</Label>
        <Input
          value={config.connectionString}
          onChange={(e) => updateConfig({ connectionString: e.target.value })}
          placeholder="postgresql://user:pass@host:5432/db"
          className="h-8 text-sm font-mono opacity-60"
        />
      </div>

      {/* Query */}
      <div className="space-y-1.5">
        <Label className="text-xs">Consulta SQL</Label>
        <Textarea
          value={config.query}
          onChange={(e) => updateConfig({ query: e.target.value })}
          placeholder={parentFieldLabel
            ? "SELECT id, name FROM cities WHERE country_id = '{{parent}}'"
            : "SELECT id, name FROM options WHERE active = true"
          }
          rows={3}
          className="text-xs font-mono opacity-60"
        />
        {parentFieldLabel && (
          <p className="text-[10px] text-blue-600 dark:text-blue-400">
            Usa <code className="font-mono bg-blue-50 dark:bg-blue-900/40 px-1 rounded">{'{{parent}}'}</code> en
            la consulta SQL para filtrar por &quot;{parentFieldLabel}&quot;
          </p>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Columna valor</Label>
          <Input
            value={config.valueColumn}
            onChange={(e) => updateConfig({ valueColumn: e.target.value })}
            placeholder="id"
            className="h-8 text-sm font-mono opacity-60"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Columna etiqueta</Label>
          <Input
            value={config.labelColumn}
            onChange={(e) => updateConfig({ labelColumn: e.target.value })}
            placeholder="name"
            className="h-8 text-sm font-mono opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
