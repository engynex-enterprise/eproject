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
} from 'lucide-react';
import type { FormField } from '../../types/form-config';
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
  const hasPlaceholder = !['checkbox', 'file', 'heading', 'radio'].includes(field.type);
  const hasOptions = field.type === 'select' || field.type === 'radio';

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
            onValueChange={(value: 'full' | 'half') =>
              onUpdate(field.id, { width: value })
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Completo (100%)</SelectItem>
              <SelectItem value="half">Mitad (50%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        {/* Options for select/radio (only when NOT dependent) */}
        {hasOptions && !field.dependsOn && (
          <>
            <Separator />
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => onUpdate(field.id, { options })}
            />
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
      // Remove dependency — restore to independent select
      onUpdate(field.id, {
        dependsOn: undefined,
        conditionalOptions: undefined,
        options: field.options ?? [],
      });
    } else {
      const parent = availableParents.find((f) => f.id === parentId);
      if (!parent) return;
      // Set dependency — initialize conditional options from parent's options
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

      {/* Conditional options editor */}
      {field.dependsOn && parentField && (
        <ConditionalOptionsEditor
          parentField={parentField}
          conditionalOptions={field.conditionalOptions ?? {}}
          onChange={(conditionalOptions) =>
            onUpdate(field.id, { conditionalOptions })
          }
        />
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
