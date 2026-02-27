'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MoreHorizontal,
  Loader2,
  Users,
  Mail,
  Shield,
} from 'lucide-react';
import type { ApiResponse, OrganizationMember, User } from '@/shared/types';
import { apiClient } from '@/shared/lib/api-client';
import { useProject } from '@/modules/projects/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProjectMember {
  id: number;
  userId: number;
  user: User;
  roleId: number;
  roleName: string;
}

export default function MembersPage() {
  const params = useParams<{ projectKey: string }>();
  const queryClient = useQueryClient();
  const { data: projectData } = useProject(params.projectKey);
  const projectId = projectData?.data?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['project-members', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<ProjectMember[]>>(
        `/projects/key/${params.projectKey}/members`,
      ),
    enabled: !!params.projectKey,
  });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const inviteMember = useMutation({
    mutationFn: () =>
      apiClient.post(`/projects/${projectId}/members/invite`, {
        email,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', params.projectKey],
      });
      setInviteOpen(false);
      setEmail('');
      setRole('member');
    },
  });

  const removeMember = useMutation({
    mutationFn: (memberId: number) =>
      apiClient.delete(`/projects/${projectId}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', params.projectKey],
      });
    },
  });

  const changeRole = useMutation({
    mutationFn: ({
      memberId,
      roleId,
    }: {
      memberId: number;
      roleId: number;
    }) =>
      apiClient.patch(`/projects/${projectId}/members/${memberId}`, {
        roleId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', params.projectKey],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const members = data?.data ?? [];

  return (
    <div className="max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Miembros del proyecto</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona quien tiene acceso al proyecto.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="size-4" />
          Invitar miembro
        </Button>
      </div>

      <Separator />

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay miembros en este proyecto.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage
                        src={member.user.avatarUrl ?? undefined}
                      />
                      <AvatarFallback>
                        {member.user.firstName[0]}
                        {member.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {member.user.firstName} {member.user.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.user.email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="size-3 mr-1" />
                    {member.roleName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Cambiar rol</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => removeMember.mutate(member.id)}
                      >
                        Eliminar del proyecto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inviteMember.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Invitar miembro</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="member">Miembro</SelectItem>
                    <SelectItem value="viewer">Observador</SelectItem>
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
                disabled={!email.trim() || inviteMember.isPending}
              >
                {inviteMember.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Invitar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
