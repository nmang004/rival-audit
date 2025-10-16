'use client';

import { use, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Audit } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ExternalLink, CheckCircle2, XCircle, AlertCircle, Globe, FileSearch, Download, Mail, MessageSquare, BarChart3, Eye, History, Accessibility } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { KeywordTrendChart } from '@/components/audit/keyword-trend-chart';
import { TopPagesTable } from '@/components/audit/top-pages-table';
import { ContentGapsDisplay } from '@/components/audit/content-gaps-display';
import { UrlStructureIssuesDisplay } from '@/components/audit/url-structure-issues-display';
import { AuditDetailHeader } from '@/components/audit/audit-detail-header';
import { ScoreComparison } from '@/components/audit/score-comparison';
import { AuditActivityTimeline } from '@/components/audit/audit-activity-timeline';
import { SitemapUrlList } from '@/components/audit/sitemap-url-list';
import { SkeletonAuditHeader, SkeletonScoreCard } from '@/components/ui/skeleton';
import { KeywordTrendData, TopPage, ContentGap, UrlStructureIssue, SitemapUrl } from '@/types';

interface ClaudeAnalysisData {
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Tab state management with URL hash - MUST be before any conditional returns
  const [activeTab, setActiveTab] = useState('overview');

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

  // Hash navigation effect - MUST be before any conditional returns
  useEffect(() => {
    // Read hash from URL on mount
    const hash = window.location.hash.replace('#', '');
    // Support both regular audit tabs and sitemap audit tabs
    const validTabs = ['overview', 'seo', 'accessibility', 'performance', 'screenshots', 'semrush', 'history', 'content-gaps', 'url-structure', 'urls'];
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <SkeletonAuditHeader />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
            <SkeletonScoreCard />
            <SkeletonScoreCard />
            <SkeletonScoreCard />
          </div>
        </div>
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
    // Parse sitemap data
    const sitemapData = audit.sitemapUrls as { totalUrls: number; urls: SitemapUrl[] } | null;
    const contentGaps = (audit.contentGaps as unknown as ContentGap[]) || [];
    const urlStructureIssues = (audit.urlStructureIssues as unknown as UrlStructureIssue[]) || [];
    const totalUrls = sitemapData?.totalUrls || 0;
    const urls = sitemapData?.urls || [];

    // Calculate health score based on gaps and issues
    const totalIssues = contentGaps.length + urlStructureIssues.length;
    const healthScore = totalUrls > 0
      ? Math.max(0, Math.min(100, 100 - (totalIssues / totalUrls) * 100))
      : 100;

    // Handle tab change with URL hash update
    const handleSitemapTabChange = (value: string) => {
      setActiveTab(value);
      window.history.pushState(null, '', `#${value}`);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        {/* Sticky Header */}
        <AuditDetailHeader audit={audit} />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
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

          {/* Tabbed Navigation */}
          <Tabs value={activeTab} onValueChange={handleSitemapTabChange} className="w-full">
            <div className="sticky top-[80px] z-30 bg-white/95 backdrop-blur-sm shadow-sm mb-8 -mx-4 px-4 py-4">
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="content-gaps" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Content Gaps
                  {contentGaps.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                      {contentGaps.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="url-structure" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  URL Structure
                  {urlStructureIssues.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                      {urlStructureIssues.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="urls" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Sitemap URLs
                  {urls.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                      {urls.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideUp">
                <Card className="card-hover-effect text-center">
                  <CardContent className="py-6">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                      <FileSearch className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-1">
                      {totalUrls.toLocaleString()}
                    </p>
                    <h3 className="text-sm font-medium text-gray-600">Total URLs</h3>
                  </CardContent>
                </Card>

                <Card className="card-hover-effect text-center">
                  <CardContent className="py-6">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                      <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600 mb-1">
                      {contentGaps.length}
                    </p>
                    <h3 className="text-sm font-medium text-gray-600">Content Gaps</h3>
                  </CardContent>
                </Card>

                <Card className="card-hover-effect text-center">
                  <CardContent className="py-6">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                      <XCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-red-600 mb-1">
                      {urlStructureIssues.length}
                    </p>
                    <h3 className="text-sm font-medium text-gray-600">Structure Issues</h3>
                  </CardContent>
                </Card>

                <Card className="card-hover-effect text-center">
                  <CardContent className="py-6">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      {Math.round(healthScore)}%
                    </p>
                    <h3 className="text-sm font-medium text-gray-600">Health Score</h3>
                  </CardContent>
                </Card>
              </div>

              {/* Claude AI Analysis */}
              {audit.claudeAnalysis && (
                <Card className="sage-bg-subtle border-l-4 border-l-secondary card-glow animate-fadeIn">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-secondary animate-sparkle" />
                      AI-Powered Sitemap Analysis
                    </CardTitle>
                    <CardDescription>Strategic content and structure insights by Claude AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {audit.claudeAnalysis}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for this sitemap audit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" asChild className="button-scale">
                      <a href={audit.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Sitemap XML
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="button-scale"
                      onClick={() => handleSitemapTabChange('content-gaps')}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Review Content Gaps
                    </Button>
                    <Button
                      variant="outline"
                      className="button-scale"
                      onClick={() => handleSitemapTabChange('url-structure')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Check URL Issues
                    </Button>
                    <Button
                      variant="outline"
                      className="button-scale"
                      onClick={() => handleSitemapTabChange('urls')}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Browse All URLs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* No Issues Message */}
              {contentGaps.length === 0 && urlStructureIssues.length === 0 && audit.status === 'COMPLETED' && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-celebrate" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Excellent! No major issues found
                      </h3>
                      <p className="text-gray-600">
                        Your sitemap appears to be well-structured with no significant content gaps or URL issues.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Content Gaps Tab */}
            <TabsContent value="content-gaps" className="space-y-6">
              {contentGaps.length > 0 ? (
                <ContentGapsDisplay gaps={contentGaps} />
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Content Gaps Detected
                      </h3>
                      <p>
                        Your sitemap appears to have comprehensive coverage for your content strategy.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* URL Structure Tab */}
            <TabsContent value="url-structure" className="space-y-6">
              {urlStructureIssues.length > 0 ? (
                <UrlStructureIssuesDisplay issues={urlStructureIssues} />
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No URL Structure Issues
                      </h3>
                      <p>
                        Your URL structure follows best practices and is well-organized.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Sitemap URLs Tab */}
            <TabsContent value="urls" className="space-y-6">
              {urls.length > 0 ? (
                <SitemapUrlList urls={urls} />
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <FileSearch className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No URLs Found
                      </h3>
                      <p>
                        No URLs were found in this sitemap. The sitemap may be empty or still processing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <AuditActivityTimeline audit={audit} />
            </TabsContent>
          </Tabs>
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

  // Handle tab change with URL hash update
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL hash
    window.history.pushState(null, '', `#${value}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Sticky Header */}
      <AuditDetailHeader audit={audit} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
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

        {/* Tabbed Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="sticky top-[80px] z-30 bg-white/95 backdrop-blur-sm shadow-sm mb-8 -mx-4 px-4 py-4">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                SEO Details
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Accessibility className="w-4 h-4" />
                Accessibility
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="screenshots" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Screenshots
              </TabsTrigger>
              {audit.isHomepage && (
                <TabsTrigger value="semrush" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  SEMRush Data
                </TabsTrigger>
              )}
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
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

            {/* Score Comparisons */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ScoreComparison
                currentScore={audit.seoScore}
                scoreType="seo"
                industryAverage={75}
              />
              <ScoreComparison
                currentScore={audit.accessibilityScore}
                scoreType="accessibility"
                industryAverage={80}
              />
              <ScoreComparison
                currentScore={audit.designScore}
                scoreType="design"
                industryAverage={7}
              />
            </div>

            {/* SEO Details */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
                <CardDescription>Meta tags, headings, and on-page SEO data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {audit.h1Tags && (audit.h1Tags as string[]).length > 0 && (
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
              </CardContent>
            </Card>

            {/* SEMRush Data - Only if homepage */}
            {audit.isHomepage && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <CardTitle>SEMRush Keyword Data</CardTitle>
                  </div>
                  <CardDescription>
                    Homepage-specific keyword rankings and traffic data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                  {/* Keyword Trend Chart */}
                  {audit.keywordTrendData && Array.isArray(audit.keywordTrendData) && audit.keywordTrendData.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Trend (12 Months)</h3>
                      <KeywordTrendChart data={audit.keywordTrendData as unknown as KeywordTrendData[]} />
                    </div>
                  )}

                  {/* Top Pages Table */}
                  {audit.topPages && Array.isArray(audit.topPages) && audit.topPages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Pages</h3>
                      <TopPagesTable
                        pages={audit.topPages as unknown as TopPage[]}
                        domain={new URL(audit.url).hostname}
                      />
                    </div>
                  )}

                  {/* Signed Workflow Results */}
                  {audit.status === 'SIGNED' && audit.excelReportUrl && (
                    <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Project Signed - Team Notified</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Button asChild variant="outline">
                            <a href={audit.excelReportUrl} download>
                              <Download className="w-4 h-4 mr-2" />
                              Download SEMRush Excel Report
                            </a>
                          </Button>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-green-600" />
                            Email sent to PM and Web Team
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            Slack notification posted
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Claude AI Analysis */}
            {claudeData && (
              <Card className="sage-bg-subtle border-l-4 border-l-secondary card-glow">
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
          </TabsContent>

          {/* SEO Details Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
                <CardDescription>Meta tags, headings, and on-page SEO data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {audit.h1Tags && (audit.h1Tags as string[]).length > 0 && (
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Details</CardTitle>
                <CardDescription>Accessibility score and violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
                    <span className="text-5xl font-bold text-white">
                      {audit.accessibilityScore ?? '-'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Accessibility Score: {audit.accessibilityScore ?? 'N/A'}/100
                  </h3>
                  <p className="text-gray-600">
                    Detailed violation breakdown coming in future updates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Core Web Vitals and loading performance</CardDescription>
              </CardHeader>
              <CardContent>
                {audit.coreWebVitals ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Core Web Vitals</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2 font-medium">Largest Contentful Paint</p>
                        <p className="text-4xl font-bold text-blue-600 mb-1">
                          {(audit.coreWebVitals as { lcp?: number; fid?: number; cls?: number }).lcp || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">Seconds</p>
                      </div>
                      <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2 font-medium">First Input Delay</p>
                        <p className="text-4xl font-bold text-green-600 mb-1">
                          {(audit.coreWebVitals as { lcp?: number; fid?: number; cls?: number }).fid || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">Milliseconds</p>
                      </div>
                      <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2 font-medium">Cumulative Layout Shift</p>
                        <p className="text-4xl font-bold text-purple-600 mb-1">
                          {(audit.coreWebVitals as { lcp?: number; fid?: number; cls?: number }).cls || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Performance data not available for this audit</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Screenshots Tab */}
          <TabsContent value="screenshots" className="space-y-6">
            {(audit.screenshotDesktop || audit.screenshotMobile) ? (
              <Card>
                <CardHeader>
                  <CardTitle>Full-Size Screenshots</CardTitle>
                  <CardDescription>Desktop and mobile views in full resolution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {audit.screenshotDesktop && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Desktop View</h3>
                      <div className="relative border-2 sage-border rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={audit.screenshotDesktop}
                          alt="Desktop screenshot"
                          width={1920}
                          height={1080}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}

                  {audit.screenshotMobile && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile View</h3>
                      <div className="relative border-2 sage-border rounded-lg overflow-hidden bg-gray-100 max-w-[375px] mx-auto">
                        <Image
                          src={audit.screenshotMobile}
                          alt="Mobile screenshot"
                          width={375}
                          height={667}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No screenshots available for this audit</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SEMRush Data Tab - Only if homepage */}
          {audit.isHomepage && (
            <TabsContent value="semrush" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <CardTitle>SEMRush Keyword Data</CardTitle>
                  </div>
                  <CardDescription>
                    Homepage-specific keyword rankings and traffic data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                  {/* Keyword Trend Chart */}
                  {audit.keywordTrendData && Array.isArray(audit.keywordTrendData) && audit.keywordTrendData.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Trend (12 Months)</h3>
                      <KeywordTrendChart data={audit.keywordTrendData as unknown as KeywordTrendData[]} />
                    </div>
                  )}

                  {/* Top Pages Table */}
                  {audit.topPages && Array.isArray(audit.topPages) && audit.topPages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Pages</h3>
                      <TopPagesTable
                        pages={audit.topPages as unknown as TopPage[]}
                        domain={new URL(audit.url).hostname}
                      />
                    </div>
                  )}

                  {/* Signed Workflow Results */}
                  {audit.status === 'SIGNED' && audit.excelReportUrl && (
                    <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Project Signed - Team Notified</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Button asChild variant="outline">
                            <a href={audit.excelReportUrl} download>
                              <Download className="w-4 h-4 mr-2" />
                              Download SEMRush Excel Report
                            </a>
                          </Button>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-green-600" />
                            Email sent to PM and Web Team
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                            Slack notification posted
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <AuditActivityTimeline audit={audit} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
