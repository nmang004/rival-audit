'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number; // Percentage change
    isPositive?: boolean; // If undefined, will auto-determine from value
    label?: string; // e.g., "vs last month"
  };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName
}: StatsCardProps) {
  // Auto-determine if trend is positive
  const isTrendPositive = trend?.isPositive !== undefined
    ? trend.isPositive
    : (trend?.value ?? 0) >= 0;

  const trendValue = trend?.value ?? 0;
  const showTrend = trend && trendValue !== 0;

  const TrendIcon = trendValue > 0 ? TrendingUp : trendValue < 0 ? TrendingDown : Minus;

  return (
    <Card className={cn('card-hover-effect subtle-border', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            'p-3 rounded-lg bg-gradient-to-br',
            iconClassName || 'from-primary/10 to-primary/5'
          )}>
            <Icon className={cn('w-6 h-6', iconClassName ? 'text-current' : 'text-primary')} />
          </div>

          {showTrend && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isTrendPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-gray-900">
            {value}
          </p>
          <p className="text-sm text-gray-600">
            {title}
          </p>
          {trend?.label && (
            <p className="text-xs text-gray-500 mt-1">
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
