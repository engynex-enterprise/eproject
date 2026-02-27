'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Plus,
  Loader2,
  Package,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Rocket,
} from 'lucide-react';
import type { Version } from '@/shared/types';
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import { useProject } from '@/modules/projects/hooks/use-projects';

export default function VersionsPage() {
  const params = useParams<{ projectKey: string }>();
  const queryClient = useQueryClient();

  const { data: projectData } = useProject(params.projectKey);
  const projectId = projectData?.data?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['versions', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<Version[]>>(
        `/projects/key/${params.projectKey}/versions`,
      ),
    enabled: !!params.projectKey,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');

  const createVersion = useMutation({
    mutationFn: () =>
      apiClient.post<ApiResponse<Version>>(
        `/projects/${projectId}/versions`,
        {
          name: versionName.trim(),
          description: versionDescription.trim() || undefined,
          releaseDate: releaseDate || undefined,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['versions', params.projectKey],
      });
      setCreateOpen(false);
      setVersionName('');
      setVersionDescription('');
      setReleaseDate('');
    },
  });

  const releaseVersion = useMutation({
    mutationFn: (versionId: number) =>
      apiClient.patch<ApiResponse<Version>>(`/versions/${versionId}`, {
        isReleased: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['versions', params.projectKey],
      });
    },
  });

  const deleteVersion = useMutation({
    mutationFn: (versionId: number) =>
      apiClient.delete<void>(`/versions/${versionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['versions', params.projectKey],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const versions = data?.data ?? [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Versiones</h2>
        <Button onClick={() => setCreateOpen(true)} disabled={!projectId}>
          <Plus className="size-4" />
          Crear version
        </Button>
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Package className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay versiones creadas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <Card key={version.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{version.name}</CardTitle>
                  {version.isReleased ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="size-3 mr-1" />
                      Publicada
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-700 text-xs"
                    >
                      <Clock className="size-3 mr-1" />
                      Sin publicar
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!version.isReleased && (
                    <Button
                      size="sm"
                      onClick={() => releaseVersion.mutate(version.id)}
                    >
                      <Rocket className="size-3.5" />
                      Publicar
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteVersion.mutate(version.id)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {version.description && (
                  <p className="text-sm text-muted-foreground">
                    {version.description}
                  </p>
                )}
                {version.releaseDate && (
                  <p className="text-xs text-muted-foreground">
                    Fecha de publicacion:{' '}
                    {format(new Date(version.releaseDate), 'd MMM yyyy', {
                      locale: es,
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Version Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createVersion.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Crear version</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="v1.0.0"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Descripcion{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="Notas de la version..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Fecha de publicacion{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
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
                disabled={!versionName.trim() || createVersion.isPending}
              >
                {createVersion.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
