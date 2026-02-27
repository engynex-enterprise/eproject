'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Loader2,
  Circle,
} from 'lucide-react';
import type { ApiResponse, Status, StatusGroupType } from '@/shared/types';
import { apiClient } from '@/shared/lib/api-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const groupConfig: Record<
  StatusGroupType,
  { label: string; color: string; bgColor: string }
> = {
  todo: {
    label: 'Por hacer',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  in_progress: {
    label: 'En progreso',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  done: {
    label: 'Hecho',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

export default function StatusesPage() {
  const params = useParams<{ projectKey: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['statuses', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<Status[]>>(
        `/projects/key/${params.projectKey}/statuses`,
      ),
    enabled: !!params.projectKey,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [statusName, setStatusName] = useState('');
  const [statusColor, setStatusColor] = useState('#3b82f6');
  const [statusGroup, setStatusGroup] = useState<StatusGroupType>('todo');

  const createStatus = useMutation({
    mutationFn: () =>
      apiClient.post(
        `/projects/key/${params.projectKey}/statuses`,
        {
          name: statusName.trim(),
          color: statusColor,
          statusGroupType: statusGroup,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['statuses', params.projectKey],
      });
      setCreateOpen(false);
      setStatusName('');
      setStatusColor('#3b82f6');
    },
  });

  const deleteStatus = useMutation({
    mutationFn: (statusId: number) =>
      apiClient.delete(`/statuses/${statusId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['statuses', params.projectKey],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const statuses = data?.data ?? [];

  // Group statuses by their group type
  const grouped = (
    ['todo', 'in_progress', 'done', 'cancelled'] as StatusGroupType[]
  ).map((groupType) => ({
    type: groupType,
    ...groupConfig[groupType],
    statuses: statuses
      .filter((s) => s.statusGroup?.type === groupType)
      .sort((a, b) => a.order - b.order),
  }));

  return (
    <div className="max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Estados</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los estados de las incidencias del proyecto.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Nuevo estado
        </Button>
      </div>

      <Separator />

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.type} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('text-xs', group.bgColor, group.color)}
              >
                {group.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {group.statuses.length} estados
              </span>
            </div>

            <div className="rounded-md border divide-y">
              {group.statuses.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No hay estados en este grupo.
                </div>
              ) : (
                group.statuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center gap-3 px-3 py-2 group"
                  >
                    <GripVertical className="size-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100" />
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="flex-1 text-sm">{status.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => deleteStatus.mutate(status.id)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Status Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createStatus.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Nuevo estado</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  placeholder="En revision"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select
                  value={statusGroup}
                  onValueChange={(v) =>
                    setStatusGroup(v as StatusGroupType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Circle
                            className={cn('size-3', config.color)}
                            fill="currentColor"
                          />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={statusColor}
                    onChange={(e) => setStatusColor(e.target.value)}
                    className="h-9 w-14 cursor-pointer rounded border"
                  />
                  <Input
                    value={statusColor}
                    onChange={(e) => setStatusColor(e.target.value)}
                    className="flex-1"
                    placeholder="#3b82f6"
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
                disabled={!statusName.trim() || createStatus.isPending}
              >
                {createStatus.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Crear estado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
