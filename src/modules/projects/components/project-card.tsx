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
  CircleDot,
  Hash,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
} from 'lucide-react';
import type { ProjectListItem } from '../services/projects.service';
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

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return `Hace ${Math.floor(diffDays / 30)}m`;
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
      <div
        className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
        onClick={handleClick}
        style={{ borderLeft: `4px solid ${project.healthColor}` }}
      >
        <div className="space-y-3 p-4">
          {/* Row 1: Name (bold) + Badges + Actions */}
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 text-base font-bold leading-tight">
              {project.name}
            </h3>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge
                className="text-[10px] font-semibold text-white"
                style={{ backgroundColor: colors.base }}
              >
                {project.key}
              </Badge>
              {project.activeSprint && (
                <Badge variant="outline" className="gap-1 text-[10px] font-normal">
                  <IterationCcw className="size-2.5" />
                  {project.activeSprint.name}
                </Badge>
              )}
              {isFavorite && (
                <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              )}

              {/* Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-6 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="size-3.5" />
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
            </div>
          </div>

          {/* Row 2: Metadata - ID | Issues | Sprints | Updated */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="size-3" />
              {project.id}
            </span>
            <span className="text-muted-foreground/30">|</span>
            <span className="flex items-center gap-1">
              <FolderKanban className="size-3" />
              {project.issueCount} incidencias
            </span>
            {project.sprintCount > 0 && (
              <>
                <span className="text-muted-foreground/30">|</span>
                <span className="flex items-center gap-1">
                  <IterationCcw className="size-3" />
                  {project.sprintCount} sprints
                </span>
              </>
            )}
            <span className="text-muted-foreground/30">|</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeDate(project.updatedAt)}
            </span>
          </div>

          {/* Row 3: Issue stats with mini icons */}
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="size-3" />
              {project.issueStats.done} completadas
            </span>
            <span className="flex items-center gap-1 text-blue-500">
              <CircleDot className="size-3" />
              {project.issueStats.inProgress} en curso
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Circle className="size-3" />
              {project.issueStats.todo} pendientes
            </span>
          </div>

          {/* Row 4: Progress bar full width */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: project.healthColor,
                }}
              />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {progressPercent}%
            </span>
          </div>

          {/* Row 5: Members */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span className="font-medium">Miembros:</span>
            {project.members.length > 0 ? (
              <TooltipProvider>
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {project.members.slice(0, 4).map((member) => (
                      <Tooltip key={member.id}>
                        <TooltipTrigger asChild>
                          <Avatar className="size-6 border-2 border-card">
                            <AvatarImage src={member.avatarUrl ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-[8px] text-primary">
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
                  </div>
                  {project.memberCount > 4 && (
                    <span className="text-[11px]">+{project.memberCount - 4} más</span>
                  )}
                </div>
              </TooltipProvider>
            ) : (
              <span>{project.memberCount} personas</span>
            )}
          </div>
        </div>
      </div>

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
