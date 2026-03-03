'use client';

import { useState } from 'react';
import {
  Settings2,
  Plus,
  X,
  GripVertical,
} from 'lucide-react';
import type { FormField } from '../../types/form-config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FieldConfigPanelProps {
  field: FormField | null;
  onUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}

export function FieldConfigPanel({ field, onUpdate }: FieldConfigPanelProps) {
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

        {/* Placeholder */}
        {field.type !== 'checkbox' && field.type !== 'file' && (
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

        <Separator />

        {/* Required toggle */}
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

        {/* Options for select */}
        {field.type === 'select' && (
          <>
            <Separator />
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => onUpdate(field.id, { options })}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Select Options Editor ──────────────────────────────────────────────────

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
