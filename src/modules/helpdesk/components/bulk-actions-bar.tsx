'use client';

import {
  X,
  Download,
  CheckCheck,
  ChevronDown,
  CircleDot,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Issue } from '@/shared/types';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedTickets: Issue[];
  onClearSelection: () => void;
  onExportSelected: () => void;
  onChangeStatus?: (statusId: number, statusName: string) => void;
  onChangePriority?: (level: string) => void;
}

const STATUS_OPTIONS = [
  { id: 1, name: 'Pendiente', type: 'todo', color: '#94a3b8' },
  { id: 2, name: 'En revisión', type: 'in_progress', color: '#3b82f6' },
  { id: 3, name: 'En progreso', type: 'in_progress', color: '#8b5cf6' },
  { id: 4, name: 'Resuelto', type: 'done', color: '#22c55e' },
  { id: 5, name: 'Cerrado', type: 'done', color: '#10b981' },
];

const PRIORITY_OPTIONS = [
  { level: 'highest', label: 'Crítica', color: '#ef4444' },
  { level: 'high', label: 'Alta', color: '#f97316' },
  { level: 'medium', label: 'Media', color: '#eab308' },
  { level: 'low', label: 'Baja', color: '#3b82f6' },
  { level: 'lowest', label: 'Muy baja', color: '#94a3b8' },
];

export function BulkActionsBar({
  selectedCount,
  selectedTickets,
  onClearSelection,
  onExportSelected,
  onChangeStatus,
  onChangePriority,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
        'flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 shadow-xl',
        'animate-in slide-in-from-bottom-4 duration-200',
      )}
    >
      {/* Count badge */}
      <Badge variant="secondary" className="gap-1.5 font-semibold">
        <CheckCheck className="size-3.5" />
        {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
      </Badge>

      <Separator orientation="vertical" className="h-5" />

      {/* Change status */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <CircleDot className="size-3.5" />
            Estado
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuLabel className="text-xs">Cambiar estado a</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUS_OPTIONS.map((s) => (
            <DropdownMenuCheckboxItem
              key={s.id}
              checked={false}
              onCheckedChange={() => onChangeStatus?.(s.id, s.name)}
              className="gap-2"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change priority */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <AlertCircle className="size-3.5" />
            Prioridad
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-44">
          <DropdownMenuLabel className="text-xs">Cambiar prioridad a</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PRIORITY_OPTIONS.map((p) => (
            <DropdownMenuCheckboxItem
              key={p.level}
              checked={false}
              onCheckedChange={() => onChangePriority?.(p.level)}
              className="gap-2"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export selected */}
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={onExportSelected}>
        <Download className="size-3.5" />
        Exportar
      </Button>

      <Separator orientation="vertical" className="h-5" />

      {/* Clear */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={onClearSelection}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
