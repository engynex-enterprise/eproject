'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Type,
  Mail,
  AlignLeft,
  ChevronDown,
  Hash,
  CheckSquare,
  Calendar,
  Phone,
  Paperclip,
  Asterisk,
} from 'lucide-react';
import type { FormField, FieldType } from '../../types/form-config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<FieldType, React.ElementType> = {
  text: Type,
  email: Mail,
  textarea: AlignLeft,
  select: ChevronDown,
  number: Hash,
  checkbox: CheckSquare,
  date: Calendar,
  phone: Phone,
  file: Paperclip,
};

const TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texto',
  email: 'Email',
  textarea: 'Texto largo',
  select: 'Seleccion',
  number: 'Numero',
  checkbox: 'Casilla',
  date: 'Fecha',
  phone: 'Telefono',
  file: 'Archivo',
};

interface CanvasFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isDragOverlay?: boolean;
}

export function CanvasField({
  field,
  isSelected,
  onSelect,
  onRemove,
  isDragOverlay,
}: CanvasFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { type: 'canvas-field', field },
  });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const Icon = ICON_MAP[field.type];

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-card transition-all',
        isSelected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-primary/30',
        isDragging && 'opacity-40',
        isDragOverlay && 'rotate-1 shadow-lg',
        field.width === 'half' ? 'col-span-1' : 'col-span-2',
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <div
          {...(isDragOverlay ? {} : attributes)}
          {...(isDragOverlay ? {} : listeners)}
          className="cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground/40 hover:text-muted-foreground"
        >
          <GripVertical className="size-4" />
        </div>

        {/* Icon + label */}
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium truncate">{field.label}</span>
            {field.required && (
              <Asterisk className="size-3 text-destructive shrink-0" />
            )}
          </div>
          {field.placeholder && (
            <p className="text-[11px] text-muted-foreground truncate">
              {field.placeholder}
            </p>
          )}
        </div>

        {/* Badges + actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="secondary" className="text-[10px] font-normal">
            {TYPE_LABELS[field.type]}
          </Badge>
          {field.width === 'half' && (
            <Badge variant="outline" className="text-[10px] font-normal">
              50%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Field preview */}
      <div className="border-t px-3 py-2.5">
        <FieldPreview field={field} />
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  switch (field.type) {
    case 'textarea':
      return (
        <div className="h-16 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {field.placeholder || 'Texto largo...'}
        </div>
      );
    case 'select':
      return (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>{field.placeholder || 'Selecciona...'}</span>
          <ChevronDown className="size-3" />
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <div className="size-4 rounded border bg-muted/30" />
          <span className="text-xs text-muted-foreground">{field.label}</span>
        </div>
      );
    case 'file':
      return (
        <div className="flex items-center justify-center rounded-md border border-dashed bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
          <Paperclip className="size-3.5 mr-1.5" />
          Haz clic o arrastra un archivo
        </div>
      );
    case 'date':
      return (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>{field.placeholder || 'dd/mm/aaaa'}</span>
          <Calendar className="size-3" />
        </div>
      );
    default:
      return (
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {field.placeholder || 'Escribe aqui...'}
        </div>
      );
  }
}
