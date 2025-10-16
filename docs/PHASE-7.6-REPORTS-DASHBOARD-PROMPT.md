# PHASE 7.6 (PHASE 6): Reports Dashboard & PDF Design Improvements

I'm continuing Phase 7 (UX Transformation) of my Sales SEO Audit Tool.

## PROJECT CONTEXT:
- Next.js 15 app with Tailwind CSS v4, shadcn/ui, Prisma, Clerk auth  
- Brand colors: Navy #002264 (primary), Orange #f78d30 (secondary)
- Reports feature already exists with basic functionality
- PDF generation works but needs visual branding improvements

## COMPLETED SO FAR:
✅ Phase 7.1: Sidebar navigation, app header, breadcrumbs, app shell layout
✅ Phase 7.2: Dashboard stats cards, score trend chart, status distribution chart
✅ Phase 7.3: Audit table view, view toggle, advanced filters, bulk actions, enhanced search
✅ Phase 7.4: Regular audit detail page with sticky header, tabs, score comparisons, activity timeline
✅ Phase 7.5: Skeleton loaders, empty states, progress rings, micro-interactions

## CURRENT STATE:
- Reports list page exists at `src/app/reports/page.tsx` (basic hero header + grid of report cards)
- Report detail page exists at `src/app/reports/[id]/page.tsx` (shows report details + PDF generation)
- PDF generator exists at `src/lib/pdf-generator.ts` (basic blue theme, needs Rival Digital branding)
- Report cards exist at `src/components/reports/report-card.tsx`

## OBJECTIVE - PHASE 7.6:
Enhance Reports dashboard with statistics, table view, and filters. Transform PDF exports with professional Rival Digital branding.

**Duration:** 90 minutes total
- Part A (Reports Dashboard): 45 min
- Part B (PDF Design): 45 min

---

## PART A: REPORTS DASHBOARD ENHANCEMENTS (45 min)

### 1. Add Report Statistics Cards (15 min)

**File:** `src/app/reports/page.tsx`

Add stats section **ABOVE** the existing hero header.

**Create 4 stat cards:**

```tsx
import { StatsCard } from '@/components/dashboard/stats-card';
import { FileStack, Calendar, Globe, BarChart3 } from 'lucide-react';

// Calculate statistics
const stats = useMemo(() => {
  if (!reports || reports.length === 0) {
    return {
      totalReports: 0,
      reportsThisMonth: 0,
      totalAudits: 0,
      avgReportSize: 0,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const reportsThisMonth = reports.filter(r => 
    new Date(r.createdAt) >= startOfMonth
  ).length;
  
  const totalAudits = reports.reduce((sum, r) => sum + r.audits.length, 0);
  const avgSize = Math.round(totalAudits / reports.length);

  return {
    totalReports: reports.length,
    reportsThisMonth,
    totalAudits,
    avgReportSize: avgSize,
  };
}, [reports]);

// Render stats grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slideUp">
  <StatsCard
    title="Total Reports"
    value={stats.totalReports}
    icon={FileStack}
    trend={{ value: 12, label: 'vs last month' }}
  />
  <StatsCard
    title="This Month"
    value={stats.reportsThisMonth}
    icon={Calendar}
    iconClassName="from-blue-100 to-blue-50 text-blue-600"
  />
  <StatsCard
    title="Total Audits"
    value={stats.totalAudits}
    icon={Globe}
    iconClassName="from-purple-100 to-purple-50 text-purple-600"
  />
  <StatsCard
    title="Avg Report Size"
    value={stats.avgReportSize}
    icon={BarChart3}
    iconClassName="from-green-100 to-green-50 text-green-600"
  />
</div>
```

### 2. Create Report Table View Component (20 min)

**File:** `src/components/reports/report-table-view.tsx`

Create a professional table view similar to audit-table-view:

```typescript
import { ReportWithAudits } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Eye, Download, Share2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ReportTableViewProps {
  reports: ReportWithAudits[];
  onDelete: (reportId: string) => void;
}

export function ReportTableView({ reports, onDelete }: ReportTableViewProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-primary text-primary-foreground">
          <tr>
            <th className="text-left p-4 font-semibold">Report Name</th>
            <th className="text-left p-4 font-semibold">Description</th>
            <th className="text-left p-4 font-semibold"># Audits</th>
            <th className="text-left p-4 font-semibold">Created</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-left p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="p-4">
                <Link 
                  href={`/reports/${report.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {report.name}
                </Link>
              </td>
              <td className="p-4 text-gray-600">
                {report.description 
                  ? report.description.substring(0, 100) + (report.description.length > 100 ? '...' : '')
                  : '-'}
              </td>
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {report.audits.length}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-600">
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </td>
              <td className="p-4">
                {report.pdfUrl ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Generated
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    Draft
                  </span>
                )}
              </td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/reports/${report.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </Link>
                    </DropdownMenuItem>
                    {report.pdfUrl && (
                      <DropdownMenuItem asChild>
                        <a href={report.pdfUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </a>
                      </DropdownMenuItem>
                    )}
                    {report.shareableLink && (
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy Share Link
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDelete(report.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 3. Add View Toggle & Filters (10 min)

**Update:** `src/app/reports/page.tsx`

Add filtering and view toggle controls:

```tsx
import { ViewToggle, useViewMode } from '@/components/audit/view-toggle';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

// State management
const [viewMode, setViewMode] = useViewMode('reports-view-mode');
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'generated'>('all');
const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

// Filter and sort logic
const filteredReports = useMemo(() => {
  if (!reports) return [];
  
  let filtered = [...reports];
  
  // Search filter
  if (searchQuery) {
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(r => 
      statusFilter === 'generated' ? r.pdfUrl !== null : r.pdfUrl === null
    );
  }
  
  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  
  return filtered;
}, [reports, searchQuery, statusFilter, sortBy]);

// Render controls
<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
  <div className="flex gap-4 flex-1 w-full">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search reports..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
    
    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Reports</SelectItem>
        <SelectItem value="draft">Draft</SelectItem>
        <SelectItem value="generated">Generated</SelectItem>
      </SelectContent>
    </Select>
    
    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest First</SelectItem>
        <SelectItem value="oldest">Oldest First</SelectItem>
        <SelectItem value="name">Name A-Z</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <ViewToggle value={viewMode} onChange={setViewMode} />
</div>

// Conditional rendering
{viewMode === 'grid' ? (
  <div className="grid gap-6 md:grid-cols-2 animate-slideUp">
    {filteredReports.map(report => (
      <ReportCard key={report.id} report={report} onDelete={handleDeleteClick} />
    ))}
  </div>
) : (
  <ReportTableView reports={filteredReports} onDelete={handleDeleteClick} />
)}
```

---

## PART B: PDF DESIGN IMPROVEMENTS (45 min)

### 4. Cover Page with Rival Digital Branding (15 min)

**File:** `src/lib/pdf-generator.ts`

**Update CSS** in `getReportStyles()`:

```css
/* REPLACE existing cover page styles with: */

.cover-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, #002264 0%, #003387 50%, #002264 100%);
  color: white;
  page-break-after: always;
  padding: 60px;
  text-align: center;
}

.cover-brand {
  margin-bottom: 40px;
}

.brand-logo {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #f78d30;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.brand-tagline {
  font-size: 18px;
  opacity: 0.95;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 300;
}

.cover-title {
  font-size: 64px;
  font-weight: bold;
  margin: 60px 0 30px;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.cover-description {
  font-size: 22px;
  margin: 0 auto 80px;
  max-width: 800px;
  opacity: 0.95;
  line-height: 1.7;
}

.cover-stats {
  margin: 80px 0;
}

.stat-large {
  display: inline-block;
  padding: 40px 80px;
  background: rgba(247, 141, 48, 0.15);
  border: 4px solid #f78d30;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.stat-number {
  font-size: 96px;
  font-weight: bold;
  color: #f78d30;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 24px;
  margin-top: 15px;
  opacity: 0.95;
  font-weight: 300;
}

.cover-meta {
  font-size: 18px;
  opacity: 0.85;
  line-height: 2;
  font-weight: 300;
}

.cover-footer {
  font-size: 16px;
  opacity: 0.75;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  padding-top: 30px;
  line-height: 2;
}

.cover-footer-brand {
  font-weight: 600;
  color: #f78d30;
  margin-bottom: 8px;
}
```

**Update** `generateCoverPage()`:

```typescript
function generateCoverPage(options: PDFGenerationOptions): string {
  return `
    <div class="cover-page">
      <!-- Rival Digital Branding -->
      <div class="cover-brand">
        <div class="brand-logo">RIVAL DIGITAL</div>
        <div class="brand-tagline">Sales SEO Audit Report</div>
      </div>

      <!-- Report Title -->
      <div class="cover-title">${escapeHtml(options.reportName)}</div>

      <!-- Description -->
      ${options.reportDescription ? `
        <div class="cover-description">${escapeHtml(options.reportDescription)}</div>
      ` : ''}

      <!-- Audit Count -->
      <div class="cover-stats">
        <div class="stat-large">
          <div class="stat-number">${options.audits.length}</div>
          <div class="stat-label">${options.audits.length === 1 ? 'Website' : 'Websites'} Analyzed</div>
        </div>
      </div>

      <!-- Generation Info -->
      <div class="cover-meta">
        <div><strong>Generated:</strong> ${formatDate(options.generatedDate)}</div>
        <div><strong>Prepared by:</strong> ${escapeHtml(options.generatedBy)}</div>
      </div>

      <!-- Footer -->
      <div class="cover-footer">
        <div class="cover-footer-brand">Rival Digital</div>
        <div>www.rivaldigital.com | Professional SEO Audit Services</div>
      </div>
    </div>
  `;
}
```

### 5. Executive Summary Enhancements (15 min)

**Add** to `getReportStyles()`:

```css
.overview-box {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 3px solid #002264;
  border-radius: 16px;
  padding: 40px;
  margin: 40px 0;
  box-shadow: 0 4px 12px rgba(0, 34, 100, 0.1);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 30px;
}

.overview-item {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.overview-label {
  font-size: 14px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  font-weight: 600;
}

.overview-value {
  font-size: 42px;
  font-weight: bold;
  color: #002264;
  line-height: 1;
}

.summary-table {
  margin: 40px 0;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-table thead th {
  background: #002264;
  color: white;
  font-weight: bold;
  padding: 18px;
  text-align: left;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.summary-table tbody tr {
  background: white;
}

.summary-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

.summary-table tbody td {
  padding: 16px 18px;
  border-bottom: 1px solid #e5e7eb;
}

.score-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
}

.score-badge.excellent {
  background: #10b981;
  color: white;
}

.score-badge.good {
  background: #3b82f6;
  color: white;
}

.score-badge.medium {
  background: #f59e0b;
  color: white;
}

.score-badge.poor {
  background: #ef4444;
  color: white;
}

.recommendations-section {
  margin: 40px 0;
}

.recommendation-priority {
  background: linear-gradient(to right, #fff7ed, #ffffff);
  border-left: 6px solid #f78d30;
  padding: 25px 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(247, 141, 48, 0.1);
}

.recommendation-priority h4 {
  color: #002264;
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.recommendation-priority p {
  color: #4b5563;
  margin: 0;
  line-height: 1.7;
  font-size: 15px;
}
```

**Update** `generateExecutiveSummary()`:

```typescript
function generateExecutiveSummary(options: PDFGenerationOptions): string {
  const avgSEO = calculateAverage(options.audits.map(a => a.seoScore));
  const avgA11y = calculateAverage(options.audits.map(a => a.accessibilityScore));
  const avgDesign = calculateAverage(options.audits.map(a => a.designScore));
  const totalKeywords = options.audits.reduce((sum, a) => sum + (a.totalKeywords || 0), 0);

  return `
    <div class="section">
      <h1>Executive Summary</h1>

      <!-- Overview Box -->
      <div class="overview-box">
        <h2 style="margin-top: 0;">Report Overview</h2>
        <div class="overview-grid">
          <div class="overview-item">
            <div class="overview-label">Websites Analyzed</div>
            <div class="overview-value">${options.audits.length}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Analysis Date</div>
            <div class="overview-value" style="font-size: 20px; font-weight: 600; color: #f78d30;">
              ${formatDate(options.generatedDate)}
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Total Keywords</div>
            <div class="overview-value">${totalKeywords.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Performance Summary Table -->
      <h2>Performance Summary</h2>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Website</th>
            <th>SEO Score</th>
            <th>Accessibility</th>
            <th>Design</th>
          </tr>
        </thead>
        <tbody>
          ${options.audits.map(audit => `
            <tr>
              <td class="url-text" style="font-weight: 600;">${truncateUrl(audit.url, 45)}</td>
              <td><span class="score-badge ${getScoreBadgeClass(audit.seoScore)}">${audit.seoScore || 'N/A'}</span></td>
              <td><span class="score-badge ${getScoreBadgeClass(audit.accessibilityScore)}">${audit.accessibilityScore || 'N/A'}</span></td>
              <td><span class="score-badge ${getScoreBadgeClass(audit.designScore ? audit.designScore * 10 : null)}">${audit.designScore || 'N/A'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Recommendations -->
      <h2>Priority Recommendations</h2>
      <div class="recommendations-section">
        ${generateTopRecommendations(options.audits, avgSEO, avgA11y, avgDesign)}
      </div>

      <!-- Overall Performance Scores -->
      <h2>Overall Performance</h2>
      <div class="scores-container">
        <div>
          <div class="score-circle ${getScoreClass(avgSEO)}">
            ${avgSEO}
          </div>
          <div style="text-align: center; margin-top: 15px; font-weight: bold; font-size: 16px;">SEO Score</div>
        </div>
        <div>
          <div class="score-circle ${getScoreClass(avgA11y)}">
            ${avgA11y}
          </div>
          <div style="text-align: center; margin-top: 15px; font-weight: bold; font-size: 16px;">Accessibility</div>
        </div>
        <div>
          <div class="score-circle ${getScoreClass(avgDesign)}">
            ${avgDesign}
          </div>
          <div style="text-align: center; margin-top: 15px; font-weight: bold; font-size: 16px;">Design</div>
        </div>
      </div>
    </div>
  `;
}
```

### 6. Add Helper Functions (15 min)

**Add** these functions to `pdf-generator.ts`:

```typescript
/**
 * Truncate URL for display
 */
function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname + urlObj.search;
    
    if (domain.length + path.length > maxLength) {
      const availableLength = maxLength - domain.length - 3;
      if (availableLength > 10) {
        return domain + path.substring(0, availableLength) + '...';
      }
      return domain + '...';
    }
    
    return domain + path;
  } catch {
    return url.substring(0, maxLength) + '...';
  }
}

/**
 * Get score badge class based on value
 */
function getScoreBadgeClass(score: number | null): string {
  if (score === null) return 'poor';
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'medium';
  return 'poor';
}

/**
 * Generate top recommendations based on scores
 */
function generateTopRecommendations(
  audits: AuditWithScores[],
  avgSEO: number,
  avgA11y: number,
  avgDesign: number
): string {
  const recommendations: string[] = [];

  // SEO Recommendation
  if (avgSEO < 70) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🎯 Improve SEO Performance</h4>
        <p>Average SEO score of ${avgSEO}/100 indicates significant optimization opportunities. Focus on meta tags, heading structure, keyword optimization, and content quality to improve search engine rankings.</p>
      </div>
    `);
  } else if (avgSEO < 85) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🎯 Optimize SEO Further</h4>
        <p>With an average SEO score of ${avgSEO}/100, you're performing well but there's room for improvement. Fine-tune technical SEO elements and enhance content strategy.</p>
      </div>
    `);
  }

  // Accessibility Recommendation
  if (avgA11y < 80) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>♿ Enhance Accessibility</h4>
        <p>Average accessibility score of ${avgA11y}/100 requires attention. Prioritize WCAG 2.1 Level AA compliance for better user experience, legal compliance, and broader audience reach.</p>
      </div>
    `);
  }

  // Design Recommendation
  if (avgDesign < 7) {
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🎨 Modernize Design</h4>
        <p>Average design score of ${avgDesign}/10 suggests design improvements are needed. Consider updating UI/UX elements, improving visual hierarchy, and ensuring mobile responsiveness.</p>
      </div>
    `);
  }

  // Keywords Recommendation
  const homepages = audits.filter(a => a.isHomepage);
  const withKeywords = homepages.filter(a => a.totalKeywords && a.totalKeywords > 0);
  
  if (homepages.length > 0 && withKeywords.length < homepages.length) {
    const missing = homepages.length - withKeywords.length;
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>🔑 Expand Keyword Strategy</h4>
        <p>${missing} homepage${missing > 1 ? 's' : ''} missing comprehensive keyword data. Conduct thorough keyword research to identify high-value search terms and optimize content accordingly.</p>
      </div>
    `);
  }

  // Low-performing sites
  const poorSEO = audits.filter(a => a.seoScore && a.seoScore < 60);
  if (poorSEO.length > 0) {
    const urls = poorSEO.map(a => truncateUrl(a.url, 30)).join(', ');
    recommendations.push(`
      <div class="recommendation-priority">
        <h4>⚠️ Address Critical SEO Issues</h4>
        <p>${poorSEO.length} site${poorSEO.length > 1 ? 's' : ''} (${urls}) scoring below 60/100 require immediate attention. These sites may be losing significant organic traffic.</p>
      </div>
    `);
  }

  return recommendations.length > 0 
    ? recommendations.join('') 
    : '<div class="recommendation-priority"><h4>✅ Excellent Overall Performance</h4><p>No critical recommendations at this time. Continue monitoring performance and implementing incremental improvements.</p></div>';
}
```

---

## IMPLEMENTATION ORDER:

### Phase A: Reports Dashboard (45 min)

1. **Stats Cards (15 min)**
   ✅ Calculate report statistics
   ✅ Add stats grid above hero
   ✅ Import StatsCard component
   ✅ Style with brand colors

2. **Table View Component (20 min)**
   ✅ Create report-table-view.tsx
   ✅ Add table with all columns
   ✅ Add action dropdown per row
   ✅ Style with navy header
   ✅ Add hover effects

3. **Filters & Toggle (10 min)**
   ✅ Add search input
   ✅ Add status filter (draft/generated)
   ✅ Add sort dropdown
   ✅ Add ViewToggle component
   ✅ Implement filter logic
   ✅ Conditionally render grid/table

### Phase B: PDF Improvements (45 min)

4. **Cover Page (15 min)**
   ✅ Update CSS with Rival Digital theme
   ✅ Add brand logo section
   ✅ Add navy/orange gradient
   ✅ Add footer with contact

5. **Executive Summary (15 min)**
   ✅ Add overview box CSS
   ✅ Add summary table CSS
   ✅ Add recommendations CSS
   ✅ Update generateExecutiveSummary()

6. **Helper Functions (15 min)**
   ✅ Add truncateUrl()
   ✅ Add getScoreBadgeClass()
   ✅ Add generateTopRecommendations()

---

## TECHNICAL REQUIREMENTS:

✅ Use existing components (StatsCard, ViewToggle)
✅ Match Rival Digital brand colors throughout
✅ TypeScript for all new code
✅ Responsive design (mobile, tablet, desktop)
✅ Accessible components (ARIA labels)
✅ Professional PDF output ready for clients

---

## SUCCESS CRITERIA:

### Reports Dashboard
✅ Statistics show above hero header
✅ View toggle works (grid/table)
✅ Table view is professional and clean
✅ Filters work correctly (search, status, sort)
✅ Responsive on all devices
✅ Build succeeds with no errors

### PDF Design
✅ Cover has Rival Digital branding
✅ Navy (#002264) and Orange (#f78d30) throughout
✅ Executive summary is comprehensive
✅ Summary table lists all audits
✅ Recommendations are relevant and helpful
✅ Professional appearance ready for clients

---

## TESTING CHECKLIST:

**Reports Dashboard:**
- [ ] Stats calculate correctly
- [ ] View toggle persists preference
- [ ] Search filters reports
- [ ] Status filter works
- [ ] Sort options work
- [ ] Table displays all columns
- [ ] Actions dropdown works
- [ ] Responsive on mobile

**PDF Generation:**
- [ ] Cover page shows Rival Digital
- [ ] Brand colors throughout
- [ ] Executive summary complete
- [ ] Performance table accurate
- [ ] Recommendations relevant
- [ ] PDFs download successfully
- [ ] File sizes reasonable (<10MB)

---

**Start with Reports Dashboard to see immediate UI improvements, then enhance PDF for professional client deliverables!**
