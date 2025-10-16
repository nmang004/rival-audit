import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

/**
 * Flexible empty state component for various scenarios
 * - No data states (no audits, no reports, etc.)
 * - No search results
 * - No filter results
 * - Error states
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-16 px-6 sage-bg-subtle rounded-lg border-2 border-dashed sage-border",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Animated Icon */}
      <Icon className="w-24 h-24 text-secondary opacity-50 mx-auto mb-6 animate-float" />

      {/* Title */}
      <h3 className="text-2xl font-bold gradient-heading mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground mb-6 text-lg max-w-md mx-auto">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {action && (
            <Button
              size="lg"
              className="button-scale animate-pulse-glow"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="button-scale"
            >
              <Link href={secondaryAction.href}>
                {secondaryAction.label}
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact empty state for smaller sections
 */
export function EmptyStateCompact({
  icon: Icon,
  title,
  description,
  className
}: Omit<EmptyStateProps, 'action' | 'secondaryAction'>) {
  return (
    <div
      className={cn(
        "text-center py-12 px-6",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
