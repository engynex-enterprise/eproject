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
import { ProjectsToolbar } from '@/modules/projects/components/projects-toolbar';
import { CreateProjectDialog } from '@/modules/projects/components/create-project-dialog';
import { useAuthStore } from '@/shared/stores/auth.store';

// TODO: Get orgId from auth context/store
const ORG_ID = 1;
const FAVORITES_KEY = 'eproject:favorite-projects';
const VIEW_MODE_KEY = 'eproject:projects-view-mode';

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

function loadViewMode(): 'cards' | 'table' {
  if (typeof window === 'undefined') return 'cards';
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  return stored === 'table' ? 'table' : 'cards';
}

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(loadFavorites);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(loadViewMode);

  const { data, isLoading } = useProjects(ORG_ID);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject(ORG_ID);
  const currentUserId = useAuthStore((s) => s.user?.id);

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

  const handleViewModeChange = useCallback((mode: 'cards' | 'table') => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

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

      <ProjectsToolbar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <ProjectList
        projects={data?.data ?? []}
        isLoading={isLoading}
        favorites={favorites}
        currentUserId={currentUserId ?? undefined}
        viewMode={viewMode}
        search={search}
        sortBy={sortBy}
        statusFilter={statusFilter}
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
