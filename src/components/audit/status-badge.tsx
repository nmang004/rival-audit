import { AuditStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AuditStatus;
  className?: string;
}

const statusConfig: Record<AuditStatus, { label: string; variant: string; className: string }> = {
  PROPOSAL: {
    label: 'Proposal',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
  INITIAL_CALL: {
    label: 'Initial Call',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  SIGNED: {
    label: 'Signed',
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'default',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'default',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline'}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
