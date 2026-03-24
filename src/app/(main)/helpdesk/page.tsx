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
import { BulkActionsBar } from '@/modules/helpdesk/components/bulk-actions-bar';
import { TicketDetailSheet } from '@/modules/helpdesk/components/ticket-detail-sheet';
import { CreateTicketDialog } from '@/modules/helpdesk/components/create-ticket-dialog';
import type {
  TicketSortBy,
  TicketFilter,
  PriorityFilter,
  StatusFilter,
  DateFilter,
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
      return apiClient.get<PaginatedResponse<Issue>>('/helpdesk/tickets', params);
    },
  });
}

const MOCK_BY_FILTER: Record<'reported_by_me' | 'assigned_to_me', Issue[]> = {
  reported_by_me: MOCK_SENT_TICKETS,
  assigned_to_me: MOCK_AGENT_TICKETS,
};

function exportToCSV(tickets: Issue[], filename: string) {
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
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [detailTicket, setDetailTicket] = useState<Issue | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: ticketsResponse, isLoading, isError } = useTickets(ticketFilter, search);
  const apiTickets = ticketsResponse?.data ?? [];
  const tickets = !isLoading && (isError || apiTickets.length === 0)
    ? MOCK_BY_FILTER[ticketFilter]
    : apiTickets;

  const selectedTickets = useMemo(
    () => tickets.filter((t) => selectedIds.has(t.id)),
    [tickets, selectedIds],
  );

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
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status?.statusGroup?.type === statusFilter);
    }
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result = result.filter((t) => {
        const date = new Date(t.createdAt);
        if (dateFilter === 'today') return date >= startOfToday;
        if (dateFilter === 'this_week') {
          const d = startOfToday.getDay();
          const start = new Date(startOfToday);
          start.setDate(startOfToday.getDate() + (d === 0 ? -6 : 1 - d));
          return date >= start;
        }
        if (dateFilter === 'this_month') return date >= new Date(now.getFullYear(), now.getMonth(), 1);
        if (dateFilter === 'last_30') {
          const ago = new Date(now); ago.setDate(now.getDate() - 30); return date >= ago;
        }
        return true;
      });
    }
    return result.length;
  }, [tickets, search, priorityFilter, statusFilter, dateFilter]);

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
      return allSelected ? new Set() : new Set(ticketIds);
    });
  }, []);

  const handleTicketClick = useCallback((ticket: Issue) => {
    setDetailTicket(ticket);
    setSheetOpen(true);
  }, []);

  const handleExportAll = useCallback(() => {
    exportToCSV(tickets, `tickets-${new Date().toISOString().slice(0, 10)}.csv`);
    sileo.success({
      title: 'Tickets exportados',
      icon: <Download className="size-4" />,
      description: <span className="text-xs!">Archivo CSV descargado.</span>,
    });
  }, [tickets]);

  const handleExportSelected = useCallback(() => {
    exportToCSV(selectedTickets, `tickets-seleccionados-${new Date().toISOString().slice(0, 10)}.csv`);
    sileo.success({
      title: `${selectedTickets.length} ticket${selectedTickets.length > 1 ? 's' : ''} exportados`,
      icon: <Download className="size-4" />,
      description: <span className="text-xs!">Archivo CSV descargado.</span>,
    });
  }, [selectedTickets]);

  const handleChangeStatus = useCallback((_statusId: number, statusName: string) => {
    sileo.info({
      title: 'Estado actualizado',
      description: <span className="text-xs!">{selectedIds.size} ticket{selectedIds.size > 1 ? 's' : ''} → {statusName}</span>,
    });
    setSelectedIds(new Set());
  }, [selectedIds.size]);

  const handleChangePriority = useCallback((level: string) => {
    const labels: Record<string, string> = { highest: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja', lowest: 'Muy baja' };
    sileo.info({
      title: 'Prioridad actualizada',
      description: <span className="text-xs!">{selectedIds.size} ticket{selectedIds.size > 1 ? 's' : ''} → {labels[level]}</span>,
    });
    setSelectedIds(new Set());
  }, [selectedIds.size]);

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
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        totalCount={tickets.length}
        filteredCount={filteredCount}
        onExport={handleExportAll}
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
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onTicketClick={handleTicketClick}
      />

      {ticketsResponse?.meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {tickets.length} de {ticketsResponse.meta.total} tickets
          </span>
          <span>
            Página {ticketsResponse.meta.page} de {ticketsResponse.meta.totalPages}
          </span>
        </div>
      )}

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        selectedTickets={selectedTickets}
        onClearSelection={() => setSelectedIds(new Set())}
        onExportSelected={handleExportSelected}
        onChangeStatus={handleChangeStatus}
        onChangePriority={handleChangePriority}
      />

      {/* Ticket detail sheet */}
      <TicketDetailSheet
        ticket={detailTicket}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

export default function HelpdeskPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('emisor');
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);
  const [createOpen, setCreateOpen] = useState(false);

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
          <Button onClick={() => setCreateOpen(true)}>
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

      {/* Create ticket dialog */}
      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
