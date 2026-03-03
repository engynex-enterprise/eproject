'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Download, FileText, Settings } from 'lucide-react';
import { sileo } from 'sileo';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import type { Issue, PaginatedResponse } from '@/shared/types';
import { useAuthStore } from '@/shared/stores/auth.store';
import { hasFormConfig } from '@/modules/helpdesk/types/form-config';
import { HelpdeskDashboard } from '@/modules/helpdesk/components/helpdesk-dashboard';
import { HelpdeskToolbar } from '@/modules/helpdesk/components/helpdesk-toolbar';
import { TicketList } from '@/modules/helpdesk/components/ticket-list';
import type {
  TicketSortBy,
  TicketFilter,
  PriorityFilter,
  ViewMode,
} from '@/modules/helpdesk/components/helpdesk-toolbar';

const VIEW_MODE_KEY = 'eproject:helpdesk-view-mode';

function loadViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'table';
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  return stored === 'cards' ? 'cards' : 'table';
}

function useTickets(filter: TicketFilter, search: string) {
  return useQuery({
    queryKey: ['helpdesk', 'tickets', filter, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filter !== 'all') params.filter = filter;
      if (search) params.search = search;
      const res = await apiClient.get<PaginatedResponse<Issue>>(
        '/helpdesk/tickets',
        params,
      );
      return res;
    },
  });
}

export default function HelpdeskPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  // Check if form config exists (client-only)
  const [formExists, setFormExists] = useState<boolean | null>(null);
  useEffect(() => {
    setFormExists(hasFormConfig(orgId));
  }, [orgId]);

  // Filters & view
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<TicketSortBy>('recent');
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Data
  const { data: ticketsResponse, isLoading } = useTickets(ticketFilter, search);
  const tickets = ticketsResponse?.data ?? [];

  // Filtered count for toolbar
  const filteredCount = useMemo(() => {
    let result = tickets;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.issueKey.toLowerCase().includes(q),
      );
    }
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority?.level === priorityFilter);
    }
    return result.length;
  }, [tickets, search, priorityFilter]);

  // Handlers
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

  const handleToggleSelect = useCallback((ticketId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback((ticketIds: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = ticketIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ticketIds);
    });
  }, []);

  // Export
  const handleExport = useCallback(() => {
    const csv = [
      ['Clave', 'Titulo', 'Estado', 'Prioridad', 'Asignado', 'Creado', 'Actualizado'].join(','),
      ...tickets.map((t) =>
        [
          t.issueKey,
          `"${t.title}"`,
          t.status?.name ?? '',
          t.priority?.name ?? '',
          t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : '',
          t.createdAt,
          t.updatedAt,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    sileo.success({
      title: 'Tickets exportados',
      icon: <Download className="size-4" />,
      description: (
        <span className="text-xs!">
          Archivo CSV descargado correctamente.
        </span>
      ),
    });
  }, [tickets]);

  // ── Empty state: no form configured ──────────────────────────────────────
  if (formExists === false) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              No hay formulario configurado
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configura tu formulario publico para recibir tickets de usuarios
              externos. Arrastra y suelta campos para personalizar el
              formulario a las necesidades de tu empresa.
            </p>
          </div>
          <Link href="/organization/helpdesk">
            <Button>
              <Settings className="size-4" />
              Crear formulario
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y accede a todos tus tickets de soporte.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/organization/helpdesk">
            <Button variant="outline">
              <Settings className="size-4" />
              Configurar formulario
            </Button>
          </Link>
          <Button>
            <Plus className="size-4" />
            Crear ticket
          </Button>
        </div>
      </div>

      {/* Dashboard stats */}
      <HelpdeskDashboard tickets={tickets} isLoading={isLoading} />

      {/* Toolbar */}
      <HelpdeskToolbar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        ticketFilter={ticketFilter}
        onTicketFilterChange={setTicketFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalCount={tickets.length}
        filteredCount={filteredCount}
        onExport={handleExport}
      />

      {/* Ticket list */}
      <TicketList
        tickets={tickets}
        isLoading={isLoading}
        viewMode={viewMode}
        search={search}
        sortBy={sortBy}
        ticketFilter={ticketFilter}
        priorityFilter={priorityFilter}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* Pagination info */}
      {ticketsResponse?.meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {tickets.length} de {ticketsResponse.meta.total} tickets
          </span>
          <div className="flex items-center gap-2">
            <span>
              Pagina {ticketsResponse.meta.page} de{' '}
              {ticketsResponse.meta.totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
