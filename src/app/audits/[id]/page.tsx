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
import { Loader2, ArrowLeft, ExternalLink, User, Mail, Calendar, CheckCircle2, XCircle, AlertCircle, Globe, FileSearch, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { KeywordTrendChart } from '@/components/audit/keyword-trend-chart';
import { TopPagesTable } from '@/components/audit/top-pages-table';
import { ContentGapsDisplay } from '@/components/audit/content-gaps-display';
import { UrlStructureIssuesDisplay } from '@/components/audit/url-structure-issues-display';
import { KeywordTrendData, TopPage, ContentGap, UrlStructureIssue } from '@/types';

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

  // SITEMAP AUDIT VIEW - Completely separate from regular audits
  if (audit.isSitemapAudit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back button */}
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="sage-bg-gradient text-white rounded-lg p-6 lg:p-8 mb-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <FileSearch className="w-10 h-10 animate-sparkle" />
              <h1 className="text-3xl lg:text-4xl font-bold">Sitemap Audit</h1>
            </div>
            <p className="text-xl opacity-90 break-all mb-4">{audit.url}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
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

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium opacity-90">Status:</span>
                <Select
                  value={audit.status}
                  onValueChange={(value) => updateStatusMutation.mutate(value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-[180px] bg-white/20 text-white border-white/30">
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

              <Button variant="secondary" size="sm" className="button-scale" asChild>
                <a href={audit.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Sitemap
                </a>
              </Button>
            </div>
          </div>

          {/* In Progress Message */}
          {audit.status === 'IN_PROGRESS' && (
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Sitemap Audit in Progress</p>
                    <p className="text-sm text-blue-700">
                      Analyzing your sitemap structure and content. This page will auto-refresh.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sitemap Overview */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-purple-600" />
                <CardTitle>Sitemap Overview</CardTitle>
              </div>
              <CardDescription>
                Summary of your sitemap structure and analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Total URLs</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {audit.sitemapUrls ? (audit.sitemapUrls as { totalUrls: number }).totalUrls?.toLocaleString() || '0' : '0'}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Content Gaps</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {audit.contentGaps ? (audit.contentGaps as unknown as ContentGap[]).length : '0'}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Structure Issues</p>
                  <p className="text-3xl font-bold text-red-600">
                    {audit.urlStructureIssues ? (audit.urlStructureIssues as unknown as UrlStructureIssue[]).length : '0'}
                  </p>
                </div>
              </div>

              {/* Summary */}
              {audit.claudeAnalysis && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Analysis Summary</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{audit.claudeAnalysis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Gaps */}
          {audit.contentGaps && (audit.contentGaps as unknown as ContentGap[]).length > 0 && (
            <ContentGapsDisplay gaps={audit.contentGaps as unknown as ContentGap[]} />
          )}

          {/* URL Structure Issues */}
          {audit.urlStructureIssues && (audit.urlStructureIssues as unknown as UrlStructureIssue[]).length > 0 && (
            <UrlStructureIssuesDisplay issues={audit.urlStructureIssues as unknown as UrlStructureIssue[]} />
          )}

          {/* No Results Message */}
          {(!audit.contentGaps || (audit.contentGaps as unknown as ContentGap[]).length === 0) &&
            (!audit.urlStructureIssues || (audit.urlStructureIssues as unknown as UrlStructureIssue[]).length === 0) &&
            audit.status === 'COMPLETED' && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Great! No major issues found
                    </h3>
                    <p className="text-gray-600">
                      Your sitemap appears to be well-structured with no significant content gaps or URL issues.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    );
  }

  // REGULAR URL AUDIT VIEW - Original audit display
  // Parse Claude analysis
  let claudeData: ClaudeAnalysisData | null = null;
  try {
    claudeData = audit.claudeAnalysis ? JSON.parse(audit.claudeAnalysis) : null;
  } catch (e) {
    console.error('Failed to parse Claude analysis:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="bg-gradient-primary text-white rounded-lg p-6 lg:p-8 mb-8 animate-fadeIn">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 break-all leading-tight">
                {audit.url}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
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

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium opacity-90">Status:</span>
                <Select
                  value={audit.status}
                  onValueChange={(value) => updateStatusMutation.mutate(value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-[180px] bg-white/20 text-white border-white/30">
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

              <Button variant="secondary" size="sm" className="button-scale" asChild>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slideUp">
          <Card className="card-hover-effect text-center">
            <CardContent className="py-8">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {audit.seoScore ?? '-'}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-primary">SEO Score</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {audit.seoScore ? audit.seoScore >= 80 ? 'Excellent' : audit.seoScore >= 60 ? 'Good' : 'Needs Work' : 'Pending'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover-effect text-center">
            <CardContent className="py-8">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {audit.accessibilityScore ?? '-'}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-primary">Accessibility</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {audit.accessibilityScore ? audit.accessibilityScore >= 80 ? 'Excellent' : audit.accessibilityScore >= 60 ? 'Good' : 'Needs Work' : 'Pending'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover-effect text-center">
            <CardContent className="py-8">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">
                  {audit.designScore ?? '-'}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-secondary">Design</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {audit.designScore ? audit.designScore >= 8 ? 'Excellent' : audit.designScore >= 6 ? 'Good' : 'Needs Work' : 'Pending'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Screenshots */}
        {(audit.screenshotDesktop || audit.screenshotMobile) && (
          <Card className="mb-8 card-hover">
            <CardHeader>
              <CardTitle>Screenshots</CardTitle>
              <CardDescription>Desktop and mobile views of the website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {audit.screenshotDesktop && (
                  <div className="relative group">
                    <h3 className="text-sm font-semibold text-primary mb-3">Desktop View</h3>
                    <div className="relative border-2 sage-border rounded-lg overflow-hidden bg-gray-100 aspect-[16/10]">
                      <Image
                        src={audit.screenshotDesktop}
                        alt="Desktop screenshot"
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                )}

                {audit.screenshotMobile && (
                  <div className="relative group">
                    <h3 className="text-sm font-semibold text-primary mb-3">Mobile View</h3>
                    <div className="relative border-2 sage-border rounded-lg overflow-hidden bg-gray-100 aspect-[9/16] max-w-[375px] mx-auto">
                      <Image
                        src={audit.screenshotMobile}
                        alt="Mobile screenshot"
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
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
          <Card className="mb-8 sage-bg-subtle border-l-4 border-l-secondary card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-secondary animate-sparkle" />
                AI-Powered Analysis
              </CardTitle>
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

        {/* Signed Workflow Results - Show after status = SIGNED */}
        {audit.status === 'SIGNED' && audit.excelReportUrl && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-900">Project Signed - Team Notified</CardTitle>
              </div>
              <CardDescription className="text-green-800">
                SEMRush data retrieved and notifications sent to project team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Downloads</h4>
                  <Button asChild variant="outline">
                    <a href={audit.excelReportUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download SEMRush Excel Report
                    </a>
                  </Button>
                </div>

                {audit.semrushData && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">SEMRush Overview</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Total Keywords</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(audit.semrushData as unknown as { totalKeywords?: number }).totalKeywords?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Organic Traffic</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(audit.semrushData as unknown as { organicTraffic?: number }).organicTraffic?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Top Keywords</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(audit.semrushData as unknown as { keywords?: unknown[] }).keywords?.length || '0'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Backlinks</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(audit.semrushData as unknown as { backlinks?: number }).backlinks?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold text-gray-900 mb-2">Notifications Sent</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-green-600" />
                      Email sent to PM and Web Team
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      Slack notification posted
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Homepage SEMRush Data - Only show if isHomepage === true */}
        {audit.isHomepage && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <CardTitle>Homepage Detected</CardTitle>
                </div>
                <CardDescription>
                  This is a domain homepage. SEMRush keyword data is included below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Total Keywords</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {audit.totalKeywords?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Trend Data Points</p>
                    <p className="text-3xl font-bold text-green-600">
                      {audit.keywordTrendData ? Array.isArray(audit.keywordTrendData) ? audit.keywordTrendData.length : '0' : '0'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Top Pages</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {audit.topPages ? Array.isArray(audit.topPages) ? audit.topPages.length : '0' : '0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Trend Chart */}
            {audit.keywordTrendData && Array.isArray(audit.keywordTrendData) && audit.keywordTrendData.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Keyword Trend (12 Months)</CardTitle>
                  <CardDescription>
                    Organic keyword ranking history over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KeywordTrendChart data={audit.keywordTrendData as unknown as KeywordTrendData[]} />
                </CardContent>
              </Card>
            )}

            {/* Top Pages Table */}
            {audit.topPages && Array.isArray(audit.topPages) && audit.topPages.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Top Performing Pages</CardTitle>
                  <CardDescription>
                    Pages with highest organic traffic and keyword rankings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TopPagesTable
                    pages={audit.topPages as unknown as TopPage[]}
                    domain={new URL(audit.url).hostname}
                  />
                </CardContent>
              </Card>
            )}
          </>
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
