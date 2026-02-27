'use client';

import { useState, useDeferredValue } from 'react';
import {
  Loader2,
  Search,
  UserPlus,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  useSearchUsers,
  useAddProjectMember,
  useProjectRoles,
} from '../hooks/use-projects';
import type { UserSearchResult } from '../services/projects.service';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectName: string;
  orgId: number;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  orgId,
}: AddMemberDialogProps) {
  const [emailQuery, setEmailQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const deferredEmail = useDeferredValue(emailQuery);
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(orgId, deferredEmail);
  const { data: rolesData } = useProjectRoles(orgId);
  const addMember = useAddProjectMember(orgId);

  const users = searchResults?.data ?? [];
  const roles = rolesData?.data ?? [];

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setEmailQuery(user.email);
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      await addMember.mutateAsync({
        projectId,
        userId: selectedUser.id,
        roleId: Number(selectedRoleId),
      });
      setSuccess(true);
      setTimeout(() => {
        handleReset();
        onOpenChange(false);
      }, 1500);
    } catch {
      // Error handled by mutation
    }
  };

  const handleReset = () => {
    setEmailQuery('');
    setSelectedUser(null);
    setSelectedRoleId('');
    setSuccess(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) handleReset();
    onOpenChange(isOpen);
  };

  const showResults = emailQuery.length >= 2 && !selectedUser;
  const isEmailNotFound = showResults && !isSearching && users.length === 0 && deferredEmail.length >= 2;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Añadir persona
          </DialogTitle>
          <DialogDescription>
            Añade un miembro al proyecto <strong>{projectName}</strong>.
            Busca por correo electrónico.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="size-12 text-green-500" />
            <p className="text-sm font-medium">
              {selectedUser?.firstName} {selectedUser?.lastName} ha sido añadido al proyecto.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Email search */}
            <div className="space-y-2">
              <Label htmlFor="member-email">Correo electrónico</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="member-email"
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={emailQuery}
                  onChange={(e) => {
                    setEmailQuery(e.target.value);
                    setSelectedUser(null);
                    setSuccess(false);
                  }}
                  className="pl-9"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Search results */}
            {showResults && users.length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Not found */}
            {isEmailNotFound && (
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                <Mail className="size-8 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    No se encontró un usuario con ese correo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    El usuario no pertenece a la organización. Puedes invitarlo desde la configuración de la organización.
                  </p>
                </div>
              </div>
            )}

            {/* Selected user badge */}
            {selectedUser && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Avatar className="size-9">
                  <AvatarImage src={selectedUser.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {selectedUser.firstName?.[0]}
                    {selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  Seleccionado
                </Badge>
              </div>
            )}

            {/* Role selector */}
            <div className="space-y-2">
              <Label htmlFor="member-role">Rol en el proyecto</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="member-role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      <div className="flex items-center gap-2">
                        {role.name}
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-[9px]">
                            Sistema
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                El rol determina los permisos del miembro en este proyecto.
              </p>
            </div>

            {/* Error */}
            {addMember.isError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {(addMember.error as Error)?.message === 'Request failed with status code 409'
                  ? 'Este usuario ya es miembro del proyecto.'
                  : 'Ocurrió un error al añadir el miembro.'}
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedUser || !selectedRoleId || addMember.isPending}
            >
              {addMember.isPending && <Loader2 className="size-4 animate-spin" />}
              Añadir miembro
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
