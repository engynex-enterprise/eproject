'use client';

import { Fragment } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MousePointerClick } from 'lucide-react';
import type { FormField } from '../../types/form-config';
import { CanvasField } from './canvas-field';
import { cn } from '@/lib/utils';

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onRemoveField: (fieldId: string) => void;
  activeId: string | null;
  overId: string | null;
}

function DropIndicator() {
  return (
    <div className="col-span-2 flex items-center gap-1.5 py-0.5 animate-in fade-in duration-150">
      <div className="size-1.5 rounded-full bg-primary shrink-0" />
      <div className="flex-1 h-0.5 bg-primary rounded-full" />
      <div className="size-1.5 rounded-full bg-primary shrink-0" />
    </div>
  );
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onRemoveField,
  activeId,
  overId,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
    data: { type: 'canvas' },
  });

  // Determine drag source type
  const isDragging = !!activeId;
  const isPaletteDrag = activeId?.startsWith('palette-') ?? false;
  const isCanvasReorder = isDragging && !isPaletteDrag;

  // Determine if overId points to a field in the canvas
  const overIsField = overId ? fields.some((f) => f.id === overId) : false;

  // Show indicator at end when hovering over the canvas container itself
  const showAtEnd = isDragging && isPaletteDrag && overId === 'form-canvas' && fields.length > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[400px] rounded-lg border-2 border-dashed p-4 transition-colors',
            isOver
              ? 'border-primary/40 bg-primary/5'
              : 'border-muted-foreground/20',
            fields.length === 0 && 'flex items-center justify-center',
          )}
        >
          {fields.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-center py-12">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <MousePointerClick className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Arrastra campos aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecciona un campo del panel izquierdo y arrastralo para
                  agregarlo al formulario
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {fields.map((field) => {
                const parentLabel = field.dependsOn
                  ? fields.find((f) => f.id === field.dependsOn)?.label
                  : undefined;

                const isTarget = overIsField && overId === field.id;
                // Palette drops insert AFTER the target field
                const showAfter = isTarget && isPaletteDrag;
                // Canvas reorder: show indicator BEFORE the target
                const showBefore = isTarget && isCanvasReorder && field.id !== activeId;

                return (
                  <Fragment key={field.id}>
                    {showBefore && <DropIndicator />}
                    <CanvasField
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => onSelectField(field.id)}
                      onRemove={() => onRemoveField(field.id)}
                      parentFieldLabel={parentLabel}
                      isDropTarget={isTarget && field.id !== activeId}
                    />
                    {showAfter && <DropIndicator />}
                  </Fragment>
                );
              })}
              {showAtEnd && <DropIndicator />}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
