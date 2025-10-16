'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportCard } from '@/components/reports/report-card';
import { ReportTableView } from '@/components/reports/report-table-view';
import { DeleteReportDialog } from '@/components/reports/delete-report-dialog';
import { SkeletonCard } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ViewToggle, useViewMode } from '@/components/audit/view-toggle';
import { Plus, FileText, FileStack, Calendar, Globe, BarChart3, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ReportWithAudits, ApiResponse } from '@/types';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<{ id: string; name: string } | null>(null);

  // View and filter state
  const [viewMode, setViewMode] = useViewMode('reports-view-mode');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'generated'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Fetch all reports
  const { data: reports, isLoading } = useQuery<ReportWithAudits[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await fetch('/api/reports');
      const result: ApiResponse<ReportWithAudits[]> = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });
      const result: ApiResponse = await response.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    },
  });

  const handleDeleteClick = (reportId: string, reportName: string) => {
    setReportToDelete({ id: reportId, name: reportName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (reportToDelete) {
      deleteReportMutation.mutate(reportToDelete.id);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!reports || reports.length === 0) {
      return {
        totalReports: 0,
        reportsThisMonth: 0,
        totalAudits: 0,
        avgReportSize: 0,
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const reportsThisMonth = reports.filter(r =>
      new Date(r.createdAt) >= startOfMonth
    ).length;

    const totalAudits = reports.reduce((sum, r) => sum + r.reportAudits.length, 0);
    const avgSize = Math.round(totalAudits / reports.length);

    return {
      totalReports: reports.length,
      reportsThisMonth,
      totalAudits,
      avgReportSize: avgSize,
    };
  }, [reports]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];

    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r =>
        statusFilter === 'generated' ? r.pdfUrl !== null : r.pdfUrl === null
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reports, searchQuery, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Hero Header Skeleton */}
          <div className="sage-bg-gradient rounded-lg p-8 mb-8 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-10 w-48 bg-white/20 rounded mb-3"></div>
                <div className="h-6 w-96 bg-white/20 rounded"></div>
              </div>
              <div className="h-12 w-40 bg-white/20 rounded"></div>
            </div>
          </div>

          {/* Reports Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slideUp">
          <StatsCard
            title="Total Reports"
            value={stats.totalReports}
            icon={FileStack}
            trend={{ value: 12, label: 'vs last month' }}
          />
          <StatsCard
            title="This Month"
            value={stats.reportsThisMonth}
            icon={Calendar}
            iconClassName="from-blue-100 to-blue-50 text-blue-600"
          />
          <StatsCard
            title="Total Audits"
            value={stats.totalAudits}
            icon={Globe}
            iconClassName="from-purple-100 to-purple-50 text-purple-600"
          />
          <StatsCard
            title="Avg Report Size"
            value={stats.avgReportSize}
            icon={BarChart3}
            iconClassName="from-green-100 to-green-50 text-green-600"
          />
        </div>

        {/* Hero Header */}
        <div className="sage-bg-gradient rounded-lg p-8 mb-8 text-white animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3">Reports</h1>
              <p className="text-lg opacity-90">
                Create professional multi-URL audit reports
              </p>
            </div>
            <Link href="/reports/new">
              <Button variant="secondary" size="lg" className="button-scale button-glow">
                <Plus className="w-5 h-5 mr-2" />
                New Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Controls */}
        {reports && reports.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 animate-slideUp">
            <div className="flex gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'draft' | 'generated')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'name')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        )}

      {/* Reports List */}
      {filteredReports && filteredReports.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 animate-slideUp">
            {filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onDelete={(reportId) => handleDeleteClick(reportId, report.name)}
              />
            ))}
          </div>
        ) : (
          <div className="animate-slideUp">
            <ReportTableView
              reports={filteredReports}
              onDelete={(reportId) => {
                const report = filteredReports.find(r => r.id === reportId);
                if (report) handleDeleteClick(reportId, report.name);
              }}
            />
          </div>
        )
      ) : (
        <div className="text-center py-16 sage-bg-subtle rounded-lg border-2 border-dashed sage-border">
          <FileText className="w-24 h-24 text-secondary opacity-50 mx-auto mb-6 animate-float" />
          <h2 className="text-2xl font-bold gradient-heading mb-4">
            No reports yet
          </h2>
          <p className="text-muted-foreground mb-6 text-lg max-w-md mx-auto">
            Create your first multi-URL report to get started
          </p>
          <Link href="/reports/new">
            <Button size="lg" className="button-scale animate-pulse-glow">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Report
            </Button>
          </Link>
        </div>
      )}

        {/* Delete Dialog */}
        {reportToDelete && (
          <DeleteReportDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            reportName={reportToDelete.name}
          />
        )}
      </div>
    </div>
  );
}
