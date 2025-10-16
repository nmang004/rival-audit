import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Base Skeleton component with shimmer animation effect
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading..."
      className={cn(
        "animate-pulse rounded-md bg-muted relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/60 before:to-transparent",
        "dark:before:via-white/10",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton variant for card layouts (audit cards, stat cards)
 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4" role="status" aria-label="Loading card...">
      {/* Card header */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Card content */}
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Card footer */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton variant for stat cards (dashboard metrics)
 */
export function SkeletonStatCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3" role="status" aria-label="Loading stat...">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/**
 * Skeleton variant for table view loading
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading table...">
      {/* Table header */}
      <div className="flex gap-4 p-4 border-b bg-muted/30">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 flex-1" />
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b items-center">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton variant for chart placeholders
 */
export function SkeletonChart({
  type = "bar",
  className
}: {
  type?: "bar" | "line" | "pie" | "donut";
  className?: string;
}) {
  if (type === "pie" || type === "donut") {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        role="status"
        aria-label="Loading chart..."
      >
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-2 p-4", className)}
      role="status"
      aria-label="Loading chart..."
    >
      {/* Chart bars/lines */}
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton variant for audit detail header
 */
export function SkeletonAuditHeader() {
  return (
    <div className="space-y-4 p-6" role="status" aria-label="Loading audit header...">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton variant for score cards
 */
export function SkeletonScoreCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4" role="status" aria-label="Loading score...">
      <Skeleton className="h-5 w-32" />
      <div className="flex items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
