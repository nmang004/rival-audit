'use client';

import { useMemo } from 'react';
import { Audit } from '@prisma/client';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays } from 'date-fns';

interface ScoreTrendChartProps {
  audits: Audit[];
  days?: 7 | 30 | 90;
}

interface TrendData {
  date: string;
  seo: number | null;
  accessibility: number | null;
  design: number | null;
}

export function ScoreTrendChart({ audits, days = 30 }: ScoreTrendChartProps) {
  const chartData = useMemo(() => {
    // Filter audits to the specified date range
    const cutoffDate = subDays(new Date(), days);
    const recentAudits = audits.filter(
      (audit) => new Date(audit.createdAt) >= cutoffDate && audit.seoScore !== null
    );

    // Group audits by date and calculate average scores
    const dataByDate = new Map<string, { seo: number[]; a11y: number[]; design: number[] }>();

    recentAudits.forEach((audit) => {
      const dateKey = format(new Date(audit.createdAt), 'MMM dd');

      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { seo: [], a11y: [], design: [] });
      }

      const dayData = dataByDate.get(dateKey)!;

      if (audit.seoScore !== null) dayData.seo.push(audit.seoScore);
      if (audit.accessibilityScore !== null) dayData.a11y.push(audit.accessibilityScore);
      if (audit.designScore !== null) dayData.design.push(audit.designScore * 10); // Scale to 100
    });

    // Convert to chart data format with averages
    const trendData: TrendData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'MMM dd');
      const dayData = dataByDate.get(dateKey);

      if (dayData) {
        trendData.push({
          date: dateKey,
          seo: dayData.seo.length > 0
            ? Math.round(dayData.seo.reduce((a, b) => a + b, 0) / dayData.seo.length)
            : null,
          accessibility: dayData.a11y.length > 0
            ? Math.round(dayData.a11y.reduce((a, b) => a + b, 0) / dayData.a11y.length)
            : null,
          design: dayData.design.length > 0
            ? Math.round(dayData.design.reduce((a, b) => a + b, 0) / dayData.design.length)
            : null,
        });
      }
    }

    return trendData.filter(d => d.seo !== null || d.accessibility !== null || d.design !== null);
  }, [audits, days]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Trends</CardTitle>
          <CardDescription>Average scores over the last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>No audit data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Score Trends</CardTitle>
        <CardDescription>Average scores over the last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="seo"
              name="SEO Score"
              stroke="oklch(0.24 0.13 265)" // Navy
              strokeWidth={2}
              dot={{ fill: 'oklch(0.24 0.13 265)', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="accessibility"
              name="Accessibility"
              stroke="oklch(0.6 0.118 184.704)" // Teal
              strokeWidth={2}
              dot={{ fill: 'oklch(0.6 0.118 184.704)', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="design"
              name="Design"
              stroke="oklch(0.71 0.15 60)" // Orange
              strokeWidth={2}
              dot={{ fill: 'oklch(0.71 0.15 60)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
