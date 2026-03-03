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
} from 'lucide-react';
import type {
  FormField,
  DataSourceType,
  ApiDataSourceConfig,
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
}

const DS_OPTIONS: { value: DataSourceType; label: string; icon: React.ElementType }[] = [
  { value: 'manual', label: 'Manual', icon: List },
  { value: 'bulk', label: 'Texto masivo', icon: FileText },
  { value: 'api', label: 'API externa', icon: Globe },
  { value: 'database', label: 'Base de datos', icon: Database },
];

export function DataSourceEditor({ field, onUpdate }: DataSourceEditorProps) {
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
        <ApiConfigEditor field={field} onUpdate={onUpdate} />
      )}
      {currentType === 'database' && (
        <DatabaseConfigEditor field={field} onUpdate={onUpdate} />
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
}: {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
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
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [showHeaders, setShowHeaders] = useState(
    () => Object.keys(config.headers ?? {}).length > 0,
  );

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
      const fetchOpts: RequestInit = {
        method: config.method,
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

      const data = config.responsePath
        .split('.')
        .reduce((obj: unknown, key: string) => (obj as Record<string, unknown>)?.[key], json);

      if (Array.isArray(data)) {
        setTestResult({
          ok: true,
          message: 'Conexion exitosa',
          count: data.length,
        });
      } else {
        setTestResult({
          ok: false,
          message: 'La ruta de respuesta no devuelve un array',
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
          placeholder="https://api.ejemplo.com/opciones"
          className="h-8 text-sm font-mono"
        />
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
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
            testResult.ok
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          }`}
        >
          {testResult.ok ? (
            <CheckCircle2 className="size-3.5 shrink-0" />
          ) : (
            <XCircle className="size-3.5 shrink-0" />
          )}
          <span>
            {testResult.message}
            {testResult.count != null && ` (${testResult.count} items)`}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Database Config Editor (Placeholder) ────────────────────────────────────

function DatabaseConfigEditor({
  field,
  onUpdate,
}: {
  field: FormField;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
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
          placeholder="SELECT id, name FROM options WHERE active = true"
          rows={3}
          className="text-xs font-mono opacity-60"
        />
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
