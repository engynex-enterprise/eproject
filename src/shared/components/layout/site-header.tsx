"use client";

import { createElement, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarIcon,
  Search,
  FolderKanban,
  Star,
  IterationCcw,
  Settings,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { usePathname } from "next/navigation";
import { useProjects } from "@/modules/projects/hooks/use-projects";
import { useAccentColor } from "@/shared/providers/accent-color-provider";
import { NotificationBell } from "@/modules/notifications/components/notification-bell";
import { getProjectIcon } from "@/modules/projects/components/icon-color-picker";
import { useAuthStore } from "@/shared/stores/auth.store";

const FAVORITES_KEY = "eproject:favorite-projects";

function loadFavorites(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

const ROUTE_LABELS: Record<string, string> = {
  "/for-you": "Inicio",
  "/projects": "Proyectos",
  "/helpdesk": "Tickets",
  "/documents": "Documentacion",
  "/profile": "Perfil",
  "/organization": "Organizacion",
  "/settings": "Configuracion",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const label =
      ROUTE_LABELS[currentPath] ||
      segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
    breadcrumbs.push({
      label,
      href: currentPath,
      isLast: i === segments.length - 1,
    });
  }

  return breadcrumbs;
}

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const router = useRouter();
  const { colors } = useAccentColor();

  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const currentOrgId = useAuthStore((s) => s.currentOrgId);
  const { data } = useProjects(currentOrgId ?? 0);
  const projects = data?.data ?? [];
  const favorites = loadFavorites();

  const favoriteProjects = projects.filter((p) => favorites.has(p.id));
  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  const navigateTo = useCallback(
    (path: string) => {
      setCommandOpen(false);
      router.push(path);
    },
    [router]
  );

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center border-b bg-white dark:bg-background">
        <div className="flex h-14 w-full items-center gap-4 px-4 lg:px-6">
          {/* Left: sidebar toggle + breadcrumbs */}
          <div className="flex items-center gap-3">
            <Button
              className="size-9"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              <SidebarIcon className="size-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb.href} className="contents">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: search + notifications */}
          <div className="ml-auto flex items-center gap-2">
            {/* Desktop search button with shortcut */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="hidden h-9 gap-2 px-3 text-muted-foreground sm:flex"
            >
              <Search className="size-3.5" />
              <span className="text-sm">Buscar...</span>
              <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                <span className="text-xs">&#8984;</span>K
              </kbd>
            </Button>
            {/* Mobile search */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 sm:hidden"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="size-4" />
              <span className="sr-only">Buscar</span>
            </Button>
            {/* Notifications */}
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Global command palette (Cmd+K) */}
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Busqueda rapida"
        description="Busca y navega rapidamente entre proyectos"
      >
        <CommandInput placeholder="Buscar proyecto por nombre o clave..." />
        <CommandList>
          <CommandEmpty>No se encontraron proyectos.</CommandEmpty>

          {favoriteProjects.length > 0 && (
            <CommandGroup heading="Marcados">
              {favoriteProjects.map((project) => (
                <CommandItem
                  key={`fav-${project.id}`}
                  onSelect={() =>
                    navigateTo(`/projects/${project.key}/board`)
                  }
                  className="gap-3"
                >
                  <div
                    className="flex size-6 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: project.color ?? colors.base }}
                  >
                    {createElement(getProjectIcon(project.avatarUrl), { className: "size-3" })}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {project.key}
                  </Badge>
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Recientes">
            {recentProjects.map((project) => (
              <CommandItem
                key={`recent-${project.id}`}
                onSelect={() =>
                  navigateTo(`/projects/${project.key}/board`)
                }
                className="gap-3"
              >
                <div
                  className="flex size-6 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: project.color ?? colors.base }}
                >
                  {createElement(getProjectIcon(project.avatarUrl), { className: "size-3" })}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{project.name}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {project.key}
                </Badge>
                {project.activeSprint && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <IterationCcw className="size-2.5" />
                    {project.activeSprint.name}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {project.issueStats.done}/{project.issueStats.total}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          {projects.length > 5 && (
            <CommandGroup heading="Todos los proyectos">
              {projects
                .filter((p) => !recentProjects.some((r) => r.id === p.id))
                .map((project) => (
                  <CommandItem
                    key={`all-${project.id}`}
                    onSelect={() =>
                      navigateTo(`/projects/${project.key}/board`)
                    }
                    className="gap-3"
                  >
                    <div
                      className="flex size-6 items-center justify-center rounded-md text-white"
                      style={{ backgroundColor: project.color ?? colors.base }}
                    >
                      {createElement(getProjectIcon(project.avatarUrl), { className: "size-3" })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {project.key}
                    </Badge>
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Acciones">
            <CommandItem
              onSelect={() => navigateTo("/projects")}
              className="gap-3"
            >
              <FolderKanban className="size-4" />
              Ir a proyectos
            </CommandItem>
            <CommandItem
              onSelect={() => navigateTo("/organization")}
              className="gap-3"
            >
              <Settings className="size-4" />
              Configuracion de organizacion
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
