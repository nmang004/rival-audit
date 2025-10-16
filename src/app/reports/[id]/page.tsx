'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShareLinkDialog } from '@/components/reports/share-link-dialog';
import { DeleteReportDialog } from '@/components/reports/delete-report-dialog';
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  FileText,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { ApiResponse, ReportWithAudits, PDFGenerationResult, ShareableLinkInfo } from '@/types';

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [shareLinkDialogOpen, setShareLinkDialogOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState<ShareableLinkInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch report
  const { data: report, isLoading } = useQuery<ReportWithAudits>({
    queryKey: ['reports', id],
    queryFn: async () => {
      const response = await fetch(`/api/reports/${id}`);
      const result: ApiResponse<ReportWithAudits> = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
  });

  // Generate PDF mutation
  const generatePDFMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/reports/${id}/generate`, {
        method: 'POST',
      });
      const result: ApiResponse<PDFGenerationResult> = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
    },
  });

  // Generate shareable link mutation
  const generateShareLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/reports/${id}/share`, {
        method: 'POST',
      });
      const result: ApiResponse<ShareableLinkInfo> = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (data) => {
      setShareableLink(data);
      setShareLinkDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
    },
  });

  // Revoke shareable link mutation
  const revokeShareLinkMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/reports/${id}/share`, {
        method: 'DELETE',
      });
      const result: ApiResponse = await response.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', id] });
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      const result: ApiResponse = await response.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      router.push('/reports');
    },
  });

  const handleGeneratePDF = () => {
    generatePDFMutation.mutate();
  };

  const handleGenerateShareLink = () => {
    generateShareLinkMutation.mutate();
  };

  const handleRevokeShareLink = () => {
    if (confirm('Are you sure you want to revoke the shareable link? Anyone with the current link will lose access.')) {
      revokeShareLinkMutation.mutate();
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteReportMutation.mutate();
  };

  const getScoreBadgeColor = (score: number | null) => {
    if (score === null) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report not found</h2>
          <p className="text-gray-600 mb-6">The report you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/reports">
            <Button>Back to Reports</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/reports">
            <Button variant="ghost" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
          </Link>

          <div className="bg-gradient-primary text-white rounded-lg p-6 lg:p-8 animate-fadeIn">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">{report.name}</h1>
                {report.description && (
                  <p className="text-lg opacity-90 mb-4">{report.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {report.reportAudits.length} URL{report.reportAudits.length !== 1 ? 's' : ''}
                  </span>
                  <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(report.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleDelete} className="text-white hover:bg-red-600 button-scale">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* PDF Report Section */}
      <Card className="mb-6 card-glow animate-slideUp">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="flex items-center gap-2 text-primary">
            <FileText className="w-6 h-6" />
            PDF Report
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {report.pdfUrl ? (
            <div className="flex items-center gap-4 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-green-500 animate-celebrate" />
              <div className="flex-1">
                <p className="font-semibold text-lg text-primary">PDF Generated</p>
                <p className="text-sm text-muted-foreground">Your professional report is ready to download</p>
              </div>
              <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button className="button-glow button-scale">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </a>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-6">
                Generate a professional PDF report containing all selected audits.
              </p>
              <Button
                onClick={handleGeneratePDF}
                disabled={generatePDFMutation.isPending}
                className="button-scale animate-pulse-glow"
              >
                {generatePDFMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shareable Link Section */}
      <Card className="mb-6 card-glow animate-slideUp">
        <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-primary">
            <LinkIcon className="w-6 h-6" />
            Shareable Link
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {report.shareableLink ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Public link active</p>
                  <p className="text-sm text-gray-600">
                    Anyone with the link can view this report
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                    setShareableLink({
                      shareableLink: report.shareableLink!,
                      publicUrl: `${appUrl}/reports/share/${report.shareableLink}`,
                      createdAt: new Date(),
                    });
                    setShareLinkDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  View Link
                </Button>
                <a
                  href={`/reports/share/${report.shareableLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open Public View
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={handleRevokeShareLink}
                  disabled={revokeShareLinkMutation.isPending}
                  className="text-red-600 hover:bg-red-50"
                >
                  Revoke Access
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Create a public link that can be shared with anyone.
              </p>
              <Button
                onClick={handleGenerateShareLink}
                disabled={generateShareLinkMutation.isPending}
                className="flex items-center gap-2"
              >
                {generateShareLinkMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Included Audits */}
      <Card>
        <CardHeader>
          <CardTitle>Included Audits ({report.reportAudits.length})</CardTitle>
          <CardDescription>
            Audits are shown in the order they will appear in the report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.reportAudits.map((ra, index) => {
              const audit = ra.audit;
              return (
                <div
                  key={audit.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{audit.url}</p>
                    {audit.clientName && (
                      <p className="text-sm text-gray-600">{audit.clientName}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created {new Date(audit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {audit.seoScore !== null && (
                      <div className="text-center">
                        <Badge className={`${getScoreBadgeColor(audit.seoScore)} text-white`}>
                          {audit.seoScore}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">SEO</p>
                      </div>
                    )}
                    {audit.accessibilityScore !== null && (
                      <div className="text-center">
                        <Badge className={`${getScoreBadgeColor(audit.accessibilityScore)} text-white`}>
                          {audit.accessibilityScore}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">A11y</p>
                      </div>
                    )}
                    {audit.designScore !== null && (
                      <div className="text-center">
                        <Badge className={`${getScoreBadgeColor(audit.designScore * 10)} text-white`}>
                          {audit.designScore}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">Design</p>
                      </div>
                    )}
                  </div>
                  <Link href={`/audits/${audit.id}`}>
                    <Button variant="outline" size="sm">
                      View Audit
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

        {/* Share Link Dialog */}
        {shareableLink && (
          <ShareLinkDialog
            open={shareLinkDialogOpen}
            onOpenChange={setShareLinkDialogOpen}
            shareableLink={shareableLink.shareableLink}
            publicUrl={shareableLink.publicUrl}
          />
        )}

        {/* Delete Dialog */}
        <DeleteReportDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          reportName={report.name}
        />
      </div>
    </div>
  );
}
