'use client';

import { useState, useMemo } from 'react';
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

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: members, isLoading: membersLoading } = useOrgMembers(orgId);
  const { data: roles } = useOrgRoles(orgId);
  const { data: invitations, isLoading: invitationsLoading } =
    usePendingInvitations(orgId);

  const inviteMember = useInviteMember(orgId);
  const createMember = useCreateMember(orgId);
  const removeMember = useRemoveMember(orgId);
  const updateMemberRole = useUpdateMemberRole(orgId);
  const cancelInvitation = useCancelInvitation(orgId);

  // Search / filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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

  const handleCreate = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!createFirstName || !createLastName || !createEmail || !createPassword || !createRoleId) return;
    createMember.mutate(
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

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m) => {
      const fullName = `${m.user.firstName} ${m.user.lastName}`.toLowerCase();
      const matchesSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        m.user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole =
        roleFilter === 'all' || String(m.role.id) === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (membersLoading) {
    return (
      <div className="space-y-8 pb-24">
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

  const memberCount = members?.length ?? 0;
  const invitationCount = invitations?.length ?? 0;

  return (
    <div className="space-y-0 pb-24">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="border-b pb-6 mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Personas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los miembros de tu organizacion y sus roles.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              <span>{memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}</span>
            </div>
            {invitationCount > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{invitationCount} invitacion{invitationCount !== 1 ? 'es' : ''} pendiente{invitationCount !== 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add dropdown */}
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

      {/* ── Search & filter ───────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
      </div>

      {/* ── Members table ─────────────────────────────────────────────────── */}
      <Card className="shadow-sm bg-white dark:bg-card">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold">
            Miembros activos
            {filteredMembers.length !== memberCount && (
              <span className="ml-2 text-muted-foreground font-normal">
                ({filteredMembers.length} de {memberCount})
              </span>
            )}
            {filteredMembers.length === memberCount && (
              <span className="ml-2 text-muted-foreground font-normal">
                ({memberCount})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead className="w-44">Rol</TableHead>
                <TableHead className="w-36">Se unio</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const fullName = `${member.user.firstName} ${member.user.lastName}`;
                const colorClass = getAvatarColor(fullName);
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={member.user.avatarUrl ?? undefined} />
                          <AvatarFallback className={`text-xs text-white ${colorClass}`}>
                            {getInitials(member.user.firstName, member.user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm leading-none">
                            {fullName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
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
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(member.joinedAt)}
                    </TableCell>
                    <TableCell>
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
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="size-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        {search || roleFilter !== 'all'
                          ? 'No se encontraron miembros con ese filtro.'
                          : 'No hay miembros en esta organizacion.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Pending invitations ───────────────────────────────────────────── */}
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
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Reenviar invitacion"
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
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Cancelar invitacion"
                          onClick={() => cancelInvitation.mutate(invitation.id)}
                          disabled={cancelInvitation.isPending}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </Button>
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

      {/* ── Invite dialog ─────────────────────────────────────────────────── */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invitar por correo</DialogTitle>
              <DialogDescription>
                Se enviara un enlace de invitacion a la direccion de correo
                indicada.
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={inviteMember.isPending || !inviteEmail || !inviteRoleId}
              >
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

      {/* ── Create member dialog ──────────────────────────────────────────── */}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createMember.isPending ||
                  !createFirstName ||
                  !createLastName ||
                  !createEmail ||
                  !createPassword ||
                  !createRoleId
                }
              >
                {createMember.isPending ? (
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
  );
}
