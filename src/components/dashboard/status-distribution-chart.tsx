'use client';

import { useMemo } from 'react';
import { Audit, AuditStatus } from '@prisma/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusDistributionChartProps {
  audits: Audit[];
}

interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

const STATUS_COLORS: Record<AuditStatus, string> = {
  PROPOSAL: 'oklch(0.71 0.15 60)', // Orange
  INITIAL_CALL: 'oklch(0.828 0.189 84.429)', // Yellow
  SIGNED: 'oklch(0.6 0.118 184.704)', // Teal
  IN_PROGRESS: 'oklch(0.488 0.243 264.376)', // Purple
  COMPLETED: 'oklch(0.24 0.13 265)', // Navy
};

const STATUS_LABELS: Record<AuditStatus, string> = {
  PROPOSAL: 'Proposal',
  INITIAL_CALL: 'Initial Call',
  SIGNED: 'Signed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export function StatusDistributionChart({ audits }: StatusDistributionChartProps) {
  const chartData = useMemo(() => {
    // Count audits by status
    const statusCounts = new Map<AuditStatus, number>();

    audits.forEach((audit) => {
      const count = statusCounts.get(audit.status) || 0;
      statusCounts.set(audit.status, count + 1);
    });

    // Convert to chart data format
    const data: ChartData[] = [];

    (Object.keys(STATUS_COLORS) as AuditStatus[]).forEach((status) => {
      const count = statusCounts.get(status) || 0;
      if (count > 0) {
        data.push({
          name: STATUS_LABELS[status],
          value: count,
          color: STATUS_COLORS[status],
        });
      }
    });

    return data;
  }, [audits]);

  const totalAudits = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Status Distribution</CardTitle>
          <CardDescription>Breakdown of audits by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>No audits to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Audit Status Distribution</CardTitle>
        <CardDescription>Breakdown of audits by current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: unknown) => {
                  const p = props as { name?: string; percent?: number };
                  const percent = p.percent || 0;
                  const name = p.name || '';
                  return `${name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text showing total */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-3xl font-bold text-gray-900">{totalAudits}</div>
            <div className="text-sm text-gray-600">Total Audits</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
