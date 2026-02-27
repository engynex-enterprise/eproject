'use client';

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

interface VelocityDataPoint {
  sprint: string;
  committed: number;
  completed: number;
}

interface VelocityChartProps {
  data: VelocityDataPoint[];
}

export function VelocityChart({ data }: VelocityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
        No hay datos de velocidad. Completa al menos un sprint.
      </div>
    );
  }

  const avgVelocity =
    data.reduce((sum, d) => sum + d.completed, 0) / data.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Velocidad promedio: </span>
          <span className="font-semibold">{avgVelocity.toFixed(1)} puntos</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="sprint"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            label={{
              value: 'Puntos de historia',
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
          <Bar
            dataKey="committed"
            name="Comprometidos"
            fill="hsl(var(--muted-foreground))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="completed"
            name="Completados"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
