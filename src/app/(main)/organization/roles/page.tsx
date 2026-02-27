'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Shield,
  Pencil,
  Trash2,
  Lock,
  Save,
  Loader2,
  ChevronRight,
  X,
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useOrgRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
} from '@/modules/organization/hooks/use-organization';
import type { Role, Permission } from '@/shared/types';
import { cn } from '@/lib/utils';

// Group permissions by resource
function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );
}

const resourceLabels: Record<string, string> = {
  project: 'Proyectos',
  issue: 'Incidencias',
  sprint: 'Sprints',
  board: 'Tableros',
  member: 'Miembros',
  role: 'Roles',
  space: 'Espacios',
  comment: 'Comentarios',
  attachment: 'Adjuntos',
  report: 'Reportes',
  organization: 'Organizacion',
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
};

export default function RolesPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: roles, isLoading: rolesLoading } = useOrgRoles(orgId);
  const { data: allPermissions } = usePermissions();
  const createRoleMutation = useCreateRole(orgId);
  const updateRoleMutation = useUpdateRole(orgId);
  const deleteRoleMutation = useDeleteRole(orgId);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());

  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const groupedPermissions = allPermissions
    ? groupPermissions(allPermissions)
    : {};

  useEffect(() => {
    if (selectedRole) {
      setEditName(selectedRole.name);
      setEditDescription(selectedRole.description ?? '');
      setSelectedPermIds(
        new Set(selectedRole.permissions.map((p) => p.id)),
      );
    }
  }, [selectedRole]);

  const handleTogglePermission = (permId: number) => {
    if (selectedRole?.isSystem) return;
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const handleSaveRole = () => {
    if (!selectedRole || selectedRole.isSystem) return;
    updateRoleMutation.mutate(
      {
        roleId: selectedRole.id,
        data: {
          name: editName,
          description: editDescription || null,
          permissionIds: Array.from(selectedPermIds),
        },
      },
      {
        onSuccess: () => {
          setSelectedRole(null);
        },
      },
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate(
      {
        name: newRoleName,
        description: newRoleDescription || null,
        permissionIds: [],
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setNewRoleName('');
          setNewRoleDescription('');
        },
      },
    );
  };

  const handleDeleteRole = (roleId: number) => {
    deleteRoleMutation.mutate(roleId, {
      onSuccess: () => {
        if (selectedRole?.id === roleId) {
          setSelectedRole(null);
        }
      },
    });
  };

  if (rolesLoading) {
    return (
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Roles y permisos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configura los roles y sus permisos para controlar el acceso.
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" />
                Crear rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateRole}>
                <DialogHeader>
                  <DialogTitle>Crear nuevo rol</DialogTitle>
                  <DialogDescription>
                    Define un nuevo rol para tu organizacion. Podras asignar
                    permisos despues de crearlo.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Nombre del rol</Label>
                    <Input
                      id="role-name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Ej: Lider de equipo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-desc">Descripcion</Label>
                    <Textarea
                      id="role-desc"
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                      placeholder="Describe las responsabilidades de este rol..."
                      rows={3}
                    />
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
                    disabled={createRoleMutation.isPending}
                  >
                    {createRoleMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Crear rol
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-6">
          {/* Roles List */}
          <Card className="w-72 shrink-0">
            <CardHeader>
              <CardTitle className="text-base">Roles</CardTitle>
              <CardDescription>
                {roles?.length ?? 0} roles configurados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {roles?.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-muted border-b last:border-b-0',
                      selectedRole?.id === role.id && 'bg-muted',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-muted-foreground" />
                      <span className="font-medium">{role.name}</span>
                      {role.isSystem && (
                        <Lock className="size-3 text-muted-foreground" />
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Detail */}
          <div className="flex-1">
            {selectedRole ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">
                        {selectedRole.isSystem
                          ? selectedRole.name
                          : editName}
                      </CardTitle>
                      {selectedRole.isSystem && (
                        <Badge variant="secondary">
                          <Lock className="size-3 mr-1" />
                          Rol del sistema
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!selectedRole.isSystem && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteRole(selectedRole.id)
                            }
                            disabled={deleteRoleMutation.isPending}
                          >
                            <Trash2 className="size-4" />
                            Eliminar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveRole}
                            disabled={updateRoleMutation.isPending}
                          >
                            {updateRoleMutation.isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Save className="size-4" />
                            )}
                            Guardar
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setSelectedRole(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedRole.isSystem && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descripcion</Label>
                          <Input
                            value={editDescription}
                            onChange={(e) =>
                              setEditDescription(e.target.value)
                            }
                            placeholder="Descripcion del rol"
                          />
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold mb-4">Permisos</h3>
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(
                        ([resource, permissions]) => (
                          <div key={resource}>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                              {resourceLabels[resource] ?? resource}
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {permissions.map((perm) => {
                                const isChecked = selectedPermIds.has(
                                  perm.id,
                                );
                                return (
                                  <label
                                    key={perm.id}
                                    className={cn(
                                      'flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors',
                                      isChecked
                                        ? 'border-primary/50 bg-primary/5'
                                        : 'border-muted',
                                      selectedRole.isSystem &&
                                        'cursor-default opacity-60',
                                    )}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() =>
                                        handleTogglePermission(perm.id)
                                      }
                                      disabled={selectedRole.isSystem}
                                    />
                                    <span>
                                      {actionLabels[perm.action] ??
                                        perm.action}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="size-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Selecciona un rol
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Haz clic en un rol de la lista para ver y editar sus
                    permisos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </div>
  );
}
