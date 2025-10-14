# Continue Development - Phase 2

## Quick Start Prompt for Claude Code

Copy and paste this into your next Claude Code session:

---

```
Navigate to /Users/nickmangubat/Documents/Coding/sales-seo-audit-tool

I need you to continue building the Sales-SEO Audit Tool. Phase 1 (core infrastructure) is complete and committed to git.

**IMPORTANT: Read these documentation files first:**
1. docs/Sales-SEO-Audit-Tool-SRS.docx - Complete requirements specification
2. docs/Development-Checklist.md - Phase-by-phase implementation checklist
3. docs/Claude-Code-Setup-Prompt.md - Architecture and setup details

**What's Already Built (Phase 1 Complete - 12/16 tasks):**
- ✅ Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui (13 components)
- ✅ Prisma schema: User, Audit, Report, StatusChange, Note models
- ✅ Clerk authentication with webhooks (src/middleware.ts, src/app/api/webhooks/clerk/route.ts)
- ✅ Complete audit workflow engine (src/lib/workflows/audit-workflow.ts)
- ✅ Puppeteer screenshot capture + axe-core accessibility testing (src/lib/puppeteer.ts)
- ✅ Claude Sonnet 4.5 vision integration for UI/UX analysis (src/lib/claude.ts)
- ✅ RESTful API routes:
  - POST /api/audits - Create & execute audit
  - GET /api/audits - List user audits
  - GET /api/audits/[id] - Get audit details
  - PATCH /api/audits/[id] - Update audit
  - DELETE /api/audits/[id] - Delete audit
- ✅ File storage utilities with S3-ready implementation (src/lib/storage.ts)
- ✅ Homepage detection logic for SEMRush integration
- ✅ Complete TypeScript types (src/types/index.ts)

**Your Task - Phase 2: Dashboard & Audit Views**

### Priority 1: Dashboard Page (src/app/dashboard/page.tsx)

Create a professional dashboard for sales teams with:

1. **Audit Creation Section**
   - Form with URL input (required, validated)
   - Optional client name and email fields
   - Submit button that calls POST /api/audits
   - Loading state during submission
   - Success/error toast notifications (use sonner)

2. **Audit List View**
   - Grid or table layout displaying all audits
   - For each audit show:
     - URL (clickable to detail page)
     - Status badge (color-coded by AuditStatus)
     - Three scores: SEO, Accessibility, Design (with visual indicators)
     - Client name (if provided)
     - Created date (formatted with date-fns)
     - Action buttons (view, delete)
   - Loading skeleton states
   - Empty state when no audits exist

3. **Filtering & Search**
   - Filter by status (dropdown)
   - Search by URL or client name
   - Sort by date, score

4. **Data Fetching**
   - Use React Query (@tanstack/react-query)
   - Fetch from GET /api/audits
   - Auto-refresh every 10 seconds (for audit progress)
   - Optimistic updates on create/delete

### Priority 2: Audit Detail Page (src/app/audits/[id]/page.tsx)

Create a comprehensive audit results view:

1. **Header Section**
   - URL being audited
   - Status badge with change dropdown
   - Client info (if provided)
   - Created/updated timestamps

2. **Scores Dashboard**
   - Three prominent score cards:
     - SEO Score (0-100)
     - Accessibility Score (0-100)
     - Design Score (0-100)
   - Visual indicators (progress circles or bars)
   - Color-coded (green > 80, yellow 50-80, red < 50)

3. **Screenshots Section**
   - Side-by-side desktop and mobile screenshots
   - Responsive layout (stack on mobile)
   - Click to expand/lightbox (optional)

4. **Claude AI Analysis**
   - Parse JSON from audit.claudeAnalysis field:
     ```typescript
     const analysis = JSON.parse(audit.claudeAnalysis);
     // Contains: analysis, strengths, weaknesses, recommendations
     ```
   - Display comprehensive analysis text
   - Show strengths as green badges/cards
   - Show weaknesses as red badges/cards
   - Display 5 recommendations as actionable list

5. **Technical Details (Expandable)**
   - SEO Data: metaTitle, metaDescription, h1Tags
   - Accessibility violations (if any)
   - Core Web Vitals
   - Homepage-specific data (if isHomepage === true)

6. **Status Management**
   - Dropdown to change status:
     - PROPOSAL → INITIAL_CALL → SIGNED → IN_PROGRESS → COMPLETED
   - Calls PATCH /api/audits/[id] on change
   - Shows confirmation toast

### Priority 3: Reusable Components

Create these in src/components/audit/:

1. **audit-card.tsx**
   - Card component for displaying audit in grid/list
   - Props: audit object, onDelete callback
   - Shows URL, scores, status, actions

2. **audit-form.tsx**
   - Form component for creating new audits
   - Uses react-hook-form + zod validation
   - Handles submission to POST /api/audits

3. **status-badge.tsx**
   - Badge component for AuditStatus
   - Color mapping:
     - PROPOSAL: gray
     - INITIAL_CALL: blue
     - SIGNED: green
     - IN_PROGRESS: yellow
     - COMPLETED: green

4. **score-display.tsx**
   - Visual score indicator (circular progress or bar)
   - Props: score (0-100), label, color

### Implementation Notes

**TypeScript Types:**
```typescript
import { Audit, AuditStatus } from '@prisma/client';
import { AuditWithRelations } from '@/types';
```

**API Usage:**
```typescript
// Fetch audits
const { data } = useQuery({
  queryKey: ['audits'],
  queryFn: async () => {
    const res = await fetch('/api/audits');
    const json = await res.json();
    return json.data;
  },
  refetchInterval: 10000, // Poll every 10s for updates
});

// Create audit
const mutation = useMutation({
  mutationFn: async (data: { url: string; clientName?: string; clientEmail?: string }) => {
    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
});
```

**Parsing Claude Analysis:**
```typescript
const claudeData = JSON.parse(audit.claudeAnalysis || '{}');
// claudeData.analysis - Full text analysis
// claudeData.strengths - Array of strengths
// claudeData.weaknesses - Array of weaknesses
// claudeData.recommendations - Array of recommendations
```

**Status Values:**
```typescript
enum AuditStatus {
  PROPOSAL = 'PROPOSAL',
  INITIAL_CALL = 'INITIAL_CALL',
  SIGNED = 'SIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
```

**Key Files to Reference:**
- prisma/schema.prisma - Database structure
- src/types/index.ts - TypeScript types
- src/app/api/audits/route.ts - API endpoint implementation
- src/lib/workflows/audit-workflow.ts - Audit execution logic
- docs/Sales-SEO-Audit-Tool-SRS.docx - Full requirements
- docs/Development-Checklist.md - Implementation checklist

**Design Guidelines:**
- Professional, clean UI suitable for sales presentations
- Use shadcn/ui components consistently
- Responsive design (mobile-first)
- Loading states for all async operations
- Error handling with user-friendly messages
- Accessibility (WCAG 2.1 AA)

**Testing:**
Before building UI, test the API:
```bash
# Create test audit
curl -X POST http://localhost:3000/api/audits \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "clientName": "Test Client"}'

# List audits
curl http://localhost:3000/api/audits
```

Start with the dashboard page. Make it polished and production-ready. Reference the docs for complete requirements and wireframe guidance.
```

---

## Development Environment Setup

If starting fresh, run:
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Make sure `.env.local` has all required variables (see `.env.example`).
