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
} from 'lucide-react';
import type { ProjectListItem } from '../services/projects.service';
import {
  Card,
  CardContent,
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
        className="group relative cursor-pointer overflow-hidden transition-all hover:shadow-md"
        onClick={handleClick}
        style={{
          borderLeft: `4px solid ${project.healthColor}`,
        }}
      >
        {/* Subtle accent blob */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: colors.base }}
        />

        <CardContent className="relative space-y-2.5 p-3">
          {/* Row 1: Icon + Name + Key + Sprint + Favorite + Menu */}
          <div className="flex items-center gap-2">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-white"
              style={{ backgroundColor: colors.base }}
            >
              {project.avatarUrl ? (
                <img
                  src={project.avatarUrl}
                  alt={project.name}
                  className="size-4 rounded-sm"
                />
              ) : (
                <FolderKanban className="size-3.5" />
              )}
            </div>
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold leading-none">
              {project.name}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-[10px] font-medium">
              {project.key}
            </Badge>
            {project.activeSprint && (
              <Badge variant="outline" className="hidden gap-1 text-[10px] font-normal sm:flex">
                <IterationCcw className="size-2.5" />
                {project.activeSprint.name}
              </Badge>
            )}
            {isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
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

          {/* Row 2: Progress bar + Stats + Members + Counts */}
          <div className="flex items-center gap-3">
            {/* Mini progress bar */}
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: project.healthColor,
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {progressPercent}%
              </span>
            </div>

            {/* Issue stats compact */}
            <span className="text-[10px] text-muted-foreground">
              {project.issueStats.done}/{project.issueStats.total}
            </span>

            <div className="flex-1" />

            {/* Member avatars */}
            {project.members.length > 0 ? (
              <TooltipProvider>
                <div className="flex -space-x-1">
                  {project.members.slice(0, 3).map((member) => (
                    <Tooltip key={member.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="size-5 border-2 border-background">
                          <AvatarImage src={member.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-[7px] text-primary">
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
                  {project.memberCount > 3 && (
                    <div className="flex size-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[7px] font-medium">
                      +{project.memberCount - 3}
                    </div>
                  )}
                </div>
              </TooltipProvider>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users className="size-2.5" />
                {project.memberCount}
              </span>
            )}

            {/* Counts */}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <FolderKanban className="size-2.5" />
                {project.issueCount}
              </span>
              {project.sprintCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <IterationCcw className="size-2.5" />
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
