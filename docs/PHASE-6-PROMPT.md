# Phase 6: Multi-URL Report Compilation & PDF Generation

## Context

Navigate to `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool`

**IMPORTANT: Read these documentation files first:**
1. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Claude-Code-Setup-Prompt.md` - Architecture and setup details
2. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Sales-SEO-Audit-Tool-SRS.md` - Complete requirements specification
3. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/docs/Development-Checklist.md` - Phase-by-phase implementation
4. `/Users/nickmangubat/Documents/Coding/sales-seo-audit-tool/PHASE-5-COMPLETE.md` - Phase 5 completion summary

**Current Status:**
- ✅ Phase 1 Complete: Core infrastructure, API routes, audit workflow, Puppeteer, Claude integration
- ✅ Phase 2 Complete: Dashboard, audit detail views, React Query, all UI components
- ✅ Phase 3 Complete: Homepage detection & SEMRush integration with placeholder data
- ✅ Phase 4 Complete: Sitemap audit feature with content gap analysis
- ✅ Phase 5 Complete: Status management workflows, email notifications, Slack integration
- ⏳ Phase 6 Starting: Multi-URL report compilation, PDF generation, shareable links

## Your Task - Phase 6: Multi-URL Reports & PDF Generation

Phase 6 implements the ability to create comprehensive reports that combine multiple audit URLs into a single, professional PDF document. This enables sales teams to present cohesive proposals that analyze an entire client ecosystem (main site, blog, landing pages, etc.) in one deliverable.

### Priority 1: Report Management API

**File: `src/app/api/reports/route.ts`**

Create complete CRUD operations for reports:

```typescript
// GET /api/reports - List all reports for the authenticated user
export async function GET(request: NextRequest): Promise<NextResponse>

// POST /api/reports - Create a new report
export async function POST(request: NextRequest): Promise<NextResponse>
```

**Request Body for POST:**
```typescript
{
  name: string;          // Report title
  description?: string;  // Optional description
  auditIds: string[];   // Array of audit IDs to include
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    reportAudits: {
      audit: Audit;
      order: number;
    }[];
  }
}
```

**Requirements:**
- Validate user authentication via Clerk
- Ensure all audit IDs belong to the user
- Create Report with ReportAudit junction records
- Set proper ordering (0, 1, 2, etc.)
- Return full report with included audits
- Error handling for invalid audit IDs

---

**File: `src/app/api/reports/[id]/route.ts`**

Individual report operations:

```typescript
// GET /api/reports/[id] - Get single report with all audits
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse>

// PATCH /api/reports/[id] - Update report (name, description, audit order)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse>

// DELETE /api/reports/[id] - Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse>
```

**PATCH Request Body:**
```typescript
{
  name?: string;
  description?: string;
  auditIds?: string[];  // Re-order or add/remove audits
}
```

**Requirements:**
- Check user owns the report
- Update report metadata
- Handle audit reordering (delete and recreate ReportAudit records)
- Validate all audit IDs
- Return updated report with audits

### Priority 2: PDF Generation Service

**File: `src/lib/pdf-generator.ts`**

Create a comprehensive PDF generator using Puppeteer:

```typescript
export interface PDFGenerationOptions {
  reportId: string;
  reportName: string;
  reportDescription?: string;
  audits: AuditWithScores[];
  generatedBy: string;
  generatedDate: Date;
}

export interface AuditWithScores {
  id: string;
  url: string;
  clientName?: string;
  seoScore: number | null;
  accessibilityScore: number | null;
  designScore: number | null;
  claudeAnalysis: string | null;
  screenshotDesktop?: string;
  screenshotMobile?: string;
  isHomepage: boolean;
  totalKeywords?: number;
  createdAt: Date;
}

// Generate PDF report from multiple audits
export async function generatePDFReport(
  options: PDFGenerationOptions
): Promise<Buffer>
```

**PDF Structure:**

1. **Cover Page**
   - Report title (large, centered)
   - Report description
   - Number of URLs analyzed
   - Generated date
   - Company branding placeholder
   - Table of contents with page numbers

2. **Executive Summary** (1 page)
   - Overall performance metrics
   - Average scores (SEO, Accessibility, Design)
   - Key findings summary
   - Quick recommendations

3. **Per-Audit Sections** (2-3 pages each)
   - URL and client name
   - Performance scores (visual circular progress)
   - Desktop and mobile screenshots (side-by-side)
   - AI analysis highlights
   - Top recommendations (bullet points)
   - Homepage data (if applicable):
     - Total keywords
     - Keyword trend chart (embedded image)
     - Top pages table

4. **Appendix** (Optional)
   - Technical details
   - Methodology explanation
   - Contact information

**Styling Requirements:**
- Professional corporate theme
- Blue primary color (#2563eb)
- Clean typography (Arial/Helvetica)
- Consistent spacing and margins
- Page numbers on all pages except cover
- Headers with report name
- Color-coded scores (green/yellow/red)
- High-quality screenshot rendering

**Implementation Approach:**
```typescript
// Use Puppeteer to render HTML to PDF
import puppeteer from 'puppeteer';

async function generatePDFReport(options: PDFGenerationOptions): Promise<Buffer> {
  // 1. Generate complete HTML string
  const html = generateReportHTML(options);

  // 2. Launch Puppeteer browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 3. Set content and wait for images to load
  await page.setContent(html, {
    waitUntil: 'networkidle0',
  });

  // 4. Generate PDF with proper formatting
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px 0;">
        <span style="color: #666;">${options.reportName}</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px 0;">
        <span style="color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  await browser.close();

  return Buffer.from(pdf);
}
```

**HTML Template Helper:**
```typescript
function generateReportHTML(options: PDFGenerationOptions): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        /* Professional PDF styling */
        @page {
          size: A4;
          margin: 0;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          padding: 0;
        }

        .cover-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          page-break-after: always;
        }

        .cover-title {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .section {
          page-break-before: always;
          padding: 40px;
        }

        .audit-section {
          page-break-before: always;
          padding: 40px;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin: 10px;
        }

        .score-good { background: #10b981; color: white; }
        .score-medium { background: #f59e0b; color: white; }
        .score-poor { background: #ef4444; color: white; }

        .screenshot {
          max-width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin: 20px 0;
        }

        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        h1 { color: #111827; font-size: 32px; margin-bottom: 20px; }
        h2 { color: #374151; font-size: 24px; margin-top: 30px; margin-bottom: 15px; }
        h3 { color: #4b5563; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }

        .recommendation {
          background: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      ${generateCoverPage(options)}
      ${generateExecutiveSummary(options)}
      ${options.audits.map(audit => generateAuditSection(audit)).join('')}
    </body>
    </html>
  `;
}
```

### Priority 3: PDF Generation API Endpoint

**File: `src/app/api/reports/[id]/generate/route.ts`**

```typescript
// POST /api/reports/[id]/generate - Generate PDF for report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse>
```

**Workflow:**
1. Fetch report with all audits (ordered)
2. Validate user owns report
3. Generate PDF using pdf-generator service
4. Upload PDF to storage
5. Update report record with pdfUrl
6. Return success with PDF URL

**Response:**
```typescript
{
  success: true,
  data: {
    pdfUrl: string;
    generatedAt: Date;
  }
}
```

**Requirements:**
- Check authentication
- Verify report ownership
- Fetch all audits with scores and screenshots
- Generate PDF asynchronously if large (>5 audits)
- Upload to storage
- Update database
- Return download URL

### Priority 4: Shareable Report Links

**File: `src/app/api/reports/[id]/share/route.ts`**

```typescript
// POST /api/reports/[id]/share - Generate shareable link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse>

// DELETE /api/reports/[id]/share - Revoke shareable link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse>
```

**Shareable Link Generation:**
- Generate unique token (UUID v4 or nanoid)
- Store in `shareableLink` field
- No expiration (manual revoke only)
- Public access (no auth required)

**Response:**
```typescript
{
  success: true,
  data: {
    shareableLink: string;  // "https://app.com/reports/share/abc123xyz"
    publicUrl: string;       // Full URL for sharing
  }
}
```

---

**File: `src/app/reports/share/[token]/page.tsx`**

Public report view page (no authentication required):

```typescript
export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
})
```

**Requirements:**
- Look up report by shareableLink token
- If not found, show 404
- Display report name and description
- Show all audits with scores
- Display screenshots (if available)
- Include download PDF button
- NO editing capabilities
- Clean, professional layout
- Watermark: "Generated by [Company Name]"

### Priority 5: Reports List Page

**File: `src/app/reports/page.tsx`**

Dashboard for managing all reports:

```typescript
'use client';

export default function ReportsPage()
```

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Reports                                   [+ New Report]│
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Report Name                          [Edit] [Delete] │ │
│  │ 5 URLs • Created Oct 14, 2025                        │ │
│  │ Description text here...                             │ │
│  │                                                       │ │
│  │ [Generate PDF]  [Share Link]  [View Details]         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Another Report                       [Edit] [Delete] │ │
│  │ 3 URLs • Created Oct 12, 2025                        │ │
│  │ ...                                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- List all user reports (React Query)
- Show report metadata (name, description, audit count, created date)
- Actions per report:
  - Generate PDF (shows loading state)
  - Share link (copy to clipboard)
  - View details (navigate to detail page)
  - Edit (inline or modal)
  - Delete (with confirmation)
- Empty state when no reports
- Loading skeleton
- Search/filter functionality

**Components to Create:**
- `<ReportCard>` - Individual report card
- `<CreateReportDialog>` - Modal for creating new report
- `<DeleteReportDialog>` - Confirmation modal
- `<ShareLinkDialog>` - Show and copy shareable link

### Priority 6: Create Report Page

**File: `src/app/reports/new/page.tsx`**

Wizard-style interface for creating a new report:

```typescript
'use client';

export default function CreateReportPage()
```

**Steps:**

**Step 1: Report Details**
```
┌─────────────────────────────────────────┐
│  Create New Report                       │
├─────────────────────────────────────────┤
│                                           │
│  Report Name *                            │
│  [________________________]              │
│                                           │
│  Description (optional)                   │
│  [________________________]              │
│  [________________________]              │
│                                           │
│                    [Cancel]  [Next →]    │
└─────────────────────────────────────────┘
```

**Step 2: Select Audits**
```
┌─────────────────────────────────────────────────┐
│  Select Audits to Include                        │
├─────────────────────────────────────────────────┤
│                                                   │
│  Search: [____________]  Filter: [All ▾]         │
│                                                   │
│  ☑ example.com               SEO: 85 A11y: 78   │
│  ☐ example.com/about         SEO: 72 A11y: 68   │
│  ☑ example.com/services      SEO: 88 A11y: 82   │
│  ☑ blog.example.com          SEO: 90 A11y: 85   │
│  ☐ example.com/contact       SEO: 65 A11y: 60   │
│                                                   │
│  Selected: 3 audits                              │
│                                                   │
│                   [← Back]  [Next →]             │
└─────────────────────────────────────────────────┘
```

**Step 3: Reorder Audits**
```
┌─────────────────────────────────────────────────┐
│  Arrange Audit Order                             │
├─────────────────────────────────────────────────┤
│                                                   │
│  Drag to reorder:                                │
│                                                   │
│  ⋮⋮ 1. example.com                              │
│  ⋮⋮ 2. example.com/services                     │
│  ⋮⋮ 3. blog.example.com                         │
│                                                   │
│                                                   │
│                   [← Back]  [Create Report]      │
└─────────────────────────────────────────────────┘
```

**Requirements:**
- Three-step wizard with progress indicator
- Form validation (report name required)
- Fetch user's audits
- Checkbox selection
- Drag-and-drop reordering (use `@dnd-kit/core`)
- Create report on final step
- Navigate to report detail on success
- Loading states throughout

### Priority 7: Report Detail Page

**File: `src/app/reports/[id]/page.tsx`**

Detailed view of a single report:

```typescript
'use client';

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
})
```

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Reports                                            │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Report Name                           [Edit] [Delete] [Share]│
│  Description text here...                                     │
│  3 URLs • Created Oct 14, 2025 • Updated Oct 14, 2025        │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PDF Report                                             │  │
│  │  Status: ○ Not Generated / ✓ Generated                 │  │
│  │                                                          │  │
│  │  [Generate PDF]  or  [Download PDF]                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Shareable Link                                         │  │
│  │  Public URL: https://app.com/reports/share/abc123      │  │
│  │                                                          │  │
│  │  [Copy Link]  [Revoke Access]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  Included Audits (3)                                          │
│                                                                │
│  1. example.com                      SEO: 85  A11y: 78  D: 8 │
│     Created Oct 12, 2025              [View Audit]            │
│                                                                │
│  2. example.com/services             SEO: 88  A11y: 82  D: 9 │
│     Created Oct 13, 2025              [View Audit]            │
│                                                                │
│  3. blog.example.com                 SEO: 90  A11y: 85  D: 9 │
│     Created Oct 14, 2025              [View Audit]            │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Display report metadata
- PDF generation status
- Generate PDF button (with loading state)
- Download PDF button (if generated)
- Shareable link management
  - Generate link
  - Copy to clipboard
  - Revoke access
- List of included audits (in order)
- Quick view of audit scores
- Link to individual audit details
- Edit report (name, description, audits)
- Delete report (with confirmation)

### Priority 8: Install Required Packages

```bash
npm install nanoid @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Packages:**
- `nanoid` - Generate unique shareable link tokens
- `@dnd-kit/core` - Drag and drop functionality
- `@dnd-kit/sortable` - Sortable list component
- `@dnd-kit/utilities` - Helper utilities for DnD

### Priority 9: Storage Service Enhancement

**File: Update `src/lib/storage.ts`**

Add PDF upload function:

```typescript
/**
 * Upload PDF report to storage
 * Returns public URL for download
 */
export async function uploadPDF(
  buffer: Buffer,
  filename: string,
  reportId: string
): Promise<string>
```

**Requirements:**
- Upload to public/uploads directory (or S3 in production)
- Generate unique filename with timestamp
- Set proper MIME type (application/pdf)
- Return full public URL
- Error handling

### Priority 10: Types Enhancement

**File: Update `src/types/index.ts`**

Add report-related types:

```typescript
export type ReportWithAudits = Report & {
  createdBy: User;
  reportAudits: {
    audit: Audit;
    order: number;
  }[];
};

export interface PDFGenerationResult {
  pdfUrl: string;
  generatedAt: Date;
  fileSize: number;
}

export interface ShareableLinkInfo {
  shareableLink: string;
  publicUrl: string;
  createdAt: Date;
}
```

## Implementation Notes

### Database Schema
The Prisma schema already includes Report and ReportAudit models:

```prisma
model Report {
  id              String        @id @default(cuid())
  name            String
  description     String?       @db.Text
  createdBy       User          @relation(fields: [createdById], references: [id])
  createdById     String
  pdfUrl          String?
  shareableLink   String?       @unique
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  reportAudits    ReportAudit[]
}

model ReportAudit {
  id        String   @id @default(cuid())
  report    Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)
  reportId  String
  audit     Audit    @relation(fields: [auditId], references: [id], onDelete: Cascade)
  auditId   String
  order     Int

  @@unique([reportId, auditId])
}
```

No migrations needed!

### PDF Generation Strategy

**Option 1: Server-Side Rendering (Recommended)**
- Use Puppeteer to render HTML to PDF
- Full control over styling
- Can include embedded images
- Works with complex layouts
- File size: 2-5 MB per report

**Option 2: Client-Side with jsPDF (Alternative)**
- Generate PDF in browser
- Faster for simple reports
- Limited styling capabilities
- Difficult with images
- Not recommended for this use case

**We'll use Option 1 (Puppeteer)** as it provides the best quality and flexibility.

### Shareable Link Security

**Approach:**
- Generate unique token using `nanoid(21)` (URL-safe, 21 chars)
- Store in `shareableLink` field (unique index)
- Public access route: `/reports/share/[token]`
- No expiration (manual revoke only)
- Revoke by setting `shareableLink` to null

**Example:**
```typescript
import { nanoid } from 'nanoid';

const token = nanoid(21); // e.g., "V1StGXR8_Z5jdHi6B-myT"
const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reports/share/${token}`;
```

### Drag and Drop Implementation

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableAudit({ audit, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: audit.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {index + 1}. {audit.url}
    </div>
  );
}

function AuditReorder({ audits, onReorder }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = audits.findIndex(a => a.id === active.id);
      const newIndex = audits.findIndex(a => a.id === over.id);
      const newAudits = arrayMove(audits, oldIndex, newIndex);
      onReorder(newAudits);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={audits.map(a => a.id)} strategy={verticalListSortingStrategy}>
        {audits.map((audit, i) => (
          <SortableAudit key={audit.id} audit={audit} index={i} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### Performance Considerations

**PDF Generation:**
- Generate asynchronously for reports with >5 audits
- Show loading state during generation
- Cache generated PDFs (don't regenerate unless audits change)
- Consider background job queue for large reports

**Image Handling:**
- Screenshots are already stored in storage
- Embed as base64 in PDF for reliability
- Optimize image size before embedding
- Consider lazy loading in public view

### Error Handling

**PDF Generation Failures:**
- Timeout after 60 seconds
- Retry once on failure
- Show clear error message to user
- Log detailed error for debugging
- Fallback: offer individual audit downloads

**Report Creation Failures:**
- Validate all audit IDs exist
- Check user owns all audits
- Ensure at least 1 audit selected
- Handle duplicate audit IDs

## Expected File Structure

```
src/
├── app/
│   ├── api/
│   │   └── reports/
│   │       ├── route.ts                          ✅ NEW
│   │       └── [id]/
│   │           ├── route.ts                      ✅ NEW
│   │           ├── generate/
│   │           │   └── route.ts                  ✅ NEW
│   │           └── share/
│   │               └── route.ts                  ✅ NEW
│   └── reports/
│       ├── page.tsx                              ✅ NEW
│       ├── new/
│       │   └── page.tsx                          ✅ NEW
│       ├── [id]/
│       │   └── page.tsx                          ✅ NEW
│       └── share/
│           └── [token]/
│               └── page.tsx                      ✅ NEW
├── components/
│   └── reports/
│       ├── report-card.tsx                       ✅ NEW
│       ├── create-report-dialog.tsx              ✅ NEW
│       ├── delete-report-dialog.tsx              ✅ NEW
│       ├── share-link-dialog.tsx                 ✅ NEW
│       └── audit-selector.tsx                    ✅ NEW
├── lib/
│   ├── pdf-generator.ts                          ✅ NEW
│   └── storage.ts                                ✅ UPDATED
└── types/
    └── index.ts                                  ✅ UPDATED
```

## Success Criteria

Phase 6 is complete when:
- ✅ Users can create reports with multiple audits
- ✅ Reports list page shows all user reports
- ✅ Report detail page displays all information
- ✅ PDF generation works and produces professional output
- ✅ Shareable links can be generated and revoked
- ✅ Public report view works without authentication
- ✅ Drag and drop reordering functions correctly
- ✅ All CRUD operations work properly
- ✅ PDFs upload to storage successfully
- ✅ Error handling is comprehensive
- ✅ UI is responsive and polished
- ✅ Code builds without errors

## Testing Checklist

### Report CRUD Operations
- [ ] Create report with multiple audits
- [ ] Create report with single audit
- [ ] Update report name and description
- [ ] Reorder audits in report
- [ ] Add audits to existing report
- [ ] Remove audits from report
- [ ] Delete report (soft or hard delete)
- [ ] List all user reports
- [ ] Filter/search reports

### PDF Generation
- [ ] Generate PDF for single audit report
- [ ] Generate PDF for multi-audit report
- [ ] PDF includes all sections (cover, summary, audits)
- [ ] Screenshots render correctly in PDF
- [ ] Scores display with proper formatting
- [ ] Page numbers appear correctly
- [ ] Headers and footers render
- [ ] PDF downloads successfully
- [ ] PDF file size is reasonable (<10 MB)

### Shareable Links
- [ ] Generate shareable link
- [ ] Copy link to clipboard
- [ ] Access report via public link
- [ ] Public view shows all data correctly
- [ ] Public view has no edit capabilities
- [ ] Revoke shareable link
- [ ] Revoked link shows 404
- [ ] Invalid token shows 404

### UI/UX
- [ ] Reports list page loads quickly
- [ ] Empty state shows when no reports
- [ ] Create report wizard flows smoothly
- [ ] Drag and drop reordering works
- [ ] Loading states appear during async operations
- [ ] Error messages are clear
- [ ] Success toasts appear on actions
- [ ] Responsive design works on mobile
- [ ] Navigation is intuitive

### Edge Cases
- [ ] Report with 0 audits (should fail validation)
- [ ] Report with 20+ audits (performance test)
- [ ] Duplicate audit IDs handled
- [ ] User tries to access other user's report
- [ ] PDF generation timeout handled
- [ ] Storage upload failure handled
- [ ] Network errors during creation

## Next Steps After Phase 6

Phase 7 (Future Enhancements):
- Email delivery of PDF reports
- Custom PDF templates
- Bulk report generation
- Report scheduling/automation
- Analytics and tracking
- White-label branding options

Focus on completing Phase 6 first!

---

**Start by implementing the report management API, then build the PDF generator, followed by the UI components. Test thoroughly with both small and large reports.**
