'use client';

import { useState, useMemo } from 'react';
import { Audit } from '@prisma/client';
import { StatusBadge } from './status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Eye,
  Trash2,
  Share2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type SortField = 'url' | 'clientName' | 'seoScore' | 'accessibilityScore' | 'designScore' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface AuditTableViewProps {
  audits: Audit[];
  onDelete: (id: string) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function AuditTableView({
  audits,
  onDelete,
  selectedIds = [],
  onSelectionChange
}: AuditTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<Audit | null>(null);

  // Sort audits
  const sortedAudits = useMemo(() => {
    return [...audits].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null values
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Convert to comparable values for comparison
      let aCompare: number | string;
      let bCompare: number | string;

      if (sortField === 'createdAt') {
        aCompare = new Date(aValue as Date).getTime();
        bCompare = new Date(bValue as Date).getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aCompare = aValue.toLowerCase();
        bCompare = bValue.toLowerCase();
      } else {
        aCompare = aValue as number | string;
        bCompare = bValue as number | string;
      }

      const comparison = aCompare < bCompare ? -1 : aCompare > bCompare ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [audits, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectedIds.length === audits.length) {
        onSelectionChange([]);
      } else {
        onSelectionChange(audits.map(a => a.id));
      }
    }
  };

  const handleSelectRow = (id: string) => {
    if (onSelectionChange) {
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    }
  };

  const handleDeleteClick = (audit: Audit) => {
    setAuditToDelete(audit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (auditToDelete) {
      onDelete(auditToDelete.id);
      setDeleteDialogOpen(false);
      setAuditToDelete(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1 text-primary" />
      : <ArrowDown className="w-4 h-4 ml-1 text-primary" />;
  };

  const getScoreBadgeClass = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getDesignScoreBadgeClass = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    if (score >= 8) return 'bg-green-100 text-green-700';
    if (score >= 6) return 'bg-yellow-100 text-yellow-700';
    if (score >= 4) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b sticky top-0 z-10">
            <tr>
              {/* Checkbox column */}
              {onSelectionChange && (
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedIds.length === audits.length && audits.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}

              {/* URL */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('url')}
                  className="flex items-center text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  URL
                  <SortIcon field="url" />
                </button>
              </th>

              {/* Client Name */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('clientName')}
                  className="flex items-center text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  Client
                  <SortIcon field="clientName" />
                </button>
              </th>

              {/* SEO Score */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('seoScore')}
                  className="flex items-center text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  SEO
                  <SortIcon field="seoScore" />
                </button>
              </th>

              {/* A11y Score */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('accessibilityScore')}
                  className="flex items-center text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  A11y
                  <SortIcon field="accessibilityScore" />
                </button>
              </th>

              {/* Design Score */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('designScore')}
                  className="flex items-center text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  Design
                  <SortIcon field="designScore" />
                </button>
              </th>

              {/* Status */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </th>

              {/* Created Date */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  Created
                  <SortIcon field="createdAt" />
                </button>
              </th>

              {/* Actions */}
              <th className="px-4 py-3 text-right">
                <span className="text-sm font-semibold text-gray-700">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAudits.map((audit, index) => (
              <tr
                key={audit.id}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}
              >
                {/* Checkbox */}
                {onSelectionChange && (
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(audit.id)}
                      onCheckedChange={() => handleSelectRow(audit.id)}
                    />
                  </td>
                )}

                {/* URL */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 max-w-md">
                    <Link
                      href={`/audits/${audit.id}`}
                      className="text-sm font-medium text-primary hover:text-secondary transition-colors truncate"
                    >
                      {audit.url}
                    </Link>
                    {audit.isHomepage && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300 shrink-0">
                        <Globe className="w-3 h-3 mr-1" />
                        Home
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Client Name */}
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {audit.clientName || '-'}
                  </span>
                </td>

                {/* SEO Score */}
                <td className="px-4 py-3">
                  <Badge className={cn('text-sm font-semibold', getScoreBadgeClass(audit.seoScore))}>
                    {audit.seoScore ?? '-'}
                  </Badge>
                </td>

                {/* A11y Score */}
                <td className="px-4 py-3">
                  <Badge className={cn('text-sm font-semibold', getScoreBadgeClass(audit.accessibilityScore))}>
                    {audit.accessibilityScore ?? '-'}
                  </Badge>
                </td>

                {/* Design Score */}
                <td className="px-4 py-3">
                  <Badge className={cn('text-sm font-semibold', getDesignScoreBadgeClass(audit.designScore))}>
                    {audit.designScore ?? '-'}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={audit.status} />
                </td>

                {/* Created Date */}
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/audits/${audit.id}`} className="flex items-center cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={audit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit URL
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(audit)}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Audit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this audit for {auditToDelete?.url}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
