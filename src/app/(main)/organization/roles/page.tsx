'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Shield,
  Trash2,
  Lock,
  Save,
  Loader2,
  ChevronRight,
  X,
  Copy,
  CheckSquare,
  Square,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce(
    (acc, perm) => {
      const key = perm.resource;
      if (!acc[key]) acc[key] = [];
      acc[key].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );
}

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

// ── Component ─────────────────────────────────────────────────────────────────

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
  const [permSearch, setPermSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filteredPermissions = allPermissions
    ? permSearch
      ? allPermissions.filter(
          (p) =>
            p.resource.includes(permSearch.toLowerCase()) ||
            p.action.includes(permSearch.toLowerCase()) ||
            (resourceLabels[p.resource] ?? p.resource)
              .toLowerCase()
              .includes(permSearch.toLowerCase()) ||
            (actionLabels[p.action] ?? p.action)
              .toLowerCase()
              .includes(permSearch.toLowerCase()),
        )
      : allPermissions
    : [];

  const groupedPermissions = groupPermissions(filteredPermissions);

  useEffect(() => {
    if (selectedRole) {
      setEditName(selectedRole.name);
      setEditDescription(selectedRole.description ?? '');
      setSelectedPermIds(new Set(selectedRole.permissions.map((p) => p.id)));
    }
  }, [selectedRole]);

  const handleTogglePermission = (permId: number) => {
    if (selectedRole?.isSystem) return;
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  };

  const handleToggleCategory = (perms: Permission[]) => {
    if (selectedRole?.isSystem) return;
    const ids = perms.map((p) => p.id);
    const allChecked = ids.every((id) => selectedPermIds.has(id));
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
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
        onSuccess: (updated) => {
          setSelectedRole(updated);
        },
      },
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate(
      { name: newRoleName, description: newRoleDescription || null, permissionIds: [] },
      {
        onSuccess: (created) => {
          setCreateOpen(false);
          setNewRoleName('');
          setNewRoleDescription('');
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
        permissionIds: role.permissions.map((p) => p.id),
      },
      {
        onSuccess: (created) => setSelectedRole(created),
      },
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

  const hasUnsavedChanges =
    !!selectedRole &&
    !selectedRole.isSystem &&
    (editName !== selectedRole.name ||
      (editDescription || '') !== (selectedRole.description ?? '') ||
      JSON.stringify(Array.from(selectedPermIds).sort((a, b) => a - b)) !==
        JSON.stringify(
          selectedRole.permissions
            .map((p) => p.id)
            .sort((a, b) => a - b),
        ));

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (rolesLoading) {
    return (
      <div className="flex-1 max-w-5xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <div className="flex gap-6 mt-4">
          <div className="w-72 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
          <Skeleton className="flex-1 h-80" />
        </div>
      </div>
    );
  }

  const customRoles = roles?.filter((r) => !r.isSystem) ?? [];
  const systemRoles = roles?.filter((r) => r.isSystem) ?? [];

  // ── Page ───────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="flex-1 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles y permisos</h1>
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
                    Define un rol personalizado. Podrás asignar permisos después de crearlo.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Nombre del rol</Label>
                    <Input
                      id="role-name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Ej: Líder de equipo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-desc">Descripción</Label>
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
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createRoleMutation.isPending}>
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
          {/* ── Roles list ────────────────────────────────────────────────── */}
          <Card className="w-72 shrink-0 self-start">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Roles</CardTitle>
              <CardDescription>
                {customRoles.length} personalizado{customRoles.length !== 1 ? 's' : ''},{' '}
                {systemRoles.length} del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {customRoles.length > 0 && (
                <>
                  <div className="px-4 py-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Personalizados
                    </span>
                  </div>
                  {customRoles.map((role) => (
                    <RoleListItem
                      key={role.id}
                      role={role}
                      isSelected={selectedRole?.id === role.id}
                      onClick={() => setSelectedRole(role)}
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
                  {systemRoles.map((role) => (
                    <RoleListItem
                      key={role.id}
                      role={role}
                      isSelected={selectedRole?.id === role.id}
                      onClick={() => setSelectedRole(role)}
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

          {/* ── Role detail ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {selectedRole ? (
              <Card>
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
                              <Lock className="size-3 mr-1" />
                              Sistema
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Los roles del sistema no se pueden modificar
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        hasUnsavedChanges && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                            Sin guardar
                          </Badge>
                        )
                      )}
                    </div>

                    {/* Actions */}
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
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                ¿Confirmar?
                              </span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteRole(selectedRole.id)}
                                disabled={deleteRoleMutation.isPending}
                              >
                                {deleteRoleMutation.isPending ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                                Eliminar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                              >
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
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setSelectedRole(null);
                          setDeleteConfirmId(null);
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Name & description */}
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
                          <Label>Descripción</Label>
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Descripción del rol"
                          />
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Permissions section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold">Permisos</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedPermIds.size} de {allPermissions?.length ?? 0} seleccionados
                        </p>
                      </div>
                      {!selectedRole.isSystem && (
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                          <Input
                            className="pl-8 h-8 text-xs w-44"
                            placeholder="Buscar permiso..."
                            value={permSearch}
                            onChange={(e) => setPermSearch(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {Object.keys(groupedPermissions).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {permSearch ? 'Sin resultados.' : 'No hay permisos disponibles.'}
                      </p>
                    ) : (
                      <div className="space-y-5">
                        {Object.entries(groupedPermissions).map(([resource, perms]) => {
                          const allChecked = perms.every((p) => selectedPermIds.has(p.id));
                          const someChecked = !allChecked && perms.some((p) => selectedPermIds.has(p.id));

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

                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {perms.map((perm) => {
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
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
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
      </div>
    </TooltipProvider>
  );
}

// ── Role list item sub-component ──────────────────────────────────────────────

function RoleListItem({
  role,
  isSelected,
  onClick,
}: {
  role: Role;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-muted border-b last:border-b-0',
        isSelected && 'bg-muted',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Shield className="size-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium truncate">{role.name}</span>
            {role.isSystem && <Lock className="size-3 text-muted-foreground shrink-0" />}
          </div>
          <span className="text-xs text-muted-foreground">
            {role.permissions.length} permiso{role.permissions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </button>
  );
}
