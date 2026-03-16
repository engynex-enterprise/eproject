'use client';

import { useState } from 'react';
import {
  Settings2,
  Plus,
  X,
  GripVertical,
  Link2,
  ChevronDown,
  ChevronRight,
  Search,
  HelpCircle,
  FileText,
  Info,
} from 'lucide-react';
import type { FormField, FieldWidth, VisibilityOperator } from '../../types/form-config';
import { WIDTH_LABELS } from '../../types/form-config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DataSourceEditor } from './data-source-editor';

interface FieldConfigPanelProps {
  field: FormField | null;
  allFields: FormField[];
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}

export function FieldConfigPanel({ field, allFields, onUpdate }: FieldConfigPanelProps) {
  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
          <Settings2 className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Selecciona un campo
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Haz clic en un campo del formulario para editar sus propiedades
        </p>
      </div>
    );
  }

  // Other select fields that can be used as parent (exclude self and fields that depend on this one)
  const availableParents = allFields.filter(
    (f) => f.type === 'select' && f.id !== field.id && f.dependsOn !== field.id,
  );

  const parentField = field.dependsOn
    ? allFields.find((f) => f.id === field.dependsOn)
    : null;

  const isInputType = ['text', 'email', 'phone', 'url'].includes(field.type);
  const hasPlaceholder = !['checkbox', 'file', 'heading', 'radio', 'divider', 'hidden', 'rating'].includes(field.type);
  const hasOptions = field.type === 'select' || field.type === 'radio';
  const isLayoutOnly = field.type === 'heading' || field.type === 'divider';
  const hasDefaultValue = !['heading', 'divider', 'file'].includes(field.type);
  const hasPatternValidation = ['text', 'email', 'phone', 'url', 'textarea'].includes(field.type);

  // Fields that can be used as visibility conditions (all before current, except divider/heading)
  const availableConditionFields = allFields.filter(
    (f) => f.id !== field.id && !['divider', 'heading'].includes(f.type),
  );
  const conditionField = field.visibilityCondition
    ? allFields.find((f) => f.id === field.visibilityCondition!.fieldId)
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Propiedades del campo
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Configura el campo seleccionado
        </p>
      </div>

      <div className="space-y-4">
        {/* Label */}
        <div className="space-y-1.5">
          <Label className="text-xs">Etiqueta</Label>
          <Input
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            placeholder="Etiqueta del campo"
            className="h-8 text-sm"
          />
        </div>

        {/* Heading description */}
        {field.type === 'heading' && (
          <div className="space-y-1.5">
            <Label className="text-xs">Descripcion del encabezado</Label>
            <Input
              value={field.headingDescription ?? ''}
              onChange={(e) =>
                onUpdate(field.id, { headingDescription: e.target.value })
              }
              placeholder="Texto descriptivo opcional..."
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Placeholder */}
        {hasPlaceholder && (
          <div className="space-y-1.5">
            <Label className="text-xs">Placeholder</Label>
            <Input
              value={field.placeholder ?? ''}
              onChange={(e) =>
                onUpdate(field.id, { placeholder: e.target.value })
              }
              placeholder="Texto de ayuda..."
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Helper text (all except heading) */}
        {field.type !== 'heading' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="size-3 text-muted-foreground" />
              <Label className="text-xs">Texto de ayuda</Label>
            </div>
            <Input
              value={field.helperText ?? ''}
              onChange={(e) =>
                onUpdate(field.id, { helperText: e.target.value })
              }
              placeholder="Texto que aparece debajo del campo..."
              className="h-8 text-sm"
            />
          </div>
        )}

        <Separator />

        {/* Required toggle (not for heading) */}
        {field.type !== 'heading' && (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs">Requerido</Label>
              <p className="text-[11px] text-muted-foreground">
                El usuario debe completar este campo
              </p>
            </div>
            <Switch
              checked={field.required}
              onCheckedChange={(checked) =>
                onUpdate(field.id, { required: checked })
              }
            />
          </div>
        )}

        {/* Width */}
        <div className="space-y-1.5">
          <Label className="text-xs">Ancho</Label>
          <Select
            value={field.width}
            onValueChange={(value: string) =>
              onUpdate(field.id, { width: value as FieldWidth })
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(WIDTH_LABELS) as [FieldWidth, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Default value */}
        {hasDefaultValue && (
          <div className="space-y-1.5">
            <Label className="text-xs">Valor por defecto</Label>
            <Input
              value={field.defaultValue ?? ''}
              onChange={(e) =>
                onUpdate(field.id, { defaultValue: e.target.value || undefined })
              }
              placeholder="Valor inicial del campo..."
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* ── Text/email/phone/url specific ── */}
        {isInputType && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Min. caracteres</Label>
                <Input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) =>
                    onUpdate(field.id, {
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  className="h-8 text-sm"
                  min={0}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max. caracteres</Label>
                <Input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) =>
                    onUpdate(field.id, {
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Sin limite"
                  className="h-8 text-sm"
                  min={0}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Number specific ── */}
        {field.type === 'number' && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Valor minimo</Label>
                <Input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) =>
                    onUpdate(field.id, {
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Sin limite"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Valor maximo</Label>
                <Input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) =>
                    onUpdate(field.id, {
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Sin limite"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* ── Textarea specific ── */}
        {field.type === 'textarea' && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs">Filas</Label>
              <Input
                type="number"
                value={field.rows ?? 4}
                onChange={(e) =>
                  onUpdate(field.id, {
                    rows: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="4"
                className="h-8 text-sm"
                min={2}
                max={20}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Min. caracteres</Label>
                <Input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) =>
                    onUpdate(field.id, {
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  className="h-8 text-sm"
                  min={0}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max. caracteres</Label>
                <Input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) =>
                    onUpdate(field.id, {
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Sin limite"
                  className="h-8 text-sm"
                  min={0}
                />
              </div>
            </div>
          </>
        )}

        {/* ── File specific ── */}
        {field.type === 'file' && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <FileText className="size-3 text-muted-foreground" />
                <Label className="text-xs">Tipos de archivo</Label>
              </div>
              <Input
                value={field.accept ?? ''}
                onChange={(e) =>
                  onUpdate(field.id, { accept: e.target.value || undefined })
                }
                placeholder=".pdf,.jpg,.png"
                className="h-8 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Extensiones separadas por coma
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs">Multiples archivos</Label>
                <p className="text-[11px] text-muted-foreground">
                  Permitir subir varios archivos
                </p>
              </div>
              <Switch
                checked={field.multiple ?? false}
                onCheckedChange={(checked) =>
                  onUpdate(field.id, { multiple: checked })
                }
              />
            </div>
          </>
        )}

        {/* ── Rating specific ── */}
        {field.type === 'rating' && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs">Estrellas maximas</Label>
              <Input
                type="number"
                value={field.ratingMax ?? 5}
                onChange={(e) =>
                  onUpdate(field.id, {
                    ratingMax: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="5"
                className="h-8 text-sm"
                min={3}
                max={10}
              />
            </div>
          </>
        )}

        {/* ── Pattern validation ── */}
        {hasPatternValidation && (
          <>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs">Patron (regex)</Label>
              <Input
                value={field.pattern ?? ''}
                onChange={(e) =>
                  onUpdate(field.id, { pattern: e.target.value || undefined })
                }
                placeholder="^[A-Z]{3}-\d+$"
                className="h-8 text-sm font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Expresion regular para validar el valor
              </p>
            </div>
            {field.pattern && (
              <div className="space-y-1.5">
                <Label className="text-xs">Mensaje de error</Label>
                <Input
                  value={field.patternMessage ?? ''}
                  onChange={(e) =>
                    onUpdate(field.id, { patternMessage: e.target.value || undefined })
                  }
                  placeholder="Formato invalido"
                  className="h-8 text-sm"
                />
              </div>
            )}
          </>
        )}

        {/* ── Select / Radio: Searchable toggle (select only) ── */}
        {field.type === 'select' && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Search className="size-3.5 text-muted-foreground" />
                <div>
                  <Label className="text-xs">Buscador</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Permite buscar entre las opciones
                  </p>
                </div>
              </div>
              <Switch
                checked={field.searchable ?? false}
                onCheckedChange={(checked) =>
                  onUpdate(field.id, { searchable: checked })
                }
              />
            </div>
          </>
        )}

        {/* Data source + options for select/radio */}
        {hasOptions && (
          <>
            <Separator />
            <DataSourceEditor
              field={field}
              onUpdate={onUpdate}
              parentFieldLabel={field.dependsOn ? (parentField?.label ?? 'campo padre') : undefined}
            />

            {/* Manual OptionsEditor only when data source is manual/absent AND not dependent */}
            {(!field.dataSource || field.dataSource.type === 'manual') && !field.dependsOn && (
              <OptionsEditor
                options={field.options ?? []}
                onChange={(options) => onUpdate(field.id, { options })}
              />
            )}
          </>
        )}

        {/* Dependency config for select fields */}
        {field.type === 'select' && (
          <>
            <Separator />
            <DependencyConfig
              field={field}
              availableParents={availableParents}
              parentField={parentField ?? null}
              onUpdate={onUpdate}
            />
          </>
        )}

        {/* ── Visibility condition ── */}
        {!isLayoutOnly && (
          <>
            <Separator />
            <VisibilityConditionEditor
              field={field}
              availableFields={availableConditionFields}
              conditionField={conditionField ?? null}
              onUpdate={onUpdate}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Dependency Configuration ───────────────────────────────────────────────

function DependencyConfig({
  field,
  availableParents,
  parentField,
  onUpdate,
}: {
  field: FormField;
  availableParents: FormField[];
  parentField: FormField | null;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}) {
  const handleParentChange = (parentId: string) => {
    if (parentId === '__none__') {
      // Remove dependency
      onUpdate(field.id, {
        dependsOn: undefined,
        conditionalOptions: undefined,
      });
    } else {
      const parent = availableParents.find((f) => f.id === parentId);
      if (!parent) return;

      const dsType = field.dataSource?.type;
      const isRemoteDs = dsType === 'api' || dsType === 'graphql' || dsType === 'database';

      if (isRemoteDs) {
        // Remote data source: just set dependency, no conditionalOptions needed
        onUpdate(field.id, {
          dependsOn: parentId,
          conditionalOptions: undefined,
          options: undefined,
        });
      } else {
        // Manual/bulk: initialize conditional options from parent's options
        const initialConditional: Record<string, string[]> = {};
        (parent.options ?? []).forEach((opt) => {
          initialConditional[opt] = [];
        });
        onUpdate(field.id, {
          dependsOn: parentId,
          conditionalOptions: initialConditional,
          options: undefined,
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Link2 className="size-3.5 text-muted-foreground" />
        <Label className="text-xs">Depende de</Label>
      </div>

      <Select
        value={field.dependsOn ?? '__none__'}
        onValueChange={handleParentChange}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Sin dependencia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Sin dependencia</SelectItem>
          {availableParents.map((parent) => (
            <SelectItem key={parent.id} value={parent.id}>
              {parent.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {availableParents.length === 0 && !field.dependsOn && (
        <p className="text-[11px] text-muted-foreground">
          Agrega otro campo de seleccion al formulario para poder crear
          dependencias
        </p>
      )}

      {/* Conditional options editor — only for manual/bulk dependent selects */}
      {field.dependsOn && parentField && (!field.dataSource || field.dataSource.type === 'manual' || field.dataSource.type === 'bulk') && (
        <ConditionalOptionsEditor
          parentField={parentField}
          conditionalOptions={field.conditionalOptions ?? {}}
          onChange={(conditionalOptions) =>
            onUpdate(field.id, { conditionalOptions })
          }
        />
      )}

      {/* Info box for remote dependent selects */}
      {field.dependsOn && parentField && field.dataSource && (field.dataSource.type === 'api' || field.dataSource.type === 'graphql' || field.dataSource.type === 'database') && (
        <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 px-3 py-2.5">
          <Info className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <p className="text-[11px] text-blue-700 dark:text-blue-400">
            Las opciones se cargan desde el origen de datos.
            Usa <code className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded text-[10px]">{'{{parent}}'}</code> en
            la configuracion para insertar el valor seleccionado en &quot;{parentField.label}&quot;.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Conditional Options Editor (grouped by parent value) ───────────────────

function ConditionalOptionsEditor({
  parentField,
  conditionalOptions,
  onChange,
}: {
  parentField: FormField;
  conditionalOptions: Record<string, string[]>;
  onChange: (opts: Record<string, string[]>) => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(parentField.options ?? []),
  );

  const parentOptions = parentField.options ?? [];

  const toggleGroup = (parentValue: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(parentValue)) next.delete(parentValue);
      else next.add(parentValue);
      return next;
    });
  };

  const addChildOption = (parentValue: string, childValue: string) => {
    const current = conditionalOptions[parentValue] ?? [];
    if (current.includes(childValue)) return;
    onChange({
      ...conditionalOptions,
      [parentValue]: [...current, childValue],
    });
  };

  const removeChildOption = (parentValue: string, index: number) => {
    const current = conditionalOptions[parentValue] ?? [];
    onChange({
      ...conditionalOptions,
      [parentValue]: current.filter((_, i) => i !== index),
    });
  };

  const updateChildOption = (
    parentValue: string,
    index: number,
    newValue: string,
  ) => {
    const current = [...(conditionalOptions[parentValue] ?? [])];
    current[index] = newValue;
    onChange({ ...conditionalOptions, [parentValue]: current });
  };

  if (parentOptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-3">
        <p className="text-[11px] text-muted-foreground text-center">
          El campo padre &quot;{parentField.label}&quot; no tiene opciones.
          Agrega opciones al campo padre primero.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Opciones por valor del padre</Label>
      <p className="text-[11px] text-muted-foreground mb-2">
        Define que opciones aparecen segun la seleccion en &quot;{parentField.label}&quot;
      </p>

      <div className="space-y-1">
        {parentOptions.map((parentValue) => {
          const childOptions = conditionalOptions[parentValue] ?? [];
          const isExpanded = expandedGroups.has(parentValue);

          return (
            <div
              key={parentValue}
              className="rounded-md border bg-muted/20 overflow-hidden"
            >
              {/* Group header */}
              <button
                type="button"
                onClick={() => toggleGroup(parentValue)}
                className="flex items-center gap-2 w-full px-2.5 py-2 text-left hover:bg-muted/40 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                )}
                <span className="text-xs font-medium truncate flex-1">
                  {parentValue}
                </span>
                <Badge
                  variant="secondary"
                  className="text-[9px] font-normal shrink-0"
                >
                  {childOptions.length}
                </Badge>
              </button>

              {/* Child options */}
              {isExpanded && (
                <div className="border-t px-2.5 py-2 space-y-1.5">
                  {childOptions.map((child, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <GripVertical className="size-2.5 shrink-0 text-muted-foreground/40" />
                      <Input
                        value={child}
                        onChange={(e) =>
                          updateChildOption(parentValue, i, e.target.value)
                        }
                        className="h-6 text-[11px] flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeChildOption(parentValue, i)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}

                  <AddChildInput
                    onAdd={(val) => addChildOption(parentValue, val)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddChildInput({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <div className="flex gap-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        placeholder="Nueva opcion..."
        className="h-6 text-[11px] flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-6 shrink-0"
        onClick={handleAdd}
        disabled={!value.trim()}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}

// ─── Select Options Editor (simple, non-dependent) ──────────────────────────

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    const value = newOption.trim();
    if (!value || options.includes(value)) return;
    onChange([...options, value]);
    setNewOption('');
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">Opciones</Label>

      {options.length > 0 && (
        <div className="space-y-1.5">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <GripVertical className="size-3 shrink-0 text-muted-foreground/40" />
              <Input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="h-7 text-xs flex-1"
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addOption();
            }
          }}
          placeholder="Nueva opcion..."
          className="h-7 text-xs flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shrink-0"
          onClick={addOption}
          disabled={!newOption.trim()}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {options.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Agrega al menos una opcion para el campo de seleccion
        </p>
      )}
    </div>
  );
}

// ─── Visibility Condition Editor ─────────────────────────────────────────────

const OPERATOR_LABELS: Record<VisibilityOperator, string> = {
  equals: 'Es igual a',
  not_equals: 'No es igual a',
  contains: 'Contiene',
  not_empty: 'No esta vacio',
  is_empty: 'Esta vacio',
};

const OPERATORS_WITH_VALUE: VisibilityOperator[] = ['equals', 'not_equals', 'contains'];

function VisibilityConditionEditor({
  field,
  availableFields,
  conditionField,
  onUpdate,
}: {
  field: FormField;
  availableFields: FormField[];
  conditionField: FormField | null;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}) {
  const condition = field.visibilityCondition;

  const handleFieldChange = (fieldId: string) => {
    if (fieldId === '__none__') {
      onUpdate(field.id, { visibilityCondition: undefined });
    } else {
      onUpdate(field.id, {
        visibilityCondition: {
          fieldId,
          operator: 'not_empty',
        },
      });
    }
  };

  const handleOperatorChange = (operator: string) => {
    if (!condition) return;
    onUpdate(field.id, {
      visibilityCondition: {
        ...condition,
        operator: operator as VisibilityOperator,
        value: OPERATORS_WITH_VALUE.includes(operator as VisibilityOperator)
          ? condition.value
          : undefined,
      },
    });
  };

  const handleValueChange = (value: string) => {
    if (!condition) return;
    onUpdate(field.id, {
      visibilityCondition: {
        ...condition,
        value: value || undefined,
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Info className="size-3.5 text-muted-foreground" />
        <Label className="text-xs">Visibilidad condicional</Label>
      </div>

      <Select
        value={condition?.fieldId ?? '__none__'}
        onValueChange={handleFieldChange}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Siempre visible" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">Siempre visible</SelectItem>
          {availableFields.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {condition && (
        <>
          <Select
            value={condition.operator}
            onValueChange={handleOperatorChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(OPERATOR_LABELS) as [VisibilityOperator, string][]).map(
                ([op, label]) => (
                  <SelectItem key={op} value={op}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          {OPERATORS_WITH_VALUE.includes(condition.operator) && (
            <Input
              value={condition.value ?? ''}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Valor..."
              className="h-8 text-sm"
            />
          )}

          {conditionField && (
            <p className="text-[11px] text-muted-foreground">
              Este campo solo se mostrara cuando &quot;{conditionField.label}&quot;{' '}
              {OPERATOR_LABELS[condition.operator].toLowerCase()}
              {condition.value ? ` "${condition.value}"` : ''}
            </p>
          )}
        </>
      )}

      {availableFields.length === 0 && !condition && (
        <p className="text-[11px] text-muted-foreground">
          Agrega otros campos al formulario para poder configurar condiciones
        </p>
      )}
    </div>
  );
}
