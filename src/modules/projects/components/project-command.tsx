'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  Star,
  IterationCcw,
  Plus,
  Settings,
  LayoutGrid,
  List,
} from 'lucide-react';
import type { ProjectListItem } from '../services/projects.service';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useAccentColor } from '@/shared/providers/accent-color-provider';

interface ProjectCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectListItem[];
  favorites?: Set<number>;
  onCreateProject: () => void;
  onToggleFavorite?: (projectId: number) => void;
}

export function ProjectCommand({
  open,
  onOpenChange,
  projects,
  favorites,
  onCreateProject,
  onToggleFavorite,
}: ProjectCommandProps) {
  const router = useRouter();
  const { colors } = useAccentColor();

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const favoriteProjects = projects.filter((p) => favorites?.has(p.id));
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const navigateTo = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar proyectos"
      description="Busca y navega rapidamente entre proyectos"
    >
      <CommandInput placeholder="Buscar proyecto por nombre o clave..." />
      <CommandList>
        <CommandEmpty>No se encontraron proyectos.</CommandEmpty>

        {/* Favorites */}
        {favoriteProjects.length > 0 && (
          <CommandGroup heading="Marcados">
            {favoriteProjects.map((project) => (
              <CommandItem
                key={`fav-${project.id}`}
                onSelect={() => navigateTo(`/projects/${project.key}/board`)}
                className="gap-3"
              >
                <div
                  className="flex size-6 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: colors.base }}
                >
                  <FolderKanban className="size-3" />
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

        {/* Recent */}
        <CommandGroup heading="Recientes">
          {recentProjects.map((project) => (
            <CommandItem
              key={`recent-${project.id}`}
              onSelect={() => navigateTo(`/projects/${project.key}/board`)}
              className="gap-3"
            >
              <div
                className="flex size-6 items-center justify-center rounded-md text-white"
                style={{ backgroundColor: colors.base }}
              >
                <FolderKanban className="size-3" />
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

        {/* All projects */}
        {projects.length > 5 && (
          <CommandGroup heading="Todos los proyectos">
            {projects
              .filter((p) => !recentProjects.some((r) => r.id === p.id))
              .map((project) => (
                <CommandItem
                  key={`all-${project.id}`}
                  onSelect={() => navigateTo(`/projects/${project.key}/board`)}
                  className="gap-3"
                >
                  <div
                    className="flex size-6 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: colors.base }}
                  >
                    <FolderKanban className="size-3" />
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

        {/* Actions */}
        <CommandGroup heading="Acciones">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onCreateProject();
            }}
            className="gap-3"
          >
            <Plus className="size-4" />
            Crear nuevo proyecto
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => navigateTo('/organization')}
            className="gap-3"
          >
            <Settings className="size-4" />
            Configuración de organización
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
