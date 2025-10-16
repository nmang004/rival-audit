# PHASE 7.5 PROMPT: Sitemap Audit Page Redesign

I'm continuing Phase 7 (UX Transformation) of my Sales SEO Audit Tool.

## PROJECT CONTEXT:
- Next.js 15 app with Tailwind CSS v4, shadcn/ui, Prisma, Clerk auth
- Brand colors: Navy #002264 (primary), Orange #f78d30 (secondary)
- Already completed: Phase 7.1-7.4 (Sidebar, Dashboard, Audit List, Regular Audit Detail)

## COMPLETED SO FAR:
✅ Phase 7.1: Sidebar navigation, app header, breadcrumbs, app shell layout
✅ Phase 7.2: Dashboard stats cards, score trend chart, status distribution chart
✅ Phase 7.3: Audit table view, view toggle, advanced filters, bulk actions, enhanced search
✅ Phase 7.4: Regular audit detail page with sticky header, tabs, score comparisons, activity timeline

## NEXT TASK - PHASE 7.5: Sitemap Audit Page Redesign (30-45 min)

Please read the current sitemap audit implementation in `src/app/audits/[id]/page.tsx` (lines 116-279).

## OBJECTIVE:
Apply the same professional UX improvements to the sitemap audit view to match the regular audit detail page design from Phase 7.4.

## BUILD THE FOLLOWING:

### 1. Reuse Sticky Header Component
- Use the existing `AuditDetailHeader` component (already created in Phase 7.4)
- Replace the custom header and back button in the sitemap view
- Ensure all action buttons work correctly (Export PDF, Share, Delete)

### 2. Create Tabbed Navigation for Sitemap Audits
Update the sitemap audit section in `src/app/audits/[id]/page.tsx` to include tabs:

**Tab Structure:**
- **Overview Tab** (default):
  - Sitemap overview stats (Total URLs, Content Gaps, Structure Issues)
  - Claude AI analysis summary
  - Key metrics visualization

- **Content Gaps Tab**:
  - Display ContentGapsDisplay component
  - Organize by priority (High/Medium/Low)
  - Add filtering/sorting options

- **URL Structure Tab**:
  - Display UrlStructureIssuesDisplay component
  - Organize by severity (High/Medium/Low)
  - Add filtering/sorting options

- **Sitemap URLs Tab**:
  - Display list of all URLs from the sitemap
  - Table with columns: URL, Last Modified, Change Frequency, Priority
  - Pagination (show 50 URLs per page)
  - Search/filter functionality

- **History Tab**:
  - Reuse the `AuditActivityTimeline` component
  - Show audit creation, status changes, exports

### 3. Create Sitemap URL List Component
**File:** `src/components/audit/sitemap-url-list.tsx`

Features:
- Table view of sitemap URLs
- Columns: URL (clickable), Last Modified, Change Frequency, Priority
- Sortable columns
- Search/filter bar
- Pagination controls
- URL count indicator
- Export to CSV button

### 4. Enhance Overview Tab
Create better visual organization:
- Larger stat cards with icons and animations
- Claude analysis in a prominent card with border accent
- Health score indicator (based on gaps + issues)
- Quick action buttons (Export, Re-analyze)

### 5. Update Styling
Apply consistent branding:
- Use same sticky tab bar design from regular audit page
- Match card styles and hover effects
- Use brand gradient backgrounds where appropriate
- Ensure responsive design (mobile, tablet, desktop)
- Add smooth transitions and animations

## TECHNICAL REQUIREMENTS:

### Hash Navigation
- Implement URL hash navigation (`#overview`, `#content-gaps`, `#url-structure`, `#urls`, `#history`)
- Update browser URL when switching tabs
- Read hash on page load to show correct tab
- Use same pattern as Phase 7.4

### State Management
- Use React hooks (useState, useEffect) for tab state
- Follow same pattern as regular audit page
- IMPORTANT: Place hooks BEFORE any conditional returns (avoid React Hooks rules violations)

### Component Reuse
- Reuse `AuditDetailHeader` component
- Reuse `AuditActivityTimeline` component
- Reuse `ContentGapsDisplay` component
- Reuse `UrlStructureIssuesDisplay` component

### Type Safety
- Use existing types from `src/types/index.ts`
- Properly type all props and state
- Handle nullable data gracefully

### Data Handling
- Parse `audit.sitemapUrls` to display individual URLs
- Handle cases where data is missing or incomplete
- Show appropriate empty states

## SITEMAP DATA STRUCTURE:

```typescript
// From audit record:
audit.sitemapUrls: {
  totalUrls: number;
  urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: number;
  }>;
}

audit.contentGaps: ContentGap[]
audit.urlStructureIssues: UrlStructureIssue[]
audit.claudeAnalysis: string (plain text summary)
```

## IMPLEMENTATION STEPS:

1. **Create Sitemap URL List Component** (15 min)
   - Build table with sorting and pagination
   - Add search/filter functionality
   - Include export button (can show "Coming soon" toast for now)

2. **Update Sitemap Audit Section** (20 min)
   - Replace custom header with `AuditDetailHeader`
   - Add tabbed navigation structure
   - Organize existing content into tabs
   - Implement hash navigation

3. **Enhance Overview Tab** (10 min)
   - Improve stat card styling
   - Add health score visualization
   - Better layout for Claude analysis

4. **Test and Polish** (5 min)
   - Verify all tabs work
   - Test hash navigation
   - Check responsive design
   - Ensure no TypeScript errors

## EXAMPLE CODE STRUCTURE:

```tsx
// Inside sitemap audit conditional block
if (audit.isSitemapAudit) {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'content-gaps', 'url-structure', 'urls', 'history'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.pushState(null, '', `#${value}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Sticky Header */}
      <AuditDetailHeader audit={audit} />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Tabbed Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="sticky top-[80px] z-30 bg-white/95 backdrop-blur-sm shadow-sm mb-8 -mx-4 px-4 py-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content-gaps">Content Gaps</TabsTrigger>
              <TabsTrigger value="url-structure">URL Structure</TabsTrigger>
              <TabsTrigger value="urls">Sitemap URLs</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content... */}
        </Tabs>
      </div>
    </div>
  );
}
```

## SUCCESS CRITERIA:

- ✅ Sticky header visible and functional
- ✅ All 5 tabs render correctly
- ✅ Hash navigation works (#overview, #content-gaps, etc.)
- ✅ Sitemap URLs display in table format with pagination
- ✅ Activity timeline shows audit history
- ✅ Responsive on mobile, tablet, desktop
- ✅ Build succeeds with no TypeScript errors
- ✅ Styling matches regular audit page consistency
- ✅ All existing data remains accessible
- ✅ No duplicate breadcrumbs (use only parent layout breadcrumbs)

## STYLING GUIDELINES:

Use existing design system from `src/app/globals.css`:
- `.card-hover-effect` for card interactions
- `.button-scale` for button animations
- `.sage-bg-subtle` for Claude analysis sections
- `.animate-fadeIn` / `.animate-slideUp` for entrance animations
- Purple color scheme for sitemap-specific elements
- Navy/Orange for primary actions and accents

## NOTES:

- **DO NOT** create a separate page file - update the existing sitemap audit section
- **DO NOT** add breadcrumbs to AuditDetailHeader (already removed in Phase 7.4)
- **REUSE** existing components wherever possible
- Follow the same code patterns as the regular audit page in Phase 7.4
- Handle edge cases (no URLs, no gaps, no issues) with friendly empty states

---

**Start with the Sitemap URL List component, then apply the tabbed structure!**
