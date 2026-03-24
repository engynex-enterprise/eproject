'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Issue } from '@/shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TicketCard } from './ticket-card';
import { TicketTable } from './ticket-table';
import type {
  TicketSortBy,
  TicketFilter,
  PriorityFilter,
  StatusFilter,
  DateFilter,
  ViewMode,
} from './helpdesk-toolbar';
import { cn } from '@/lib/utils';

interface TicketListProps {
  tickets: Issue[];
  isLoading?: boolean;
  viewMode: ViewMode;
  search: string;
  sortBy: TicketSortBy;
  ticketFilter: TicketFilter;
  priorityFilter: PriorityFilter;
  statusFilter: StatusFilter;
  dateFilter: DateFilter;
  selectedIds?: Set<number>;
  onToggleSelect?: (ticketId: number) => void;
  onToggleSelectAll?: (ticketIds: number[]) => void;
  onTicketClick?: (ticket: Issue) => void;
}

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

function sortTickets(tickets: Issue[], sortBy: TicketSortBy): Issue[] {
  return [...tickets].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'priority') {
      const pa = priorityOrder[a.priority?.level ?? 'medium'] ?? 0;
      const pb = priorityOrder[b.priority?.level ?? 'medium'] ?? 0;
      return pb - pa;
    }
    if (sortBy === 'status') {
      const sa = statusOrder[a.status?.statusGroup?.type ?? 'todo'] ?? 0;
      const sb = statusOrder[b.status?.statusGroup?.type ?? 'todo'] ?? 0;
      return sb - sa;
    }
    // default: recent
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function isInDateRange(dateStr: string, filter: DateFilter): boolean {
  if (filter === 'all') return true;
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === 'today') {
    return date >= startOfToday;
  }
  if (filter === 'this_week') {
    const day = startOfToday.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday start
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() + diff);
    return date >= startOfWeek;
  }
  if (filter === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return date >= startOfMonth;
  }
  if (filter === 'last_30') {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    return date >= thirtyDaysAgo;
  }
  return true;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  }
  return pages;
}

export function TicketList({
  tickets,
  isLoading,
  viewMode,
  search,
  sortBy,
  ticketFilter,
  priorityFilter,
  statusFilter,
  dateFilter,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onTicketClick,
}: TicketListProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, priorityFilter, statusFilter, dateFilter, sortBy]);

  const filtered = useMemo(() => {
    let result = tickets;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.issueKey.toLowerCase().includes(q),
      );
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority?.level === priorityFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status?.statusGroup?.type === statusFilter);
    }

    if (dateFilter !== 'all') {
      result = result.filter((t) => isInDateRange(t.createdAt, dateFilter));
    }

    return sortTickets(result, sortBy);
  }, [tickets, search, sortBy, priorityFilter, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {viewMode === 'cards' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Ticket className="size-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          {search
            ? 'No se encontraron tickets con esa búsqueda'
            : ticketFilter === 'all'
              ? 'Aun no hay tickets asignados o reportados por ti.'
              : ticketFilter === 'assigned_to_me'
                ? 'No tienes tickets asignados actualmente.'
                : 'No has reportado ningun ticket.'}
        </p>
        {(priorityFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
          <p className="mt-1 text-xs text-muted-foreground">
            Intenta ajustar los filtros activos.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* List / Table */}
      {viewMode === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              isSelected={selectedIds?.has(ticket.id)}
              onToggleSelect={onToggleSelect}
              onClick={onTicketClick}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <TicketTable
            tickets={paginated}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onToggleSelectAll={onToggleSelectAll}
            onTicketClick={onTicketClick}
          />
        </div>
      )}

      {/* Paginator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        {/* Left: rows per page + info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Filas por página:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">
            {start + 1}–{Math.min(start + pageSize, filtered.length)} de {filtered.length} tickets
          </span>
        </div>

        {/* Right: page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            className="size-7"
            disabled={safePage === 1}
            onClick={() => setPage(1)}
            aria-label="Primera página"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            className="size-7"
            disabled={safePage === 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-3.5" />
          </Button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === safePage ? 'default' : 'outline'}
                size="icon-xs"
                className={cn('size-7 text-xs', p === safePage && 'pointer-events-none')}
                onClick={() => setPage(p)}
                aria-label={`Página ${p}`}
                aria-current={p === safePage ? 'page' : undefined}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon-xs"
            className="size-7"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            className="size-7"
            disabled={safePage === totalPages}
            onClick={() => setPage(totalPages)}
            aria-label="Última página"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
