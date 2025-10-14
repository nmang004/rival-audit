'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KeywordTrendData } from '@/types';
import { format, parseISO } from 'date-fns';

interface KeywordTrendChartProps {
  data: KeywordTrendData[];
}

export function KeywordTrendChart({ data }: KeywordTrendChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No keyword trend data available</p>
      </div>
    );
  }

  // Transform data for chart display
  const chartData = data.map((item) => {
    try {
      // Parse the month string (format: "2024-01")
      const date = parseISO(`${item.month}-01`);
      return {
        month: format(date, 'MMM yyyy'), // Format as "Jan 2024"
        keywords: item.keywords,
        traffic: item.traffic,
      };
    } catch (error) {
      console.error('Error parsing date:', item.month, error);
      return {
        month: item.month,
        keywords: item.keywords,
        traffic: item.traffic,
      };
    }
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { month: string; keywords: number; traffic?: number }; value: number }[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{payload[0].payload.month}</p>
          <p className="text-sm text-blue-600">
            Keywords: <span className="font-semibold">{payload[0].value.toLocaleString()}</span>
          </p>
          {payload[0].payload.traffic && (
            <p className="text-sm text-green-600">
              Traffic: <span className="font-semibold">{payload[0].payload.traffic.toLocaleString()}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="keywords"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Keywords"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
