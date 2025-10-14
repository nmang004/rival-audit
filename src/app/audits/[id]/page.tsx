'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Audit } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/audit/status-badge';
import { ScoreDisplay } from '@/components/audit/score-display';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, ExternalLink, User, Mail, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ClaudeAnalysisData {
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const queryClient = useQueryClient();

  // Fetch audit details
  const { data: audit, isLoading, error } = useQuery<Audit>({
    queryKey: ['audit', resolvedParams.id],
    queryFn: async () => {
      const res = await fetch(`/api/audits/${resolvedParams.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch audit');
      }
      const json = await res.json();
      return json.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      // Refetch every 5s if audit is in progress
      return data?.status === 'IN_PROGRESS' ? 5000 : false;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/audits/${resolvedParams.id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['audit', resolvedParams.id] });
      toast.success('Status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8">
            <p className="text-center text-red-600">Failed to load audit. Please try again.</p>
            <div className="mt-4 text-center">
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse Claude analysis
  let claudeData: ClaudeAnalysisData | null = null;
  try {
    claudeData = audit.claudeAnalysis ? JSON.parse(audit.claudeAnalysis) : null;
  } catch (e) {
    console.error('Failed to parse Claude analysis:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 break-all">
                {audit.url}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {audit.clientName && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {audit.clientName}
                  </div>
                )}
                {audit.clientEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {audit.clientEmail}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {format(new Date(audit.createdAt), 'PPp')}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Select
                  value={audit.status}
                  onValueChange={(value) => updateStatusMutation.mutate(value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-[180px]">
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
              </div>

              <Button asChild variant="outline" size="sm">
                <a href={audit.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* In Progress Message */}
        {audit.status === 'IN_PROGRESS' && (!audit.seoScore || !audit.accessibilityScore || !audit.designScore) && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Audit in Progress</p>
                  <p className="text-sm text-blue-700">
                    This audit is currently being processed. Results will appear shortly. This page will auto-refresh.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ScoreDisplay score={audit.seoScore} label="SEO Score" size="lg" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ScoreDisplay score={audit.accessibilityScore} label="Accessibility" size="lg" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ScoreDisplay score={audit.designScore} label="Design" size="lg" />
            </CardContent>
          </Card>
        </div>

        {/* Screenshots */}
        {(audit.screenshotDesktop || audit.screenshotMobile) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Screenshots</CardTitle>
              <CardDescription>Desktop and mobile views of the website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {audit.screenshotDesktop && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Desktop View</h3>
                    <div className="relative border rounded-lg overflow-hidden bg-gray-100 aspect-[16/10]">
                      <Image
                        src={audit.screenshotDesktop}
                        alt="Desktop screenshot"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {audit.screenshotMobile && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Mobile View</h3>
                    <div className="relative border rounded-lg overflow-hidden bg-gray-100 aspect-[9/16] max-w-[375px] mx-auto">
                      <Image
                        src={audit.screenshotMobile}
                        alt="Mobile screenshot"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claude AI Analysis */}
        {claudeData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>Comprehensive UI/UX analysis by Claude AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Analysis */}
              {claudeData.analysis && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {claudeData.analysis}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {claudeData.strengths && claudeData.strengths.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths</h3>
                  <div className="grid gap-3">
                    {claudeData.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-800">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {claudeData.weaknesses && claudeData.weaknesses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement</h3>
                  <div className="grid gap-3">
                    {claudeData.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-800">{weakness}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {claudeData.recommendations && claudeData.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <div className="grid gap-3">
                    {claudeData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>SEO data, accessibility findings, and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="seo" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Meta Title</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                    {audit.metaTitle || 'No meta title found'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Meta Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                    {audit.metaDescription || 'No meta description found'}
                  </p>
                </div>

                {audit.h1Tags && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">H1 Tags</h4>
                    <div className="space-y-2">
                      {(audit.h1Tags as string[]).map((h1, index) => (
                        <p key={index} className="text-gray-700 bg-gray-50 p-3 rounded border">
                          {h1}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {audit.isHomepage && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-900 font-medium">
                      Homepage detected - Additional SEMRush data available when status is set to SIGNED
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="accessibility" className="space-y-4 mt-4">
                <div className="text-center py-8 text-gray-600">
                  <p>Accessibility score: {audit.accessibilityScore ?? 'N/A'}/100</p>
                  <p className="text-sm mt-2">
                    Detailed violation data will be displayed here in future updates
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4 mt-4">
                {audit.coreWebVitals ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Core Web Vitals</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 border rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Largest Contentful Paint</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {(audit.coreWebVitals as { lcp?: number; fid?: number; cls?: number }).lcp || 'N/A'}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 border rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">First Input Delay</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {(audit.coreWebVitals as { lcp?: number; fid?: number; cls?: number }).fid || 'N/A'}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 border rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Cumulative Layout Shift</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {(audit.coreWebVitals as { lcp?: number; fid?: number; cls?: number }).cls || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <p>Performance data not available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
