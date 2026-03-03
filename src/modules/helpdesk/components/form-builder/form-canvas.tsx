'use client';

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
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onRemoveField,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas',
    data: { type: 'canvas' },
  });

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
              {fields.map((field) => (
                <CanvasField
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => onSelectField(field.id)}
                  onRemove={() => onRemoveField(field.id)}
                />
              ))}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
