'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  Save,
  ExternalLink,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { sileo } from 'sileo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  type FormField,
  type FormConfig,
  type FieldType,
  FIELD_TYPES,
  getDefaultConfig,
  loadFormConfig,
  saveFormConfig,
  generateFieldId,
} from '@/modules/helpdesk/types/form-config';
import { FieldPalette } from '@/modules/helpdesk/components/form-builder/field-palette';
import { FormCanvas } from '@/modules/helpdesk/components/form-builder/form-canvas';
import { CanvasField, ICON_MAP } from '@/modules/helpdesk/components/form-builder/canvas-field';
import { FieldConfigPanel } from '@/modules/helpdesk/components/form-builder/field-config-panel';

export default function OrganizationHelpdeskPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 1;

  // Load initial config
  const [config, setConfig] = useState<FormConfig>(() => {
    return loadFormConfig(orgId) ?? getDefaultConfig();
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedField =
    config.fields.find((f) => f.id === selectedFieldId) ?? null;

  // ── DnD sensors ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // ── DnD handlers ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over) return;

      const activeData = active.data.current;
      const overId = String(over.id);

      // ─ Palette → Canvas: add new field ─────────────────────────────────
      if (activeData?.type === 'palette-item') {
        const fieldType = activeData.fieldType;
        const meta = FIELD_TYPES.find((ft) => ft.type === fieldType);
        if (!meta) return;

        const newField: FormField = {
          id: generateFieldId(),
          type: meta.type,
          label: meta.defaultLabel,
          placeholder: meta.defaultPlaceholder || undefined,
          required: false,
          options: meta.type === 'select' ? ['Opcion 1', 'Opcion 2'] : undefined,
          width: 'full',
        };

        setConfig((prev) => {
          // If dropped on a specific field, insert after it
          if (overId !== 'form-canvas') {
            const overIndex = prev.fields.findIndex((f) => f.id === overId);
            if (overIndex !== -1) {
              const next = [...prev.fields];
              next.splice(overIndex + 1, 0, newField);
              return { ...prev, fields: next };
            }
          }
          return { ...prev, fields: [...prev.fields, newField] };
        });

        setSelectedFieldId(newField.id);
        return;
      }

      // ─ Canvas reorder ──────────────────────────────────────────────────
      if (activeData?.type === 'canvas-field' && overId !== String(active.id)) {
        setConfig((prev) => {
          const oldIndex = prev.fields.findIndex(
            (f) => f.id === String(active.id),
          );
          const newIndex = prev.fields.findIndex((f) => f.id === overId);
          if (oldIndex === -1 || newIndex === -1) return prev;
          return {
            ...prev,
            fields: arrayMove(prev.fields, oldIndex, newIndex),
          };
        });
      }
    },
    [],
  );

  // ── Field operations ─────────────────────────────────────────────────────
  const handleSelectField = useCallback((fieldId: string) => {
    setSelectedFieldId(fieldId);
  }, []);

  const handleRemoveField = useCallback(
    (fieldId: string) => {
      setConfig((prev) => ({
        ...prev,
        fields: prev.fields
          .filter((f) => f.id !== fieldId)
          // Clear dependency for any field that depended on the removed one
          .map((f) =>
            f.dependsOn === fieldId
              ? { ...f, dependsOn: undefined, conditionalOptions: undefined }
              : f,
          ),
      }));
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
    },
    [selectedFieldId],
  );

  const handleUpdateField = useCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      setConfig((prev) => ({
        ...prev,
        fields: prev.fields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f,
        ),
      }));
    },
    [],
  );

  // ── Save / Reset ─────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    setSaving(true);
    saveFormConfig(orgId, config);
    setTimeout(() => {
      setSaving(false);
      sileo.success({
        title: 'Formulario guardado',
        description: (
          <span className="text-xs!">
            La configuracion del formulario se ha guardado correctamente.
          </span>
        ),
      });
    }, 400);
  }, [orgId, config]);

  const handleReset = useCallback(() => {
    const defaults = getDefaultConfig();
    setConfig(defaults);
    setSelectedFieldId(null);
  }, []);

  // ── Drag overlay content ─────────────────────────────────────────────────
  const activeField = activeId
    ? config.fields.find((f) => f.id === activeId)
    : null;

  const activePaletteType = activeId?.startsWith('palette-')
    ? activeId.replace('palette-', '')
    : null;
  const activePaletteMeta = activePaletteType
    ? FIELD_TYPES.find((ft) => ft.type === activePaletteType)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Constructor de formulario
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configura el formulario publico para recibir tickets de soporte
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {config.fields.length} campo{config.fields.length !== 1 && 's'}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="size-3.5" />
              Restablecer
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`/submit-ticket?orgId=${orgId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3.5" />
                Vista previa
              </a>
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Guardar
            </Button>
          </div>
        </div>
      </div>

      {/* Body: 3-column layout */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Field palette */}
          <div className="w-[240px] shrink-0 border-r overflow-y-auto p-4">
            <FieldPalette />
          </div>

          {/* Center: Canvas */}
          <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
            <FormCanvas
              fields={config.fields}
              selectedFieldId={selectedFieldId}
              onSelectField={handleSelectField}
              onRemoveField={handleRemoveField}
              activeId={activeId}
              overId={overId}
            />
          </div>

          {/* Right: Config panel */}
          <div className="w-[280px] shrink-0 border-l overflow-y-auto p-4">
            <FieldConfigPanel
              field={selectedField}
              allFields={config.fields}
              onUpdate={handleUpdateField}
            />
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeField ? (
            <CanvasField
              field={activeField}
              isSelected={false}
              onSelect={() => {}}
              onRemove={() => {}}
              isDragOverlay
            />
          ) : activePaletteMeta ? (() => {
            const PaletteIcon = ICON_MAP[activePaletteMeta.type as FieldType];
            return (
              <div className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm shadow-lg rotate-1">
                {PaletteIcon && <PaletteIcon className="size-4 shrink-0 text-muted-foreground" />}
                <span className="font-medium">{activePaletteMeta.label}</span>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
