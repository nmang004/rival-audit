'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;        // Current value (e.g., 75)
  max?: number;         // Maximum value (default: 100)
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;  // Show value in center
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  thickness?: number;   // Stroke width (default: 8)
  className?: string;
  label?: string;       // Optional label below value
}

const sizeMap = {
  sm: { width: 80, fontSize: 'text-xl' },
  md: { width: 120, fontSize: 'text-3xl' },
  lg: { width: 160, fontSize: 'text-4xl' },
  xl: { width: 200, fontSize: 'text-5xl' },
};

const colorMap = {
  primary: {
    stroke: 'oklch(0.24 0.13 265)',      // Navy Blue
    trail: 'oklch(0.96 0.01 265)',       // Light Navy
    text: 'text-primary',
  },
  secondary: {
    stroke: 'oklch(0.71 0.15 60)',       // Orange
    trail: 'oklch(0.96 0.05 60)',        // Light Orange
    text: 'text-secondary',
  },
  success: {
    stroke: 'oklch(0.6 0.118 184.704)',  // Teal/Green
    trail: 'oklch(0.95 0.05 184)',       // Light Teal
    text: 'text-green-600',
  },
  warning: {
    stroke: 'oklch(0.828 0.189 84.429)', // Yellow
    trail: 'oklch(0.96 0.05 84)',        // Light Yellow
    text: 'text-yellow-600',
  },
  danger: {
    stroke: 'oklch(0.577 0.245 27.325)', // Red
    trail: 'oklch(0.95 0.05 27)',        // Light Red
    text: 'text-red-600',
  },
};

/**
 * Circular progress ring component for displaying scores and percentages
 *
 * Features:
 * - SVG-based for sharp rendering at any size
 * - Animated stroke drawing
 * - Customizable size, color, and thickness
 * - Optional value display in center
 * - Accessible with ARIA attributes
 */
export function ProgressRing({
  value,
  max = 100,
  size = 'md',
  showValue = true,
  color = 'primary',
  thickness = 8,
  className,
  label
}: ProgressRingProps) {
  const { width, fontSize } = sizeMap[size];
  const colors = colorMap[color];

  // Calculate circle dimensions
  const radius = (width - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `Progress: ${value} out of ${max}`}
    >
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Background circle (trail) */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={colors.trail}
          strokeWidth={thickness}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>

      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', fontSize, colors.text)}>
            {Math.round(value)}
          </span>
          {label && (
            <span className="text-sm text-gray-600 mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Progress ring with gradient effect
 */
export function ProgressRingGradient({
  value,
  max = 100,
  size = 'md',
  showValue = true,
  gradientId = 'progress-gradient',
  className,
  label
}: Omit<ProgressRingProps, 'color'> & { gradientId?: string }) {
  const { width, fontSize } = sizeMap[size];
  const thickness = 8;

  const radius = (width - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `Progress: ${value} out of ${max}`}
    >
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Define gradient */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.24 0.13 265)" />
            <stop offset="100%" stopColor="oklch(0.71 0.15 60)" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="oklch(0.96 0.01 265)"
          strokeWidth={thickness}
          fill="none"
        />

        {/* Progress circle with gradient */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent', fontSize)}>
            {Math.round(value)}
          </span>
          {label && (
            <span className="text-sm text-gray-600 mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
