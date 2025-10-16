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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto p-6">
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

      {/* Reports List */}
      {reports && reports.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 animate-slideUp">
          {reports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={(reportId) => handleDeleteClick(reportId, report.name)}
            />
          ))}
        </div>
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
