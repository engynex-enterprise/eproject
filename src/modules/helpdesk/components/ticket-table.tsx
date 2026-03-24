'use client';

import { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Ticket,
} from 'lucide-react';
import type { Issue } from '@/shared/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SortColumn = 'title' | 'status' | 'priority' | 'assignee' | 'created' | 'updated';
type SortDir = 'asc' | 'desc';

interface TicketTableProps {
  tickets: Issue[];
  selectedIds?: Set<number>;
  onToggleSelect?: (ticketId: number) => void;
  onToggleSelectAll?: (ticketIds: number[]) => void;
  onTicketClick?: (ticket: Issue) => void;
}

const priorityColors: Record<string, string> = {
  highest: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400',
  high: 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400',
  low: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
  lowest: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400',
};

const priorityLabels: Record<string, string> = {
  highest: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  lowest: 'Muy baja',
};

const statusGroupColors: Record<string, string> = {
  todo: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const priorityOrder: Record<string, number> = {
  highest: 5,
  high: 4,
  medium: 3,
  low: 2,
  lowest: 1,
};

const statusOrder: Record<string, number> = {
  in_progress: 3,
  todo: 2,
  done: 1,
  cancelled: 0,
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(diffDays / 365)} ano${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

function SortableHead({
  column,
  currentSort,
  currentDir,
  onSort,
  children,
  className,
}: {
  column: SortColumn;
  currentSort: SortColumn;
  currentDir: SortDir;
  onSort: (col: SortColumn) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const isActive = currentSort === column;
  return (
    <TableHead
      className={cn('cursor-pointer select-none hover:text-foreground', className)}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive && (
          currentDir === 'asc'
            ? <ArrowUp className="size-3" />
            : <ArrowDown className="size-3" />
        )}
      </div>
    </TableHead>
  );
}

export function TicketTable({
  tickets,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onTicketClick,
}: TicketTableProps) {
  const [sortCol, setSortCol] = useState<SortColumn>('updated');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sorted = [...tickets].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortCol) {
      case 'title': return a.title.localeCompare(b.title) * dir;
      case 'status': {
        const sa = statusOrder[a.status?.statusGroup?.type ?? 'todo'] ?? 0;
        const sb = statusOrder[b.status?.statusGroup?.type ?? 'todo'] ?? 0;
        return (sa - sb) * dir;
      }
      case 'priority': {
        const pa = priorityOrder[a.priority?.level ?? 'medium'] ?? 0;
        const pb = priorityOrder[b.priority?.level ?? 'medium'] ?? 0;
        return (pa - pb) * dir;
      }
      case 'assignee': {
        const na = a.assignee?.firstName ?? '';
        const nb = b.assignee?.firstName ?? '';
        return na.localeCompare(nb) * dir;
      }
      case 'created':
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      case 'updated':
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
      default: return 0;
    }
  });

  const allSelected = sorted.length > 0 && sorted.every((t) => selectedIds?.has(t.id));
  const someSelected = sorted.some((t) => selectedIds?.has(t.id)) && !allSelected;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={() => onToggleSelectAll?.(sorted.map((t) => t.id))}
              aria-label="Seleccionar todos"
            />
          </TableHead>
          <TableHead className="w-28">Clave</TableHead>
          <SortableHead column="title" currentSort={sortCol} currentDir={sortDir} onSort={handleSort}>
            Titulo
          </SortableHead>
          <SortableHead column="status" currentSort={sortCol} currentDir={sortDir} onSort={handleSort} className="w-32">
            Estado
          </SortableHead>
          <SortableHead column="priority" currentSort={sortCol} currentDir={sortDir} onSort={handleSort} className="w-28">
            Prioridad
          </SortableHead>
          <SortableHead column="assignee" currentSort={sortCol} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell w-40">
            Asignado
          </SortableHead>
          <SortableHead column="created" currentSort={sortCol} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell w-28">
            Creado
          </SortableHead>
          <SortableHead column="updated" currentSort={sortCol} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell w-28">
            Actualizado
          </SortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((ticket) => {
          const isSelected = selectedIds?.has(ticket.id) ?? false;

          return (
            <TableRow
              key={ticket.id}
              className={cn('cursor-pointer', isSelected && 'bg-muted/50')}
              onClick={() => onTicketClick?.(ticket)}
            >
              {/* Checkbox */}
              <TableCell className="pr-0" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect?.(ticket.id)}
                  aria-label={`Seleccionar ${ticket.title}`}
                />
              </TableCell>

              {/* Key */}
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">
                  {ticket.issueKey}
                </span>
              </TableCell>

              {/* Title */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Ticket className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-medium">
                    {ticket.title}
                  </span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium',
                    ticket.status?.statusGroup
                      ? statusGroupColors[ticket.status.statusGroup.type]
                      : '',
                  )}
                >
                  {ticket.status?.name ?? 'Sin estado'}
                </Badge>
              </TableCell>

              {/* Priority */}
              <TableCell>
                {ticket.priority && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      priorityColors[ticket.priority.level],
                    )}
                  >
                    {priorityLabels[ticket.priority.level] ?? ticket.priority.name}
                  </Badge>
                )}
              </TableCell>

              {/* Assignee */}
              <TableCell className="hidden md:table-cell">
                {ticket.assignee ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5 border-2 border-background">
                            <AvatarImage src={ticket.assignee.avatarUrl ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-[7px] text-primary">
                              {ticket.assignee.firstName?.[0]}
                              {ticket.assignee.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">
                            {ticket.assignee.firstName}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {ticket.assignee.firstName} {ticket.assignee.lastName}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin asignar
                  </span>
                )}
              </TableCell>

              {/* Created */}
              <TableCell className="hidden lg:table-cell">
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(ticket.createdAt)}
                </span>
              </TableCell>

              {/* Updated */}
              <TableCell className="hidden lg:table-cell">
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(ticket.updatedAt)}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
