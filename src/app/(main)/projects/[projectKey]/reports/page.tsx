'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';
import { SprintBurndown } from '@/modules/reports/components/sprint-burndown';
import { VelocityChart } from '@/modules/reports/components/velocity-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ReportTab = 'burndown' | 'velocity' | 'created-resolved';

interface ReportsData {
  burndown: Array<{ date: string; ideal: number; actual: number }>;
  velocity: Array<{ sprint: string; committed: number; completed: number }>;
  createdResolved: Array<{
    period: string;
    created: number;
    resolved: number;
  }>;
  activeSprintName?: string;
}

export default function ReportsPage() {
  const params = useParams<{ projectKey: string }>();
  const [activeTab, setActiveTab] = useState<ReportTab>('burndown');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<ReportsData>>(
        `/projects/key/${params.projectKey}/reports`,
      ),
    enabled: !!params.projectKey,
  });

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'burndown', label: 'Sprint Burndown' },
    { key: 'velocity', label: 'Velocidad' },
    { key: 'created-resolved', label: 'Creadas vs Resueltas' },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const reportData = data?.data;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Reportes</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg border p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="rounded-lg border p-6">
        {activeTab === 'burndown' && (
          <SprintBurndown
            data={reportData?.burndown ?? []}
            sprintName={reportData?.activeSprintName}
          />
        )}

        {activeTab === 'velocity' && (
          <VelocityChart data={reportData?.velocity ?? []} />
        )}

        {activeTab === 'created-resolved' && (
          <CreatedVsResolved data={reportData?.createdResolved ?? []} />
        )}
      </div>
    </div>
  );
}

// Inline created vs resolved chart component
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function CreatedVsResolved({
  data,
}: {
  data: Array<{ period: string; created: number; resolved: number }>;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
        No hay datos disponibles.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="created"
          name="Creadas"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="resolved"
          name="Resueltas"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
