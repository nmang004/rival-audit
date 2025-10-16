'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ReportCard } from '@/components/reports/report-card';
import { DeleteReportDialog } from '@/components/reports/delete-report-dialog';
import { Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ReportWithAudits, ApiResponse } from '@/types';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<{ id: string; name: string } | null>(null);

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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">
            Create and manage multi-URL audit reports
          </p>
        </div>
        <Link href="/reports/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Reports List */}
      {reports && reports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {reports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={(reportId) => handleDeleteClick(reportId, report.name)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No reports yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first multi-URL report to get started
          </p>
          <Link href="/reports/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
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
  );
}
