'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Audit, AuditStatus } from '@prisma/client';
import { AuditForm, AuditFormData } from '@/components/audit/audit-form';
import { AuditCard } from '@/components/audit/audit-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { Search, Loader2, FileText } from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'ALL'>('ALL');

  // Fetch audits with auto-refresh
  const { data: audits, isLoading, error } = useQuery<Audit[]>({
    queryKey: ['audits'],
    queryFn: async () => {
      const res = await fetch('/api/audits');
      if (!res.ok) {
        throw new Error('Failed to fetch audits');
      }
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds to show audit progress
  });

  // Create audit mutation
  const createAuditMutation = useMutation({
    mutationFn: async (data: AuditFormData) => {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create audit');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit created successfully! Processing will take a few minutes.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create audit');
    },
  });

  // Delete audit mutation
  const deleteAuditMutation = useMutation({
    mutationFn: async (auditId: string) => {
      const res = await fetch(`/api/audits/${auditId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete audit');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete audit');
    },
  });

  // Filter audits based on search and status
  const filteredAudits = audits?.filter((audit) => {
    const matchesSearch =
      audit.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audit.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'ALL' || audit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Audit Dashboard</h1>
          <p className="text-gray-600">Create and manage website audits for your sales pipeline</p>
        </div>

        {/* Audit Form */}
        <div className="mb-8">
          <AuditForm
            onSubmit={(data) => createAuditMutation.mutate(data)}
            isLoading={createAuditMutation.isPending}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by URL or client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AuditStatus | 'ALL')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PROPOSAL">Proposal</SelectItem>
              <SelectItem value="INITIAL_CALL">Initial Call</SelectItem>
              <SelectItem value="SIGNED">Signed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {filteredAudits && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredAudits.length} of {audits?.length || 0} audits
          </div>
        )}

        {/* Audit List */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6">
              <p className="text-red-600 text-center">
                Failed to load audits. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && filteredAudits && filteredAudits.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || statusFilter !== 'ALL' ? 'No audits found' : 'No audits yet'}
                </h3>
                <p className="text-gray-600 max-w-md">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first audit to get started'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && filteredAudits && filteredAudits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAudits.map((audit) => (
              <AuditCard
                key={audit.id}
                audit={audit}
                onDelete={(id) => deleteAuditMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
