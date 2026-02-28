'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Shield, Trash2, Lock, Save, Loader2, ChevronRight, X, Copy,
  CheckSquare, Square, Search, ShieldCheck, ShieldAlert, KeyRound,
  GripVertical, Users, History, LayoutGrid, GitCompare, Download,
  UserPlus, Check, Minus, Activity, ChevronDown, ChevronUp, CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useOrgRoles, useCreateRole, useUpdateRole, useDeleteRole, usePermissions,
  useOrgMembers, useUpdateMemberRole, useAuditLog,
} from '@/modules/organization/hooks/use-organization';
import type { Role, Permission } from '@/shared/types';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = 'editor' | 'matrix' | 'compare';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_ORDER_KEY = 'eproject:roles-order';

const PERMISSION_TEMPLATES: Record<string, {
  label: string; description: string; actions: string[]; color: string;
}> = {
  readonly: {
    label: 'Solo lectura',
    description: 'Ver contenido sin modificarlo',
    actions: ['read'],
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  contributor: {
    label: 'Contribuidor',
    description: 'Crear y editar contenido propio',
    actions: ['read', 'create', 'update', 'update_own', 'transition'],
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  moderator: {
    label: 'Moderador',
    description: 'Gestión avanzada del contenido',
    actions: ['read', 'create', 'update', 'update_own', 'delete', 'assign', 'transition', 'release', 'export'],
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  admin: {
    label: 'Administrador',
    description: 'Control total de la organización',
    actions: ['read', 'create', 'update', 'update_own', 'delete', 'delete_any', 'manage', 'assign', 'transition', 'release', 'export', 'invite', 'manage_members', 'manage_roles', 'manage_settings', 'manage_billing'],
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

// ── Labels ────────────────────────────────────────────────────────────────────

const resourceLabels: Record<string, string> = {
  organization: 'Organización',
  project: 'Proyectos',
  issue: 'Incidencias',
  sprint: 'Sprints',
  comment: 'Comentarios',
  attachment: 'Adjuntos',
  workflow: 'Flujos de trabajo',
  automation: 'Automatizaciones',
  report: 'Reportes',
  space: 'Espacios',
  version: 'Versiones',
  board: 'Tableros',
  member: 'Miembros',
  role: 'Roles',
};

const actionLabels: Record<string, string> = {
  create: 'Crear',
  read: 'Leer',
  update: 'Actualizar',
  delete: 'Eliminar',
  manage: 'Gestionar',
  invite: 'Invitar',
  assign: 'Asignar',
  export: 'Exportar',
  transition: 'Cambiar estado',
  release: 'Publicar versión',
  manage_members: 'Gestionar miembros',
  manage_roles: 'Gestionar roles',
  manage_billing: 'Gestionar facturación',
  manage_settings: 'Gestionar ajustes',
  update_own: 'Editar propios',
  delete_any: 'Eliminar cualquiera',
};

const ACTION_PILL: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupPermissions(perms: Permission[]): Record<string, Permission[]> {
  return perms.reduce((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = [];
    acc[p.resource].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);
}

function generateSummaryLines(permissions: Permission[]): string[] {
  const grouped = groupPermissions(permissions);
  return Object.entries(grouped).map(([resource, perms]) => {
    const actions = perms.map(p => actionLabels[p.action] ?? p.action).join(', ');
    return `${resourceLabels[resource] ?? resource}: ${actions}`;
  });
}

function formatRelative(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(months / 12)} año${Math.floor(months / 12) > 1 ? 's' : ''}`;
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function loadRoleOrder(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROLE_ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function exportRolesAsJson(roles: Role[]): void {
  const data = roles.map(r => ({
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    permissions: r.permissions.map(p => ({ resource: p.resource, action: p.action })),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `roles-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor }: {
  label: string; value: number | string;
  icon: React.ElementType; iconBg: string; iconColor: string;
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

// ── PermissionSummary ─────────────────────────────────────────────────────────

function PermissionSummary({ permissions }: { permissions: Permission[] }) {
  const [open, setOpen] = useState(false);
  const lines = generateSummaryLines(permissions);
  if (permissions.length === 0) return null;
  return (
    <div className="rounded-lg bg-muted/40 border px-3 py-2.5">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Resumen legible de permisos</span>
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>
      {open && (
        <ul className="mt-2.5 space-y-1">
          {lines.map((line, i) => (
            <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
              <Check className="size-3 mt-0.5 shrink-0 text-emerald-500" />
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── MatrixView ────────────────────────────────────────────────────────────────

function MatrixView({ roles, allPermissions }: { roles: Role[]; allPermissions: Permission[] }) {
  const resources = useMemo(
    () => [...new Set(allPermissions.map(p => p.resource))].sort(),
    [allPermissions],
  );

  return (
    <div className="rounded-xl border bg-white dark:bg-card shadow-sm overflow-x-auto">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <LayoutGrid className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Matriz de permisos</span>
        <span className="text-xs text-muted-foreground">
          — {roles.length} roles · {resources.length} recursos
        </span>
      </div>
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap border-r">
              Recurso
            </th>
            {roles.map(role => (
              <th key={role.id} className="px-4 py-3 text-center font-medium whitespace-nowrap min-w-36">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold">{role.name}</span>
                  {role.isSystem && (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                      <Lock className="size-2.5 mr-0.5" />Sistema
                    </Badge>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource, ri) => (
            <tr key={resource} className={cn('border-b last:border-b-0', ri % 2 === 1 && 'bg-muted/10')}>
              <td className="sticky left-0 z-10 px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap bg-inherit border-r">
                {resourceLabels[resource] ?? resource}
              </td>
              {roles.map(role => {
                const rolePerms = role.permissions.filter(p => p.resource === resource);
                return (
                  <td key={role.id} className="px-3 py-2 text-center">
                    {rolePerms.length === 0 ? (
                      <span className="text-muted-foreground/25">—</span>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-1">
                        {rolePerms.map(p => (
                          <Badge key={p.id} variant="secondary" className="text-[10px] h-5 px-1.5">
                            {actionLabels[p.action] ?? p.action}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CompareView ───────────────────────────────────────────────────────────────

function CompareView({ roles, allPermissions }: { roles: Role[]; allPermissions: Permission[] }) {
  const [roleAId, setRoleAId] = useState('');
  const [roleBId, setRoleBId] = useState('');

  const roleA = roles.find(r => String(r.id) === roleAId);
  const roleB = roles.find(r => String(r.id) === roleBId);

  const resources = useMemo(
    () => [...new Set(allPermissions.map(p => p.resource))].sort(),
    [allPermissions],
  );
  const grouped = useMemo(() => groupPermissions(allPermissions), [allPermissions]);

  const stats = useMemo(() => {
    if (!roleA || !roleB) return null;
    const idsA = new Set(roleA.permissions.map(p => p.id));
    const idsB = new Set(roleB.permissions.map(p => p.id));
    const onlyA = roleA.permissions.filter(p => !idsB.has(p.id)).length;
    const onlyB = roleB.permissions.filter(p => !idsA.has(p.id)).length;
    const both = roleA.permissions.filter(p => idsB.has(p.id)).length;
    return { onlyA, onlyB, both };
  }, [roleA, roleB]);

  return (
    <div className="flex flex-col gap-4">
      {/* Selectors + stats */}
      <div className="rounded-xl border bg-white dark:bg-card shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-44">
            <p className="text-xs text-muted-foreground font-medium mb-1.5">Rol A</p>
            <Select value={roleAId} onValueChange={setRoleAId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol A..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={String(r.id)} disabled={String(r.id) === roleBId}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center pb-2.5">
            <GitCompare className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-44">
            <p className="text-xs text-muted-foreground font-medium mb-1.5">Rol B</p>
            <Select value={roleBId} onValueChange={setRoleBId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol B..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={String(r.id)} disabled={String(r.id) === roleAId}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {stats && (
            <>
              <Separator orientation="vertical" className="h-10 hidden sm:block" />
              <div className="flex gap-5 text-center pb-0.5">
                <div>
                  <p className="font-bold text-lg text-emerald-600 leading-none">{stats.both}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">En común</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-blue-600 leading-none">{stats.onlyA}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Solo en A</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-violet-600 leading-none">{stats.onlyB}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Solo en B</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {roleA && roleB ? (
        <div className="rounded-xl border bg-white dark:bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/30">
                <TableHead className="w-48 pl-4">Permiso</TableHead>
                <TableHead className="text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{roleA.name}</span>
                    {roleA.isSystem && (
                      <Badge variant="secondary" className="text-[9px]">Sistema</Badge>
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-center pr-4">
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{roleB.name}</span>
                    {roleB.isSystem && (
                      <Badge variant="secondary" className="text-[9px]">Sistema</Badge>
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.flatMap(resource => {
                const perms = grouped[resource] ?? [];
                const relevantPerms = perms.filter(perm => {
                  const inA = roleA.permissions.some(p => p.id === perm.id);
                  const inB = roleB.permissions.some(p => p.id === perm.id);
                  return inA || inB;
                });
                if (relevantPerms.length === 0) return [];
                return [
                  <TableRow key={`${resource}-hdr`} className="hover:bg-transparent bg-muted/20">
                    <TableCell colSpan={3} className="pl-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {resourceLabels[resource] ?? resource}
                    </TableCell>
                  </TableRow>,
                  ...relevantPerms.map(perm => {
                    const inA = roleA.permissions.some(p => p.id === perm.id);
                    const inB = roleB.permissions.some(p => p.id === perm.id);
                    const isDiff = inA !== inB;
                    return (
                      <TableRow
                        key={perm.id}
                        className={cn(isDiff && 'bg-amber-50/40 dark:bg-amber-900/10')}
                      >
                        <TableCell className="pl-6 text-sm">
                          {actionLabels[perm.action] ?? perm.action}
                          {isDiff && (
                            <Badge variant="outline" className="ml-2 text-[9px] text-amber-600 border-amber-300">
                              Diferente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {inA
                            ? <Check className="size-4 text-emerald-500 mx-auto" />
                            : <Minus className="size-4 text-muted-foreground/25 mx-auto" />}
                        </TableCell>
                        <TableCell className="text-center pr-4">
                          {inB
                            ? <Check className="size-4 text-emerald-500 mx-auto" />
                            : <Minus className="size-4 text-muted-foreground/25 mx-auto" />}
                        </TableCell>
                      </TableRow>
                    );
                  }),
                ];
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border bg-white dark:bg-card shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <GitCompare className="size-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium">Selecciona dos roles para comparar</p>
          <p className="text-xs text-muted-foreground mt-1">
            Elige el rol A y el rol B en los selectores de arriba
          </p>
        </div>
      )}
    </div>
  );
}

// ── MembersTab ────────────────────────────────────────────────────────────────

function MembersTab({ role, orgId, allRoles }: {
  role: Role; orgId: number; allRoles: Role[];
}) {
  const { data: members = [], isLoading } = useOrgMembers(orgId);
  const updateRoleMutation = useUpdateMemberRole(orgId);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const roleMembers = members.filter(m => m.role.id === role.id);
  const nonRoleMembers = members.filter(m => m.role.id !== role.id);

  const handleAssign = () => {
    if (!selectedMemberId) return;
    updateRoleMutation.mutate(
      { memberId: Number(selectedMemberId), roleId: role.id },
      { onSuccess: () => { setAssignOpen(false); setSelectedMemberId(''); } },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? '...' : `${roleMembers.length} miembro${roleMembers.length !== 1 ? 's' : ''} con este rol`}
        </p>
        {!role.isSystem && (
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="size-4" />
                Asignar miembro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar miembro a "{role.name}"</DialogTitle>
                <DialogDescription>
                  El miembro seleccionado cambiará su rol al asignado.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <Label>Miembro</Label>
                {nonRoleMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todos los miembros ya tienen este rol.
                  </p>
                ) : (
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar miembro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {nonRoleMembers.map(m => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-5">
                              {m.user.avatarUrl && <AvatarImage src={m.user.avatarUrl} />}
                              <AvatarFallback className="text-[9px]">
                                {getInitials(`${m.user.firstName} ${m.user.lastName}`)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{m.user.firstName} {m.user.lastName}</span>
                            <span className="text-muted-foreground text-xs">({m.role.name})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancelar</Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedMemberId || updateRoleMutation.isPending || nonRoleMembers.length === 0}
                >
                  {updateRoleMutation.isPending
                    ? <Loader2 className="size-4 animate-spin" />
                    : <UserPlus className="size-4" />}
                  Asignar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : roleMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="size-9 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">Sin miembros asignados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ningún miembro tiene este rol actualmente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {roleMembers.map(member => (
            <div key={member.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
              <Avatar className="size-9 shrink-0">
                {member.user.avatarUrl && <AvatarImage src={member.user.avatarUrl} />}
                <AvatarFallback className="text-xs">
                  {getInitials(`${member.user.firstName} ${member.user.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.user.firstName} {member.user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">
                  Desde {formatDate(member.joinedAt)}
                </span>
                {!role.isSystem && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select
                        value={String(role.id)}
                        onValueChange={newRoleId =>
                          updateRoleMutation.mutate({ memberId: member.id, roleId: Number(newRoleId) })
                        }
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allRoles.map(r => (
                            <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>Cambiar rol</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── HistoryTab ────────────────────────────────────────────────────────────────

function HistoryTab({ role, orgId }: { role: Role; orgId: number }) {
  const { data, isLoading } = useAuditLog(orgId, { resourceType: 'roles', limit: 50 });

  const entries = useMemo(() => {
    if (!data?.entries) return [];
    return data.entries.filter(
      e => e.resource === 'roles' && e.resourceId === String(role.id),
    );
  }, [data?.entries, role.id]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {isLoading ? '...' : `${entries.length} cambio${entries.length !== 1 ? 's' : ''} registrado${entries.length !== 1 ? 's' : ''}`}
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <History className="size-9 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium">Sin historial</p>
          <p className="text-xs text-muted-foreground mt-1">
            No se han registrado cambios para este rol.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => {
            const body = (entry.metadata as Record<string, any>)?.body as Record<string, any> | undefined;
            return (
              <div key={entry.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    ACTION_PILL[entry.action] ?? 'bg-muted text-muted-foreground',
                  )}>
                    {entry.action === 'CREATE' ? 'Creó' : entry.action === 'UPDATE' ? 'Actualizó' : 'Eliminó'}
                  </span>
                  <span className="text-sm font-medium">{entry.userName}</span>
                  <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                    {formatRelative(entry.timestamp)}
                  </span>
                </div>
                {body && Object.keys(body).filter(k => k !== 'updatedAt').length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(body).filter(k => k !== 'updatedAt').map(k => (
                      <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>
                    ))}
                  </div>
                )}
                {entry.ipAddress && (
                  <p className="text-[10px] text-muted-foreground font-mono">{entry.ipAddress}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── RoleListItem ──────────────────────────────────────────────────────────────

function RoleListItem({
  role, isSelected, memberCount, onClick,
  onDragStart, onDragOver, onDrop, onDragEnd,
  isDragOver, isDragging,
}: {
  role: Role; isSelected: boolean; memberCount: number; onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  isDragging: boolean;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={e => { e.preventDefault(); onDrop(); }}
      className={cn(
        'border-b last:border-b-0 transition-all',
        isDragOver && 'border-t-2 border-primary',
      )}
    >
      <div
        draggable={!role.isSystem}
        onDragStart={!role.isSystem ? onDragStart : undefined}
        onDragEnd={!role.isSystem ? onDragEnd : undefined}
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-muted transition-colors',
          isSelected && 'bg-muted',
          isDragging && 'opacity-40',
        )}
      >
        {role.isSystem ? (
          <div className="w-4 shrink-0" />
        ) : (
          <GripVertical className="size-4 text-muted-foreground/40 hover:text-muted-foreground shrink-0 cursor-grab" />
        )}

        <Shield className="size-4 text-muted-foreground shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{role.name}</span>
            {role.isSystem && <Lock className="size-3 text-muted-foreground shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-muted-foreground">
              {role.permissions.length} permisos
            </span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">
              {memberCount} miembro{memberCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <ChevronRight className="size-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {formatRelative(role.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── RolesPage ─────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: roles, isLoading: rolesLoading } = useOrgRoles(orgId);
  const { data: allPermissions } = usePermissions();
  const { data: members = [] } = useOrgMembers(orgId);
  const createRoleMutation = useCreateRole(orgId);
  const updateRoleMutation = useUpdateRole(orgId);
  const deleteRoleMutation = useDeleteRole(orgId);

  // ── View state
  const [viewMode, setViewMode] = useState<ViewMode>('editor');

  // ── Role selection & editing
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [detailTab, setDetailTab] = useState('permissions');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const [permSearch, setPermSearch] = useState('');

  // ── Drag to reorder
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [roleOrder, setRoleOrder] = useState<number[]>(loadRoleOrder);

  // ── Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermIds, setNewRolePermIds] = useState<Set<number>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // ── Derived data
  const customRoles = roles?.filter(r => !r.isSystem) ?? [];
  const systemRoles = roles?.filter(r => r.isSystem) ?? [];

  const orderedCustomRoles = useMemo(() => {
    if (!customRoles.length) return [];
    if (!roleOrder.length) return customRoles;
    const currentIds = new Set(customRoles.map(r => r.id));
    const validOrder = roleOrder.filter(id => currentIds.has(id));
    const orderMap = new Map(validOrder.map((id, i) => [id, i]));
    const unordered = customRoles.filter(r => !orderMap.has(r.id));
    return [
      ...customRoles
        .filter(r => orderMap.has(r.id))
        .sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!),
      ...unordered,
    ];
  }, [customRoles, roleOrder]);

  const memberCountByRole = useMemo(() => {
    const map = new Map<number, number>();
    for (const m of members) {
      map.set(m.role.id, (map.get(m.role.id) ?? 0) + 1);
    }
    return map;
  }, [members]);

  const filteredPermissions = useMemo(() => {
    if (!allPermissions) return [];
    if (!permSearch) return allPermissions;
    const q = permSearch.toLowerCase();
    return allPermissions.filter(
      p =>
        p.resource.includes(q) ||
        p.action.includes(q) ||
        (resourceLabels[p.resource] ?? p.resource).toLowerCase().includes(q) ||
        (actionLabels[p.action] ?? p.action).toLowerCase().includes(q),
    );
  }, [allPermissions, permSearch]);

  const groupedPermissions = useMemo(
    () => groupPermissions(filteredPermissions),
    [filteredPermissions],
  );

  // ── Effects
  useEffect(() => {
    if (selectedRole) {
      setEditName(selectedRole.name);
      setEditDescription(selectedRole.description ?? '');
      setSelectedPermIds(new Set(selectedRole.permissions.map(p => p.id)));
    }
  }, [selectedRole]);

  // ── Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, roleId: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(roleId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, roleId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId !== roleId) setDragOverId(roleId);
  }, [draggedId]);

  const handleDrop = useCallback((targetId: number) => {
    if (!draggedId || draggedId === targetId) return;
    const base = roleOrder.length > 0
      ? [...roleOrder]
      : customRoles.map(r => r.id);
    if (!base.includes(draggedId)) base.push(draggedId);
    if (!base.includes(targetId)) base.push(targetId);
    const from = base.indexOf(draggedId);
    const to = base.indexOf(targetId);
    base.splice(from, 1);
    base.splice(to, 0, draggedId);
    localStorage.setItem(ROLE_ORDER_KEY, JSON.stringify(base));
    setRoleOrder(base);
    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, roleOrder, customRoles]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  // ── Permission handlers
  const handleTogglePermission = (permId: number) => {
    if (selectedRole?.isSystem) return;
    setSelectedPermIds(prev => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  };

  const handleToggleCategory = (perms: Permission[]) => {
    if (selectedRole?.isSystem) return;
    const ids = perms.map(p => p.id);
    const allChecked = ids.every(id => selectedPermIds.has(id));
    setSelectedPermIds(prev => {
      const next = new Set(prev);
      allChecked ? ids.forEach(id => next.delete(id)) : ids.forEach(id => next.add(id));
      return next;
    });
  };

  const handleSelectAllPermissions = () => {
    if (!allPermissions) return;
    if (selectedPermIds.size === allPermissions.length) {
      setSelectedPermIds(new Set());
    } else {
      setSelectedPermIds(new Set(allPermissions.map(p => p.id)));
    }
  };

  // ── Role actions
  const handleSaveRole = () => {
    if (!selectedRole || selectedRole.isSystem) return;
    updateRoleMutation.mutate(
      {
        roleId: selectedRole.id,
        data: { name: editName, description: editDescription || null, permissionIds: Array.from(selectedPermIds) },
      },
      { onSuccess: updated => setSelectedRole(updated) },
    );
  };

  const handleCreateRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createRoleMutation.mutate(
      { name: newRoleName, description: newRoleDescription || null, permissionIds: Array.from(newRolePermIds) },
      {
        onSuccess: created => {
          setCreateOpen(false);
          setNewRoleName('');
          setNewRoleDescription('');
          setNewRolePermIds(new Set());
          setSelectedRole(created);
        },
      },
    );
  };

  const handleDuplicateRole = (role: Role) => {
    createRoleMutation.mutate(
      {
        name: `${role.name} (copia)`,
        description: role.description ?? null,
        permissionIds: role.permissions.map(p => p.id),
      },
      { onSuccess: created => setSelectedRole(created) },
    );
  };

  const handleDeleteRole = (roleId: number) => {
    deleteRoleMutation.mutate(roleId, {
      onSuccess: () => {
        if (selectedRole?.id === roleId) setSelectedRole(null);
        setDeleteConfirmId(null);
      },
    });
  };

  const applyTemplate = (key: string) => {
    const template = PERMISSION_TEMPLATES[key];
    if (!template || !allPermissions) return;
    setNewRolePermIds(new Set(allPermissions.filter(p => template.actions.includes(p.action)).map(p => p.id)));
  };

  const hasUnsavedChanges =
    !!selectedRole &&
    !selectedRole.isSystem &&
    (editName !== selectedRole.name ||
      (editDescription || '') !== (selectedRole.description ?? '') ||
      JSON.stringify(Array.from(selectedPermIds).sort((a, b) => a - b)) !==
        JSON.stringify(selectedRole.permissions.map(p => p.id).sort((a, b) => a - b)));

  // ── Loading skeleton
  if (rolesLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex gap-6">
          <div className="w-72 space-y-2 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="flex-1 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Create dialog content
  const createDialog = (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Crear rol
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleCreateRole}>
          <DialogHeader>
            <DialogTitle>Crear nuevo rol</DialogTitle>
            <DialogDescription>
              Define nombre, descripción y permisos de inicio para el nuevo rol.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Nombre del rol</Label>
                <Input
                  id="role-name"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="Ej: Líder de equipo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-desc">Descripción</Label>
                <Input
                  id="role-desc"
                  value={newRoleDescription}
                  onChange={e => setNewRoleDescription(e.target.value)}
                  placeholder="Opcional..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plantilla de inicio <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PERMISSION_TEMPLATES).map(([key, t]) => {
                  const count = (allPermissions ?? []).filter(p => t.actions.includes(p.action)).length;
                  const isActive = newRolePermIds.size > 0 && [...(allPermissions ?? [])].filter(p => t.actions.includes(p.action)).every(p => newRolePermIds.has(p.id)) && newRolePermIds.size === count;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyTemplate(key)}
                      className={cn(
                        'rounded-lg border p-2.5 text-left hover:bg-muted transition-colors',
                        isActive && 'ring-2 ring-primary border-primary',
                      )}
                    >
                      <span className={cn('inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold', t.color)}>
                        {t.label}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">{t.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{count} permisos</p>
                    </button>
                  );
                })}
              </div>
              {newRolePermIds.size > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="size-3 text-emerald-500" />
                  {newRolePermIds.size} permisos preseleccionados
                  <button
                    type="button"
                    onClick={() => setNewRolePermIds(new Set())}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending
                ? <Loader2 className="size-4 animate-spin" />
                : <Plus className="size-4" />}
              Crear rol
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // ── Render
  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles y permisos</h1>
            <p className="text-sm text-muted-foreground">
              Configura los roles y sus permisos para controlar el acceso.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportRolesAsJson(roles ?? [])}
                >
                  <Download className="size-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar roles como JSON</TooltipContent>
            </Tooltip>
            {createDialog}
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total roles"
            value={roles?.length ?? 0}
            icon={Shield}
            iconBg="bg-slate-100 dark:bg-slate-800"
            iconColor="text-slate-600 dark:text-slate-400"
          />
          <StatCard
            label="Personalizados"
            value={customRoles.length}
            icon={ShieldCheck}
            iconBg="bg-violet-100 dark:bg-violet-900/40"
            iconColor="text-violet-600 dark:text-violet-400"
          />
          <StatCard
            label="Del sistema"
            value={systemRoles.length}
            icon={ShieldAlert}
            iconBg="bg-amber-100 dark:bg-amber-900/40"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label="Permisos disponibles"
            value={allPermissions?.length ?? 0}
            icon={KeyRound}
            iconBg="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        </div>

        {/* ── View mode tabs ─────────────────────────────────────────────── */}
        <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
          <TabsList className="w-fit">
            <TabsTrigger value="editor" className="gap-1.5">
              <Shield className="size-3.5" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-1.5">
              <LayoutGrid className="size-3.5" />
              Matriz
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-1.5">
              <GitCompare className="size-3.5" />
              Comparar
            </TabsTrigger>
          </TabsList>

          {/* ── Editor ──────────────────────────────────────────────────── */}
          <TabsContent value="editor" className="mt-4">
            <div className="flex gap-6 items-start">

              {/* Roles list */}
              <Card className="w-72 shrink-0 shadow-sm bg-white dark:bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Roles</CardTitle>
                  <CardDescription>
                    {customRoles.length} personalizado{customRoles.length !== 1 ? 's' : ''},{' '}
                    {systemRoles.length} del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {orderedCustomRoles.length > 0 && (
                    <>
                      <div className="px-4 py-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Personalizados
                        </span>
                      </div>
                      {orderedCustomRoles.map(role => (
                        <RoleListItem
                          key={role.id}
                          role={role}
                          isSelected={selectedRole?.id === role.id}
                          memberCount={memberCountByRole.get(role.id) ?? 0}
                          onClick={() => { setSelectedRole(role); setDetailTab('permissions'); }}
                          onDragStart={e => handleDragStart(e, role.id)}
                          onDragOver={e => handleDragOver(e, role.id)}
                          onDrop={() => handleDrop(role.id)}
                          onDragEnd={handleDragEnd}
                          isDragOver={dragOverId === role.id}
                          isDragging={draggedId === role.id}
                        />
                      ))}
                    </>
                  )}

                  {systemRoles.length > 0 && (
                    <>
                      <div className={cn('px-4 py-1.5', customRoles.length > 0 && 'mt-1')}>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Sistema
                        </span>
                      </div>
                      {systemRoles.map(role => (
                        <RoleListItem
                          key={role.id}
                          role={role}
                          isSelected={selectedRole?.id === role.id}
                          memberCount={memberCountByRole.get(role.id) ?? 0}
                          onClick={() => { setSelectedRole(role); setDetailTab('permissions'); }}
                          onDragStart={() => {}}
                          onDragOver={e => handleDragOver(e, role.id)}
                          onDrop={() => handleDrop(role.id)}
                          onDragEnd={handleDragEnd}
                          isDragOver={false}
                          isDragging={false}
                        />
                      ))}
                    </>
                  )}

                  {(roles?.length ?? 0) === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No hay roles configurados.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Role detail */}
              <div className="flex-1 min-w-0">
                {selectedRole ? (
                  <Card className="shadow-sm bg-white dark:bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <CardTitle className="text-base">
                            {selectedRole.isSystem ? selectedRole.name : (editName || selectedRole.name)}
                          </CardTitle>
                          {selectedRole.isSystem ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="cursor-default">
                                  <Lock className="size-3 mr-1" />Sistema
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Los roles del sistema no se pueden modificar</TooltipContent>
                            </Tooltip>
                          ) : hasUnsavedChanges && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                              Sin guardar
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateRole(selectedRole)}
                                disabled={createRoleMutation.isPending}
                              >
                                <Copy className="size-4" />
                                <span className="hidden sm:inline">Duplicar</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {selectedRole.isSystem
                                ? 'Crear un rol personalizado basado en este'
                                : 'Crear copia de este rol'}
                            </TooltipContent>
                          </Tooltip>

                          {!selectedRole.isSystem && (
                            <>
                              {deleteConfirmId === selectedRole.id ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">¿Confirmar?</span>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteRole(selectedRole.id)}
                                    disabled={deleteRoleMutation.isPending}
                                  >
                                    {deleteRoleMutation.isPending
                                      ? <Loader2 className="size-4 animate-spin" />
                                      : <Trash2 className="size-4" />}
                                    Eliminar
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                                    <X className="size-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeleteConfirmId(selectedRole.id)}
                                >
                                  <Trash2 className="size-4" />
                                  <span className="hidden sm:inline">Eliminar</span>
                                </Button>
                              )}

                              <Button
                                size="sm"
                                onClick={handleSaveRole}
                                disabled={updateRoleMutation.isPending || !hasUnsavedChanges}
                              >
                                {updateRoleMutation.isPending
                                  ? <Loader2 className="size-4 animate-spin" />
                                  : <Save className="size-4" />}
                                Guardar
                              </Button>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => { setSelectedRole(null); setDeleteConfirmId(null); }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Tabs value={detailTab} onValueChange={setDetailTab}>
                        <TabsList className="mb-5">
                          <TabsTrigger value="permissions" className="gap-1.5">
                            <KeyRound className="size-3.5" />
                            Permisos
                          </TabsTrigger>
                          <TabsTrigger value="members" className="gap-1.5">
                            <Users className="size-3.5" />
                            Miembros
                            {memberCountByRole.has(selectedRole.id) && (
                              <Badge variant="secondary" className="ml-0.5 h-4 px-1.5 text-[10px]">
                                {memberCountByRole.get(selectedRole.id)}
                              </Badge>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="history" className="gap-1.5">
                            <History className="size-3.5" />
                            Historial
                          </TabsTrigger>
                        </TabsList>

                        {/* ── Permisos ─────────────────────────────────── */}
                        <TabsContent value="permissions" className="space-y-5 mt-0">
                          {/* Name & description (editable) */}
                          {!selectedRole.isSystem && (
                            <>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Nombre</Label>
                                  <Input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Descripción</Label>
                                  <Input
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    placeholder="Descripción del rol"
                                  />
                                </div>
                              </div>
                              <Separator />
                            </>
                          )}

                          {/* Readable summary */}
                          <PermissionSummary permissions={selectedRole.permissions} />

                          {/* Permissions header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-semibold">Permisos</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {selectedPermIds.size} de {allPermissions?.length ?? 0} seleccionados
                              </p>
                            </div>
                            {!selectedRole.isSystem && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs gap-1.5"
                                  onClick={handleSelectAllPermissions}
                                >
                                  {selectedPermIds.size === (allPermissions?.length ?? 0) ? (
                                    <><Square className="size-3.5" />Deseleccionar todos</>
                                  ) : (
                                    <><CheckCheck className="size-3.5" />Seleccionar todos</>
                                  )}
                                </Button>
                                <Separator orientation="vertical" className="h-5" />
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                  <Input
                                    className="pl-8 h-8 text-xs w-44"
                                    placeholder="Buscar permiso..."
                                    value={permSearch}
                                    onChange={e => setPermSearch(e.target.value)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Permission groups */}
                          {Object.keys(groupedPermissions).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              {permSearch ? 'Sin resultados.' : 'No hay permisos disponibles.'}
                            </p>
                          ) : (
                            <div className="space-y-5">
                              {Object.entries(groupedPermissions).map(([resource, perms]) => {
                                const allChecked = perms.every(p => selectedPermIds.has(p.id));
                                const someChecked = !allChecked && perms.some(p => selectedPermIds.has(p.id));
                                return (
                                  <div key={resource}>
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {resourceLabels[resource] ?? resource}
                                      </h4>
                                      {!selectedRole.isSystem && (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleCategory(perms)}
                                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                          {allChecked ? (
                                            <CheckSquare className="size-3.5" />
                                          ) : someChecked ? (
                                            <CheckSquare className="size-3.5 opacity-40" />
                                          ) : (
                                            <Square className="size-3.5" />
                                          )}
                                          {allChecked ? 'Quitar todos' : 'Seleccionar todos'}
                                        </button>
                                      )}
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                      {perms.map(perm => {
                                        const isChecked = selectedPermIds.has(perm.id);
                                        return (
                                          <label
                                            key={perm.id}
                                            className={cn(
                                              'flex items-start gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors',
                                              !selectedRole.isSystem
                                                ? 'cursor-pointer hover:bg-muted/50'
                                                : 'cursor-default',
                                              isChecked
                                                ? 'border-primary/40 bg-primary/5'
                                                : 'border-border',
                                              selectedRole.isSystem && !isChecked && 'opacity-40',
                                            )}
                                          >
                                            <Checkbox
                                              checked={isChecked}
                                              onCheckedChange={() => handleTogglePermission(perm.id)}
                                              disabled={selectedRole.isSystem}
                                              className="shrink-0 mt-0.5"
                                            />
                                            <div className="min-w-0">
                                              <span className="block truncate font-medium">
                                                {actionLabels[perm.action] ?? perm.action}
                                              </span>
                                              {perm.description && (
                                                <span className="block text-[10px] text-muted-foreground leading-tight mt-0.5">
                                                  {perm.description}
                                                </span>
                                              )}
                                            </div>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </TabsContent>

                        {/* ── Miembros ─────────────────────────────────── */}
                        <TabsContent value="members" className="mt-0">
                          <MembersTab
                            role={selectedRole}
                            orgId={orgId}
                            allRoles={roles ?? []}
                          />
                        </TabsContent>

                        {/* ── Historial ────────────────────────────────── */}
                        <TabsContent value="history" className="mt-0">
                          <HistoryTab role={selectedRole} orgId={orgId} />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-sm bg-white dark:bg-card">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                        <Shield className="size-8 text-muted-foreground/60" />
                      </div>
                      <h3 className="text-sm font-semibold mb-1">Selecciona un rol</h3>
                      <p className="text-xs text-muted-foreground max-w-[220px]">
                        Haz clic en un rol de la lista para ver y editar sus permisos.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="size-4" />
                        Crear nuevo rol
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Matriz ──────────────────────────────────────────────────── */}
          <TabsContent value="matrix" className="mt-4">
            <MatrixView roles={roles ?? []} allPermissions={allPermissions ?? []} />
          </TabsContent>

          {/* ── Comparar ────────────────────────────────────────────────── */}
          <TabsContent value="compare" className="mt-4">
            <CompareView roles={roles ?? []} allPermissions={allPermissions ?? []} />
          </TabsContent>
        </Tabs>

      </div>
    </TooltipProvider>
  );
}
