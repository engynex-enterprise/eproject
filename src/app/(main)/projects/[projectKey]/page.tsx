'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layers, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject } from '@/modules/projects/hooks/use-projects';
import { useSpaces } from '@/modules/spaces/hooks/use-spaces';
import { CreateSpaceDialog } from '@/modules/spaces/components/create-space-dialog';

export default function ProjectRootPage() {
  const params = useParams<{ projectKey: string }>();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: projectData, isLoading: projectLoading } = useProject(params.projectKey);
  const project = projectData?.data;

  const { data: spaces, isLoading: spacesLoading } = useSpaces(project?.id);

  const isLoading = projectLoading || spacesLoading;

  return (
    <div className="flex flex-1 flex-col">
      {/* Page Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            {projectLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <h1 className="text-lg font-semibold">
                Espacios de {project?.name}
              </h1>
            )}
            <p className="mt-0.5 text-sm text-muted-foreground">
              Selecciona un espacio para ver su tablero y actividad
            </p>
          </div>
          {project && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nuevo espacio
            </Button>
          )}
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : spaces && spaces.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <button
                key={space.id}
                onClick={() =>
                  router.push(`/projects/${params.projectKey}/spaces/${space.id}/board`)
                }
                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                {/* Space color + name */}
                <div className="flex items-center gap-3">
                  <span
                    className="size-4 shrink-0 rounded-full"
                    style={{ backgroundColor: space.color ?? '#6b7280' }}
                  />
                  <span className="font-semibold">{space.name}</span>
                  <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Description */}
                {space.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {space.description}
                  </p>
                )}

                {/* CTA */}
                <span className="mt-auto text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Abrir tablero →
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
            <Layers className="mb-4 size-12 text-muted-foreground/40" />
            <h3 className="text-base font-semibold">Sin espacios</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea un espacio para empezar a organizar las incidencias del proyecto.
            </p>
            {project && (
              <Button
                className="mt-6"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                Crear primer espacio
              </Button>
            )}
          </div>
        )}
      </div>

      {project && (
        <CreateSpaceDialog
          projectId={project.id}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </div>
  );
}
