'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Download, Settings, SendHorizontal, Headphones } from 'lucide-react';
import { sileo } from 'sileo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import type { Issue, PaginatedResponse } from '@/shared/types';
import { MOCK_SENT_TICKETS, MOCK_AGENT_TICKETS } from '@/modules/helpdesk/data/mock-tickets';
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

type TabValue = 'emisor' | 'receptor';

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

const MOCK_BY_FILTER: Record<'reported_by_me' | 'assigned_to_me', Issue[]> = {
  reported_by_me: MOCK_SENT_TICKETS,
  assigned_to_me: MOCK_AGENT_TICKETS,
};

function TicketPanel({
  ticketFilter,
  viewMode,
  onViewModeChange,
}: {
  ticketFilter: 'reported_by_me' | 'assigned_to_me';
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<TicketSortBy>('recent');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: ticketsResponse, isLoading, isError } = useTickets(ticketFilter, search);
  const apiTickets = ticketsResponse?.data ?? [];
  const tickets = !isLoading && (isError || apiTickets.length === 0)
    ? MOCK_BY_FILTER[ticketFilter]
    : apiTickets;

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

  return (
    <div className="flex flex-col gap-4">
      <HelpdeskDashboard tickets={tickets} isLoading={isLoading} />

      <HelpdeskToolbar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        ticketFilter={ticketFilter}
        onTicketFilterChange={() => {}}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        totalCount={tickets.length}
        filteredCount={filteredCount}
        onExport={handleExport}
        showTicketFilter={false}
      />

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

export default function HelpdeskPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('emisor');
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex flex-col gap-4"
      >
        <TabsList variant="line" className="w-fit">
          <TabsTrigger value="emisor" className="gap-2 px-4">
            <SendHorizontal className="size-4" />
            Mis tickets enviados
          </TabsTrigger>
          <TabsTrigger value="receptor" className="gap-2 px-4">
            <Headphones className="size-4" />
            Tickets como agente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emisor">
          <TicketPanel
            ticketFilter="reported_by_me"
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </TabsContent>

        <TabsContent value="receptor">
          <TicketPanel
            ticketFilter="assigned_to_me"
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
