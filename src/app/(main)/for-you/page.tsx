"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  FolderKanban,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/shared/stores/auth.store";

const MOCK_TASKS = [
  {
    id: "1",
    title: "Configurar CI/CD pipeline",
    project: "eProject Frontend",
    priority: "Alta",
    status: "En progreso",
  },
  {
    id: "2",
    title: "Revisar PR de autenticacion",
    project: "API Backend",
    priority: "Media",
    status: "Pendiente",
  },
  {
    id: "3",
    title: "Actualizar dependencias",
    project: "Mobile App",
    priority: "Baja",
    status: "Pendiente",
  },
];

const MOCK_ACTIVITY = [
  {
    id: "1",
    action: "completo la tarea",
    target: "Disenar pantalla de login",
    user: "Maria Garcia",
    time: "Hace 2 horas",
  },
  {
    id: "2",
    action: "comento en",
    target: "Configurar base de datos",
    user: "Carlos Lopez",
    time: "Hace 4 horas",
  },
  {
    id: "3",
    action: "creo el ticket",
    target: "Bug en el formulario de registro",
    user: "Ana Martinez",
    time: "Hace 6 horas",
  },
];

const MOCK_RECENT_PROJECTS = [
  {
    name: "eProject Frontend",
    key: "EP",
    tasksCount: 24,
    url: "/projects/eproject-frontend",
  },
  {
    name: "API Backend",
    key: "AB",
    tasksCount: 18,
    url: "/projects/api-backend",
  },
  {
    name: "Mobile App",
    key: "MA",
    tasksCount: 12,
    url: "/projects/mobile-app",
  },
];

function priorityColor(priority: string): string {
  switch (priority) {
    case "Alta":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "Media":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400";
    case "Baja":
      return "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400";
    default:
      return "";
  }
}

export default function ForYouPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName || "Usuario";

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Aqui tienes un resumen de tu actividad y pendientes.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tareas asignadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_TASKS.length}</div>
            <p className="text-xs text-muted-foreground">
              1 completada esta semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              En progreso
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              De {MOCK_TASKS.length} tareas totales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Proyectos activos
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MOCK_RECENT_PROJECTS.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {MOCK_RECENT_PROJECTS.reduce((a, p) => a + p.tasksCount, 0)}{" "}
              tareas en total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mis tareas */}
        <Card>
          <CardHeader>
            <CardTitle>Mis tareas</CardTitle>
            <CardDescription>Tareas asignadas a ti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.project}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={priorityColor(task.priority)}
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Ultimas acciones en tus proyectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-medium text-primary">
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Proyectos recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Proyectos recientes</CardTitle>
            <CardDescription>
              Proyectos en los que has trabajado recientemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_RECENT_PROJECTS.map((project) => (
                <Link key={project.key} href={project.url}>
                  <div className="group flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                      {project.key}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.tasksCount} tareas
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
