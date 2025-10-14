# Phase 3: Homepage Detection & SEMRush Integration

## Context

Navigate to `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool`

**IMPORTANT: Read these documentation files first:**
1. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Claude-Code-Setup-Prompt.md` - Architecture and setup details
2. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Sales-SEO-Audit-Tool-SRS.md` - Complete requirements specification
3. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Development-Checklist.md` - Phase-by-phase implementation

**Current Status:**
- ✅ Phase 1 Complete: Core infrastructure, API routes, audit workflow, Puppeteer, Claude integration
- ✅ Phase 2 Complete: Dashboard, audit detail views, React Query, all UI components
- ⏳ Phase 3 Starting: Homepage detection & SEMRush integration

## Your Task - Phase 3: Homepage Detection & SEMRush Integration

Phase 3 adds intelligent homepage detection and SEMRush keyword data integration to provide deeper insights for homepage audits.

### Priority 1: SEMRush API Integration

**File: `src/lib/semrush.ts`**

Create a SEMRush API wrapper with the following functions:

```typescript
import axios from 'axios';

const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY;
const SEMRUSH_BASE_URL = 'https://api.semrush.com';

export interface SEMRushDomainData {
  totalKeywords: number;
  organicTraffic: number;
  organicCost: number;
  paidTraffic: number;
  backlinks: number;
}

export interface KeywordTrendDataPoint {
  month: string; // Format: "2024-01"
  keywords: number;
  traffic?: number;
}

export interface TopPage {
  url: string;
  traffic: number;
  keywords: number;
  position: number;
}

// Get domain overview data
export async function getDomainOverview(domain: string): Promise<SEMRushDomainData>

// Get keyword count trend for last 12 months
export async function getKeywordTrend(domain: string): Promise<KeywordTrendDataPoint[]>

// Get top 5 pages by organic traffic
export async function getTopPages(domain: string, limit: number = 5): Promise<TopPage[]>

// Combined function to fetch all homepage data
export async function getHomepageData(domain: string): Promise<{
  totalKeywords: number;
  keywordTrendData: KeywordTrendDataPoint[];
  topPages: TopPage[];
}>
```

**SEMRush API Endpoints:**
- Domain Overview: `/analytics/v1/`
- Keyword Trend: `/analytics/v1/domain_rank_history`
- Top Pages: `/analytics/v1/domain_organic_organic`

**Requirements:**
- Handle API errors gracefully (return empty data if SEMRush fails)
- Add rate limiting (max 10 requests per second)
- Cache results (to avoid duplicate API calls)
- Log all API calls for debugging
- Validate domain format before making requests

### Priority 2: Update Audit Workflow

**File: `src/lib/workflows/audit-workflow.ts`**

Update the `executeAudit` function to:

1. **Check if URL is a homepage** (already implemented via `isHomepage()`)
2. **If homepage detected**, fetch SEMRush data:
   ```typescript
   if (homepage) {
     console.log(`[Audit ${auditId}] Homepage detected, fetching SEMRush data...`);
     try {
       const domain = new URL(url).hostname;
       const semrushData = await getHomepageData(domain);

       homepageData = {
         isHomepage: true,
         totalKeywords: semrushData.totalKeywords,
         keywordTrendData: semrushData.keywordTrendData,
         topPages: semrushData.topPages,
       };
     } catch (error) {
       console.error(`[Audit ${auditId}] SEMRush data fetch failed:`, error);
       // Continue with audit even if SEMRush fails
       homepageData = {
         isHomepage: true,
         totalKeywords: 0,
         keywordTrendData: [],
         topPages: [],
       };
     }
   }
   ```

3. **Store SEMRush data** in the audit record (already has fields in Prisma schema)

### Priority 3: Keyword Trend Chart Component

**File: `src/components/audit/keyword-trend-chart.tsx`**

Create a chart component using Recharts to visualize keyword trends:

```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordTrendDataPoint } from '@/types';
import { format, parseISO } from 'date-fns';

interface KeywordTrendChartProps {
  data: KeywordTrendDataPoint[];
}

export function KeywordTrendChart({ data }: KeywordTrendChartProps) {
  // Transform data for chart
  // Format dates for display
  // Show keyword count over 12 months
  // Add tooltip with formatted values
}
```

**Requirements:**
- Show 12-month keyword trend
- Format dates as "Jan 2024", "Feb 2024", etc.
- Color: Blue line for keywords
- Responsive (works on mobile)
- Show tooltip on hover with exact values
- Handle empty data gracefully

### Priority 4: Top Pages Component

**File: `src/components/audit/top-pages-table.tsx`**

Create a component to display top performing pages:

```typescript
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TopPage } from '@/types';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopPagesTableProps {
  pages: TopPage[];
  domain: string;
}

export function TopPagesTable({ pages, domain }: TopPagesTableProps) {
  // Display table of top 5 pages
  // Show: URL, Traffic, Keywords, Position
  // Add link to view page
  // Format numbers with commas (e.g., 1,234)
}
```

**Requirements:**
- Show top 5 pages by traffic
- Columns: URL, Organic Traffic, Keywords, Avg Position
- Make URLs clickable (open in new tab)
- Format large numbers with commas
- Responsive table (stack on mobile)
- Show "No data available" if empty

### Priority 5: Update Audit Detail Page

**File: `src/app/audits/[id]/page.tsx`**

Add a new section for homepage-specific data **after the Technical Details section**:

```typescript
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
          {/* Add more metrics here */}
        </div>
      </CardContent>
    </Card>

    {/* Keyword Trend Chart */}
    {audit.keywordTrendData && (audit.keywordTrendData as KeywordTrendDataPoint[]).length > 0 && (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Keyword Trend (12 Months)</CardTitle>
          <CardDescription>
            Organic keyword ranking history over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeywordTrendChart data={audit.keywordTrendData as KeywordTrendDataPoint[]} />
        </CardContent>
      </Card>
    )}

    {/* Top Pages Table */}
    {audit.topPages && (audit.topPages as TopPage[]).length > 0 && (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Performing Pages</CardTitle>
          <CardDescription>
            Pages with highest organic traffic and keyword rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopPagesTable
            pages={audit.topPages as TopPage[]}
            domain={new URL(audit.url).hostname}
          />
        </CardContent>
      </Card>
    )}
  </>
)}
```

**Requirements:**
- Only show section if `audit.isHomepage === true`
- Add icon and "Homepage Detected" badge
- Display total keywords metric prominently
- Show keyword trend chart (if data exists)
- Show top pages table (if data exists)
- Handle missing SEMRush data gracefully (show "Data unavailable")

### Priority 6: Dashboard Audit Card Updates

**File: `src/components/audit/audit-card.tsx`**

Add a small homepage indicator badge:

```typescript
{audit.isHomepage && (
  <Badge variant="outline" className="text-xs">
    <Globe className="w-3 h-3 mr-1" />
    Homepage
  </Badge>
)}
```

Position this next to the status badge in the card header.

## Implementation Notes

### Environment Variables

Ensure `.env.local` has:
```env
SEMRUSH_API_KEY="your-semrush-api-key"
```

### Testing Without SEMRush API Key

If you don't have a SEMRush API key, the code should:
1. Log a warning: "SEMRush API key not configured"
2. Continue with audit (skip SEMRush data)
3. Set `totalKeywords: 0, keywordTrendData: [], topPages: []`
4. Not crash or block audit completion

### Database Schema (Already Complete)

The Prisma schema already has these fields in the Audit model:
- `isHomepage Boolean @default(false)`
- `totalKeywords Int?`
- `keywordTrendData Json?`
- `topPages Json?`

### Key Design Principles

1. **Graceful Degradation**: If SEMRush API fails, audit should still complete
2. **Progressive Enhancement**: Homepage data enhances the audit but isn't required
3. **User Experience**: Clear indicators when homepage is detected
4. **Data Visualization**: Charts should be intuitive and professional
5. **Mobile Responsive**: All new components must work on mobile

## Testing Instructions

### Test Homepage Detection

1. Create audit with homepage URL: `https://example.com`
   - Should detect homepage
   - Should attempt to fetch SEMRush data
   - Should display homepage section

2. Create audit with subpage URL: `https://example.com/about`
   - Should NOT detect homepage
   - Should skip SEMRush integration
   - Should NOT show homepage section

### Test SEMRush Integration

1. **With API Key:**
   - Create homepage audit
   - Verify SEMRush data appears in database
   - Check keyword trend chart renders
   - Check top pages table populates

2. **Without API Key:**
   - Set `SEMRUSH_API_KEY=""` in `.env.local`
   - Create homepage audit
   - Should complete successfully
   - Should show "Data unavailable" messages

### Test Error Handling

1. Test with invalid domain
2. Test with SEMRush rate limiting
3. Test with network timeout
4. Verify audit completes in all cases

## Expected File Structure After Phase 3

```
src/
├── lib/
│   ├── semrush.ts                          ✅ NEW
│   └── workflows/
│       └── audit-workflow.ts               ✅ UPDATED
├── components/
│   └── audit/
│       ├── keyword-trend-chart.tsx         ✅ NEW
│       ├── top-pages-table.tsx             ✅ NEW
│       └── audit-card.tsx                  ✅ UPDATED
└── app/
    └── audits/
        └── [id]/
            └── page.tsx                    ✅ UPDATED
```

## Success Criteria

Phase 3 is complete when:
- ✅ SEMRush API wrapper is functional
- ✅ Homepage detection works correctly
- ✅ SEMRush data is fetched for homepages
- ✅ Keyword trend chart displays properly
- ✅ Top pages table shows data
- ✅ Audit detail page shows homepage section
- ✅ Dashboard shows homepage badge
- ✅ Graceful fallback when SEMRush unavailable
- ✅ All TypeScript types are correct
- ✅ Code builds without errors
- ✅ Responsive design works on mobile

## Additional Resources

**SEMRush API Documentation:**
- https://www.semrush.com/api-documentation/

**Recharts Documentation:**
- https://recharts.org/en-US/

**Key Points:**
- Recharts is already installed in package.json
- Use date-fns for date formatting (already installed)
- Follow existing shadcn/ui patterns for consistency
- Add console logs for debugging
- Handle errors gracefully

## Next Steps After Phase 3

Phase 4 will include:
- Sitemap audit feature
- Content gap analysis
- URL structure analysis

But focus on completing Phase 3 first!

---

**Start by reading the documentation files, then implement the SEMRush integration and UI components. Test thoroughly with and without API keys.**
