'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import { sprintsService } from '@/modules/sprints/services/sprints.service';
import { SprintList } from '@/modules/sprints/components/sprint-list';
import { StartSprintDialog } from '@/modules/sprints/components/start-sprint-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/modules/projects/hooks/use-projects';
import type { Sprint } from '@/shared/types';

export default function SprintsPage() {
  const params = useParams<{ projectKey: string }>();
  const queryClient = useQueryClient();

  const { data: projectData } = useProject(params.projectKey);
  const projectId = projectData?.data?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sprints', params.projectKey],
    queryFn: () => sprintsService.getSprints(params.projectKey),
    enabled: !!params.projectKey,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDialogSprint, setStartDialogSprint] = useState<Sprint | null>(null);

  const createSprint = useMutation({
    mutationFn: () =>
      sprintsService.createSprint(projectId!, {
        name: sprintName.trim(),
        goal: sprintGoal.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', params.projectKey],
      });
      setCreateOpen(false);
      setSprintName('');
      setSprintGoal('');
    },
  });

  const startSprint = useMutation({
    mutationFn: ({
      sprintId,
      data,
    }: {
      sprintId: number;
      data: { name: string; startDate: string; endDate: string; goal: string };
    }) =>
      sprintsService.startSprint(sprintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', params.projectKey],
      });
    },
  });

  const completeSprint = useMutation({
    mutationFn: (sprintId: number) =>
      sprintsService.completeSprint(sprintId, { moveToBacklog: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', params.projectKey],
      });
    },
  });

  const deleteSprint = useMutation({
    mutationFn: (sprintId: number) => sprintsService.deleteSprint(sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', params.projectKey],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-sm text-destructive">
          Error al cargar los sprints.
        </p>
      </div>
    );
  }

  const sprints = data?.data ?? [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sprints</h2>
        <Button onClick={() => setCreateOpen(true)} disabled={!projectId}>
          <Plus className="size-4" />
          Crear sprint
        </Button>
      </div>

      <SprintList
        sprints={sprints}
        onStartSprint={(id) => {
          const sprint = sprints.find((s) => s.id === id);
          if (sprint) setStartDialogSprint(sprint);
        }}
        onCompleteSprint={(id) => completeSprint.mutate(id)}
        onEditSprint={() => {}}
        onDeleteSprint={(id) => deleteSprint.mutate(id)}
      />

      {/* Create Sprint Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createSprint.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Crear sprint</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  placeholder={`Sprint ${sprints.length + 1}`}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Objetivo{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  value={sprintGoal}
                  onChange={(e) => setSprintGoal(e.target.value)}
                  placeholder="Describe el objetivo del sprint..."
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
                disabled={!sprintName.trim() || createSprint.isPending}
              >
                {createSprint.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Start Sprint Dialog */}
      {startDialogSprint && (
        <StartSprintDialog
          open={!!startDialogSprint}
          onOpenChange={(open) => {
            if (!open) setStartDialogSprint(null);
          }}
          sprintName={startDialogSprint.name}
          onConfirm={async (data) => {
            await startSprint.mutateAsync({
              sprintId: startDialogSprint.id,
              data,
            });
            setStartDialogSprint(null);
          }}
          isPending={startSprint.isPending}
        />
      )}
    </div>
  );
}
