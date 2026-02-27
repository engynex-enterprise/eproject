'use client';

import { useState } from 'react';
import {
  Activity,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useAuditLog } from '@/modules/organization/hooks/use-organization';
import { OrgSettingsSidebar } from '@/app/(main)/organization/page';
import type { AuditFilters } from '@/modules/organization/services/organization.service';

const ACTION_TYPES = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'login', label: 'Inicio de sesion' },
  { value: 'logout', label: 'Cierre de sesion' },
  { value: 'member_added', label: 'Miembro agregado' },
  { value: 'member_removed', label: 'Miembro eliminado' },
  { value: 'role_changed', label: 'Rol cambiado' },
  { value: 'settings_updated', label: 'Configuracion actualizada' },
  { value: 'project_created', label: 'Proyecto creado' },
  { value: 'project_deleted', label: 'Proyecto eliminado' },
  { value: 'api_key_created', label: 'API key creada' },
  { value: 'api_key_revoked', label: 'API key revocada' },
];

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  logout: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  member_added: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member_removed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  role_changed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  settings_updated: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  project_created: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  project_deleted: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  api_key_created: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  api_key_revoked: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

function getActionLabel(action: string): string {
  return ACTION_TYPES.find((a) => a.value === action)?.label ?? action;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AuditPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const filters: AuditFilters = {
    action: actionFilter !== 'all' ? actionFilter : undefined,
    page,
    limit: 20,
  };

  const { data, isLoading } = useAuditLog(orgId, filters);

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Client-side search filter (for stub data)
  const filtered = searchQuery
    ? entries.filter(
        (e) =>
          e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.resource.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : entries;

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6">
      <OrgSettingsSidebar />
      <div className="flex-1 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registro de todas las actividades y cambios realizados en la organizacion.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4" />
                  Registro de actividad
                </CardTitle>
                <CardDescription>
                  {total > 0 ? `${total} eventos registrados` : 'Sin eventos registrados'}
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="outline" size="sm" disabled>
                        <Download className="size-4" />
                        Exportar CSV
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Proximamente</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario o recurso..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="size-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Sin actividad registrada</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Los eventos de la organizacion apareceran aqui.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Fecha</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Accion</TableHead>
                        <TableHead>Recurso</TableHead>
                        <TableHead className="w-32">IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(entry.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(entry.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{entry.userName}</p>
                                <p className="text-xs text-muted-foreground truncate">{entry.userEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLORS[entry.action] ?? 'bg-muted text-muted-foreground'}`}
                            >
                              {getActionLabel(entry.action)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {entry.resource}
                            {entry.resourceId && (
                              <span className="text-xs ml-1 text-muted-foreground/60">#{entry.resourceId}</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {entry.ipAddress}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Pagina {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="size-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
