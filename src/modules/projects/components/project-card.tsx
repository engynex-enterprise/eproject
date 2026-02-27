'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  MoreHorizontal,
  Users,
  Star,
  UserPlus,
  FileText,
  Image,
  Settings,
  Archive,
  Trash2,
  ChevronRight,
  IterationCcw,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import type { ProjectListItem } from '../services/projects.service';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAccentColor } from '@/shared/providers/accent-color-provider';

interface ProjectCardProps {
  project: ProjectListItem;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: number) => void;
  onArchive?: (projectId: number) => void;
  onDelete?: (projectId: number) => void;
}

export function ProjectCard({
  project,
  isFavorite = false,
  onToggleFavorite,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { colors } = useAccentColor();

  const handleClick = () => {
    router.push(`/projects/${project.key}/board`);
  };

  const progressPercent =
    project.issueStats.total > 0
      ? Math.round((project.issueStats.done / project.issueStats.total) * 100)
      : 0;

  return (
    <>
      <Card
        className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-lg"
        onClick={handleClick}
        style={{
          borderLeft: `4px solid ${project.healthColor}`,
        }}
      >
        {/* Gradient blob with blur */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: colors.base }}
        />
        <div
          className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full opacity-15 blur-2xl"
          style={{ backgroundColor: colors.light }}
        />

        <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ backgroundColor: colors.base }}
            >
              {project.avatarUrl ? (
                <img
                  src={project.avatarUrl}
                  alt={project.name}
                  className="size-6 rounded"
                />
              ) : (
                <FolderKanban className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold leading-none">
                  {project.name}
                </h3>
                {isFavorite && (
                  <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {project.key}
                </Badge>
                {project.activeSprint && (
                  <Badge variant="outline" className="gap-1 text-[10px] font-normal">
                    <IterationCcw className="size-2.5" />
                    {project.activeSprint.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={() => onToggleFavorite?.(project.id)}
                className="gap-2"
              >
                <Star
                  className={cn(
                    'size-4',
                    isFavorite && 'fill-yellow-400 text-yellow-400',
                  )}
                />
                {isFavorite ? 'Quitar de marcados' : 'Añadir a marcados'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/projects/${project.key}/settings/members`)}
                className="gap-2"
              >
                <UserPlus className="size-4" />
                Añadir personas
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" disabled>
                <FileText className="size-4" />
                <span className="flex-1">Guardar como plantilla</span>
                <Badge variant="outline" className="ml-auto h-5 px-1.5 text-[9px] font-semibold uppercase tracking-wider">
                  Pronto
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/projects/${project.key}/settings`)}
                className="gap-2"
              >
                <Image className="size-4" />
                <span className="flex-1">Establecer fondo del proyecto</span>
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/projects/${project.key}/settings`)}
                className="gap-2"
              >
                <Settings className="size-4" />
                Configuración del proyecto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onArchive?.(project.id)}
                className="gap-2"
              >
                <Archive className="size-4" />
                Archivar proyecto
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                className="gap-2"
              >
                <Trash2 className="size-4" />
                Borrar proyecto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="relative space-y-3 pt-0">
          {/* Description */}
          {project.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {project.description}
            </p>
          )}

          {/* Issue stats row */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-green-500" />
              {project.issueStats.done} completadas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-blue-500" />
              {project.issueStats.inProgress} en curso
            </span>
            <span className="flex items-center gap-1">
              <Circle className="size-3 text-muted-foreground/50" />
              {project.issueStats.todo} pendientes
            </span>
          </div>

          {/* Progress bar */}
          {project.issueStats.total > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Progreso</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: project.healthColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Footer: members + counts */}
          <div className="flex items-center justify-between pt-1">
            {/* Member avatars */}
            <div className="flex items-center gap-2">
              {project.members.length > 0 ? (
                <TooltipProvider>
                  <div className="flex -space-x-1.5">
                    {project.members.slice(0, 4).map((member) => (
                      <Tooltip key={member.id}>
                        <TooltipTrigger asChild>
                          <Avatar className="size-6 border-2 border-background">
                            <AvatarImage src={member.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                              {member.firstName?.[0]}
                              {member.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{member.firstName} {member.lastName}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {project.memberCount > 4 && (
                      <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-medium">
                        +{project.memberCount - 4}
                      </div>
                    )}
                  </div>
                </TooltipProvider>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users className="size-3" />
                  {project.memberCount}
                </span>
              )}
            </div>

            {/* Issue and sprint counts */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <FolderKanban className="size-3" />
                {project.issueCount}
              </span>
              {project.sprintCount > 0 && (
                <span className="flex items-center gap-1">
                  <IterationCcw className="size-3" />
                  {project.sprintCount}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas borrar el proyecto{' '}
              <strong>{project.name}</strong>? Esta acción no se puede deshacer
              y se eliminarán todas las incidencias, sprints y datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete?.(project.id)}
            >
              Borrar proyecto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
