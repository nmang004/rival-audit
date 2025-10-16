'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Audit, AuditStatus } from '@prisma/client';
import { AuditForm, AuditFormData } from '@/components/audit/audit-form';
import { AuditCard } from '@/components/audit/audit-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { Search, Loader2, FileText, FileSearch, Globe, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState('url-audit');

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

  // Filter audits based on search and status
  const filteredAudits = audits?.filter((audit) => {
    const matchesSearch =
      audit.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audit.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === 'ALL' || audit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="sage-bg-gradient py-12 px-6 mb-8 rounded-lg animate-fadeIn">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Sales SEO Audit Tool
            </h1>
            <p className="text-lg lg:text-xl opacity-90 mb-2">
              AI-powered website analysis for closing more deals
            </p>
            <p className="text-sm opacity-75">
              Powered by Rival Digital
            </p>
          </div>
        </div>

        {/* Audit Creation Tabs */}
        <Card className="mb-8 card-hover-effect animate-slideUp">
          <CardHeader className="sage-bg-subtle">
            <CardTitle className="text-2xl">Create New Audit</CardTitle>
            <CardDescription>
              Choose between a single URL audit or a comprehensive sitemap audit
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    className="w-full"
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
