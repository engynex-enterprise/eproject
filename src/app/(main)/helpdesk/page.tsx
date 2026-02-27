'use client';

import { useState } from 'react';
import {
  Ticket,
  Search,
  Filter,
  User,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, Issue, PaginatedResponse } from '@/shared/types';
import { cn } from '@/lib/utils';

type TicketFilter = 'all' | 'assigned_to_me' | 'reported_by_me';

const priorityColors: Record<string, string> = {
  highest: 'text-red-600 bg-red-50',
  high: 'text-orange-600 bg-orange-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-blue-600 bg-blue-50',
  lowest: 'text-zinc-500 bg-zinc-50',
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function HelpdeskPage() {
  const [filter, setFilter] = useState<TicketFilter>('all');
  const [search, setSearch] = useState('');

  const { data: ticketsResponse, isLoading } = useTickets(filter, search);
  const tickets = ticketsResponse?.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Ticket className="size-6" />
          Tickets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos los tickets donde eres reportero o asignado.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                {filter === 'all'
                  ? 'Todos'
                  : filter === 'assigned_to_me'
                    ? 'Asignados a mi'
                    : 'Reportados por mi'}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter('assigned_to_me')}
              >
                <User className="size-4" />
                Asignados a mi
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter('reported_by_me')}
              >
                <AlertCircle className="size-4" />
                Reportados por mi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Clave</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Actualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {ticket.issueKey}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">
                        {ticket.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.projectId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs font-medium',
                          ticket.status?.statusGroup
                            ? statusGroupColors[
                                ticket.status.statusGroup.type
                              ]
                            : '',
                        )}
                      >
                        {ticket.status?.name ?? 'Sin estado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.priority && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            priorityColors[ticket.priority.level],
                          )}
                        >
                          {priorityLabels[ticket.priority.level] ??
                            ticket.priority.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(
                                ticket.assignee.firstName,
                                ticket.assignee.lastName,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">
                            {ticket.assignee.firstName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sin asignar
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(ticket.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Ticket className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground">
                No se encontraron tickets
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {filter === 'all'
                  ? 'Aun no hay tickets asignados o reportados por ti.'
                  : filter === 'assigned_to_me'
                    ? 'No tienes tickets asignados actualmente.'
                    : 'No has reportado ningun ticket.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination info */}
      {ticketsResponse?.meta && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
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
