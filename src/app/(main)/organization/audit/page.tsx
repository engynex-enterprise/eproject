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
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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

const getActionLabel = (a: string) => ACTION_LABELS[a] ?? a;
const getResourceLabel = (r: string) => RESOURCE_LABELS[r] ?? r;

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatRelative(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Desconocido';
  if (ua.includes('Chrome') && !ua.includes('Edg'))
    return `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1] ?? ''}`;
  if (ua.includes('Firefox'))
    return `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1] ?? ''}`;
  if (ua.includes('Safari') && !ua.includes('Chrome'))
    return `Safari ${ua.match(/Version\/([\d.]+)/)?.[1] ?? ''}`;
  if (ua.includes('Edg'))
    return `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1] ?? ''}`;
  return ua.slice(0, 60);
}

/** Short browser name for inline table cell */
function getBrowserShort(ua: string | null): { name: string; version: string } {
  if (!ua) return { name: '—', version: '' };
  if (ua.includes('Edg')) return { name: 'Edge', version: ua.match(/Edg\/([\d]+)/)?.[1] ?? '' };
  if (ua.includes('Chrome')) return { name: 'Chrome', version: ua.match(/Chrome\/([\d]+)/)?.[1] ?? '' };
  if (ua.includes('Firefox')) return { name: 'Firefox', version: ua.match(/Firefox\/([\d]+)/)?.[1] ?? '' };
  if (ua.includes('Safari')) return { name: 'Safari', version: ua.match(/Version\/([\d]+)/)?.[1] ?? '' };
  return { name: 'Otro', version: '' };
}

/** Human-readable description of the audit event */
function getEventDescription(action: string, resource: string, resourceId: string | null, body: Record<string, any> | undefined): string {
  const res = RESOURCE_LABELS[resource] ?? resource;
  const id = resourceId ? ` #${resourceId}` : '';
  if (action === 'CREATE') return `Creó ${res.toLowerCase()}${id}`;
  if (action === 'DELETE') return `Eliminó ${res.toLowerCase()}${id}`;
  if (action === 'UPDATE') {
    const fields = body ? Object.keys(body).filter((k) => k !== 'updatedAt') : [];
    if (fields.length === 0) return `Actualizó ${res.toLowerCase()}${id}`;
    if (fields.length === 1) return `Actualizó ${fields[0]}`;
    if (fields.length <= 3) return `Actualizó ${fields.join(', ')}`;
    return `Actualizó ${fields.length} campos`;
  }
  return `${action} ${res.toLowerCase()}`;
}

/** Summary of body fields changed */
function getChangeSummary(action: string, body: Record<string, any> | undefined): { text: string; count: number } {
  if (!body || action === 'DELETE') return { text: '—', count: 0 };
  const keys = Object.keys(body).filter((k) => k !== 'updatedAt');
  if (keys.length === 0) return { text: '—', count: 0 };
  if (keys.length <= 3) return { text: keys.join(', '), count: keys.length };
  return { text: `${keys.slice(0, 2).join(', ')} +${keys.length - 2}`, count: keys.length };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="shadow-sm bg-white dark:bg-card">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`flex size-9 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`size-4 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="px-4 pb-4 pt-3 bg-muted/30 border-t space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 text-xs">
        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <Calendar className="size-3" /> Fecha exacta
          </p>
          <p className="font-mono text-[11px]">{formatTimestamp(entry.timestamp)}</p>
        </div>

        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <User className="size-3" /> Usuario
          </p>
          <p className="font-medium text-[11px]">{entry.userName}</p>
          <p className="text-muted-foreground text-[10px]">{entry.userEmail || '—'}</p>
        </div>

        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <Globe className="size-3" /> Direccion IP
          </p>
          <p className="font-mono text-[11px]">{entry.ipAddress ?? '—'}</p>
        </div>

        {entry.resourceId && (
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <Hash className="size-3" /> ID recurso
            </p>
            <p className="font-mono text-[11px]">#{entry.resourceId}</p>
          </div>
        )}

        {entry.userAgent && (
          <div className="space-y-0.5 col-span-2">
            <p className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <Monitor className="size-3" /> Cliente
            </p>
            <p className="text-[11px]">{parseUserAgent(entry.userAgent)}</p>
            <p className="text-muted-foreground text-[10px] truncate">{entry.userAgent}</p>
          </div>
        )}
      </div>

      {method && url && (
        <>
          <Separator />
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              Endpoint
            </p>
            <code className="inline-flex items-center gap-2 bg-background border rounded px-2 py-1 font-mono text-[11px]">
              <span
                className={`font-bold ${
                  method === 'POST' ? 'text-emerald-600' :
                  method === 'DELETE' ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {method}
              </span>
              {url}
            </code>
          </div>
        </>
      )}

      {hasBody && (
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            Datos enviados
          </p>
          <pre className="bg-background border rounded p-3 overflow-x-auto font-mono text-[11px] leading-relaxed max-h-40">
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

  const filtered = searchQuery
    ? entries.filter(
        (e) =>
          e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : entries;

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
      <div className="flex flex-1 flex-col gap-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
            <p className="text-sm text-muted-foreground">
              Registro completo de actividades y cambios en la organizacion.
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total eventos"
            value={total}
            icon={Activity}
            iconBg="bg-slate-100 dark:bg-slate-800"
            iconColor="text-slate-600 dark:text-slate-400"
          />
          <StatCard
            label="Creaciones"
            value={creates}
            icon={Plus}
            iconBg="bg-emerald-100 dark:bg-emerald-900/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Actualizaciones"
            value={updates}
            icon={Pencil}
            iconBg="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Eliminaciones"
            value={deletes}
            icon={Trash2}
            iconBg="bg-red-100 dark:bg-red-900/40"
            iconColor="text-red-600 dark:text-red-400"
          />
        </div>

        {/* ── Filters toolbar ────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-white dark:bg-card shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-52 flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-44">
                <SlidersHorizontal className="size-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="h-9 w-36 text-sm"
              />
              <span className="text-muted-foreground text-xs">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="h-9 w-36 text-sm"
              />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 gap-1.5 text-muted-foreground">
                <X className="size-3.5" />
                Limpiar
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5">
              {actionFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {getActionLabel(actionFilter)}
                  <button onClick={() => setActionFilter('all')} className="ml-0.5 hover:text-foreground">
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
              {resourceFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {getResourceLabel(resourceFilter)}
                  <button onClick={() => setResourceFilter('all')} className="ml-0.5 hover:text-foreground">
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
              {(startDate || endDate) && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {startDate || '...'} — {endDate || '...'}
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-0.5 hover:text-foreground">
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:text-foreground">
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="rounded-xl border bg-white dark:bg-card shadow-sm overflow-x-auto">
          {/* Table header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Registro de actividad</span>
              {total > 0 && (
                <Badge variant="secondary" className="text-xs">{total}</Badge>
              )}
            </div>
            {total > 0 && (
              <p className="text-xs text-muted-foreground">
                {pageStart}–{pageEnd} de {total}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
                <Activity className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Sin actividad registrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasActiveFilters
                  ? 'No hay eventos que coincidan con los filtros.'
                  : 'Las acciones de la organizacion apareceran aqui.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-28 pl-4">Cuando</TableHead>
                    <TableHead className="w-48">Usuario</TableHead>
                    <TableHead className="w-28">Accion</TableHead>
                    <TableHead className="w-36">Recurso</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="w-44">Cambios</TableHead>
                    <TableHead className="w-24">Navegador</TableHead>
                    <TableHead className="w-28">IP</TableHead>
                    <TableHead className="w-8 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => {
                    const isExpanded = expandedId === entry.id;
                    const body = (entry.metadata as any)?.body as Record<string, any> | undefined;
                    const description = getEventDescription(entry.action, entry.resource, entry.resourceId, body);
                    const changes = getChangeSummary(entry.action, body);
                    const browser = getBrowserShort(entry.userAgent);
                    return (
                      <>
                        <TableRow
                          key={entry.id}
                          className={`cursor-pointer transition-colors ${
                            isExpanded ? 'bg-muted/50' : 'hover:bg-muted/30'
                          }`}
                          onClick={() => toggleExpand(entry.id)}
                        >
                          {/* Cuando */}
                          <TableCell className="pl-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground whitespace-nowrap cursor-default">
                                  {formatRelative(entry.timestamp)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{formatTimestamp(entry.timestamp)}</TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* Usuario */}
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-7 shrink-0">
                                {entry.userAvatarUrl && (
                                  <AvatarImage src={entry.userAvatarUrl} alt={entry.userName} />
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

                          {/* Accion */}
                          <TableCell>
                            <ActionBadge action={entry.action} />
                          </TableCell>

                          {/* Recurso */}
                          <TableCell>
                            <span className="text-sm font-medium">
                              {getResourceLabel(entry.resource)}
                            </span>
                            {entry.resourceId && (
                              <span className="text-xs ml-1.5 font-mono text-muted-foreground">
                                #{entry.resourceId}
                              </span>
                            )}
                          </TableCell>

                          {/* Descripcion */}
                          <TableCell className="text-sm text-muted-foreground">
                            {description}
                          </TableCell>

                          {/* Cambios */}
                          <TableCell>
                            {changes.count === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs font-mono text-muted-foreground truncate block max-w-40 cursor-default">
                                    {changes.text}
                                  </span>
                                </TooltipTrigger>
                                {body && (
                                  <TooltipContent side="top" className="max-w-xs">
                                    <pre className="text-[11px] font-mono leading-relaxed">
                                      {JSON.stringify(body, null, 2)}
                                    </pre>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            )}
                          </TableCell>

                          {/* Navegador */}
                          <TableCell>
                            {browser.name === '—' ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <div>
                                <p className="text-xs font-medium leading-none">{browser.name}</p>
                                {browser.version && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    v{browser.version.split('.')[0]}
                                  </p>
                                )}
                              </div>
                            )}
                          </TableCell>

                          {/* IP */}
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {entry.ipAddress ?? '—'}
                          </TableCell>

                          {/* Expand */}
                          <TableCell className="pr-4 text-muted-foreground">
                            {isExpanded
                              ? <ChevronUp className="size-4" />
                              : <ChevronDown className="size-4" />}
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow key={`${entry.id}-detail`} className="hover:bg-transparent">
                            <TableCell colSpan={9} className="p-0">
                              <MetadataPanel entry={entry} />
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {pageStart}–{pageEnd} de {total} registros
                  </p>
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
                    <span className="text-sm text-muted-foreground tabular-nums">
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
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </TooltipProvider>
  );
}
