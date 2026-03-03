'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Send,
  Ticket,
  AlertTriangle,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type FormConfig,
  type FormField,
  loadFormConfig,
  getDefaultConfig,
} from '../types/form-config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface PublicTicketFormProps {
  orgId: string;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', color: '#4C9AFF' },
  { value: 'medium', label: 'Media', color: '#FFAB00' },
  { value: 'high', label: 'Alta', color: '#FF991F' },
  { value: 'critical', label: 'Critica', color: '#FF5630' },
];

export function PublicTicketForm({ orgId }: PublicTicketFormProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);

  // Load form config from localStorage
  useEffect(() => {
    const config = loadFormConfig(orgId) ?? getDefaultConfig();
    setFormConfig(config);
  }, [orgId]);

  // Dynamic field values (keyed by field.id)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [priority, setPriority] = useState('medium');

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
  };

  const updateFieldValue = (fieldId: string, value: string) => {
    setFieldValues((prev) => {
      const next = { ...prev, [fieldId]: value };
      // Clear dependent children when parent value changes
      if (formConfig) {
        const clearDependents = (parentId: string) => {
          formConfig.fields.forEach((f) => {
            if (f.dependsOn === parentId) {
              next[f.id] = '';
              clearDependents(f.id); // cascade
            }
          });
        };
        clearDependents(fieldId);
      }
      return next;
    });
  };

  const getFieldError = (field: FormField): string => {
    if (field.type === 'heading') return '';
    const value = fieldValues[field.id] ?? '';

    // Skip validation for dependent fields whose parent has no value
    if (field.dependsOn) {
      const parentValue = fieldValues[field.dependsOn] ?? '';
      if (!parentValue) return '';
    }

    if (field.required && !value.trim()) {
      return `${field.label} es requerido`;
    }
    if (field.type === 'email' && value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Ingresa un email valido';
      }
    }
    if (field.type === 'url' && value.trim()) {
      try {
        new URL(value);
      } catch {
        return 'Ingresa una URL valida';
      }
    }
    if (value.trim() && field.min != null) {
      if (field.type === 'number') {
        if (Number(value) < field.min) return `El valor minimo es ${field.min}`;
      } else if (value.length < field.min) {
        return `Minimo ${field.min} caracteres`;
      }
    }
    if (value.trim() && field.max != null) {
      if (field.type === 'number') {
        if (Number(value) > field.max) return `El valor maximo es ${field.max}`;
      } else if (value.length > field.max) {
        return `Maximo ${field.max} caracteres`;
      }
    }
    return '';
  };

  const isValid = formConfig
    ? formConfig.fields.every((f) => !getFieldError(f))
    : false;

  const resetForm = () => {
    setFieldValues({});
    setPriority('medium');
    setTouched({});
    setFormState('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig) return;

    // Mark all required fields as touched
    const allTouched: Record<string, boolean> = {};
    formConfig.fields.forEach((f) => {
      allTouched[f.id] = true;
    });
    setTouched(allTouched);

    if (!isValid) return;

    setFormState('submitting');
    setErrorMessage('');

    // Detect well-known fields by type/label
    const subjectField = formConfig.fields.find(
      (f) => f.type === 'text' && f.label.toLowerCase().includes('asunto'),
    );
    const descriptionField = formConfig.fields.find(
      (f) => f.type === 'textarea',
    );
    const nameField = formConfig.fields.find(
      (f) =>
        f.type === 'text' &&
        (f.label.toLowerCase().includes('nombre') ||
          f.label.toLowerCase().includes('name')),
    );
    const emailField = formConfig.fields.find((f) => f.type === 'email');

    const subject =
      (subjectField ? fieldValues[subjectField.id]?.trim() : '') ||
      'Ticket desde formulario publico';
    const description = descriptionField
      ? fieldValues[descriptionField.id]?.trim()
      : '';
    const contactName = nameField ? fieldValues[nameField.id]?.trim() : '';
    const contactEmail = emailField ? fieldValues[emailField.id]?.trim() : '';

    try {
      const res = await fetch(
        `${API_URL}/organizations/${orgId}/helpdesk/tickets`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            description: description || undefined,
            priority,
            type: 'external',
            contactName: contactName || undefined,
            contactEmail: contactEmail || undefined,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Error al enviar el ticket');
      }

      setFormState('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al enviar el ticket';
      setErrorMessage(message);
      setFormState('error');
    }
  };

  // Loading state
  if (!formConfig) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold">
            {formConfig.successMessage || 'Ticket enviado correctamente'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Hemos recibido tu solicitud. Te contactaremos con actualizaciones.
          </p>
          <Button onClick={resetForm} variant="outline" className="mt-6">
            Enviar otro ticket
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (formState === 'error') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <XCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold">Error al enviar el ticket</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {errorMessage}
          </p>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setFormState('idle')} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
          <Ticket className="size-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{formConfig.title}</CardTitle>
        <CardDescription>{formConfig.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dynamic fields from config */}
          <div className="grid grid-cols-2 gap-4">
            {formConfig.fields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={fieldValues[field.id] ?? ''}
                onChange={(val) => updateFieldValue(field.id, val)}
                onBlur={() => markTouched(field.id)}
                error={touched[field.id] ? getFieldError(field) : ''}
                allFields={formConfig.fields}
                allFieldValues={fieldValues}
              />
            ))}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: opt.color }}
                      />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
            <AlertTriangle className="size-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Tu ticket sera revisado por nuestro equipo de soporte. Recibiras
              actualizaciones en el email proporcionado.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={formState === 'submitting'}
          >
            {formState === 'submitting' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="size-4" />
                {formConfig.submitLabel || 'Enviar ticket'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Dynamic Field Renderer ─────────────────────────────────────────────────

interface DynamicFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error: string;
  allFields: FormField[];
  allFieldValues: Record<string, string>;
}

function DynamicField({
  field,
  value,
  onChange,
  onBlur,
  error,
  allFields,
  allFieldValues,
}: DynamicFieldProps) {
  const wrapperClass =
    field.width === 'half' ? 'col-span-1' : 'col-span-2';

  const label = (
    <Label>
      {field.label}{' '}
      {field.required && <span className="text-destructive">*</span>}
    </Label>
  );

  const helperText = field.helperText ? (
    <p className="text-[11px] text-muted-foreground">{field.helperText}</p>
  ) : null;

  switch (field.type) {
    case 'heading':
      return (
        <div className={`col-span-2 pt-2`}>
          <h3 className="text-base font-semibold">{field.label}</h3>
          {field.headingDescription && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {field.headingDescription}
            </p>
          )}
          <div className="mt-2 border-b" />
        </div>
      );

    case 'textarea':
      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            rows={field.rows ?? 4}
            minLength={field.min}
            maxLength={field.max}
          />
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );

    case 'select': {
      let resolvedOptions: string[] = [];
      let isDisabled = false;
      let disabledMessage = '';

      if (field.dependsOn && field.conditionalOptions) {
        const parentField = allFields.find((f) => f.id === field.dependsOn);
        const parentValue = allFieldValues[field.dependsOn] ?? '';
        if (!parentValue) {
          isDisabled = true;
          disabledMessage = parentField
            ? `Selecciona primero "${parentField.label}"`
            : 'Selecciona el campo padre primero';
        } else {
          resolvedOptions = field.conditionalOptions[parentValue] ?? [];
        }
      } else {
        resolvedOptions = field.options ?? [];
      }

      // Searchable select
      if (field.searchable) {
        return (
          <div className={`space-y-2 ${wrapperClass}`}>
            {label}
            <SearchableSelect
              value={value}
              onValueChange={onChange}
              options={resolvedOptions.map((opt) => ({
                value: opt,
                label: opt,
              }))}
              placeholder={
                isDisabled
                  ? disabledMessage
                  : field.placeholder || 'Selecciona...'
              }
              searchPlaceholder="Buscar..."
              emptyMessage="Sin resultados."
              disabled={isDisabled}
            />
            {helperText}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        );
      }

      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <Select
            value={value}
            onValueChange={onChange}
            disabled={isDisabled}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isDisabled
                    ? disabledMessage
                    : field.placeholder || 'Selecciona...'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {resolvedOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );
    }

    case 'radio':
      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <div className="space-y-2">
            {(field.options ?? []).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  onBlur={onBlur}
                  className="size-4 accent-primary"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className={`space-y-1 ${wrapperClass}`}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => onChange(e.target.checked ? 'true' : '')}
              onBlur={onBlur}
              className="size-4 rounded border accent-primary"
            />
            <Label className="font-normal">{field.label}</Label>
          </div>
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );

    case 'file':
      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <div className="flex items-center justify-center rounded-md border border-dashed bg-muted/30 px-3 py-4 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
            <Paperclip className="size-4 mr-2" />
            {field.multiple ? 'Arrastra archivos aqui' : 'Haz clic o arrastra un archivo'}
          </div>
          {field.accept && (
            <p className="text-[10px] text-muted-foreground">
              Formatos aceptados: {field.accept}
            </p>
          )}
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );

    case 'date':
      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );

    case 'time':
      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <Input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );

    case 'url':
      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <Input
            type="url"
            placeholder={field.placeholder || 'https://...'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={!!error}
          />
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );

    default:
      return (
        <div className={`space-y-2 ${wrapperClass}`}>
          {label}
          <Input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            aria-invalid={!!error}
            minLength={field.min}
            maxLength={field.max}
            min={field.type === 'number' ? field.min : undefined}
            max={field.type === 'number' ? field.max : undefined}
          />
          {helperText}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      );
  }
}
