'use client';

import { Plus, Hash, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { getSpaces } from '@/modules/spaces/services/spaces.service';
import type { Space } from '@/shared/types';
import { cn } from '@/lib/utils';

interface SpaceListProps {
  projectId: number;
  selectedSpaceId?: number | null;
  onSelectSpace?: (space: Space) => void;
  onCreateSpace?: () => void;
}

export function SpaceList({
  projectId,
  selectedSpaceId,
  onSelectSpace,
  onCreateSpace,
}: SpaceListProps) {
  const {
    data: spaces,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['spaces', projectId],
    queryFn: () => getSpaces(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-3 py-4">
        <p className="text-sm text-destructive">
          Error al cargar los espacios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Espacios
        </h3>
        {onCreateSpace && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onCreateSpace}
            title="Crear espacio"
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>

      {spaces && spaces.length > 0 ? (
        spaces.map((space) => (
          <button
            key={space.id}
            onClick={() => onSelectSpace?.(space)}
            className={cn(
              'flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors text-left',
              selectedSpaceId === space.id
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted',
            )}
          >
            <div
              className="size-3 rounded-full shrink-0"
              style={{
                backgroundColor: space.color || '#6b7280',
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{space.name}</div>
              {space.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {space.description}
                </div>
              )}
            </div>
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          </button>
        ))
      ) : (
        <div className="px-3 py-6 text-center">
          <Hash className="size-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            No hay espacios en este proyecto.
          </p>
          {onCreateSpace && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateSpace}
              className="mt-3"
            >
              <Plus className="size-4" />
              Crear espacio
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
