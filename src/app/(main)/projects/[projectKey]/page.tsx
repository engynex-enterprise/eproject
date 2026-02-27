'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Layers,
  ArrowRight,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  Target,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

import { useProject, useProjectMembers } from '@/modules/projects/hooks/use-projects';
import { useSpaces } from '@/modules/spaces/hooks/use-spaces';
import { useBoardData } from '@/modules/board/hooks/use-board';
import { useSprints } from '@/modules/sprints/hooks/use-sprints';
import { useAuthStore } from '@/shared/stores/auth.store';
import { CreateSpaceDialog } from '@/modules/spaces/components/create-space-dialog';
import type { Issue } from '@/shared/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function categorize(issues: Issue[]) {
  let done = 0, inProgress = 0, todo = 0, cancelled = 0;
  for (const iss of issues) {
    const t = iss.status?.statusGroup?.type;
    if (t === 'done') done++;
    else if (t === 'in_progress') inProgress++;
    else if (t === 'cancelled') cancelled++;
    else todo++;
  }
  return { done, inProgress, todo, cancelled, total: issues.length };
}

const COLORS = {
  done: '#22c55e',
  inProgress: '#f59e0b',
  todo: '#64748b',
  cancelled: '#ef4444',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function IssueDonutChart({
  data,
  loading,
  emptyMessage,
}: {
  data: { name: string; value: number; color: string }[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return <Skeleton className="mx-auto h-48 w-48 rounded-full" />;
  }
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number, n: string) => [v, n]} />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProjectRootPage() {
  const params = useParams<{ projectKey: string }>();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [createOpen, setCreateOpen] = useState(false);

  // Project
  const { data: projectData, isLoading: projectLoading } = useProject(params.projectKey);
  const project = projectData?.data;

  // Spaces
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces(project?.id);

  // All issues (project-wide)
  const { data: allBoardData, isLoading: allLoading } = useBoardData(params.projectKey);
  const allIssues = useMemo(
    () => allBoardData?.data.columns.flatMap((c) => c.issues) ?? [],
    [allBoardData],
  );

  // My issues (filtered by current user)
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
  const activeSprint = sprintsData?.data?.find((s) => s.status === 'active') ?? null;
  const sprintIssues = useMemo(
    () => (activeSprint ? allIssues.filter((i) => i.sprintId === activeSprint.id) : []),
    [activeSprint, allIssues],
  );
  const sprintDone = sprintIssues.filter((i) => i.status?.statusGroup?.type === 'done').length;
  const sprintTotal = sprintIssues.length;
  const sprintProgress = sprintTotal > 0 ? Math.round((sprintDone / sprintTotal) * 100) : 0;

  // Members
  const { data: membersData, isLoading: membersLoading } = useProjectMembers(project?.id);
  const members = membersData?.data ?? [];

  // Stats
  const allStats = useMemo(() => categorize(allIssues), [allIssues]);
  const myStats = useMemo(() => categorize(myIssues), [myIssues]);

  const allChartData = [
    { name: 'Hecho', value: allStats.done, color: COLORS.done },
    { name: 'En progreso', value: allStats.inProgress, color: COLORS.inProgress },
    { name: 'Por hacer', value: allStats.todo, color: COLORS.todo },
    { name: 'Cancelado', value: allStats.cancelled, color: COLORS.cancelled },
  ].filter((d) => d.value > 0);

  const myChartData = [
    { name: 'Hecho', value: myStats.done, color: COLORS.done },
    { name: 'En progreso', value: myStats.inProgress, color: COLORS.inProgress },
    { name: 'Por hacer', value: myStats.todo, color: COLORS.todo },
    { name: 'Cancelado', value: myStats.cancelled, color: COLORS.cancelled },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Header ── */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            {projectLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <h1 className="text-lg font-semibold">{project?.name}</h1>
            )}
            <p className="mt-0.5 text-sm text-muted-foreground">
              Resumen general del proyecto
            </p>
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
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Dashboard tabs */}
        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal">Mi actividad</TabsTrigger>
            <TabsTrigger value="project">Resumen del proyecto</TabsTrigger>
          </TabsList>

          {/* ─── Personal tab ─────────────────────────────────────────── */}
          <TabsContent value="personal" className="mt-4 space-y-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {myLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : (
                <>
                  <StatCard
                    label="Mis incidencias"
                    value={myStats.total}
                    icon={<Circle className="size-5" />}
                  />
                  <StatCard
                    label="Completadas"
                    value={myStats.done}
                    icon={<CheckCircle2 className="size-5 text-green-500" />}
                  />
                  <StatCard
                    label="En progreso"
                    value={myStats.inProgress}
                    icon={<Clock className="size-5 text-amber-500" />}
                  />
                  <StatCard
                    label="Por hacer"
                    value={myStats.todo}
                    icon={<Circle className="size-5 text-slate-400" />}
                  />
                </>
              )}
            </div>

            {/* Chart + recent issues */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Distribución de mis incidencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IssueDonutChart
                    data={myChartData}
                    loading={myLoading}
                    emptyMessage="Sin incidencias asignadas"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mis incidencias recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full rounded" />
                      ))}
                    </div>
                  ) : myIssues.length === 0 ? (
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                      No tienes incidencias asignadas
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {myIssues.slice(0, 8).map((issue) => (
                        <li
                          key={issue.id}
                          className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted/50"
                        >
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: issue.status?.color ?? '#64748b' }}
                          />
                          <span className="flex-1 truncate text-sm">{issue.title}</span>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {issue.status?.name}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Project tab ──────────────────────────────────────────── */}
          <TabsContent value="project" className="mt-4 space-y-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {allLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : (
                <>
                  <StatCard
                    label="Total incidencias"
                    value={allStats.total}
                    icon={<Circle className="size-5" />}
                  />
                  <StatCard
                    label="Completadas"
                    value={allStats.done}
                    icon={<CheckCircle2 className="size-5 text-green-500" />}
                  />
                  <StatCard
                    label="En progreso"
                    value={allStats.inProgress}
                    icon={<Clock className="size-5 text-amber-500" />}
                  />
                  <StatCard
                    label="Por hacer"
                    value={allStats.todo}
                    icon={<Circle className="size-5 text-slate-400" />}
                  />
                </>
              )}
            </div>

            {/* Active sprint progress */}
            {activeSprint && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">
                      Sprint activo: {activeSprint.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {sprintDone} de {sprintTotal} completadas
                    </span>
                    <span className="font-medium">{sprintProgress}%</span>
                  </div>
                  <Progress value={sprintProgress} className="h-2" />
                </CardContent>
              </Card>
            )}

            {/* Chart + members */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Distribución de incidencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IssueDonutChart
                    data={allChartData}
                    loading={allLoading}
                    emptyMessage="Sin incidencias en el proyecto"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">
                      Miembros del proyecto
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded" />
                      ))}
                    </div>
                  ) : members.length === 0 ? (
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                      Sin miembros
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {members.slice(0, 6).map((member) => (
                        <li key={member.id} className="flex items-center gap-3">
                          <Avatar className="size-7">
                            <AvatarImage src={member.user.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {member.user.firstName[0]}
                              {member.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate text-sm">
                            {member.user.firstName} {member.user.lastName}
                          </span>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {member.role.name}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Spaces section ── */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Espacios del proyecto</h2>

          {projectLoading || spacesLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
                  className="group flex flex-col gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
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
                Crea un espacio para empezar a organizar las incidencias del proyecto.
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
