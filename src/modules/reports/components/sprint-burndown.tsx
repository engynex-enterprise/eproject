'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
}

interface SprintBurndownProps {
  data: BurndownDataPoint[];
  sprintName?: string;
}

export function SprintBurndown({ data, sprintName }: SprintBurndownProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
        No hay datos de burndown para este sprint.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sprintName && (
        <h3 className="text-sm font-semibold">{sprintName}</h3>
      )}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            label={{
              value: 'Puntos restantes',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="linear"
            dataKey="ideal"
            name="Ideal"
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Real"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
