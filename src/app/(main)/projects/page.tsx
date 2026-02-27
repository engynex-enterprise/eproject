'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useProjects,
  useUpdateProject,
  useDeleteProject,
} from '@/modules/projects/hooks/use-projects';
import { ProjectList } from '@/modules/projects/components/project-list';
import { CreateProjectDialog } from '@/modules/projects/components/create-project-dialog';

// TODO: Get orgId from auth context/store
const ORG_ID = 1;
const FAVORITES_KEY = 'eproject:favorite-projects';

function loadFavorites(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<number>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
}

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(loadFavorites);
  const { data, isLoading } = useProjects(ORG_ID);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject(ORG_ID);

  const handleToggleFavorite = useCallback((projectId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      saveFavorites(next);
      return next;
    });
  }, []);

  const handleArchive = useCallback(
    (projectId: number) => {
      updateProject.mutate({ projectId, data: { isArchived: true } });
    },
    [updateProject],
  );

  const handleDelete = useCallback(
    (projectId: number) => {
      deleteProject.mutate(projectId);
    },
    [deleteProject],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona y accede a todos tus proyectos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Crear proyecto
        </Button>
      </div>

      <ProjectList
        projects={data?.data ?? []}
        isLoading={isLoading}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        orgId={ORG_ID}
      />
    </div>
  );
}
