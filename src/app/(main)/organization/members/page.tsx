'use client';

import { useState } from 'react';
import {
  UserPlus,
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  Mail,
  Clock,
  X,
  Loader2,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  DialogTrigger,
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
  useRemoveMember,
  useUpdateMemberRole,
  usePendingInvitations,
  useCancelInvitation,
} from '@/modules/organization/hooks/use-organization';
import { OrgSettingsSidebar } from '@/app/(main)/organization/page';

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

export default function MembersPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: members, isLoading: membersLoading } = useOrgMembers(orgId);
  const { data: roles } = useOrgRoles(orgId);
  const { data: invitations, isLoading: invitationsLoading } =
    usePendingInvitations(orgId);

  const inviteMember = useInviteMember(orgId);
  const removeMember = useRemoveMember(orgId);
  const updateMemberRole = useUpdateMemberRole(orgId);
  const cancelInvitation = useCancelInvitation(orgId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');

  const handleInvite = (e: React.FormEvent) => {
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

  const handleRemoveMember = (memberId: number) => {
    removeMember.mutate(memberId);
  };

  const handleChangeRole = (memberId: number, roleId: number) => {
    updateMemberRole.mutate({ memberId, roleId });
  };

  if (membersLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 p-6">
        <OrgSettingsSidebar />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6">
      <OrgSettingsSidebar />
      <div className="flex-1 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Miembros</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestiona los miembros de tu organizacion y sus roles.
            </p>
          </div>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="size-4" />
                Invitar miembro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle>Invitar miembro</DialogTitle>
                  <DialogDescription>
                    Envia una invitacion por correo electronico para unirse a la
                    organizacion.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">
                      Correo electronico
                    </Label>
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
                    <Select
                      value={inviteRoleId}
                      onValueChange={setInviteRoleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role) => (
                          <SelectItem
                            key={role.id}
                            value={String(role.id)}
                          >
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
                  <Button type="submit" disabled={inviteMember.isPending}>
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
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Miembros activos ({members?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Se unio</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              member.user.firstName,
                              member.user.lastName,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {member.user.firstName} {member.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.role.name}</Badge>
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
                          {roles?.map((role) => (
                            <DropdownMenuItem
                              key={role.id}
                              onClick={() =>
                                handleChangeRole(member.id, role.id)
                              }
                            >
                              <ShieldCheck className="size-4" />
                              Cambiar a {role.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="size-4" />
                            Eliminar miembro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!members || members.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      No hay miembros en esta organizacion.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                Invitaciones pendientes
              </div>
            </CardTitle>
            <CardDescription>
              Invitaciones que aun no han sido aceptadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : invitations && invitations.length > 0 ? (
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">
                          {invitation.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Rol: {invitation.role.name} &middot; Invitado el{' '}
                          {formatDate(invitation.invitedAt)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => cancelInvitation.mutate(invitation.id)}
                      disabled={cancelInvitation.isPending}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay invitaciones pendientes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
