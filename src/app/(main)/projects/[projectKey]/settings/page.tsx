'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { useProject, useUpdateProject } from '@/modules/projects/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsGeneralPage() {
  const params = useParams<{ projectKey: string }>();
  const { data, isLoading } = useProject(params.projectKey);
  const project = data?.data;
  const updateProject = useUpdateProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize form when data loads
  if (project && !initialized) {
    setName(project.name);
    setDescription(project.description ?? '');
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!project) return;
    await updateProject.mutateAsync({
      projectId: project.id,
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Configuracion general</h2>
        <p className="text-sm text-muted-foreground">
          Configura los detalles basicos del proyecto.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Nombre del proyecto</Label>
          <Input
            id="settings-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Clave del proyecto</Label>
          <Input value={project?.key ?? ''} disabled />
          <p className="text-xs text-muted-foreground">
            La clave del proyecto no se puede cambiar.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-description">Descripcion</Label>
          <Textarea
            id="settings-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Lider del proyecto</Label>
          <Select
            value={project?.leadId?.toString() ?? ''}
            onValueChange={(v) => {
              if (project) {
                updateProject.mutate({
                  projectId: project.id,
                  data: { leadId: v ? parseInt(v, 10) : null },
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar lider" />
            </SelectTrigger>
            <SelectContent>
              {project?.lead && (
                <SelectItem value={project.lead.id.toString()}>
                  {project.lead.firstName} {project.lead.lastName}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Asignado por defecto</Label>
          <Select
            value={project?.defaultAssigneeId?.toString() ?? 'unassigned'}
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
            <SelectTrigger>
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
        </div>
      </div>

      <div className="flex justify-end">
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
  );
}
