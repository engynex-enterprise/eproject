'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Star, Clock, User, Folder } from 'lucide-react';
import type { ProjectListItem } from '../services/projects.service';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ProjectCard } from './project-card';
import { ProjectTable } from './project-table';

import type { SortBy, StatusFilter, HealthFilter, ViewMode } from './projects-toolbar';

interface ProjectListProps {
  projects: ProjectListItem[];
  isLoading?: boolean;
  favorites?: Set<number>;
  currentUserId?: number;
  viewMode: ViewMode;
  search: string;
  sortBy: SortBy;
  statusFilter: StatusFilter;
  healthFilter: HealthFilter;
  selectedIds?: Set<number>;
  onToggleSelect?: (projectId: number) => void;
  onToggleSelectAll?: (projectIds: number[]) => void;
  onToggleFavorite?: (projectId: number) => void;
  onArchive?: (projectId: number) => void;
  onDelete?: (projectId: number) => void;
  onPreview?: (project: ProjectListItem) => void;
  onAddMember?: (project: ProjectListItem) => void;
}

interface ProjectGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  projects: ProjectListItem[];
}

function sortProjects(
  projects: ProjectListItem[],
  sortBy: SortBy,
): ProjectListItem[] {
  return [...projects].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'progress') {
      const progA = a.issueStats.total > 0 ? a.issueStats.done / a.issueStats.total : 0;
      const progB = b.issueStats.total > 0 ? b.issueStats.done / b.issueStats.total : 0;
      return progB - progA;
    }
    if (sortBy === 'issues') return b.issueCount - a.issueCount;
    if (sortBy === 'members') return b.memberCount - a.memberCount;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function getProjectHealthCategory(project: ProjectListItem): HealthFilter {
  if (project.issueStats.total === 0) return 'no-issues';
  const ratio = project.issueStats.done / project.issueStats.total;
  if (ratio >= 0.7) return 'healthy';
  if (ratio >= 0.3) return 'at-risk';
  return 'critical';
}

function CollapsibleSection({
  group,
  defaultOpen = true,
  children,
}: {
  group: ProjectGroup;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          className={cn(
            'size-4 transition-transform',
            !open && '-rotate-90',
          )}
        />
        {group.icon}
        <span>{group.label}</span>
        <span className="text-xs font-normal">({group.projects.length})</span>
      </button>
      {open && children}
    </div>
  );
}

export function ProjectList({
  projects,
  isLoading,
  favorites,
  currentUserId,
  viewMode,
  search,
  sortBy,
  statusFilter,
  healthFilter,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onToggleFavorite,
  onArchive,
  onDelete,
  onPreview,
  onAddMember,
}: ProjectListProps) {
  const filtered = useMemo(() => {
    let result = projects;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((p) => p.isActive);
    } else if (statusFilter === 'archived') {
      result = result.filter((p) => !p.isActive);
    }

    // Health filter
    if (healthFilter !== 'all') {
      result = result.filter((p) => getProjectHealthCategory(p) === healthFilter);
    }

    return result;
  }, [projects, search, statusFilter, healthFilter]);

  const groups = useMemo(() => {
    const sorted = sortProjects(filtered, sortBy);
    const used = new Set<number>();
    const result: ProjectGroup[] = [];

    // 1. Marcados (favorites)
    if (favorites && favorites.size > 0) {
      const favProjects = sorted.filter((p) => favorites.has(p.id));
      if (favProjects.length > 0) {
        favProjects.forEach((p) => used.add(p.id));
        result.push({
          key: 'favorites',
          label: 'Marcados',
          icon: <Star className="size-3.5 fill-yellow-400 text-yellow-400" />,
          projects: favProjects,
        });
      }
    }

    // 2. Recientes (top 5 by updatedAt, excluding already shown)
    const recentCandidates = [...filtered]
      .filter((p) => !used.has(p.id))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
    if (recentCandidates.length > 0) {
      recentCandidates.forEach((p) => used.add(p.id));
      result.push({
        key: 'recent',
        label: 'Recientes',
        icon: <Clock className="size-3.5" />,
        projects: sortProjects(recentCandidates, sortBy),
      });
    }

    // 3. Creados por mi (where leadId matches current user)
    if (currentUserId) {
      const myProjects = sorted.filter(
        (p) => !used.has(p.id) && p.leadId === currentUserId,
      );
      if (myProjects.length > 0) {
        myProjects.forEach((p) => used.add(p.id));
        result.push({
          key: 'mine',
          label: 'Creados por mí',
          icon: <User className="size-3.5" />,
          projects: myProjects,
        });
      }
    }

    // 4. Resto
    const rest = sorted.filter((p) => !used.has(p.id));
    if (rest.length > 0) {
      result.push({
        key: 'rest',
        label: 'Otros proyectos',
        icon: <Folder className="size-3.5" />,
        projects: rest,
      });
    }

    return result;
  }, [filtered, favorites, currentUserId, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {viewMode === 'cards' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {search
            ? 'No se encontraron proyectos'
            : 'No hay proyectos aún. Crea el primero.'}
        </p>
      </div>
    );
  }

  // If only one group exists and it's "recent" or "rest", don't show section headers
  const showHeaders = groups.length > 1 || (groups.length === 1 && groups[0].key === 'favorites');

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const content =
          viewMode === 'cards' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isFavorite={favorites?.has(project.id)}
                  onToggleFavorite={onToggleFavorite}
                  onArchive={onArchive}
                  onDelete={onDelete}
                  onAddMember={onAddMember}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <ProjectTable
                projects={group.projects}
                favorites={favorites}
                selectedIds={selectedIds}
                onToggleSelect={onToggleSelect}
                onToggleSelectAll={onToggleSelectAll}
                onToggleFavorite={onToggleFavorite}
                onArchive={onArchive}
                onDelete={onDelete}
                onPreview={onPreview}
                onAddMember={onAddMember}
              />
            </div>
          );

        if (!showHeaders) {
          return <div key={group.key}>{content}</div>;
        }

        return (
          <CollapsibleSection key={group.key} group={group}>
            {content}
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
