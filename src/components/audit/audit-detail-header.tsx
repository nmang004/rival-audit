'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Audit } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/audit/status-badge';
import { ArrowLeft, FileDown, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AuditDetailHeaderProps {
  audit: Audit;
}

export function AuditDetailHeader({ audit }: AuditDetailHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSticky, setIsSticky] = useState(false);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/audits/${audit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update status');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit', audit.id] });
      toast.success('Status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/audits/${audit.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete audit');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('Audit deleted successfully');
      router.push('/dashboard');
    },
    onError: () => {
      toast.error('Failed to delete audit');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this audit? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleExportPDF = () => {
    toast.info('PDF export coming soon!');
  };

  const handleShare = () => {
    toast.info('Share functionality coming soon!');
  };

  // Listen to scroll for sticky behavior
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsSticky(window.scrollY > 100);
    });
  }

  return (
    <div
      className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
        isSticky ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header Content */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {audit.url}
              </h1>
              {audit.clientName && (
                <p className="text-sm text-gray-600">{audit.clientName}</p>
              )}
            </div>
          </div>

          {/* Right: Status and actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status selector */}
            <Select
              value={audit.status}
              onValueChange={(value) => updateStatusMutation.mutate(value)}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue>
                  <StatusBadge status={audit.status} />
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                <SelectItem value="INITIAL_CALL">Initial Call</SelectItem>
                <SelectItem value="SIGNED">Signed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Action buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="button-scale"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="button-scale"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
