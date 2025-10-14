# Phase 4: Sitemap Audit Feature

## Context

Navigate to `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool`

**IMPORTANT: Read these documentation files first:**
1. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Claude-Code-Setup-Prompt.md` - Architecture and setup details
2. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Sales-SEO-Audit-Tool-SRS.md` - Complete requirements specification
3. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Development-Checklist.md` - Phase-by-phase implementation
4. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/PHASE-3-COMPLETE.md` - Phase 3 completion summary

**Current Status:**
- ✅ Phase 1 Complete: Core infrastructure, API routes, audit workflow, Puppeteer, Claude integration
- ✅ Phase 2 Complete: Dashboard, audit detail views, React Query, all UI components
- ✅ Phase 3 Complete: Homepage detection & SEMRush integration with placeholder data
- ⏳ Phase 4 Starting: Sitemap audit feature

## Your Task - Phase 4: Sitemap Audit Feature

Phase 4 adds comprehensive sitemap analysis capabilities, allowing users to audit entire websites by crawling their sitemap.xml files. This includes URL structure analysis, content gap detection, and missing page identification using Claude AI.

### Priority 1: XML Sitemap Parser

**File: `src/lib/sitemap-parser.ts`**

Create a robust XML sitemap parser with the following functions:

```typescript
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export interface ParsedSitemap {
  urls: SitemapUrl[];
  totalUrls: number;
  errors: string[];
}

// Parse sitemap.xml from URL
export async function parseSitemap(sitemapUrl: string): Promise<ParsedSitemap>

// Fetch and parse sitemap index (handles sitemap_index.xml)
export async function parseSitemapIndex(indexUrl: string): Promise<string[]>

// Extract all URLs from sitemap (handles nested sitemaps)
export async function extractAllUrls(sitemapUrl: string): Promise<SitemapUrl[]>
```

**Requirements:**
- Handle both regular sitemaps and sitemap indexes
- Support nested sitemaps (sitemap_index.xml that links to multiple sitemaps)
- Parse all standard sitemap fields (loc, lastmod, changefreq, priority)
- Handle malformed XML gracefully
- Add timeout (30 seconds per request)
- Log all parsing steps
- Return detailed error messages

**XML Parser:**
- Use `fast-xml-parser` (already installed)
- Configure to handle namespaces
- Validate URL formats
- Handle large sitemaps (10,000+ URLs)

### Priority 2: Content Gap Analysis with Claude

**File: `src/lib/analysis/content-gap-analyzer.ts`**

Create a Claude-powered content gap analyzer:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { SitemapUrl } from '../sitemap-parser';

export interface ContentGap {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedPages: string[];
  reasoning: string;
}

export interface ContentGapAnalysis {
  gaps: ContentGap[];
  summary: string;
  totalGaps: number;
}

// Analyze sitemap URLs for content gaps
export async function analyzeContentGaps(
  urls: SitemapUrl[],
  domain: string
): Promise<ContentGapAnalysis>
```

**Claude Prompt Structure:**

```
You are analyzing a website's sitemap to identify content gaps and missing pages.

Domain: {domain}
Total URLs in sitemap: {totalUrls}

Sample URLs from sitemap:
{first 50 URLs listed}

Please analyze this sitemap and identify:

1. Missing Essential Pages:
   - About Us / Company Info
   - Contact Information
   - Privacy Policy / Terms of Service
   - FAQ or Help Center
   - Blog or News section (if appropriate)
   - Products/Services pages (if e-commerce)
   - Careers/Jobs (if company site)

2. Content Gaps:
   - Missing topic areas based on the domain's industry
   - Incomplete category coverage
   - Missing landing pages for key services
   - Lack of resource/educational content

3. SEO Opportunities:
   - Missing location-based pages (if relevant)
   - Absence of comparison/vs pages
   - No how-to guides or tutorials
   - Missing category/hub pages

For each gap identified, provide:
- Category (e.g., "Essential Pages", "Educational Content", "Product Pages")
- Description of what's missing
- Priority: high, medium, or low
- Suggested page URLs to create
- Brief reasoning why this content would be valuable

Format your response as JSON with this structure:
{
  "gaps": [
    {
      "category": "Essential Pages",
      "description": "Missing privacy policy",
      "priority": "high",
      "suggestedPages": ["/privacy-policy", "/terms-of-service"],
      "reasoning": "Legal requirement and builds trust"
    }
  ],
  "summary": "Overall assessment..."
}
```

**Requirements:**
- Analyze up to 500 URLs (sample if more)
- Use Claude Sonnet 4.5
- Parse JSON response from Claude
- Handle API errors gracefully
- Cache results to avoid duplicate analysis
- Add rate limiting

### Priority 3: URL Structure Analysis

**File: `src/lib/analysis/url-structure-analyzer.ts`**

Analyze URL patterns and structure issues:

```typescript
import { SitemapUrl } from '../sitemap-parser';

export interface UrlStructureIssue {
  type: 'inconsistent_pattern' | 'too_deep' | 'poor_naming' | 'missing_canonical' | 'duplicate_pattern';
  description: string;
  affectedUrls: string[];
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface UrlStructureAnalysis {
  issues: UrlStructureIssue[];
  totalIssues: number;
  patterns: {
    pattern: string;
    count: number;
    example: string;
  }[];
  depthAnalysis: {
    averageDepth: number;
    maxDepth: number;
    urlsByDepth: Record<number, number>;
  };
}

// Analyze URL structure and patterns
export async function analyzeUrlStructure(
  urls: SitemapUrl[]
): Promise<UrlStructureAnalysis>
```

**Analysis Rules:**

1. **URL Depth:**
   - Flag URLs deeper than 4 levels
   - Calculate average depth
   - Identify outliers

2. **Naming Conventions:**
   - Detect inconsistent naming (camelCase, snake_case, kebab-case)
   - Find URLs with parameters
   - Identify overly long URLs (>100 characters)

3. **Pattern Detection:**
   - Group URLs by pattern (e.g., /blog/{slug}, /products/{category}/{product})
   - Find common prefixes
   - Detect unusual patterns

4. **SEO Issues:**
   - Find non-descriptive URLs (/page1, /item-123)
   - Detect duplicate content patterns
   - Identify missing trailing slashes inconsistencies

### Priority 4: Sitemap Workflow

**File: `src/lib/workflows/sitemap-workflow.ts`**

Create the main sitemap audit workflow:

```typescript
import { extractAllUrls } from '../sitemap-parser';
import { analyzeContentGaps } from '../analysis/content-gap-analyzer';
import { analyzeUrlStructure } from '../analysis/url-structure-analyzer';
import prisma from '../prisma';

export interface SitemapAuditResult {
  totalUrls: number;
  crawledUrls: number;
  contentGaps: ContentGap[];
  urlStructureIssues: UrlStructureIssue[];
  summary: string;
}

// Execute complete sitemap audit
export async function executeSitemapAudit(
  auditId: string,
  sitemapUrl: string
): Promise<SitemapAuditResult>
```

**Workflow Steps:**

1. Validate sitemap URL
2. Parse sitemap and extract all URLs
3. Analyze URL structure
4. Run content gap analysis with Claude
5. Store results in database
6. Update audit status

**Error Handling:**
- Handle invalid sitemap URLs
- Handle XML parsing errors
- Handle Claude API failures
- Continue with partial results if possible

### Priority 5: API Routes

**File: `src/app/api/sitemap-audit/route.ts`**

Create API endpoint for sitemap audits:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { executeSitemapAudit } from '@/lib/workflows/sitemap-workflow';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sitemapUrl, clientName, clientEmail } = body;

    // Validate sitemap URL
    if (!sitemapUrl || !sitemapUrl.endsWith('.xml')) {
      return NextResponse.json(
        { error: 'Invalid sitemap URL. Must end with .xml' },
        { status: 400 }
      );
    }

    // Create audit record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const audit = await prisma.audit.create({
      data: {
        url: sitemapUrl,
        status: 'IN_PROGRESS',
        isSitemapAudit: true,
        clientName,
        clientEmail,
        createdById: user.id,
      },
    });

    // Execute sitemap audit in background
    executeSitemapAudit(audit.id, sitemapUrl)
      .then(() => {
        console.log(`[Sitemap Audit ${audit.id}] Completed successfully`);
      })
      .catch((error) => {
        console.error(`[Sitemap Audit ${audit.id}] Failed:`, error);
      });

    return NextResponse.json({
      success: true,
      data: audit,
    });
  } catch (error) {
    console.error('Error creating sitemap audit:', error);
    return NextResponse.json(
      { error: 'Failed to create sitemap audit' },
      { status: 500 }
    );
  }
}
```

### Priority 6: Sitemap Audit Page UI

**File: `src/app/sitemap-audit/page.tsx`**

Create the sitemap audit interface:

```typescript
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
                  <h4 className="font-semibold text-blue-900 mb-1">What we'll analyze:</h4>
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
```

### Priority 7: Update Audit Detail Page

**File: `src/app/audits/[id]/page.tsx`**

Add sitemap audit results section (after homepage section, before technical details):

```typescript
{/* Sitemap Audit Results - Only show if isSitemapAudit === true */}
{audit.isSitemapAudit && (
  <>
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-purple-600" />
          <CardTitle>Sitemap Audit Results</CardTitle>
        </div>
        <CardDescription>
          Complete analysis of your website's sitemap structure and content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Total URLs</p>
            <p className="text-3xl font-bold text-purple-600">
              {audit.sitemapUrls ? (audit.sitemapUrls as { totalUrls: number }).totalUrls : '0'}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Content Gaps</p>
            <p className="text-3xl font-bold text-orange-600">
              {audit.contentGaps ? (audit.contentGaps as ContentGap[]).length : '0'}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Structure Issues</p>
            <p className="text-3xl font-bold text-red-600">
              {audit.urlStructureIssues ? (audit.urlStructureIssues as UrlStructureIssue[]).length : '0'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Content Gaps */}
    {audit.contentGaps && (audit.contentGaps as ContentGap[]).length > 0 && (
      <ContentGapsDisplay gaps={audit.contentGaps as ContentGap[]} />
    )}

    {/* URL Structure Issues */}
    {audit.urlStructureIssues && (audit.urlStructureIssues as UrlStructureIssue[]).length > 0 && (
      <UrlStructureIssuesDisplay issues={audit.urlStructureIssues as UrlStructureIssue[]} />
    )}
  </>
)}
```

### Priority 8: UI Components

**File: `src/components/audit/content-gaps-display.tsx`**

Display content gaps with priority indicators:

```typescript
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ContentGap } from '@/types';

interface ContentGapsDisplayProps {
  gaps: ContentGap[];
}

export function ContentGapsDisplay({ gaps }: ContentGapsDisplayProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Content Gaps & Missing Pages</CardTitle>
        <CardDescription>
          AI-identified opportunities to improve your website's content coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {gaps.map((gap, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{gap.category}</h4>
                <p className="text-sm text-gray-600">{gap.description}</p>
              </div>
              <Badge className={getPriorityColor(gap.priority)}>
                <span className="flex items-center gap-1">
                  {getPriorityIcon(gap.priority)}
                  {gap.priority.toUpperCase()}
                </span>
              </Badge>
            </div>

            {gap.suggestedPages.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Suggested Pages:</p>
                <div className="flex flex-wrap gap-2">
                  {gap.suggestedPages.map((page, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {page}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 italic">
              {gap.reasoning}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

**File: `src/components/audit/url-structure-issues-display.tsx`**

Display URL structure issues:

```typescript
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { UrlStructureIssue } from '@/types';

interface UrlStructureIssuesDisplayProps {
  issues: UrlStructureIssue[];
}

export function UrlStructureIssuesDisplay({ issues }: UrlStructureIssuesDisplayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>URL Structure Issues</CardTitle>
        <CardDescription>
          Problems detected in your website's URL organization and naming
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {getTypeLabel(issue.type)}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                  <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    <strong>Recommendation:</strong> {issue.recommendation}
                  </p>
                </div>
              </div>
              <Badge className={getSeverityColor(issue.severity)}>
                {issue.severity.toUpperCase()}
              </Badge>
            </div>

            {issue.affectedUrls.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Affected URLs ({issue.affectedUrls.length}):
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {issue.affectedUrls.slice(0, 5).map((url, idx) => (
                    <code key={idx} className="block text-xs bg-gray-50 p-2 rounded">
                      {url}
                    </code>
                  ))}
                  {issue.affectedUrls.length > 5 && (
                    <p className="text-xs text-gray-500 italic">
                      ... and {issue.affectedUrls.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Priority 9: Navigation Updates

**File: `src/app/dashboard/page.tsx`**

Add button to access sitemap audit:

```typescript
<div className="flex gap-4 mb-8">
  <Button asChild size="lg">
    <Link href="/dashboard">
      <Plus className="w-4 h-4 mr-2" />
      New Audit
    </Link>
  </Button>
  <Button asChild size="lg" variant="outline">
    <Link href="/sitemap-audit">
      <FileSearch className="w-4 h-4 mr-2" />
      Sitemap Audit
    </Link>
  </Button>
</div>
```

### Priority 10: Types Updates

**File: `src/types/index.ts`**

Add sitemap-related types:

```typescript
// Add to existing types
export interface ContentGap {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedPages: string[];
  reasoning: string;
}

export interface UrlStructureIssue {
  type: 'inconsistent_pattern' | 'too_deep' | 'poor_naming' | 'missing_canonical' | 'duplicate_pattern';
  description: string;
  affectedUrls: string[];
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SitemapAuditResult {
  totalUrls: number;
  crawledUrls: number;
  contentGaps: ContentGap[];
  urlStructureIssues: UrlStructureIssue[];
  summary: string;
}
```

## Implementation Notes

### Database Schema

The Prisma schema already has these fields:
```prisma
isSitemapAudit      Boolean     @default(false)
sitemapUrls         Json?
contentGaps         Json?
urlStructureIssues  Json?
```

No migrations needed!

### Claude API Integration

- Use same Claude instance from `src/lib/claude.ts`
- Add new prompt for content gap analysis
- Parse JSON response
- Handle API errors gracefully

### Error Handling

1. **Invalid Sitemap URL**: Return 400 with clear error message
2. **XML Parsing Failed**: Log error, return partial results
3. **Claude API Failed**: Continue without content gap analysis
4. **Network Timeout**: Show friendly error, allow retry

### Rate Limiting

- Sitemap parsing: No limit (user-initiated)
- Claude analysis: Max 10 per minute per user
- URL fetching: Max 100 URLs per second

## Testing Checklist

### Sitemap Parsing
- [ ] Test with regular sitemap.xml
- [ ] Test with sitemap_index.xml (nested sitemaps)
- [ ] Test with invalid XML
- [ ] Test with 404 sitemap URL
- [ ] Test with large sitemap (10,000+ URLs)

### Content Gap Analysis
- [ ] Test with e-commerce site
- [ ] Test with blog/content site
- [ ] Test with company website
- [ ] Verify Claude returns valid JSON
- [ ] Test with small sitemap (< 10 URLs)

### URL Structure Analysis
- [ ] Test with well-structured URLs
- [ ] Test with messy URLs
- [ ] Test with very deep URLs (5+ levels)
- [ ] Test with inconsistent naming
- [ ] Verify all issue types are detected

### UI Testing
- [ ] Sitemap audit page loads correctly
- [ ] Form validation works
- [ ] Content gaps display correctly
- [ ] URL structure issues display correctly
- [ ] Severity/priority badges show right colors
- [ ] Mobile responsive design works

## Expected File Structure

```
src/
├── lib/
│   ├── sitemap-parser.ts                   ✅ NEW
│   ├── analysis/
│   │   ├── content-gap-analyzer.ts         ✅ NEW
│   │   └── url-structure-analyzer.ts       ✅ NEW
│   └── workflows/
│       └── sitemap-workflow.ts             ✅ NEW
├── components/
│   └── audit/
│       ├── content-gaps-display.tsx        ✅ NEW
│       └── url-structure-issues-display.tsx ✅ NEW
├── app/
│   ├── sitemap-audit/
│   │   └── page.tsx                        ✅ NEW
│   ├── api/
│   │   └── sitemap-audit/
│   │       └── route.ts                    ✅ NEW
│   ├── audits/
│   │   └── [id]/page.tsx                   ✅ UPDATED
│   └── dashboard/page.tsx                  ✅ UPDATED
└── types/index.ts                          ✅ UPDATED
```

## Success Criteria

Phase 4 is complete when:
- ✅ Sitemap parser handles regular and index sitemaps
- ✅ Content gap analysis works with Claude
- ✅ URL structure analyzer detects issues
- ✅ Sitemap workflow executes successfully
- ✅ API endpoint creates sitemap audits
- ✅ Sitemap audit page UI is functional
- ✅ Audit detail page shows sitemap results
- ✅ Content gaps display component works
- ✅ URL structure issues display component works
- ✅ Dashboard has sitemap audit button
- ✅ All TypeScript types are correct
- ✅ Code builds without errors
- ✅ Responsive design works on mobile

## Additional Resources

**fast-xml-parser Documentation:**
- https://github.com/NaturalIntelligence/fast-xml-parser

**Sitemap Protocol:**
- https://www.sitemaps.org/protocol.html

**Key Points:**
- Handle both regular sitemaps and sitemap indexes
- Use Claude for intelligent content gap analysis
- Provide actionable recommendations
- Show clear priority/severity indicators
- Make results easy to understand and act on

## Next Steps After Phase 4

Phase 5 will include:
- Status management workflows
- SIGNED status triggers
- Email notifications
- Slack integration

Focus on completing Phase 4 first!

---

**Start by reading the existing code structure, then implement the sitemap parser, Claude analysis, and UI components. Test thoroughly with various sitemap types.**
