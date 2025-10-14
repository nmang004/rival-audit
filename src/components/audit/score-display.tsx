import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number | null | undefined;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-green-600';
  if (score >= 50) return 'stroke-yellow-600';
  return 'stroke-red-600';
}

const sizeConfig = {
  sm: {
    container: 'w-20 h-20',
    svg: 'w-20 h-20',
    text: 'text-lg',
    label: 'text-xs',
    strokeWidth: 6,
    radius: 30,
  },
  md: {
    container: 'w-32 h-32',
    svg: 'w-32 h-32',
    text: 'text-3xl',
    label: 'text-sm',
    strokeWidth: 8,
    radius: 54,
  },
  lg: {
    container: 'w-40 h-40',
    svg: 'w-40 h-40',
    text: 'text-4xl',
    label: 'text-base',
    strokeWidth: 10,
    radius: 70,
  },
};

export function ScoreDisplay({ score, label, size = 'md', className }: ScoreDisplayProps) {
  const config = sizeConfig[size];
  const displayScore = score ?? 0;
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  if (score === null || score === undefined) {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div className={cn('relative flex items-center justify-center', config.container)}>
          <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-100">
            <span className={cn('font-bold text-gray-400', config.text)}>--</span>
          </div>
        </div>
        <span className={cn('font-medium text-gray-600 text-center', config.label)}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('relative flex items-center justify-center', config.container)}>
        {/* Background circle */}
        <svg
          className={cn('absolute transform -rotate-90', config.svg)}
          viewBox="0 0 120 120"
        >
          <circle
            cx="60"
            cy="60"
            r={config.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={config.radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-1000 ease-out', getScoreRingColor(displayScore))}
          />
        </svg>

        {/* Score text */}
        <div className={cn('flex items-center justify-center w-full h-full rounded-full', getScoreBgColor(displayScore))}>
          <span className={cn('font-bold', config.text, getScoreColor(displayScore))}>
            {displayScore}
          </span>
        </div>
      </div>

      {/* Label */}
      <span className={cn('font-medium text-gray-700 text-center', config.label)}>
        {label}
      </span>
    </div>
  );
}
