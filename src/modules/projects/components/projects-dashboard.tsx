'use client';

import { useMemo } from 'react';
import {
  FolderKanban,
  Users,
  IterationCcw,
  CheckCircle2,
  CircleDot,
  Circle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import type { ProjectListItem } from '../services/projects.service';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccentColor } from '@/shared/providers/accent-color-provider';

interface ProjectsDashboardProps {
  projects: ProjectListItem[];
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

function StatCard({ icon, label, value, subValue, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: color ?? 'var(--color-muted-foreground)' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
      {subValue && (
        <span className="ml-auto text-[11px] font-medium text-muted-foreground">
          {subValue}
        </span>
      )}
    </div>
  );
}

export function ProjectsDashboard({ projects, isLoading }: ProjectsDashboardProps) {
  const { colors } = useAccentColor();

  const stats = useMemo(() => {
    if (!projects.length) return null;

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.isActive).length;
    const totalIssues = projects.reduce((sum, p) => sum + p.issueStats.total, 0);
    const doneIssues = projects.reduce((sum, p) => sum + p.issueStats.done, 0);
    const inProgressIssues = projects.reduce((sum, p) => sum + p.issueStats.inProgress, 0);
    const todoIssues = projects.reduce((sum, p) => sum + p.issueStats.todo, 0);
    const totalMembers = new Set(projects.flatMap((p) => p.members.map((m) => m.id))).size;
    const activeSprints = projects.filter((p) => p.activeSprint).length;
    const totalSpaces = projects.reduce((sum, p) => sum + p.spaceCount, 0);
    const avgProgress = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

    return {
      totalProjects,
      activeProjects,
      totalIssues,
      doneIssues,
      inProgressIssues,
      todoIssues,
      totalMembers,
      activeSprints,
      totalSpaces,
      avgProgress,
    };
  }, [projects]);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-3">
      {/* Main stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FolderKanban className="size-4" />}
          label="Proyectos"
          value={stats.totalProjects}
          subValue={`${stats.activeProjects} activos`}
          color={colors.base}
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="Incidencias totales"
          value={stats.totalIssues}
          subValue={`${stats.doneIssues} completadas`}
          color="#36B37E"
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="Miembros"
          value={stats.totalMembers}
          subValue={`en ${stats.totalProjects} proyectos`}
          color="#6554C0"
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Progreso promedio"
          value={`${stats.avgProgress}%`}
          subValue={`${stats.activeSprints} sprints activos`}
          color={stats.avgProgress >= 70 ? '#36B37E' : stats.avgProgress >= 30 ? '#FF991F' : '#FF5630'}
        />
      </div>

      {/* Issue breakdown mini bar */}
      {stats.totalIssues > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">Resumen de incidencias</span>
          <div className="flex h-2 flex-1 overflow-hidden rounded-full">
            {stats.doneIssues > 0 && (
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(stats.doneIssues / stats.totalIssues) * 100}%` }}
              />
            )}
            {stats.inProgressIssues > 0 && (
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(stats.inProgressIssues / stats.totalIssues) * 100}%` }}
              />
            )}
            {stats.todoIssues > 0 && (
              <div
                className="h-full bg-muted-foreground/20 transition-all"
                style={{ width: `${(stats.todoIssues / stats.totalIssues) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-green-500" />
              {stats.doneIssues}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" />
              {stats.inProgressIssues}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted-foreground/20" />
              {stats.todoIssues}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
