'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Loader2, Boxes } from 'lucide-react';
import type { ApiResponse, Space } from '@/shared/types';
import { apiClient } from '@/shared/lib/api-client';
import { useProject } from '@/modules/projects/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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

export default function SpacesPage() {
  const params = useParams<{ projectKey: string }>();
  const queryClient = useQueryClient();
  const { data: projectData } = useProject(params.projectKey);
  const projectId = projectData?.data?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['spaces', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<Space[]>>(
        `/projects/key/${params.projectKey}/spaces`,
      ),
    enabled: !!params.projectKey,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [spaceColor, setSpaceColor] = useState('#3b82f6');

  const createSpace = useMutation({
    mutationFn: () =>
      apiClient.post<ApiResponse<Space>>(`/projects/${projectId}/spaces`, {
        name: spaceName.trim(),
        description: spaceDescription.trim() || undefined,
        color: spaceColor,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['spaces', params.projectKey],
      });
      setCreateOpen(false);
      setSpaceName('');
      setSpaceDescription('');
      setSpaceColor('#3b82f6');
    },
  });

  const deleteSpace = useMutation({
    mutationFn: (spaceId: number) =>
      apiClient.delete(`/spaces/${spaceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['spaces', params.projectKey],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const spaces = data?.data ?? [];

  return (
    <div className="max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Espacios</h2>
          <p className="text-sm text-muted-foreground">
            Organiza las incidencias en espacios logicos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!projectId}>
          <Plus className="size-4" />
          Crear espacio
        </Button>
      </div>

      <Separator />

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Boxes className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay espacios creados. Los espacios ayudan a organizar las
            incidencias en areas como Frontend, Backend, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {spaces
            .sort((a, b) => a.order - b.order)
            .map((space) => (
              <Card key={space.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-4 rounded"
                      style={{ backgroundColor: space.color ?? '#3b82f6' }}
                    />
                    <CardTitle className="text-base">{space.name}</CardTitle>
                  </div>
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
                        onClick={() => deleteSpace.mutate(space.id)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                {space.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {space.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
        </div>
      )}

      {/* Create Space Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createSpace.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Crear espacio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  placeholder="Frontend"
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
                  value={spaceDescription}
                  onChange={(e) => setSpaceDescription(e.target.value)}
                  placeholder="Describe el espacio..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={spaceColor}
                    onChange={(e) => setSpaceColor(e.target.value)}
                    className="h-9 w-14 cursor-pointer rounded border"
                  />
                  <Input
                    value={spaceColor}
                    onChange={(e) => setSpaceColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
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
                disabled={!spaceName.trim() || createSpace.isPending}
              >
                {createSpace.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Crear espacio
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
