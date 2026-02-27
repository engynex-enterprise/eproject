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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface ProjectTableProps {
  projects: ProjectListItem[];
  favorites?: Set<number>;
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
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

export function ProjectTable({
  projects,
  favorites,
  onToggleFavorite,
  onArchive,
  onDelete,
}: ProjectTableProps) {
  const router = useRouter();
  const { colors } = useAccentColor();
  const [deleteProject, setDeleteProject] = useState<ProjectListItem | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Sprint</TableHead>
            <TableHead className="w-32">Progreso</TableHead>
            <TableHead className="hidden lg:table-cell">Espacios</TableHead>
            <TableHead className="hidden sm:table-cell w-24 text-center">Incidencias</TableHead>
            <TableHead className="hidden lg:table-cell w-20 text-center">Sprints</TableHead>
            <TableHead className="hidden md:table-cell w-32">Miembros</TableHead>
            <TableHead className="hidden lg:table-cell w-28">Actualizado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const isFavorite = favorites?.has(project.id) ?? false;
            const progressPercent =
              project.issueStats.total > 0
                ? Math.round((project.issueStats.done / project.issueStats.total) * 100)
                : 0;

            return (
              <TableRow
                key={project.id}
                className="cursor-pointer"
                onClick={() => router.push(`/projects/${project.key}/board`)}
              >
                {/* Favorite star */}
                <TableCell className="pr-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(project.id);
                    }}
                    className="flex items-center justify-center"
                  >
                    <Star
                      className={cn(
                        'size-3.5 transition-colors hover:text-yellow-400',
                        isFavorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/40',
                      )}
                    />
                  </button>
                </TableCell>

                {/* Name + icon + key */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex size-6 shrink-0 items-center justify-center rounded-md text-white"
                      style={{ backgroundColor: colors.base }}
                    >
                      {project.avatarUrl ? (
                        <img
                          src={project.avatarUrl}
                          alt={project.name}
                          className="size-3.5 rounded-sm"
                        />
                      ) : (
                        <FolderKanban className="size-3" />
                      )}
                    </div>
                    <span className="truncate text-sm font-medium">{project.name}</span>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {project.key}
                    </Badge>
                  </div>
                </TableCell>

                {/* Sprint */}
                <TableCell className="hidden md:table-cell">
                  {project.activeSprint ? (
                    <Badge variant="outline" className="gap-1 text-[10px] font-normal">
                      <IterationCcw className="size-2.5" />
                      {project.activeSprint.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Progress */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: project.healthColor,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {progressPercent}%
                    </span>
                  </div>
                </TableCell>

                {/* Spaces */}
                <TableCell className="hidden lg:table-cell">
                  {project.spaces.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {project.spaces.slice(0, 3).map((space) => (
                        <Badge
                          key={space.id}
                          variant="outline"
                          className="text-[10px] font-normal"
                          style={space.color ? { borderColor: space.color, color: space.color } : undefined}
                        >
                          {space.name}
                        </Badge>
                      ))}
                      {project.spaceCount > 3 && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          +{project.spaceCount - 3}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Issue count */}
                <TableCell className="hidden sm:table-cell text-center">
                  <span className="text-xs text-muted-foreground">{project.issueCount}</span>
                </TableCell>

                {/* Sprint count */}
                <TableCell className="hidden lg:table-cell text-center">
                  <span className="text-xs text-muted-foreground">{project.sprintCount}</span>
                </TableCell>

                {/* Members */}
                <TableCell className="hidden md:table-cell">
                  {project.members.length > 0 ? (
                    <TooltipProvider>
                      <div className="flex items-center gap-1">
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
                        </div>
                        {project.memberCount > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{project.memberCount - 3}
                          </span>
                        )}
                      </div>
                    </TooltipProvider>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3" />
                      {project.memberCount}
                    </span>
                  )}
                </TableCell>

                {/* Updated */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(project.updatedAt)}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-xs" className="size-6">
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
                        onClick={() => setDeleteProject(project)}
                        className="gap-2"
                      >
                        <Trash2 className="size-4" />
                        Borrar proyecto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas borrar el proyecto{' '}
              <strong>{deleteProject?.name}</strong>? Esta acción no se puede deshacer
              y se eliminarán todas las incidencias, sprints y datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteProject) onDelete?.(deleteProject.id);
                setDeleteProject(null);
              }}
            >
              Borrar proyecto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
