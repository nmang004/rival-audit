'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, FileSearch, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SitemapAuditPage() {
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const router = useRouter();

  const createSitemapAudit = useMutation({
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
      toast.success('Sitemap audit started!');
      router.push(`/audits/${data.data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sitemapUrl) {
      toast.error('Please enter a sitemap URL');
      return;
    }

    if (!sitemapUrl.endsWith('.xml')) {
      toast.error('Sitemap URL must end with .xml');
      return;
    }

    createSitemapAudit.mutate({
      sitemapUrl,
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sitemap Audit</h1>
          <p className="text-gray-600">
            Analyze your entire website structure by auditing your sitemap.xml file
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-blue-600" />
              <CardTitle>Start Sitemap Audit</CardTitle>
            </div>
            <CardDescription>
              Enter your sitemap URL to analyze URL structure, identify content gaps, and detect missing pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="sitemapUrl">Sitemap URL *</Label>
                <Input
                  id="sitemapUrl"
                  type="url"
                  placeholder="https://example.com/sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  className="mt-1"
                  disabled={createSitemapAudit.isPending}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must end with .xml (e.g., sitemap.xml, sitemap_index.xml)
                </p>
              </div>

              <div>
                <Label htmlFor="clientName">Client Name (Optional)</Label>
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Company Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1"
                  disabled={createSitemapAudit.isPending}
                />
              </div>

              <div>
                <Label htmlFor="clientEmail">Client Email (Optional)</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1"
                  disabled={createSitemapAudit.isPending}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createSitemapAudit.isPending}
              >
                {createSitemapAudit.isPending ? (
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

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">What we&apos;ll analyze:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• URL structure and naming patterns</li>
                    <li>• Content gaps and missing essential pages</li>
                    <li>• SEO opportunities based on your sitemap</li>
                    <li>• URL depth and organization issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
