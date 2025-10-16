'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuditStatus } from '@prisma/client';
import { Trash2, FileStack, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: AuditStatus) => void;
  onAddToReport?: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onSelectAll,
  totalCount,
  onBulkDelete,
  onBulkStatusChange,
  onAddToReport,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<AuditStatus | null>(null);

  if (selectedCount === 0) return null;

  const handleBulkDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
  };

  const handleBulkStatusChange = () => {
    if (newStatus) {
      onBulkStatusChange(newStatus);
      setShowStatusDialog(false);
      setNewStatus(null);
    }
  };

  const allSelected = selectedCount === totalCount;

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg',
          'animate-slideUp'
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                  {selectedCount}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {selectedCount === 1 ? '1 audit selected' : `${selectedCount} audits selected`}
                </span>
              </div>

              <div className="h-6 w-px bg-gray-300" />

              {/* Select All / Clear */}
              {allSelected ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="text-sm"
                >
                  Deselect All
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  className="text-sm"
                >
                  Select All ({totalCount})
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Change Status */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusDialog(true)}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Change Status
              </Button>

              {/* Add to Report */}
              {onAddToReport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddToReport}
                  className="gap-2"
                >
                  <FileStack className="w-4 h-4" />
                  Add to Report
                </Button>
              )}

              {/* Delete */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>

              {/* Close */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedCount} Audit{selectedCount > 1 ? 's' : ''}?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} audit{selectedCount > 1 ? 's' : ''}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete {selectedCount} Audit{selectedCount > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status for {selectedCount} Audit{selectedCount > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Select a new status to apply to all {selectedCount} selected audit{selectedCount > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus || ''} onValueChange={(value) => setNewStatus(value as AuditStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                <SelectItem value="INITIAL_CALL">Initial Call</SelectItem>
                <SelectItem value="SIGNED">Signed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowStatusDialog(false);
              setNewStatus(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusChange} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spacer to prevent content from being hidden behind the bar */}
      <div className="h-20" />
    </>
  );
}
