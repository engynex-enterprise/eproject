'use client';

import { useMemo } from 'react';
import type { Issue } from '@/shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket } from 'lucide-react';
import { TicketCard } from './ticket-card';
import { TicketTable } from './ticket-table';
import type {
  TicketSortBy,
  TicketFilter,
  PriorityFilter,
  ViewMode,
} from './helpdesk-toolbar';

interface TicketListProps {
  tickets: Issue[];
  isLoading?: boolean;
  viewMode: ViewMode;
  search: string;
  sortBy: TicketSortBy;
  ticketFilter: TicketFilter;
  priorityFilter: PriorityFilter;
  selectedIds?: Set<number>;
  onToggleSelect?: (ticketId: number) => void;
  onToggleSelectAll?: (ticketIds: number[]) => void;
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

export function TicketList({
  tickets,
  isLoading,
  viewMode,
  search,
  sortBy,
  ticketFilter,
  priorityFilter,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: TicketListProps) {
  const filtered = useMemo(() => {
    let result = tickets;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.issueKey.toLowerCase().includes(q),
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority?.level === priorityFilter);
    }

    return sortTickets(result, sortBy);
  }, [tickets, search, sortBy, priorityFilter]);

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
            ? 'No se encontraron tickets'
            : ticketFilter === 'all'
              ? 'Aun no hay tickets asignados o reportados por ti.'
              : ticketFilter === 'assigned_to_me'
                ? 'No tienes tickets asignados actualmente.'
                : 'No has reportado ningun ticket.'}
        </p>
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <TicketTable
        tickets={filtered}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
      />
    </div>
  );
}
