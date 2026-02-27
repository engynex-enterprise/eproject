'use client';

import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  IterationCcw,
  CheckCircle2,
  CircleDot,
  Circle,
  Users,
  Layers,
  Calendar,
  Hash,
  ExternalLink,
  Star,
  Clock,
} from 'lucide-react';
import type { ProjectListItem } from '../services/projects.service';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useAccentColor } from '@/shared/providers/accent-color-provider';

interface ProjectPreviewSheetProps {
  project: ProjectListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (projectId: number) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ProjectPreviewSheet({
  project,
  open,
  onOpenChange,
  isFavorite,
  onToggleFavorite,
}: ProjectPreviewSheetProps) {
  const router = useRouter();
  const { colors } = useAccentColor();

  if (!project) return null;

  const progressPercent =
    project.issueStats.total > 0
      ? Math.round((project.issueStats.done / project.issueStats.total) * 100)
      : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: colors.base }}
            >
              <FolderKanban className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-lg">{project.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <Badge
                  className="text-[10px] font-semibold text-white"
                  style={{ backgroundColor: colors.base }}
                >
                  {project.key}
                </Badge>
                {isFavorite && (
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 px-4">
          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                router.push(`/projects/${project.key}/board`);
              }}
              className="flex-1"
            >
              <FolderKanban className="size-3.5" />
              Tablero
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                router.push(`/projects/${project.key}/backlog`);
              }}
              className="flex-1"
            >
              Backlog
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                router.push(`/projects/${project.key}/settings`);
              }}
            >
              <ExternalLink className="size-3.5" />
            </Button>
          </div>

          {project.description && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </>
          )}

          <Separator />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-[11px] text-muted-foreground">ID</span>
              <p className="flex items-center gap-1 text-sm font-medium">
                <Hash className="size-3" />
                {project.id}
              </p>
            </div>
            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-[11px] text-muted-foreground">Creado</span>
              <p className="flex items-center gap-1 text-sm font-medium">
                <Calendar className="size-3" />
                {formatDate(project.createdAt)}
              </p>
            </div>
            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-[11px] text-muted-foreground">Actualizado</span>
              <p className="flex items-center gap-1 text-sm font-medium">
                <Clock className="size-3" />
                {formatDate(project.updatedAt)}
              </p>
            </div>
            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-[11px] text-muted-foreground">Estado</span>
              <p className="text-sm font-medium">
                {project.isActive ? (
                  <Badge variant="outline" className="border-green-500 text-green-600">Activo</Badge>
                ) : (
                  <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Archivado</Badge>
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* Sprint activo */}
          {project.activeSprint && (
            <>
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <IterationCcw className="size-4" />
                  Sprint activo
                </h4>
                <div className="rounded-lg border p-3">
                  <p className="font-medium text-sm">{project.activeSprint.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.activeSprint.startDate && formatDate(project.activeSprint.startDate)}
                    {project.activeSprint.startDate && project.activeSprint.endDate && ' → '}
                    {project.activeSprint.endDate && formatDate(project.activeSprint.endDate)}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Issue stats */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <FolderKanban className="size-4" />
              Incidencias ({project.issueStats.total})
            </h4>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: project.healthColor,
                  }}
                />
              </div>
              <span className="text-sm font-semibold">{progressPercent}%</span>
            </div>

            {/* Stats breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center rounded-lg border p-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span className="mt-1 text-lg font-bold">{project.issueStats.done}</span>
                <span className="text-[10px] text-muted-foreground">Completadas</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border p-2">
                <CircleDot className="size-4 text-blue-500" />
                <span className="mt-1 text-lg font-bold">{project.issueStats.inProgress}</span>
                <span className="text-[10px] text-muted-foreground">En curso</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border p-2">
                <Circle className="size-4 text-muted-foreground/50" />
                <span className="mt-1 text-lg font-bold">{project.issueStats.todo}</span>
                <span className="text-[10px] text-muted-foreground">Pendientes</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Spaces */}
          {project.spaces.length > 0 && (
            <>
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Layers className="size-4" />
                  Espacios ({project.spaceCount})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.spaces.map((space) => (
                    <Badge
                      key={space.id}
                      variant="outline"
                      className="text-xs"
                      style={space.color ? { borderColor: space.color, color: space.color } : undefined}
                    >
                      {space.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Members */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4" />
              Miembros ({project.memberCount})
            </h4>
            <div className="space-y-2">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={member.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                      {member.firstName?.[0]}
                      {member.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {member.firstName} {member.lastName}
                  </span>
                </div>
              ))}
              {project.memberCount > project.members.length && (
                <p className="text-xs text-muted-foreground">
                  +{project.memberCount - project.members.length} miembros más
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
