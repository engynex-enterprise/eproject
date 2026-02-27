'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  UserPlus,
  MoreHorizontal,
  Trash2,
  Mail,
  Clock,
  X,
  Loader2,
  Search,
  ChevronDown,
  UserRoundPlus,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  LayoutList,
  LayoutGrid,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  UserCheck,
  TrendingUp,
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
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  useOrgMembers,
  useOrgRoles,
  useInviteMember,
  useCreateMember,
  useRemoveMember,
  useUpdateMemberRole,
  usePendingInvitations,
  useCancelInvitation,
} from '@/modules/organization/hooks/use-organization';
import type { OrganizationMember } from '@/shared/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function isNewThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function exportToCsv(members: OrganizationMember[]) {
  const header = ['Nombre', 'Apellido', 'Correo', 'Rol', 'Se unio'];
  const rows = members.map((m) => [
    m.user.firstName,
    m.user.lastName,
    m.user.email,
    m.role.name,
    formatDate(m.joinedAt),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((c) => `"${c}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'miembros.csv';
  a.click();
  URL.revokeObjectURL(url);
}

type SortKey = 'name' | 'role' | 'joined';
type SortDir = 'asc' | 'desc';
type ViewMode = 'table' | 'card';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: members, isLoading: membersLoading } = useOrgMembers(orgId);
  const { data: roles } = useOrgRoles(orgId);
  const { data: invitations, isLoading: invitationsLoading } =
    usePendingInvitations(orgId);

  const inviteMember = useInviteMember(orgId);
  const createMemberMutation = useCreateMember(orgId);
  const removeMember = useRemoveMember(orgId);
  const updateMemberRole = useUpdateMemberRole(orgId);
  const cancelInvitation = useCancelInvitation(orgId);

  // View & sort
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Search / filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Multi-select
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkRoleId, setBulkRoleId] = useState('');

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRoleId, setCreateRoleId] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // ── Sort toggle ─────────────────────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="size-3 ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="size-3 ml-1" />
      : <ArrowDown className="size-3 ml-1" />;
  };

  // ── Filtered & sorted members ───────────────────────────────────────────────
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const filtered = members.filter((m) => {
      const fullName = `${m.user.firstName} ${m.user.lastName}`.toLowerCase();
      const matchesSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        m.user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole =
        roleFilter === 'all' || String(m.role.id) === roleFilter;
      return matchesSearch && matchesRole;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') {
        cmp = `${a.user.firstName} ${a.user.lastName}`.localeCompare(
          `${b.user.firstName} ${b.user.lastName}`,
        );
      } else if (sortKey === 'role') {
        cmp = a.role.name.localeCompare(b.role.name);
      } else {
        cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [members, search, roleFilter, sortKey, sortDir]);

  // ── Selection helpers ───────────────────────────────────────────────────────
  const allSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selected.has(m.id));
  const someSelected = selected.size > 0;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredMembers.map((m) => m.id)));
    }
  }, [allSelected, filteredMembers]);

  const toggleOne = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelected(new Set());

  const handleBulkRemove = () => {
    selected.forEach((id) => removeMember.mutate(id));
    clearSelection();
  };

  const handleBulkRoleChange = (roleId: string) => {
    selected.forEach((memberId) =>
      updateMemberRole.mutate({ memberId, roleId: Number(roleId) }),
    );
    clearSelection();
    setBulkRoleId('');
  };

  // ── Invite handler ──────────────────────────────────────────────────────────
  const handleInvite = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRoleId) return;
    inviteMember.mutate(
      { email: inviteEmail, roleId: Number(inviteRoleId) },
      {
        onSuccess: () => {
          setInviteOpen(false);
          setInviteEmail('');
          setInviteRoleId('');
        },
      },
    );
  };

  // ── Create handler ──────────────────────────────────────────────────────────
  const handleCreate = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!createFirstName || !createLastName || !createEmail || !createPassword || !createRoleId) return;
    createMemberMutation.mutate(
      {
        firstName: createFirstName,
        lastName: createLastName,
        email: createEmail,
        password: createPassword,
        roleId: Number(createRoleId),
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setCreateFirstName('');
          setCreateLastName('');
          setCreateEmail('');
          setCreatePassword('');
          setCreateRoleId('');
        },
      },
    );
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (membersLoading) {
    return (
      <div className="space-y-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="border-b pb-6 space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Metrics ─────────────────────────────────────────────────────────────────
  const memberCount = members?.length ?? 0;
  const invitationCount = invitations?.length ?? 0;
  const newThisMonth = members?.filter((m) => isNewThisMonth(m.joinedAt)).length ?? 0;
  const uniqueRoles = new Set(members?.map((m) => m.role.id)).size;

  const stats = [
    {
      label: 'Total miembros',
      value: memberCount,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Nuevos este mes',
      value: newThisMonth,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Invit. pendientes',
      value: invitationCount,
      icon: UserCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Roles activos',
      value: uniqueRoles,
      icon: Shield,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950',
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-0 pb-24">

        {/* ── Metrics row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-sm bg-white dark:bg-card">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`flex size-9 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`size-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="border-b pb-6 mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Personas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los miembros de tu organizacion y sus roles.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="shrink-0">
                <UserPlus className="size-4" />
                Añadir persona
                <ChevronDown className="size-3.5 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                <Mail className="size-4" />
                <div>
                  <p className="text-sm font-medium">Invitar por correo</p>
                  <p className="text-xs text-muted-foreground">Enviar enlace de invitacion</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                <UserRoundPlus className="size-4" />
                <div>
                  <p className="text-sm font-medium">Crear persona</p>
                  <p className="text-xs text-muted-foreground">Crear cuenta directamente</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Role filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort (table only) */}
          {viewMode === 'table' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <ArrowUpDown className="size-3.5" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Ordenar por
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {([
                  { key: 'name', label: 'Nombre' },
                  { key: 'role', label: 'Rol' },
                  { key: 'joined', label: 'Fecha de ingreso' },
                ] as { key: SortKey; label: string }[]).map((opt) => (
                  <DropdownMenuItem
                    key={opt.key}
                    onClick={() => handleSort(opt.key)}
                    className="flex items-center justify-between"
                  >
                    {opt.label}
                    {sortKey === opt.key && (
                      sortDir === 'asc'
                        ? <ArrowUp className="size-3.5" />
                        : <ArrowDown className="size-3.5" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="ml-auto flex items-center gap-2">
            {/* Export */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={() => exportToCsv(filteredMembers)}
                  disabled={filteredMembers.length === 0}
                >
                  <Download className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar CSV</TooltipContent>
            </Tooltip>

            {/* View toggle */}
            <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex size-7 items-center justify-center rounded transition-colors ${
                      viewMode === 'table'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutList className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Vista tabla</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`flex size-7 items-center justify-center rounded transition-colors ${
                      viewMode === 'card'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Vista tarjeta</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* ── Bulk action bar ──────────────────────────────────────────────── */}
        {someSelected && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/60 px-4 py-2.5 mb-4 text-sm">
            <span className="font-medium text-muted-foreground">
              {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <Select value={bulkRoleId} onValueChange={handleBulkRoleChange}>
              <SelectTrigger className="h-7 w-44 text-xs">
                <SelectValue placeholder="Cambiar rol..." />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={handleBulkRemove}
            >
              <Trash2 className="size-3.5" />
              Eliminar ({selected.size})
            </Button>
            <button
              onClick={clearSelection}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* ── Table view ──────────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <Card className="shadow-sm bg-white dark:bg-card">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Miembros activos
                  <span className="ml-2 font-normal text-muted-foreground">
                    {filteredMembers.length !== memberCount
                      ? `(${filteredMembers.length} de ${memberCount})`
                      : `(${memberCount})`}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 pl-6">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Seleccionar todos"
                      />
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center text-xs font-medium hover:text-foreground"
                        onClick={() => handleSort('name')}
                      >
                        Miembro <SortIcon col="name" />
                      </button>
                    </TableHead>
                    <TableHead className="w-44">
                      <button
                        className="flex items-center text-xs font-medium hover:text-foreground"
                        onClick={() => handleSort('role')}
                      >
                        Rol <SortIcon col="role" />
                      </button>
                    </TableHead>
                    <TableHead className="w-28">Estado</TableHead>
                    <TableHead className="w-36">
                      <button
                        className="flex items-center text-xs font-medium hover:text-foreground"
                        onClick={() => handleSort('joined')}
                      >
                        Se unio <SortIcon col="joined" />
                      </button>
                    </TableHead>
                    <TableHead className="w-10 pr-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const fullName = `${member.user.firstName} ${member.user.lastName}`;
                    const colorClass = getAvatarColor(fullName);
                    const isChecked = selected.has(member.id);
                    return (
                      <TableRow
                        key={member.id}
                        data-state={isChecked ? 'selected' : undefined}
                        className={isChecked ? 'bg-muted/40' : undefined}
                      >
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleOne(member.id)}
                            aria-label={`Seleccionar ${fullName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 shrink-0">
                              <AvatarImage src={member.user.avatarUrl ?? undefined} />
                              <AvatarFallback className={`text-xs text-white ${colorClass}`}>
                                {getInitials(member.user.firstName, member.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-sm leading-none truncate">
                                {fullName}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                {member.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={String(member.role.id)}
                            onValueChange={(val) =>
                              updateMemberRole.mutate({
                                memberId: member.id,
                                roleId: Number(val),
                              })
                            }
                          >
                            <SelectTrigger className="h-7 text-xs w-36 bg-transparent">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles?.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 block" />
                            <span className="text-xs text-muted-foreground">Activo</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(member.joinedAt)}
                        </TableCell>
                        <TableCell className="pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-xs">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => removeMember.mutate(member.id)}
                              >
                                <Trash2 className="size-4" />
                                Eliminar miembro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {filteredMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="size-10 text-muted-foreground/30" />
                          <p className="text-sm font-medium text-muted-foreground">
                            {search || roleFilter !== 'all'
                              ? 'No se encontraron miembros'
                              : 'No hay miembros'}
                          </p>
                          {(search || roleFilter !== 'all') && (
                            <button
                              onClick={() => { setSearch(''); setRoleFilter('all'); }}
                              className="text-xs text-primary hover:underline"
                            >
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* ── Card view ───────────────────────────────────────────────────── */}
        {viewMode === 'card' && (
          <>
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16">
                <Users className="size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  {search || roleFilter !== 'all'
                    ? 'No se encontraron miembros'
                    : 'No hay miembros'}
                </p>
                {(search || roleFilter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setRoleFilter('all'); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMembers.map((member) => {
                  const fullName = `${member.user.firstName} ${member.user.lastName}`;
                  const colorClass = getAvatarColor(fullName);
                  const isChecked = selected.has(member.id);
                  return (
                    <Card
                      key={member.id}
                      className={`shadow-sm bg-white dark:bg-card transition-colors ${
                        isChecked ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleOne(member.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="size-10 shrink-0">
                                <AvatarImage src={member.user.avatarUrl ?? undefined} />
                                <AvatarFallback className={`text-sm text-white font-medium ${colorClass}`}>
                                  {getInitials(member.user.firstName, member.user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate">{fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-xs" className="shrink-0">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => removeMember.mutate(member.id)}
                                  >
                                    <Trash2 className="size-4" />
                                    Eliminar miembro
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <Separator className="mb-3" />

                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Rol</span>
                                <Select
                                  value={String(member.role.id)}
                                  onValueChange={(val) =>
                                    updateMemberRole.mutate({
                                      memberId: member.id,
                                      roleId: Number(val),
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-6 text-xs w-32 border-0 bg-muted/60 px-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles?.map((role) => (
                                      <SelectItem key={role.id} value={String(role.id)}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Estado</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="size-1.5 rounded-full bg-emerald-500 block" />
                                  <span className="text-xs">Activo</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Se unio</span>
                                <span>{formatDate(member.joinedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Pending invitations ──────────────────────────────────────────── */}
        <Card className="shadow-sm bg-white dark:bg-card mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">
                Invitaciones pendientes
                <span className="ml-2 text-muted-foreground font-normal">
                  ({invitationCount})
                </span>
              </CardTitle>
            </div>
            <CardDescription>
              Invitaciones enviadas que aun no han sido aceptadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : invitations && invitations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Correo</TableHead>
                    <TableHead className="w-44">Rol</TableHead>
                    <TableHead className="w-36">Invitado</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                            <Mail className="size-3.5 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium">{invitation.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {invitation.role.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(invitation.invitedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  inviteMember.mutate({
                                    email: invitation.email,
                                    roleId: invitation.role.id,
                                  })
                                }
                                disabled={inviteMember.isPending}
                              >
                                <RefreshCw className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reenviar invitacion</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => cancelInvitation.mutate(invitation.id)}
                                disabled={cancelInvitation.isPending}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancelar invitacion</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <Mail className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No hay invitaciones pendientes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Invite dialog ────────────────────────────────────────────────── */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleInvite}>
              <DialogHeader>
                <DialogTitle>Invitar por correo</DialogTitle>
                <DialogDescription>
                  Se enviara un enlace de invitacion a la direccion de correo indicada.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Correo electronico</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Rol</Label>
                  <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={inviteMember.isPending || !inviteEmail || !inviteRoleId}>
                  {inviteMember.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  Enviar invitacion
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Create member dialog ─────────────────────────────────────────── */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Crear persona</DialogTitle>
                <DialogDescription>
                  Crea una cuenta nueva y anadela directamente a la organizacion.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="create-firstname">Nombre</Label>
                    <Input
                      id="create-firstname"
                      placeholder="Juan"
                      value={createFirstName}
                      onChange={(e) => setCreateFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-lastname">Apellido</Label>
                    <Input
                      id="create-lastname"
                      placeholder="Garcia"
                      value={createLastName}
                      onChange={(e) => setCreateLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Correo electronico</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="juan@empresa.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">Contrasena temporal</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showCreatePassword ? 'text' : 'password'}
                      placeholder="Min. 8 caracteres"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                    >
                      {showCreatePassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El usuario debera cambiar su contrasena al iniciar sesion.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="create-role">Rol</Label>
                  <Select value={createRoleId} onValueChange={setCreateRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMemberMutation.isPending ||
                    !createFirstName ||
                    !createLastName ||
                    !createEmail ||
                    !createPassword ||
                    !createRoleId
                  }
                >
                  {createMemberMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UserRoundPlus className="size-4" />
                  )}
                  Crear persona
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
