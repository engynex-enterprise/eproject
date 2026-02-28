'use client';

import { useState, useCallback } from 'react';
import {
  Activity,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Monitor,
  Globe,
  Hash,
  Calendar,
  User,
  Shield,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import type {
  AuditFilters,
  AuditEntry,
} from '@/modules/organization/services/organization.service';
import { useQueryClient } from '@tanstack/react-query';

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTION_TYPES = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'CREATE', label: 'Creacion' },
  { value: 'UPDATE', label: 'Actualizacion' },
  { value: 'DELETE', label: 'Eliminacion' },
];

const RESOURCE_TYPES = [
  { value: 'all', label: 'Todos los recursos' },
  { value: 'members', label: 'Miembros' },
  { value: 'invitations', label: 'Invitaciones' },
  { value: 'roles', label: 'Roles' },
  { value: 'appearance', label: 'Apariencia' },
  { value: 'sso', label: 'SSO' },
  { value: 'notification-config', label: 'Notificaciones' },
  { value: 'storage-config', label: 'Almacenamiento' },
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Creacion',
  UPDATE: 'Actualizacion',
  DELETE: 'Eliminacion',
};

const RESOURCE_LABELS: Record<string, string> = {
  members: 'Miembros',
  invitations: 'Invitaciones',
  roles: 'Roles',
  appearance: 'Apariencia',
  sso: 'SSO',
  'notification-config': 'Notificaciones',
  'storage-config': 'Almacenamiento',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function getResourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource;
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
  return new Date(ts).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatRelative(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Desconocido';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return `Chrome · ${ua.match(/Chrome\/([\d.]+)/)?.[1] ?? ''}`;
  if (ua.includes('Firefox')) return `Firefox · ${ua.match(/Firefox\/([\d.]+)/)?.[1] ?? ''}`;
  if (ua.includes('Safari') && !ua.includes('Chrome')) return `Safari · ${ua.match(/Version\/([\d.]+)/)?.[1] ?? ''}`;
  if (ua.includes('Edg')) return `Edge · ${ua.match(/Edg\/([\d.]+)/)?.[1] ?? ''}`;
  return ua.slice(0, 60);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${colorClass}`}>
      <Icon className="size-5 opacity-60 shrink-0" />
      <div>
        <p className="text-xs font-medium opacity-70 leading-none">{label}</p>
        <p className="text-xl font-bold mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const Icon = ACTION_ICONS[action] ?? Shield;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        ACTION_COLORS[action] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      <Icon className="size-3" />
      {getActionLabel(action)}
    </span>
  );
}

function MetadataPanel({ entry }: { entry: AuditEntry }) {
  const { method, url, body } = (entry.metadata ?? {}) as {
    method?: string;
    url?: string;
    body?: Record<string, any>;
  };

  const hasBody = body && Object.keys(body).length > 0;

  return (
    <div className="px-4 pb-4 pt-2 bg-muted/30 border-t space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Timestamp */}
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
            <Calendar className="size-3" />
            Fecha exacta
          </p>
          <p className="font-mono">{formatTimestamp(entry.timestamp)}</p>
        </div>

        {/* User info */}
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
            <User className="size-3" />
            Usuario
          </p>
          <p className="font-medium">{entry.userName}</p>
          <p className="text-muted-foreground">{entry.userEmail || '—'}</p>
        </div>

        {/* IP */}
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
            <Globe className="size-3" />
            Dirección IP
          </p>
          <p className="font-mono">{entry.ipAddress ?? '—'}</p>
        </div>

        {/* Resource ID */}
        {entry.resourceId && (
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
              <Hash className="size-3" />
              ID del recurso
            </p>
            <p className="font-mono">#{entry.resourceId}</p>
          </div>
        )}

        {/* User agent */}
        {entry.userAgent && (
          <div className="space-y-1 sm:col-span-2">
            <p className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
              <Monitor className="size-3" />
              Cliente
            </p>
            <p className="truncate">{parseUserAgent(entry.userAgent)}</p>
            <p className="text-muted-foreground text-[10px] truncate">{entry.userAgent}</p>
          </div>
        )}
      </div>

      {/* Endpoint */}
      {method && url && (
        <>
          <Separator />
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
              Endpoint
            </p>
            <code className="inline-flex items-center gap-2 bg-muted px-2 py-1 rounded font-mono text-[11px]">
              <span
                className={`font-bold ${
                  method === 'POST'
                    ? 'text-green-600'
                    : method === 'PATCH' || method === 'PUT'
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}
              >
                {method}
              </span>
              {url}
            </code>
          </div>
        </>
      )}

      {/* Payload */}
      {hasBody && (
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground font-medium uppercase tracking-wide text-[10px]">
            Datos enviados
          </p>
          <pre className="bg-muted rounded-md p-3 overflow-x-auto font-mono text-[11px] leading-relaxed max-h-48">
            {JSON.stringify(body, null, 2)}
          </pre>
        </div>
      )}

      {!method && !hasBody && !entry.userAgent && (
        <p className="text-xs text-muted-foreground italic">Sin metadatos adicionales</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;
  const queryClient = useQueryClient();

  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filters: AuditFilters = {
    action: actionFilter !== 'all' ? actionFilter : undefined,
    resourceType: resourceFilter !== 'all' ? resourceFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, isFetching } = useAuditLog(orgId, filters);

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Client-side search filter on user name/email
  const filtered = searchQuery
    ? entries.filter(
        (e) =>
          e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : entries;

  // Stats from current page
  const creates = filtered.filter((e) => e.action === 'CREATE').length;
  const updates = filtered.filter((e) => e.action === 'UPDATE').length;
  const deletes = filtered.filter((e) => e.action === 'DELETE').length;

  const toggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['organizations', 'audit-log', orgId] });
  };

  const resetFilters = () => {
    setActionFilter('all');
    setResourceFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters =
    actionFilter !== 'all' ||
    resourceFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    searchQuery !== '';

  const pageStart = total === 0 ? 0 : (page - 1) * 20 + 1;
  const pageEnd = Math.min(page * 20, total);

  return (
    <TooltipProvider>
      <div className="flex-1 max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Registro completo de actividades y cambios realizados en la organizacion.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
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
          </div>
        </div>

        {/* Stats mini-cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total registros"
            value={total}
            icon={Activity}
            colorClass="bg-card"
          />
          <StatCard
            label="Creaciones"
            value={creates}
            icon={Plus}
            colorClass="bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900 dark:text-green-300"
          />
          <StatCard
            label="Actualizaciones"
            value={updates}
            icon={Pencil}
            colorClass="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300"
          />
          <StatCard
            label="Eliminaciones"
            value={deletes}
            icon={Trash2}
            colorClass="bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300"
          />
        </div>

        {/* Main card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4" />
                  Registro de actividad
                </CardTitle>
                <CardDescription>
                  {total > 0
                    ? `Mostrando ${pageStart}–${pageEnd} de ${total} eventos`
                    : 'Sin eventos registrados'}
                </CardDescription>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters row 1: search + action + resource */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={actionFilter}
                onValueChange={(v) => { setActionFilter(v); setPage(1); }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={resourceFilter}
                onValueChange={(v) => { setResourceFilter(v); setPage(1); }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filters row 2: date range */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="text-sm"
                  placeholder="Desde"
                />
                <span className="text-muted-foreground text-sm shrink-0">—</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="text-sm"
                  placeholder="Hasta"
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Activity className="size-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">
                  Sin actividad registrada
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {hasActiveFilters
                    ? 'Prueba ajustando los filtros.'
                    : 'Los eventos de la organizacion apareceran aqui.'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-36">Cuando</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="w-32">Accion</TableHead>
                        <TableHead className="w-40">Recurso</TableHead>
                        <TableHead className="w-28">IP</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((entry) => {
                        const isExpanded = expandedId === entry.id;
                        return (
                          <>
                            <TableRow
                              key={entry.id}
                              className={`cursor-pointer transition-colors ${
                                isExpanded ? 'bg-muted/40' : 'hover:bg-muted/30'
                              }`}
                              onClick={() => toggleExpand(entry.id)}
                            >
                              {/* Timestamp */}
                              <TableCell className="text-xs whitespace-nowrap">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-muted-foreground cursor-default">
                                      {formatRelative(entry.timestamp)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {formatTimestamp(entry.timestamp)}
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>

                              {/* User */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-7 shrink-0">
                                    {entry.userAvatarUrl && (
                                      <AvatarImage
                                        src={entry.userAvatarUrl}
                                        alt={entry.userName}
                                      />
                                    )}
                                    <AvatarFallback className="text-[10px]">
                                      {getInitials(entry.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate leading-none">
                                      {entry.userName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                      {entry.userEmail}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Action */}
                              <TableCell>
                                <ActionBadge action={entry.action} />
                              </TableCell>

                              {/* Resource */}
                              <TableCell className="text-sm">
                                <span className="font-medium">
                                  {getResourceLabel(entry.resource)}
                                </span>
                                {entry.resourceId && (
                                  <span className="text-xs ml-1 text-muted-foreground font-mono">
                                    #{entry.resourceId}
                                  </span>
                                )}
                              </TableCell>

                              {/* IP */}
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {entry.ipAddress ?? '—'}
                              </TableCell>

                              {/* Expand toggle */}
                              <TableCell
                                className="text-muted-foreground"
                                onClick={(e) => { e.stopPropagation(); toggleExpand(entry.id); }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="size-4" />
                                ) : (
                                  <ChevronDown className="size-4" />
                                )}
                              </TableCell>
                            </TableRow>

                            {/* Expanded detail row */}
                            {isExpanded && (
                              <TableRow key={`${entry.id}-detail`} className="hover:bg-transparent">
                                <TableCell colSpan={6} className="p-0">
                                  <MetadataPanel entry={entry} />
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {total > 0
                      ? `${pageStart}–${pageEnd} de ${total} registros`
                      : 'Sin registros'}
                  </p>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="size-4" />
                        Anterior
                      </Button>
                      <span className="text-sm text-muted-foreground px-1">
                        {page} / {totalPages}
                      </span>
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
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
