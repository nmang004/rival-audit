'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Audit, AuditStatus } from '@prisma/client';
import { AuditForm, AuditFormData } from '@/components/audit/audit-form';
import { AuditCard } from '@/components/audit/audit-card';
import { AuditTableView } from '@/components/audit/audit-table-view';
import { ViewToggle, useViewMode } from '@/components/audit/view-toggle';
import { AuditSearch } from '@/components/audit/audit-search';
import { AdvancedFilters, FilterValues } from '@/components/audit/advanced-filters';
import { BulkActionsBar } from '@/components/audit/bulk-actions-bar';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ScoreTrendChart } from '@/components/dashboard/score-trend-chart';
import { StatusDistributionChart } from '@/components/dashboard/status-distribution-chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SkeletonStatCard, SkeletonChart, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { Loader2, FileText, FileSearch, Globe, Plus, Activity, Users, TrendingUp, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [viewMode, setViewMode] = useViewMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState('url-audit');
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
    statuses: [],
    seoScoreMin: 0,
    seoScoreMax: 100,
    a11yScoreMin: 0,
    a11yScoreMax: 100,
    designScoreMin: 0,
    designScoreMax: 100,
    homepageOnly: false,
    sitemapOnly: false,
  });

  // Sitemap audit form state
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [sitemapClientName, setSitemapClientName] = useState('');
  const [sitemapClientEmail, setSitemapClientEmail] = useState('');

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

  // Create sitemap audit mutation
  const createSitemapAuditMutation = useMutation({
    mutationFn: async (data: { sitemapUrl: string; clientName?: string; clientEmail?: string }) => {
      const res = await fetch('/api/sitemap-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create sitemap audit');
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Sitemap audit started!');
      router.push(`/audits/${data.data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
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

  const handleSitemapSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sitemapUrl) {
      toast.error('Please enter a sitemap URL');
      return;
    }

    if (!sitemapUrl.endsWith('.xml')) {
      toast.error('Sitemap URL must end with .xml');
      return;
    }

    createSitemapAuditMutation.mutate({
      sitemapUrl,
      clientName: sitemapClientName || undefined,
      clientEmail: sitemapClientEmail || undefined,
    });
  };

  // Bulk operation handlers
  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedAuditIds.map(id =>
          fetch(`/api/audits/${id}`, { method: 'DELETE' })
        )
      );
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success(`Deleted ${selectedAuditIds.length} audit${selectedAuditIds.length > 1 ? 's' : ''}`);
      setSelectedAuditIds([]);
    } catch {
      toast.error('Failed to delete audits');
    }
  };

  const handleBulkStatusChange = async (status: AuditStatus) => {
    try {
      await Promise.all(
        selectedAuditIds.map(id =>
          fetch(`/api/audits/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        )
      );
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success(`Updated ${selectedAuditIds.length} audit${selectedAuditIds.length > 1 ? 's' : ''}`);
      setSelectedAuditIds([]);
    } catch {
      toast.error('Failed to update audits');
    }
  };

  const handleSelectAll = () => {
    if (filteredAudits) {
      setSelectedAuditIds(filteredAudits.map(a => a.id));
    }
  };

  const handleApplyFilters = (filters: FilterValues) => {
    setAdvancedFilters(filters);
    setSelectedAuditIds([]); // Clear selection when filters change
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setAdvancedFilters({
      statuses: [],
      seoScoreMin: 0,
      seoScoreMax: 100,
      a11yScoreMin: 0,
      a11yScoreMax: 100,
      designScoreMin: 0,
      designScoreMax: 100,
      homepageOnly: false,
      sitemapOnly: false,
    });
    setSelectedAuditIds([]);
    toast.success('All filters cleared');
  };

  // Filter audits based on search, status, and advanced filters
  const filteredAudits = audits?.filter((audit) => {
    // Search filter - only apply if there's a search query
    const matchesSearch =
      !searchQuery || searchQuery.trim() === '' ||
      audit.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audit.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    // Status filter (basic)
    const matchesStatus = statusFilter === 'ALL' || audit.status === statusFilter;

    // Advanced filters
    const matchesAdvancedStatus =
      advancedFilters.statuses.length === 0 ||
      advancedFilters.statuses.includes(audit.status);

    const matchesDateFrom =
      !advancedFilters.dateFrom || advancedFilters.dateFrom.trim() === '' ||
      new Date(audit.createdAt) >= new Date(advancedFilters.dateFrom);

    const matchesDateTo =
      !advancedFilters.dateTo || advancedFilters.dateTo.trim() === '' ||
      new Date(audit.createdAt) <= new Date(advancedFilters.dateTo);

    const matchesSeoScore =
      (audit.seoScore === null) ||
      (audit.seoScore >= advancedFilters.seoScoreMin &&
       audit.seoScore <= advancedFilters.seoScoreMax);

    const matchesA11yScore =
      (audit.accessibilityScore === null) ||
      (audit.accessibilityScore >= advancedFilters.a11yScoreMin &&
       audit.accessibilityScore <= advancedFilters.a11yScoreMax);

    const matchesDesignScore =
      (audit.designScore === null) ||
      (audit.designScore >= advancedFilters.designScoreMin &&
       audit.designScore <= advancedFilters.designScoreMax);

    const matchesClientName =
      !advancedFilters.clientName || advancedFilters.clientName.trim() === '' ||
      (audit.clientName?.toLowerCase().includes(advancedFilters.clientName.toLowerCase()) ?? false);

    const matchesHomepage =
      !advancedFilters.homepageOnly || audit.isHomepage;

    const matchesSitemap =
      !advancedFilters.sitemapOnly || audit.isSitemapAudit;

    return matchesSearch &&
           matchesStatus &&
           matchesAdvancedStatus &&
           matchesDateFrom &&
           matchesDateTo &&
           matchesSeoScore &&
           matchesA11yScore &&
           matchesDesignScore &&
           matchesClientName &&
           matchesHomepage &&
           matchesSitemap;
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!audits || audits.length === 0) {
      return {
        totalAudits: 0,
        averageSeoScore: 0,
        activeClients: 0,
        completedAudits: 0,
      };
    }

    const validScores = audits.filter(a => a.seoScore !== null);
    const averageSeo = validScores.length > 0
      ? Math.round(validScores.reduce((sum, a) => sum + (a.seoScore || 0), 0) / validScores.length)
      : 0;

    const uniqueClients = new Set(audits.filter(a => a.clientName).map(a => a.clientName));
    const completed = audits.filter(a => a.status === 'COMPLETED').length;

    return {
      totalAudits: audits.length,
      averageSeoScore: averageSeo,
      activeClients: uniqueClients.size,
      completedAudits: completed,
    };
  }, [audits]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s an overview of your audit performance.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
        {isLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Audits"
              value={stats.totalAudits}
              icon={Activity}
              trend={{ value: 12, label: 'vs last month' }}
            />
            <StatsCard
              title="Average SEO Score"
              value={stats.averageSeoScore}
              icon={TrendingUp}
              iconClassName="from-secondary/10 to-secondary/5 text-secondary"
              trend={{ value: 8, label: 'vs last month' }}
            />
            <StatsCard
              title="Active Clients"
              value={stats.activeClients}
              icon={Users}
              iconClassName="from-blue-100 to-blue-50 text-blue-600"
              trend={{ value: 5, label: 'vs last month' }}
            />
            <StatsCard
              title="Completed"
              value={stats.completedAudits}
              icon={CheckCircle2}
              iconClassName="from-green-100 to-green-50 text-green-600"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonChart type="line" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <SkeletonChart type="donut" />
            </CardContent>
          </Card>
        </div>
      ) : audits && audits.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          <ScoreTrendChart audits={audits} days={30} />
          <StatusDistributionChart audits={audits} />
        </div>
      ) : null}

      {/* Audit Creation Tabs */}
      <Card className="animate-slideUp border-[oklch(0.24_0.13_265)]/10 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-white to-[oklch(0.24_0.13_265)]/[0.02]">
          <CardTitle className="text-2xl text-primary">Create New Audit</CardTitle>
          <CardDescription className="text-base">
            Choose between a single URL audit or a comprehensive sitemap audit
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="url-audit" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                URL Audit
              </TabsTrigger>
              <TabsTrigger value="sitemap-audit" className="flex items-center gap-2">
                <FileSearch className="w-4 h-4" />
                Sitemap Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url-audit" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Analyze a specific webpage with AI-powered insights, screenshots, and SEO metrics
              </div>
              <AuditForm
                onSubmit={(data) => createAuditMutation.mutate(data)}
                isLoading={createAuditMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="sitemap-audit" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Analyze your entire website structure, identify content gaps, and detect URL issues
              </div>
              <form onSubmit={handleSitemapSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="sitemap-url">Sitemap URL *</Label>
                  <Input
                    id="sitemap-url"
                    type="url"
                    placeholder="https://example.com/sitemap.xml"
                    value={sitemapUrl}
                    onChange={(e) => setSitemapUrl(e.target.value)}
                    className="mt-1"
                    disabled={createSitemapAuditMutation.isPending}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Must end with .xml (e.g., sitemap.xml, sitemap_index.xml)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sitemap-client-name">Client Name (Optional)</Label>
                    <Input
                      id="sitemap-client-name"
                      type="text"
                      placeholder="Company Name"
                      value={sitemapClientName}
                      onChange={(e) => setSitemapClientName(e.target.value)}
                      className="mt-1"
                      disabled={createSitemapAuditMutation.isPending}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sitemap-client-email">Client Email (Optional)</Label>
                    <Input
                      id="sitemap-client-email"
                      type="email"
                      placeholder="client@example.com"
                      value={sitemapClientEmail}
                      onChange={(e) => setSitemapClientEmail(e.target.value)}
                      className="mt-1"
                      disabled={createSitemapAuditMutation.isPending}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rival-button"
                  disabled={createSitemapAuditMutation.isPending}
                >
                  {createSitemapAuditMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Audit...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4 mr-2" />
                      Start Sitemap Audit
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters and View Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search and Basic Filter */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
            <AuditSearch
              audits={audits || []}
              value={searchQuery}
              onChange={setSearchQuery}
              onSelectAudit={(audit) => router.push(`/audits/${audit.id}`)}
            />

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

          {/* Advanced Filters and View Toggle */}
          <div className="flex gap-3">
            <AdvancedFilters
              onApply={handleApplyFilters}
              initialFilters={advancedFilters}
            />
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Clear Filters Button - show if any filters are active */}
        {(searchQuery || statusFilter !== 'ALL' || advancedFilters.statuses.length > 0 || advancedFilters.clientName) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAllFilters}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Results count */}
      {filteredAudits && (
        <div className="text-sm text-gray-600">
          Showing {filteredAudits.length} of {audits?.length || 0} audits
        </div>
      )}

      {/* Audit List */}
      {isLoading && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <SkeletonTable rows={8} />
          )}
        </>
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
        <Card className="sage-bg-subtle border-2 border-dashed sage-border">
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <FileText className="w-24 h-24 text-secondary opacity-50 mb-6 animate-float" />
              <h3 className="text-2xl font-bold gradient-heading mb-4">
                {searchQuery || statusFilter !== 'ALL' ? 'No audits found' : 'No audits yet'}
              </h3>
              <p className="text-muted-foreground max-w-md mb-6 text-lg">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first SEO audit to start analyzing websites and closing deals'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Button
                  size="lg"
                  className="button-scale animate-pulse-glow"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Audit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredAudits && filteredAudits.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAudits.map((audit) => (
                <AuditCard
                  key={audit.id}
                  audit={audit}
                  onDelete={(id) => deleteAuditMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <AuditTableView
              audits={filteredAudits}
              onDelete={(id) => deleteAuditMutation.mutate(id)}
              selectedIds={selectedAuditIds}
              onSelectionChange={setSelectedAuditIds}
            />
          )}
        </>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedAuditIds.length}
        totalCount={filteredAudits?.length || 0}
        onClearSelection={() => setSelectedAuditIds([])}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
      />
    </div>
  );
}
