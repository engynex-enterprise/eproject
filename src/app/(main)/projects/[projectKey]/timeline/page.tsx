'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { timelineService } from '@/modules/timeline/services/timeline.service';
import { GanttChart } from '@/modules/timeline/components/gantt-chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function TimelinePage() {
  const params = useParams<{ projectKey: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['timeline', params.projectKey],
    queryFn: () => timelineService.getTimelineData(params.projectKey),
    enabled: !!params.projectKey,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 p-4">
        <div className="w-80 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-2 pl-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-sm text-destructive">
          Error al cargar el cronograma. Intenta de nuevo.
        </p>
      </div>
    );
  }

  if (!data?.data.issues.length) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-sm text-muted-foreground">
          No hay incidencias con fechas para mostrar en el cronograma.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <GanttChart
        issues={data.data.issues}
        startDate={data.data.startDate}
        endDate={data.data.endDate}
      />
    </div>
  );
}
