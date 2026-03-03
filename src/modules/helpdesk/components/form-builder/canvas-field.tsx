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
  Link2,
  Link,
  Clock,
  CircleDot,
  Heading,
  Search,
  Globe,
  Database,
  FileText,
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
  url: Link,
  time: Clock,
  radio: CircleDot,
  heading: Heading,
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
  url: 'URL',
  time: 'Hora',
  radio: 'Opciones',
  heading: 'Encabezado',
};

interface CanvasFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isDragOverlay?: boolean;
  parentFieldLabel?: string;
}

export function CanvasField({
  field,
  isSelected,
  onSelect,
  onRemove,
  isDragOverlay,
  parentFieldLabel,
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
          {field.searchable && (
            <Badge variant="outline" className="text-[10px] font-normal gap-0.5">
              <Search className="size-2.5" />
            </Badge>
          )}
          {field.dataSource?.type === 'api' && (
            <Badge variant="outline" className="text-[10px] font-normal gap-0.5">
              <Globe className="size-2.5 text-blue-500" />
              API
            </Badge>
          )}
          {field.dataSource?.type === 'database' && (
            <Badge variant="outline" className="text-[10px] font-normal gap-0.5">
              <Database className="size-2.5 text-amber-500" />
              DB
            </Badge>
          )}
          {field.dataSource?.type === 'bulk' && (
            <Badge variant="outline" className="text-[10px] font-normal gap-0.5">
              <FileText className="size-2.5" />
              Masivo
            </Badge>
          )}
          {parentFieldLabel && (
            <Badge variant="outline" className="text-[10px] font-normal gap-0.5">
              <Link2 className="size-2.5" />
              {parentFieldLabel}
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
        <div
          className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
          style={{ height: `${(field.rows ?? 4) * 16}px`, maxHeight: '128px' }}
        >
          {field.placeholder || 'Texto largo...'}
        </div>
      );
    case 'select':
      if (field.dataSource?.type === 'api') {
        return (
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Globe className="size-3 text-blue-500" />
              Opciones desde API
            </span>
            <ChevronDown className="size-3" />
          </div>
        );
      }
      if (field.dataSource?.type === 'database') {
        return (
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Database className="size-3 text-amber-500" />
              Base de datos (proximamente)
            </span>
            <ChevronDown className="size-3" />
          </div>
        );
      }
      return (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>{field.placeholder || 'Selecciona...'}</span>
          <div className="flex items-center gap-1">
            {field.searchable && <Search className="size-3 text-primary" />}
            <ChevronDown className="size-3" />
          </div>
        </div>
      );
    case 'radio':
      return (
        <div className="space-y-1.5">
          {(field.options ?? ['Opcion 1', 'Opcion 2']).slice(0, 3).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="size-3.5 rounded-full border-2 border-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">{opt}</span>
            </div>
          ))}
          {(field.options ?? []).length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{(field.options ?? []).length - 3} mas
            </span>
          )}
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
          {field.multiple ? 'Arrastra archivos aqui' : 'Haz clic o arrastra un archivo'}
          {field.accept && (
            <span className="ml-1 text-[10px] text-muted-foreground/60">
              ({field.accept})
            </span>
          )}
        </div>
      );
    case 'date':
      return (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>{field.placeholder || 'dd/mm/aaaa'}</span>
          <Calendar className="size-3" />
        </div>
      );
    case 'time':
      return (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>{field.placeholder || 'HH:MM'}</span>
          <Clock className="size-3" />
        </div>
      );
    case 'url':
      return (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Link className="size-3 shrink-0" />
          <span>{field.placeholder || 'https://...'}</span>
        </div>
      );
    case 'heading':
      return (
        <div className="py-1">
          <div className="text-sm font-semibold">{field.label}</div>
          {field.headingDescription && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {field.headingDescription}
            </p>
          )}
          <div className="mt-2 border-b" />
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
