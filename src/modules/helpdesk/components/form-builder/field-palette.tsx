'use client';

import { useDraggable } from '@dnd-kit/core';
import {
  Type,
  Mail,
  AlignLeft,
  ChevronDown,
  Hash,
  CheckSquare,
  Calendar,
  Phone,
  Paperclip,
  GripVertical,
} from 'lucide-react';
import { FIELD_TYPES, type FieldType } from '../../types/form-config';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Type,
  Mail,
  AlignLeft,
  ChevronDown,
  Hash,
  CheckSquare,
  Calendar,
  Phone,
  Paperclip,
};

interface PaletteItemProps {
  type: FieldType;
  label: string;
  iconName: string;
}

function PaletteItem({ type, label, iconName }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type: 'palette-item', fieldType: type },
  });

  const Icon = ICON_MAP[iconName] ?? Type;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm',
        'cursor-grab active:cursor-grabbing transition-all',
        'hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm',
        isDragging && 'opacity-40',
      )}
    >
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground/50" />
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="font-medium">{label}</span>
    </div>
  );
}

export function FieldPalette() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Campos disponibles
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Arrastra un campo al formulario
        </p>
      </div>

      <div className="space-y-1.5">
        {FIELD_TYPES.map((field) => (
          <PaletteItem
            key={field.type}
            type={field.type}
            label={field.label}
            iconName={field.icon}
          />
        ))}
      </div>
    </div>
  );
}
