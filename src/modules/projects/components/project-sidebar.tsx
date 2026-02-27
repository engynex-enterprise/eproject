'use client';

import { createElement, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Layers, Settings, UserPlus, LayoutDashboard } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/modules/projects/hooks/use-projects';
import { useSpaces } from '@/modules/spaces/hooks/use-spaces';
import { getProjectIcon } from '@/modules/projects/components/icon-color-picker';
import { useAccentColor } from '@/shared/providers/accent-color-provider';
import { CreateSpaceDialog } from '@/modules/spaces/components/create-space-dialog';
import { AddMemberDialog } from '@/modules/projects/components/add-member-dialog';

export function ProjectSidebar() {
  const params = useParams<{ projectKey: string; spaceId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useAccentColor();
  const [createOpen, setCreateOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const { data, isLoading } = useProject(params.projectKey);
  const project = data?.data;

  const { data: spaces, isLoading: spacesLoading } = useSpaces(project?.id);

  const basePath = `/projects/${params.projectKey}`;
  const activeSpaceId = params.spaceId;

  const ProjectIcon = project ? getProjectIcon(project.iconUrl) : null;
  const projectColor = project?.color ?? colors.base;

  return (
    <>
      <Sidebar>
        <SidebarHeader className="gap-0 p-0">
          {/* Back to projects — same height as the global header (h-14) */}
          <Button
            variant="ghost"
            className="h-14 w-full justify-start gap-2 rounded-none px-4 text-sm font-medium"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="size-4" />
            Proyectos
          </Button>

          <Separator />

          {/* Project info */}
          <div className="flex items-center gap-3 px-4 py-3">
            {isLoading ? (
              <>
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </>
            ) : (
              <>
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: projectColor }}
                >
                  {ProjectIcon && createElement(ProjectIcon, { className: 'size-4' })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{project?.name}</p>
                  <Badge variant="secondary" className="mt-0.5 text-xs px-1.5 py-0">
                    {params.projectKey}
                  </Badge>
                </div>
              </>
            )}
          </div>

          <Separator />
        </SidebarHeader>

        <SidebarContent>
          {/* Dashboard link */}
          <SidebarGroup className="pb-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard del proyecto"
                  isActive={pathname === basePath}
                >
                  <Link href={basePath}>
                    <LayoutDashboard className="size-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Espacios</SidebarGroupLabel>
            <SidebarMenu>
              {spacesLoading ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <Skeleton className="size-3 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : spaces && spaces.length > 0 ? (
                spaces.map((space) => {
                  const isActive = activeSpaceId === String(space.id);
                  return (
                    <SidebarMenuItem key={space.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={space.name}
                      >
                        <Link href={`${basePath}/spaces/${space.id}/board`}>
                          <span
                            className="size-3 shrink-0 rounded-full"
                            style={{ backgroundColor: space.color ?? '#6b7280' }}
                          />
                          <span className="truncate">{space.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                <SidebarMenuItem>
                  <div className="flex flex-col items-center gap-2 px-2 py-4 text-center">
                    <Layers className="size-8 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">
                      Sin espacios. Crea uno para comenzar.
                    </p>
                  </div>
                </SidebarMenuItem>
              )}

              {/* New space button */}
              {project && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCreateOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-4" />
                    <span>Nuevo espacio</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-0 p-0">
          <Separator />
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Configuración del proyecto"
                isActive={pathname.startsWith(`${basePath}/settings`)}
              >
                <Link href={`${basePath}/settings`}>
                  <Settings className="size-4" />
                  <span>Configuración</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => project && setAddMemberOpen(true)}
                tooltip="Añadir persona al proyecto"
                disabled={!project}
              >
                <UserPlus className="size-4" />
                <span>Añadir persona</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {project && (
        <CreateSpaceDialog
          projectId={project.id}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}

      {project && (
        <AddMemberDialog
          projectId={project.id}
          projectName={project.name}
          orgId={project.organizationId}
          open={addMemberOpen}
          onOpenChange={setAddMemberOpen}
        />
      )}
    </>
  );
}
