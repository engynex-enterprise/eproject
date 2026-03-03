'use client';

import { useMemo } from 'react';
import {
  Ticket,
  CheckCircle2,
  CircleDot,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccentColor } from '@/shared/providers/accent-color-provider';
import type { Issue } from '@/shared/types';

interface HelpdeskDashboardProps {
  tickets: Issue[];
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

export function HelpdeskDashboard({ tickets, isLoading }: HelpdeskDashboardProps) {
  const { colors } = useAccentColor();

  const stats = useMemo(() => {
    if (!tickets.length) return null;

    const total = tickets.length;
    const done = tickets.filter(
      (t) => t.status?.statusGroup?.type === 'done',
    ).length;
    const inProgress = tickets.filter(
      (t) => t.status?.statusGroup?.type === 'in_progress',
    ).length;
    const todo = tickets.filter(
      (t) => t.status?.statusGroup?.type === 'todo',
    ).length;
    const highPriority = tickets.filter(
      (t) => t.priority?.level === 'highest' || t.priority?.level === 'high',
    ).length;

    return { total, done, inProgress, todo, highPriority };
  }, [tickets]);

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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Ticket className="size-4" />}
          label="Total de tickets"
          value={stats.total}
          subValue={`${stats.todo} pendientes`}
          color={colors.base}
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="Resueltos"
          value={stats.done}
          subValue={stats.total > 0 ? `${Math.round((stats.done / stats.total) * 100)}%` : '0%'}
          color="#36B37E"
        />
        <StatCard
          icon={<CircleDot className="size-4" />}
          label="En progreso"
          value={stats.inProgress}
          subValue={stats.total > 0 ? `${Math.round((stats.inProgress / stats.total) * 100)}%` : '0%'}
          color="#4C9AFF"
        />
        <StatCard
          icon={<AlertTriangle className="size-4" />}
          label="Prioridad alta"
          value={stats.highPriority}
          subValue={stats.highPriority > 0 ? 'Requieren atencion' : 'Sin urgencias'}
          color={stats.highPriority > 0 ? '#FF5630' : '#36B37E'}
        />
      </div>

      {/* Status breakdown bar */}
      {stats.total > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">Resumen de tickets</span>
          <div className="flex h-2 flex-1 overflow-hidden rounded-full">
            {stats.done > 0 && (
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(stats.done / stats.total) * 100}%` }}
              />
            )}
            {stats.inProgress > 0 && (
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
              />
            )}
            {stats.todo > 0 && (
              <div
                className="h-full bg-muted-foreground/20 transition-all"
                style={{ width: `${(stats.todo / stats.total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-green-500" />
              {stats.done}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" />
              {stats.inProgress}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted-foreground/20" />
              {stats.todo}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
