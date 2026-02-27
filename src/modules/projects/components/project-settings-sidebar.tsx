'use client';

import { createElement } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  LayoutDashboard,
  Users,
  Shield,
  Bell,
  Zap,
  Puzzle,
  Link as LinkIcon,
  GitBranch,
  Activity,
  Tags,
  Boxes,
  Wrench,
  AppWindow,
  type LucideIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/modules/projects/hooks/use-projects';
import { getProjectIcon } from '@/modules/projects/components/icon-color-picker';
import { useAccentColor } from '@/shared/providers/accent-color-provider';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function getNavGroups(basePath: string): NavGroup[] {
  return [
    {
      label: 'General',
      items: [
        { label: 'Detalles', href: `${basePath}/settings`, icon: Settings },
        { label: 'Resumen', href: `${basePath}/settings/summary`, icon: LayoutDashboard },
      ],
    },
    {
      label: 'Acceso',
      items: [
        { label: 'Personas', href: `${basePath}/settings/members`, icon: Users },
        { label: 'Permisos', href: `${basePath}/settings/permissions`, icon: Shield },
      ],
    },
    {
      label: 'Notificaciones',
      items: [
        { label: 'Notificaciones', href: `${basePath}/settings/notifications`, icon: Bell },
      ],
    },
    {
      label: 'Automatizacion',
      items: [
        { label: 'Automatizacion', href: `${basePath}/settings/automations`, icon: Zap },
        { label: 'Funciones', href: `${basePath}/settings/features`, icon: Puzzle },
        { label: 'Cadena de herramientas', href: `${basePath}/settings/toolchain`, icon: LinkIcon },
      ],
    },
    {
      label: 'Flujos',
      items: [
        { label: 'Flujos de trabajo', href: `${basePath}/settings/workflows`, icon: GitBranch },
        { label: 'Actividades', href: `${basePath}/settings/activities`, icon: Activity },
      ],
    },
    {
      label: 'Proyecto',
      items: [
        { label: 'Versiones', href: `${basePath}/settings/versions`, icon: Tags },
        { label: 'Componentes', href: `${basePath}/settings/components`, icon: Boxes },
      ],
    },
    {
      label: 'Integraciones',
      items: [
        { label: 'Herramientas de desarrollo', href: `${basePath}/settings/dev-tools`, icon: Wrench },
        { label: 'Aplicaciones', href: `${basePath}/settings/apps`, icon: AppWindow },
      ],
    },
  ];
}

export function ProjectSettingsSidebar() {
  const params = useParams<{ projectKey: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useAccentColor();

  const { data, isLoading } = useProject(params.projectKey);
  const project = data?.data;

  const basePath = `/projects/${params.projectKey}`;
  const navGroups = getNavGroups(basePath);

  const isActive = (href: string) => {
    if (href === `${basePath}/settings`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const ProjectIcon = project ? getProjectIcon(project.iconUrl) : null;
  const projectColor = colors.base;

  return (
    <Sidebar>
      <SidebarHeader className="gap-0 p-0">
        {/* Back button */}
        <Button
          variant="ghost"
          className="h-auto justify-start gap-2 rounded-none px-4 py-3 text-sm font-medium"
          onClick={() => router.push(`${basePath}/board`)}
        >
          <ArrowLeft className="size-4" />
          Configuracion del espacio
        </Button>

        <Separator />

        {/* Project info */}
        <div className="flex items-center gap-3 px-4 py-3">
          {isLoading ? (
            <>
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
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
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{project?.name}</p>
                <p className="text-xs text-muted-foreground">Espacio de software</p>
              </div>
            </>
          )}
        </div>

        <Separator />
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
