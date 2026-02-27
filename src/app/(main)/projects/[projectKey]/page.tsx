'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Plus,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Users,
  TrendingUp,
  CalendarClock,
  Circle,
  Flag,
  BarChart2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

import { useProject, useProjectMembers } from '@/modules/projects/hooks/use-projects';
import { useSpaces } from '@/modules/spaces/hooks/use-spaces';
import { useBoardData } from '@/modules/board/hooks/use-board';
import { useSprints } from '@/modules/sprints/hooks/use-sprints';
import { useAuthStore } from '@/shared/stores/auth.store';
import { CreateSpaceDialog } from '@/modules/spaces/components/create-space-dialog';
import type { Issue } from '@/shared/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  done: '#22c55e',
  in_progress: '#3b82f6',
  todo: '#94a3b8',
  cancelled: '#ef4444',
};

const PRIORITY_META: Record<string, { label: string; color: string; order: number }> = {
  highest: { label: 'Crítica', color: '#dc2626', order: 0 },
  high: { label: 'Alta', color: '#ea580c', order: 1 },
  medium: { label: 'Media', color: '#d97706', order: 2 },
  low: { label: 'Baja', color: '#2563eb', order: 3 },
  lowest: { label: 'Mínima', color: '#94a3b8', order: 4 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isOverdue(issue: Issue): boolean {
  if (!issue.dueDate) return false;
  const t = issue.status?.statusGroup?.type;
  if (t === 'done' || t === 'cancelled') return false;
  return new Date(issue.dueDate) < new Date();
}

function categorize(issues: Issue[]) {
  let done = 0, inProgress = 0, todo = 0, cancelled = 0;
  for (const i of issues) {
    const t = i.status?.statusGroup?.type;
    if (t === 'done') done++;
    else if (t === 'in_progress') inProgress++;
    else if (t === 'cancelled') cancelled++;
    else todo++;
  }
  const overdue = issues.filter(isOverdue).length;
  const total = issues.length;
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, inProgress, todo, cancelled, overdue, total, completionPct };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantClass = {
    default: 'text-muted-foreground',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
  }[variant];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`mt-0.5 ${variantClass}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ level }: { level: string | undefined }) {
  const meta = level ? PRIORITY_META[level] : null;
  if (!meta) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
    >
      <Flag className="size-3" />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Issue['status'] }) {
  if (!status) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${status.color}20`, color: status.color }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: status.color }}
      />
      {status.name}
    </span>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProjectRootPage() {
  const params = useParams<{ projectKey: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: projectData, isLoading: projectLoading } = useProject(params.projectKey);
  const project = projectData?.data;

  const { data: spaces = [], isLoading: spacesLoading } = useSpaces(project?.id);

  // All issues
  const { data: allBoardData, isLoading: allLoading } = useBoardData(params.projectKey);
  const allIssues = useMemo(
    () => allBoardData?.data.columns.flatMap((c) => c.issues) ?? [],
    [allBoardData],
  );

  // My issues
  const myFilters = useMemo(
    () => (currentUser ? { assigneeId: currentUser.id } : undefined),
    [currentUser],
  );
  const { data: myBoardData, isLoading: myLoading } = useBoardData(
    params.projectKey,
    myFilters,
  );
  const myIssues = useMemo(
    () => myBoardData?.data.columns.flatMap((c) => c.issues) ?? [],
    [myBoardData],
  );

  // Sprints
  const { data: sprintsData } = useSprints(params.projectKey);
  const allSprints = sprintsData?.data ?? [];
  const activeSprint = allSprints.find((s) => s.status === 'active') ?? null;
  const completedSprints = allSprints.filter((s) => s.status === 'completed');

  const sprintIssues = useMemo(
    () => (activeSprint ? allIssues.filter((i) => i.sprintId === activeSprint.id) : []),
    [activeSprint, allIssues],
  );
  const sprintStats = useMemo(() => categorize(sprintIssues), [sprintIssues]);
  const daysRemaining = activeSprint
    ? differenceInDays(new Date(activeSprint.endDate!), new Date())
    : null;

  // Members
  const { data: membersData, isLoading: membersLoading } = useProjectMembers(project?.id);
  const members = useMemo(() => membersData?.data ?? [], [membersData]);

  // Aggregated stats
  const allStats = useMemo(() => categorize(allIssues), [allIssues]);
  const myStats = useMemo(() => categorize(myIssues), [myIssues]);

  // Overdue issues
  const overdueIssues = useMemo(
    () =>
      allIssues
        .filter(isOverdue)
        .sort(
          (a, b) =>
            new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
        ),
    [allIssues],
  );

  const myOverdueIssues = useMemo(() => myIssues.filter(isOverdue), [myIssues]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of allIssues) {
      const level = i.priority?.level ?? 'none';
      counts[level] = (counts[level] ?? 0) + 1;
    }
    return Object.entries(PRIORITY_META)
      .map(([level, meta]) => ({
        name: meta.label,
        value: counts[level] ?? 0,
        color: meta.color,
      }))
      .filter((d) => d.value > 0);
  }, [allIssues]);

  // Status chart data
  const statusChartData = [
    { name: 'Hecho', value: allStats.done, color: STATUS_COLORS.done },
    { name: 'En progreso', value: allStats.inProgress, color: STATUS_COLORS.in_progress },
    { name: 'Por hacer', value: allStats.todo, color: STATUS_COLORS.todo },
    { name: 'Cancelado', value: allStats.cancelled, color: STATUS_COLORS.cancelled },
  ].filter((d) => d.value > 0);

  const myStatusChartData = [
    { name: 'Hecho', value: myStats.done, color: STATUS_COLORS.done },
    { name: 'En progreso', value: myStats.inProgress, color: STATUS_COLORS.in_progress },
    { name: 'Por hacer', value: myStats.todo, color: STATUS_COLORS.todo },
    { name: 'Cancelado', value: myStats.cancelled, color: STATUS_COLORS.cancelled },
  ].filter((d) => d.value > 0);

  // Team workload per member
  const teamWorkload = useMemo(() => {
    const map = new Map<
      number,
      {
        userId: number;
        name: string;
        avatarUrl: string | null;
        role: string;
        assigned: number;
        done: number;
        inProgress: number;
        overdue: number;
      }
    >();
    for (const m of members) {
      map.set(m.userId, {
        userId: m.userId,
        name: `${m.user.firstName} ${m.user.lastName}`,
        avatarUrl: m.user.avatarUrl,
        role: m.role.name,
        assigned: 0,
        done: 0,
        inProgress: 0,
        overdue: 0,
      });
    }
    for (const issue of allIssues) {
      if (!issue.assigneeId) continue;
      const entry = map.get(issue.assigneeId);
      if (!entry) continue;
      entry.assigned++;
      const t = issue.status?.statusGroup?.type;
      if (t === 'done') entry.done++;
      else if (t === 'in_progress') entry.inProgress++;
      if (isOverdue(issue)) entry.overdue++;
    }
    return Array.from(map.values()).sort((a, b) => b.assigned - a.assigned);
  }, [members, allIssues]);

  const isLoading = projectLoading || spacesLoading;

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Page header ── */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {projectLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold">{project?.name}</h1>
                  <Badge variant="secondary" className="text-xs">
                    {params.projectKey}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <BarChart2 className="size-3.5" />
                    {allStats.total} incidencias
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    {allStats.done} completadas ({allStats.completionPct}%)
                  </span>
                  {overdueIssues.length > 0 && (
                    <span className="flex items-center gap-1 font-medium text-red-600">
                      <AlertTriangle className="size-3.5" />
                      {overdueIssues.length} vencidas
                    </span>
                  )}
                  {activeSprint && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Target className="size-3.5" />
                      Sprint: {activeSprint.name}
                      {daysRemaining !== null && (
                        <span
                          className={`ml-1 rounded-full px-1.5 py-0 text-xs font-semibold ${
                            daysRemaining < 0
                              ? 'bg-red-100 text-red-700'
                              : daysRemaining <= 3
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)}d vencido`
                            : `${daysRemaining}d restantes`}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          {project && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nuevo espacio
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-6 p-6">
          <Tabs defaultValue="project">
            <TabsList>
              <TabsTrigger value="project">Resumen del proyecto</TabsTrigger>
              <TabsTrigger value="personal">Mi actividad</TabsTrigger>
            </TabsList>

            {/* ══ PROJECT TAB ══════════════════════════════════════════════ */}
            <TabsContent value="project" className="mt-6 space-y-6">

              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {allLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))
                ) : (
                  <>
                    <KpiCard
                      label="Total incidencias"
                      value={allStats.total}
                      sub={`${allStats.inProgress} en progreso`}
                      icon={<BarChart2 className="size-5" />}
                    />
                    <KpiCard
                      label="Completadas"
                      value={`${allStats.done} (${allStats.completionPct}%)`}
                      sub={`${completedSprints.length} sprints finalizados`}
                      icon={<CheckCircle2 className="size-5" />}
                      variant="success"
                    />
                    <KpiCard
                      label="Por hacer"
                      value={allStats.todo}
                      sub={`${allStats.inProgress} en ejecución`}
                      icon={<Clock className="size-5" />}
                      variant="warning"
                    />
                    <KpiCard
                      label="Vencidas"
                      value={overdueIssues.length}
                      sub={overdueIssues.length > 0 ? 'Requieren atención' : 'Sin retrasos'}
                      icon={<AlertTriangle className="size-5" />}
                      variant={overdueIssues.length > 0 ? 'danger' : 'success'}
                    />
                  </>
                )}
              </div>

              {/* Active sprint */}
              {activeSprint && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <SectionTitle
                          icon={<Target className="size-4" />}
                          title={`Sprint activo: ${activeSprint.name}`}
                          description={
                            activeSprint.goal ?? 'Sin objetivo definido'
                          }
                        />
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        {activeSprint.startDate && activeSprint.endDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activeSprint.startDate), 'd MMM', { locale: es })}
                            {' — '}
                            {format(new Date(activeSprint.endDate), 'd MMM yyyy', { locale: es })}
                          </span>
                        )}
                        {daysRemaining !== null && (
                          <Badge
                            variant="outline"
                            className={
                              daysRemaining < 0
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : daysRemaining <= 3
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : ''
                            }
                          >
                            {daysRemaining < 0
                              ? `Vencido hace ${Math.abs(daysRemaining)}d`
                              : `${daysRemaining} días restantes`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Progress
                        value={sprintStats.completionPct}
                        className="h-2 flex-1"
                      />
                      <span className="w-10 text-right text-sm font-semibold">
                        {sprintStats.completionPct}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground">Hecho:</span>
                        <span className="font-semibold">{sprintStats.done}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">En progreso:</span>
                        <span className="font-semibold">{sprintStats.inProgress}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-slate-400" />
                        <span className="text-muted-foreground">Por hacer:</span>
                        <span className="font-semibold">{sprintStats.todo}</span>
                      </span>
                      <span className="ml-auto text-muted-foreground">
                        {sprintStats.total} incidencias en este sprint
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Status donut */}
                <Card>
                  <CardHeader className="pb-2">
                    <SectionTitle
                      icon={<TrendingUp className="size-4" />}
                      title="Estado de incidencias"
                    />
                  </CardHeader>
                  <CardContent>
                    {allLoading ? (
                      <Skeleton className="mx-auto h-48 w-48 rounded-full" />
                    ) : statusChartData.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        Sin datos
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={210}>
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={82}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statusChartData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: number, n: string) => [v, n]}
                          />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Priority bar chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <SectionTitle
                      icon={<Flag className="size-4" />}
                      title="Distribución por prioridad"
                    />
                  </CardHeader>
                  <CardContent>
                    {allLoading ? (
                      <div className="space-y-3 pt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-5 w-full rounded" />
                        ))}
                      </div>
                    ) : priorityData.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        Sin datos de prioridad
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={210}>
                        <BarChart
                          data={priorityData}
                          layout="vertical"
                          margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={56}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(v: number) => [v, 'Incidencias']}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {priorityData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Overdue issues table */}
              {overdueIssues.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <SectionTitle
                      icon={<AlertTriangle className="size-4 text-red-500" />}
                      title={`Incidencias vencidas (${overdueIssues.length})`}
                      description="Ordenadas por fecha de vencimiento más antigua"
                    />
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-72">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="pl-6">Clave</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Asignado a</TableHead>
                            <TableHead>Vencida</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead className="pr-6">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overdueIssues.map((issue) => (
                            <TableRow key={issue.id}>
                              <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                {issue.issueKey}
                              </TableCell>
                              <TableCell className="max-w-52 truncate font-medium">
                                {issue.title}
                              </TableCell>
                              <TableCell>
                                {issue.assignee ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar className="size-6">
                                      <AvatarImage
                                        src={issue.assignee.avatarUrl ?? undefined}
                                      />
                                      <AvatarFallback className="text-[10px]">
                                        {issue.assignee.firstName[0]}
                                        {issue.assignee.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">
                                      {issue.assignee.firstName}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    Sin asignar
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-medium text-red-600">
                                  {formatDistanceToNow(new Date(issue.dueDate!), {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </span>
                              </TableCell>
                              <TableCell>
                                <PriorityBadge level={issue.priority?.level} />
                              </TableCell>
                              <TableCell className="pr-6">
                                <StatusBadge status={issue.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Team workload */}
              <Card>
                <CardHeader className="pb-2">
                  <SectionTitle
                    icon={<Users className="size-4" />}
                    title="Carga de trabajo del equipo"
                    description="Distribución de incidencias por miembro"
                  />
                </CardHeader>
                <CardContent className="p-0">
                  {membersLoading ? (
                    <div className="space-y-2 p-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded" />
                      ))}
                    </div>
                  ) : teamWorkload.length === 0 ? (
                    <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                      Sin miembros en el proyecto
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Miembro</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead className="text-center">Asignadas</TableHead>
                          <TableHead className="text-center">Completadas</TableHead>
                          <TableHead className="text-center">En progreso</TableHead>
                          <TableHead className="text-center">Vencidas</TableHead>
                          <TableHead className="pr-6">Avance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamWorkload.map((m) => {
                          const pct =
                            m.assigned > 0
                              ? Math.round((m.done / m.assigned) * 100)
                              : 0;
                          return (
                            <TableRow key={m.userId}>
                              <TableCell className="pl-6">
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="size-7">
                                    <AvatarImage src={m.avatarUrl ?? undefined} />
                                    <AvatarFallback className="text-xs">
                                      {m.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{m.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {m.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-sm font-semibold">
                                {m.assigned}
                              </TableCell>
                              <TableCell className="text-center text-sm text-emerald-600">
                                {m.done}
                              </TableCell>
                              <TableCell className="text-center text-sm text-blue-600">
                                {m.inProgress}
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {m.overdue > 0 ? (
                                  <span className="font-semibold text-red-600">
                                    {m.overdue}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="pr-6">
                                <div className="flex items-center gap-2">
                                  <Progress value={pct} className="h-1.5 w-16" />
                                  <span className="w-8 text-right text-xs font-medium text-muted-foreground">
                                    {pct}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Sprint history */}
              {completedSprints.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <SectionTitle
                      icon={<CalendarClock className="size-4" />}
                      title="Historial de sprints"
                      description={`${completedSprints.length} sprints completados`}
                    />
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Sprint</TableHead>
                          <TableHead>Objetivo</TableHead>
                          <TableHead>Inicio</TableHead>
                          <TableHead className="pr-6">Fin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedSprints
                          .slice()
                          .reverse()
                          .slice(0, 6)
                          .map((sprint) => (
                            <TableRow key={sprint.id}>
                              <TableCell className="pl-6 font-medium">
                                {sprint.name}
                              </TableCell>
                              <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                                {sprint.goal ?? '—'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {sprint.startDate
                                  ? format(new Date(sprint.startDate), 'd MMM yyyy', {
                                      locale: es,
                                    })
                                  : '—'}
                              </TableCell>
                              <TableCell className="pr-6 text-sm text-muted-foreground">
                                {sprint.endDate
                                  ? format(new Date(sprint.endDate), 'd MMM yyyy', {
                                      locale: es,
                                    })
                                  : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ══ PERSONAL TAB ═════════════════════════════════════════════ */}
            <TabsContent value="personal" className="mt-6 space-y-6">

              {/* Personal KPIs */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {myLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))
                ) : (
                  <>
                    <KpiCard
                      label="Mis incidencias"
                      value={myStats.total}
                      sub="total asignadas"
                      icon={<Circle className="size-5" />}
                    />
                    <KpiCard
                      label="Completadas"
                      value={`${myStats.done} (${myStats.completionPct}%)`}
                      sub="de mis incidencias"
                      icon={<CheckCircle2 className="size-5" />}
                      variant="success"
                    />
                    <KpiCard
                      label="En progreso"
                      value={myStats.inProgress}
                      sub={`${myStats.todo} por hacer`}
                      icon={<Clock className="size-5" />}
                      variant="warning"
                    />
                    <KpiCard
                      label="Vencidas"
                      value={myOverdueIssues.length}
                      sub={
                        myOverdueIssues.length > 0
                          ? 'Requieren atención'
                          : 'Al día'
                      }
                      icon={<AlertTriangle className="size-5" />}
                      variant={myOverdueIssues.length > 0 ? 'danger' : 'success'}
                    />
                  </>
                )}
              </div>

              {/* Personal overdue alert */}
              {myOverdueIssues.length > 0 && (
                <Card className="border-red-200 bg-red-50/40">
                  <CardHeader className="pb-2">
                    <SectionTitle
                      icon={<AlertTriangle className="size-4 text-red-500" />}
                      title={`Tienes ${myOverdueIssues.length} incidencias vencidas`}
                      description="Estas incidencias están atrasadas respecto a su fecha límite"
                    />
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Clave</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Vencida</TableHead>
                          <TableHead>Prioridad</TableHead>
                          <TableHead className="pr-6">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myOverdueIssues.map((issue) => (
                          <TableRow key={issue.id}>
                            <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                              {issue.issueKey}
                            </TableCell>
                            <TableCell className="max-w-56 truncate font-medium">
                              {issue.title}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-red-600">
                                {formatDistanceToNow(new Date(issue.dueDate!), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </span>
                            </TableCell>
                            <TableCell>
                              <PriorityBadge level={issue.priority?.level} />
                            </TableCell>
                            <TableCell className="pr-6">
                              <StatusBadge status={issue.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Chart + recent issues */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <SectionTitle
                      icon={<TrendingUp className="size-4" />}
                      title="Mis incidencias por estado"
                    />
                  </CardHeader>
                  <CardContent>
                    {myLoading ? (
                      <Skeleton className="mx-auto h-48 w-48 rounded-full" />
                    ) : myStatusChartData.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        Sin incidencias asignadas
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={210}>
                        <PieChart>
                          <Pie
                            data={myStatusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={82}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {myStatusChartData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v: number, n: string) => [v, n]}
                          />
                          <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <SectionTitle
                      icon={<Clock className="size-4" />}
                      title="Mis incidencias recientes"
                    />
                  </CardHeader>
                  <CardContent>
                    {myLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-9 w-full rounded" />
                        ))}
                      </div>
                    ) : myIssues.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        No tienes incidencias asignadas
                      </div>
                    ) : (
                      <ScrollArea className="h-52">
                        <ul className="space-y-1">
                          {myIssues
                            .slice()
                            .sort(
                              (a, b) =>
                                new Date(b.updatedAt).getTime() -
                                new Date(a.updatedAt).getTime(),
                            )
                            .slice(0, 10)
                            .map((issue) => (
                              <li
                                key={issue.id}
                                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                              >
                                <span
                                  className="size-2 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor:
                                      issue.status?.color ?? '#94a3b8',
                                  }}
                                />
                                <span className="flex-1 truncate text-sm">
                                  {issue.title}
                                </span>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <PriorityBadge level={issue.priority?.level} />
                                </div>
                              </li>
                            ))}
                        </ul>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* ── Spaces section ── */}
          <div>
            <Separator className="mb-6" />
            <div className="mb-4 flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Espacios del proyecto</h2>
              <Badge variant="secondary" className="text-xs">
                {spaces.length}
              </Badge>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
              </div>
            ) : spaces.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {spaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() =>
                      router.push(
                        `/projects/${params.projectKey}/spaces/${space.id}/board`,
                      )
                    }
                    className="group flex flex-col gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="size-4 shrink-0 rounded-full"
                        style={{ backgroundColor: space.color ?? '#6b7280' }}
                      />
                      <span className="font-semibold">{space.name}</span>
                      <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    {space.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {space.description}
                      </p>
                    )}
                    <span className="mt-auto text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Abrir tablero →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                <Layers className="mb-4 size-10 text-muted-foreground/40" />
                <h3 className="text-base font-semibold">Sin espacios</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea un espacio para empezar a organizar las incidencias del
                  proyecto.
                </p>
                {project && (
                  <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    Crear primer espacio
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {project && (
        <CreateSpaceDialog
          projectId={project.id}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </div>
  );
}
