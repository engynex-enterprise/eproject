'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, GitBranch } from 'lucide-react';
import type { ApiResponse, Workflow, WorkflowTransition } from '@/shared/types';
import { apiClient } from '@/shared/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function WorkflowsPage() {
  const params = useParams<{ projectKey: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['workflows', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<Workflow[]>>(
        `/projects/key/${params.projectKey}/workflows`,
      ),
    enabled: !!params.projectKey,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const workflows = data?.data ?? [];

  return (
    <div className="max-w-3xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Flujos de trabajo</h2>
        <p className="text-sm text-muted-foreground">
          Visualiza y gestiona las transiciones entre estados.
        </p>
      </div>

      <Separator />

      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <GitBranch className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No hay flujos de trabajo configurados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    {workflow.name}
                  </CardTitle>
                  {workflow.isDefault && (
                    <Badge variant="secondary" className="text-[10px]">
                      Por defecto
                    </Badge>
                  )}
                </div>
                {workflow.description && (
                  <p className="text-sm text-muted-foreground">
                    {workflow.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Transiciones ({workflow.transitions?.length ?? 0})
                  </h4>
                  {workflow.transitions && workflow.transitions.length > 0 ? (
                    <div className="space-y-1.5">
                      {workflow.transitions.map((transition) => (
                        <div
                          key={transition.id}
                          className="flex items-center gap-2 rounded-md border px-3 py-2"
                        >
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{
                              borderColor: transition.fromStatus?.color,
                              color: transition.fromStatus?.color,
                            }}
                          >
                            {transition.fromStatus?.name}
                          </Badge>
                          <ArrowRight className="size-3.5 text-muted-foreground" />
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                            style={{
                              borderColor: transition.toStatus?.color,
                              color: transition.toStatus?.color,
                            }}
                          >
                            {transition.toStatus?.name}
                          </Badge>
                          {transition.name && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {transition.name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No hay transiciones definidas.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
