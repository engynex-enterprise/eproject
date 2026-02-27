'use client';

import { createElement, useState, useDeferredValue } from 'react';
import { useParams } from 'next/navigation';
import { sileo } from 'sileo';
import {
  Loader2,
  Save,
  Search,
  UserCircle,
  X,
} from 'lucide-react';
import {
  useProject,
  useUpdateProject,
  useSearchUsers,
} from '@/modules/projects/hooks/use-projects';
import {
  IconColorPicker,
  getProjectIcon,
} from '@/modules/projects/components/icon-color-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import type { UserSearchResult } from '@/modules/projects/services/projects.service';

const ORG_ID = 1;

const PROJECT_CATEGORIES = [
  { value: 'software', label: 'Software' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Diseño' },
  { value: 'business', label: 'Negocio' },
  { value: 'operations', label: 'Operaciones' },
  { value: 'support', label: 'Soporte' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'other', label: 'Otro' },
];

export default function SettingsGeneralPage() {
  const params = useParams<{ projectKey: string }>();
  const { data, isLoading } = useProject(params.projectKey);
  const project = data?.data;
  const updateProject = useUpdateProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder-kanban');
  const [selectedColor, setSelectedColor] = useState('#0052CC');
  const [category, setCategory] = useState('');
  const [leadQuery, setLeadQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<UserSearchResult | null>(
    null,
  );
  const [initialized, setInitialized] = useState(false);

  const deferredLeadQuery = useDeferredValue(leadQuery);
  const { data: leadResults, isLoading: isSearchingLead } = useSearchUsers(
    ORG_ID,
    deferredLeadQuery,
  );
  const leadUsers = leadResults?.data ?? [];

  if (project && !initialized) {
    setName(project.name);
    setDescription(project.description ?? '');
    setSelectedIcon(project.iconUrl ?? 'folder-kanban');
    setInitialized(true);
    if (project.lead) {
      setSelectedLead({
        id: project.lead.id,
        email: project.lead.email,
        firstName: project.lead.firstName,
        lastName: project.lead.lastName,
        displayName: null,
        avatarUrl: project.lead.avatarUrl,
      });
      setLeadQuery(project.lead.email);
    }
  }

  const handleSave = async () => {
    if (!project || !name.trim()) return;
    try {
      await sileo.promise(
        updateProject.mutateAsync({
          projectId: project.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
            leadId: selectedLead?.id ?? null,
            iconUrl: selectedIcon,
          },
        }),
        {
          loading: { title: 'Guardando cambios...' },
          success: {
            title: 'Cambios guardados',
            description: (
              <span className="text-xs!">
                Los detalles del proyecto han sido actualizados.
              </span>
            ),
          },
          error: {
            title: 'Error al guardar',
            description: (
              <span className="text-xs!">
                No se pudieron guardar los cambios.
              </span>
            ),
          },
        },
      );
    } catch {
      // handled by sileo
    }
  };

  const showLeadResults = leadQuery.length >= 2 && !selectedLead;
  const ProjectIcon = getProjectIcon(selectedIcon);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24">
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Detalles del proyecto
        </h2>
        <p className="text-sm text-muted-foreground">
          Administra la identidad visual y la informacion general del proyecto.
        </p>
      </div>

      {/* ── Identidad visual ──────────────────────────────────────── */}
      <Card className="bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="text-sm">Identidad visual</CardTitle>
          <CardDescription>
            Elige un icono y color que representen tu proyecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            {/* Large preview */}
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform hover:scale-105"
              style={{ backgroundColor: selectedColor }}
            >
              {createElement(ProjectIcon, { className: 'size-7' })}
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{name || 'Mi proyecto'}</p>
              <p className="text-xs text-muted-foreground">
                Haz clic en el boton para personalizar
              </p>
            </div>

            <IconColorPicker
              selectedIcon={selectedIcon}
              selectedColor={selectedColor}
              onIconChange={setSelectedIcon}
              onColorChange={setSelectedColor}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Informacion general ───────────────────────────────────── */}
      <Card className="bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="text-sm">Informacion general</CardTitle>
          <CardDescription>
            Los datos basicos que identifican tu proyecto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Name */}
          <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
            <Label htmlFor="settings-name" className="text-sm text-muted-foreground">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="settings-name"
              placeholder="Mi proyecto"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <Separator />

          {/* Key */}
          <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-start">
            <Label className="text-sm text-muted-foreground pt-2.5">
              Clave
            </Label>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Input
                  value={project?.key ?? ''}
                  disabled
                  className="max-w-32 font-mono"
                />
                <Badge variant="secondary" className="shrink-0">
                  Solo lectura
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Prefijo de incidencias (ej: {project?.key ?? 'PROJ'}-1). No se
                puede modificar.
              </p>
            </div>
          </div>

          <Separator />

          {/* Category */}
          <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
            <Label
              htmlFor="settings-category"
              className="text-sm text-muted-foreground"
            >
              Categoria
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="settings-category" className="max-w-xs">
                <SelectValue placeholder="Selecciona una categoria" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Description */}
          <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-start">
            <Label
              htmlFor="settings-description"
              className="text-sm text-muted-foreground pt-2.5"
            >
              Descripcion
            </Label>
            <Textarea
              id="settings-description"
              placeholder="Describe brevemente el objetivo del proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Personas ──────────────────────────────────────────────── */}
      <Card className="bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="text-sm">Personas</CardTitle>
          <CardDescription>
            Define quien lidera y quien recibe las nuevas incidencias.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Lead */}
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-start">
            <Label className="text-sm text-muted-foreground pt-2.5">
              Propietario
            </Label>
            <div className="space-y-3">
              {selectedLead ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={selectedLead.avatarUrl ?? undefined}
                    />
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {selectedLead.firstName?.[0]}
                      {selectedLead.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {selectedLead.firstName} {selectedLead.lastName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedLead.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0"
                    onClick={() => {
                      setSelectedLead(null);
                      setLeadQuery('');
                    }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="settings-lead"
                      placeholder="Buscar por correo electronico..."
                      value={leadQuery}
                      onChange={(e) => setLeadQuery(e.target.value)}
                      className="pl-9"
                    />
                    {isSearchingLead && (
                      <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {showLeadResults && leadUsers.length > 0 && (
                    <div className="max-h-40 space-y-0.5 overflow-y-auto rounded-lg border p-1">
                      {leadUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                          onClick={() => {
                            setSelectedLead(user);
                            setLeadQuery(user.email);
                          }}
                        >
                          <Avatar className="size-7">
                            <AvatarImage
                              src={user.avatarUrl ?? undefined}
                            />
                            <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
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
                  {!showLeadResults && !selectedLead && (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                      <UserCircle className="size-8 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        Busca un miembro de la organizacion para asignarlo como
                        propietario del proyecto.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Default Assignee */}
          <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-start">
            <Label className="text-sm text-muted-foreground pt-2.5">
              Asignado por defecto
            </Label>
            <div className="space-y-1.5">
              <Select
                value={
                  project?.defaultAssigneeId?.toString() ?? 'unassigned'
                }
                onValueChange={(v) => {
                  if (project) {
                    updateProject.mutate({
                      projectId: project.id,
                      data: {
                        defaultAssigneeId:
                          v === 'unassigned' ? null : parseInt(v, 10),
                      },
                    });
                  }
                }}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {project?.lead && (
                    <SelectItem value={project.lead.id.toString()}>
                      Lider del proyecto
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Las nuevas incidencias se asignaran automaticamente a esta
                persona.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Fixed save bar ──────────────────────────────────────── */}
      <div
        className="fixed bottom-0 right-0 z-20 border-t bg-white/80 backdrop-blur-sm dark:bg-card/80"
        style={{ left: 'var(--sidebar-width)' }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Los cambios no se guardan automaticamente.
          </p>
          <Button
            onClick={handleSave}
            disabled={updateProject.isPending || !name.trim()}
          >
            {updateProject.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
