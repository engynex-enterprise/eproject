'use client';

import { useState, useCallback, useMemo } from 'react';
import { sileo } from 'sileo';
import { Plus, Star, Download, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useProjects,
  useUpdateProject,
  useDeleteProject,
} from '@/modules/projects/hooks/use-projects';
import { ProjectList } from '@/modules/projects/components/project-list';
import { ProjectsToolbar } from '@/modules/projects/components/projects-toolbar';
import { ProjectsDashboard } from '@/modules/projects/components/projects-dashboard';
import { ProjectPreviewSheet } from '@/modules/projects/components/project-preview-sheet';
import { BulkActionsBar } from '@/modules/projects/components/bulk-actions-bar';
import { CreateProjectDialog } from '@/modules/projects/components/create-project-dialog';
import { AddMemberDialog } from '@/modules/projects/components/add-member-dialog';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { ProjectListItem } from '@/modules/projects/services/projects.service';
import type {
  SortBy,
  StatusFilter,
  HealthFilter,
  ViewMode,
} from '@/modules/projects/components/projects-toolbar';

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

function loadViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'cards';
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  return stored === 'table' ? 'table' : 'cards';
}

export default function ProjectsPage() {
  // Dialogs & sheets
  const [createOpen, setCreateOpen] = useState(false);
  const [previewProject, setPreviewProject] = useState<ProjectListItem | null>(null);
  const [addMemberProject, setAddMemberProject] = useState<ProjectListItem | null>(null);

  // Filters & view
  const [favorites, setFavorites] = useState<Set<number>>(loadFavorites);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Data
  const { data, isLoading } = useProjects(ORG_ID);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject(ORG_ID);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const projects = data?.data ?? [];

  // Filtered count for toolbar
  const filteredCount = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
      );
    }
    if (statusFilter === 'active') result = result.filter((p) => p.isActive);
    else if (statusFilter === 'archived') result = result.filter((p) => !p.isActive);
    if (healthFilter !== 'all') {
      result = result.filter((p) => {
        if (p.issueStats.total === 0) return healthFilter === 'no-issues';
        const ratio = p.issueStats.done / p.issueStats.total;
        if (healthFilter === 'healthy') return ratio >= 0.7;
        if (healthFilter === 'at-risk') return ratio >= 0.3 && ratio < 0.7;
        if (healthFilter === 'critical') return ratio < 0.3;
        return false;
      });
    }
    return result.length;
  }, [projects, search, statusFilter, healthFilter]);

  // Handlers
  const handleToggleFavorite = useCallback((projectId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      saveFavorites(next);
      return next;
    });
  }, []);

  const handleArchive = useCallback(
    (projectId: number) => {
      sileo.promise(
        updateProject.mutateAsync({ projectId, data: { isArchived: true } }),
        {
          loading: { title: 'Archivando proyecto...' },
          success: {
            title: 'Proyecto archivado',
            description: (
              <span className="text-xs!">
                El proyecto ha sido archivado correctamente.
              </span>
            ),
          },
          error: {
            title: 'Error al archivar',
            description: (
              <span className="text-xs!">
                No se pudo archivar el proyecto.
              </span>
            ),
          },
        },
      );
    },
    [updateProject],
  );

  const handleDelete = useCallback(
    (projectId: number) => {
      sileo.promise(
        deleteProject.mutateAsync(projectId),
        {
          loading: { title: 'Eliminando proyecto...' },
          success: {
            title: 'Proyecto eliminado',
            description: (
              <span className="text-xs!">
                El proyecto ha sido eliminado permanentemente.
              </span>
            ),
          },
          error: {
            title: 'Error al eliminar',
            description: (
              <span className="text-xs!">
                No se pudo eliminar el proyecto.
              </span>
            ),
          },
        },
      );
    },
    [deleteProject],
  );

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

  // Selection handlers
  const handleToggleSelect = useCallback((projectId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback((projectIds: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = projectIds.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(projectIds);
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk actions
  const handleBulkFavorite = useCallback(() => {
    const count = selectedIds.size;
    setFavorites((prev) => {
      const next = new Set(prev);
      for (const id of selectedIds) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      saveFavorites(next);
      return next;
    });
    setSelectedIds(new Set());
    sileo.success({
      title: 'Favoritos actualizados',
      icon: <Star className="size-4" />,
      description: (
        <span className="text-xs!">
          {count} proyecto(s) han sido actualizados.
        </span>
      ),
    });
  }, [selectedIds]);

  const handleBulkArchive = useCallback(() => {
    const count = selectedIds.size;
    sileo.promise(
      Promise.all(
        [...selectedIds].map((id) =>
          updateProject.mutateAsync({ projectId: id, data: { isArchived: true } }),
        ),
      ),
      {
        loading: { title: `Archivando ${count} proyecto(s)...` },
        success: {
          title: 'Proyectos archivados',
          icon: <Archive className="size-4" />,
          description: (
            <span className="text-xs!">
              {count} proyecto(s) han sido archivados.
            </span>
          ),
        },
        error: {
          title: 'Error al archivar',
          description: (
            <span className="text-xs!">
              No se pudieron archivar algunos proyectos.
            </span>
          ),
        },
      },
    );
    setSelectedIds(new Set());
  }, [selectedIds, updateProject]);

  const handleBulkDelete = useCallback(() => {
    const count = selectedIds.size;
    sileo.promise(
      Promise.all(
        [...selectedIds].map((id) => deleteProject.mutateAsync(id)),
      ),
      {
        loading: { title: `Eliminando ${count} proyecto(s)...` },
        success: {
          title: 'Proyectos eliminados',
          description: (
            <span className="text-xs!">
              {count} proyecto(s) han sido eliminados permanentemente.
            </span>
          ),
        },
        error: {
          title: 'Error al eliminar',
          description: (
            <span className="text-xs!">
              No se pudieron eliminar algunos proyectos.
            </span>
          ),
        },
      },
    );
    setSelectedIds(new Set());
  }, [selectedIds, deleteProject]);

  // Export
  const handleExport = useCallback(() => {
    const csv = [
      ['Nombre', 'Clave', 'Incidencias', 'Completadas', 'En curso', 'Pendientes', 'Miembros', 'Sprints', 'Espacios', 'Actualizado'].join(','),
      ...projects.map((p) =>
        [
          `"${p.name}"`,
          p.key,
          p.issueStats.total,
          p.issueStats.done,
          p.issueStats.inProgress,
          p.issueStats.todo,
          p.memberCount,
          p.sprintCount,
          p.spaceCount,
          p.updatedAt,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proyectos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    sileo.success({
      title: 'Proyectos exportados',
      icon: <Download className="size-4" />,
      description: (
        <span className="text-xs!">
          Archivo CSV descargado correctamente.
        </span>
      ),
    });
  }, [projects]);

  // Preview
  const handlePreview = useCallback((project: ProjectListItem) => {
    setPreviewProject(project);
  }, []);

  // Add member
  const handleAddMember = useCallback((project: ProjectListItem) => {
    setAddMemberProject(project);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
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

      {/* Dashboard stats */}
      <ProjectsDashboard projects={projects} isLoading={isLoading} />

      {/* Toolbar */}
      <ProjectsToolbar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        healthFilter={healthFilter}
        onHealthFilterChange={setHealthFilter}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalCount={projects.length}
        filteredCount={filteredCount}
        onExport={handleExport}
      />

      {/* Project list */}
      <ProjectList
        projects={projects}
        isLoading={isLoading}
        favorites={favorites}
        currentUserId={currentUserId ?? undefined}
        viewMode={viewMode}
        search={search}
        sortBy={sortBy}
        statusFilter={statusFilter}
        healthFilter={healthFilter}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleFavorite={handleToggleFavorite}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onPreview={handlePreview}
        onAddMember={handleAddMember}
      />

      {/* Bulk actions floating bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onBulkFavorite={handleBulkFavorite}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
      />

      {/* Preview sheet */}
      <ProjectPreviewSheet
        project={previewProject}
        open={!!previewProject}
        onOpenChange={(open) => !open && setPreviewProject(null)}
        isFavorite={previewProject ? favorites.has(previewProject.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        orgId={ORG_ID}
      />

      {/* Add member dialog */}
      <AddMemberDialog
        open={!!addMemberProject}
        onOpenChange={(open) => !open && setAddMemberProject(null)}
        projectId={addMemberProject?.id ?? 0}
        projectName={addMemberProject?.name ?? ''}
        orgId={ORG_ID}
      />
    </div>
  );
}
