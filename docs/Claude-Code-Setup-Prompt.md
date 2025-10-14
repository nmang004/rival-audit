# Sales-SEO Audit Tool - Project Setup and Development

## Project Overview

You are tasked with building a comprehensive Sales-SEO Audit & Analysis Tool that automates website auditing, provides AI-powered analysis, and streamlines workflows between Sales and SEO teams. This is a full-stack Next.js application with AI integration.

**Key Documents:**
- Software Requirements Specification (SRS) - Contains complete functional and non-functional requirements
- Interactive Wireframes - Visual reference for all UI screens

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Data Fetching:** React Query (TanStack Query)
- **Charts:** Recharts or Chart.js

### Backend
- **API:** Next.js API Routes (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Clerk

### Integrations & Services
- **AI Analysis:** Anthropic Claude API (Sonnet 4.5) with vision
- **Web Rendering:** Puppeteer (headless Chrome)
- **SEO Data:** SEMRush API
- **Accessibility Testing:** axe-core, pa11y
- **Email:** SendGrid
- **Notifications:** Slack Web API
- **File Storage:** AWS S3 or Vercel Blob Storage
- **Excel Generation:** ExcelJS
- **PDF Generation:** Puppeteer PDF or jsPDF
- **XML Parsing:** fast-xml-parser

### Deployment
- **Hosting:** Vercel
- **Database:** Supabase or Railway
- **Environment:** Node.js 18+

## Phase 1: Initial Setup (Start Here)

### Step 1: Initialize Next.js Project

```bash
npx create-next-app@latest sales-seo-audit-tool --typescript --tailwind --app --src-dir
cd sales-seo-audit-tool
```

### Step 2: Install Core Dependencies

```bash
# UI Components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card badge dialog select textarea table tabs

# Data & State Management
npm install @tanstack/react-query @tanstack/react-query-devtools

# Database & ORM
npm install prisma @prisma/client
npm install -D prisma

# Authentication
npm install @clerk/nextjs

# API Clients
npm install @anthropic-ai/sdk axios

# Web Scraping & Analysis
npm install puppeteer
npm install @axe-core/puppeteer pa11y

# Charting
npm install recharts

# File Processing
npm install exceljs fast-xml-parser

# Email & Notifications
npm install @sendgrid/mail @slack/web-api

# Utilities
npm install date-fns zod
```

### Step 3: Set Up Prisma Database Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String
  role      Role     @default(SALES)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  audits    Audit[]
  reports   Report[]
}

enum Role {
  SALES
  ADMIN
  PROJECT_MANAGER
}

model Audit {
  id                  String      @id @default(cuid())
  url                 String
  status              AuditStatus @default(PROPOSAL)
  
  // Audit Results
  seoScore            Int?
  accessibilityScore  Int?
  designScore         Int?
  claudeAnalysis      String?     @db.Text
  screenshotDesktop   String?
  screenshotMobile    String?
  
  // Homepage-specific data (only for domain-level audits)
  isHomepage          Boolean     @default(false)
  totalKeywords       Int?
  keywordTrendData    Json?
  topPages            Json?
  
  // SEMRush Data (populated when status = SIGNED)
  semrushData         Json?
  excelReportUrl      String?
  
  // Sitemap Audit Data
  isSitemapAudit      Boolean     @default(false)
  sitemapUrls         Json?
  contentGaps         Json?
  urlStructureIssues  Json?
  
  // Metadata
  createdBy           User        @relation(fields: [createdById], references: [id])
  createdById         String
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  
  // Client Info
  clientName          String?
  clientEmail         String?
  
  notes               Note[]
  statusHistory       StatusChange[]
  reportAudits        ReportAudit[]
}

enum AuditStatus {
  PROPOSAL
  INITIAL_CALL
  SIGNED
  IN_PROGRESS
  COMPLETED
}

model StatusChange {
  id          String      @id @default(cuid())
  audit       Audit       @relation(fields: [auditId], references: [id], onDelete: Cascade)
  auditId     String
  fromStatus  AuditStatus
  toStatus    AuditStatus
  changedBy   String
  changedAt   DateTime    @default(now())
  notes       String?
}

model Note {
  id        String   @id @default(cuid())
  audit     Audit    @relation(fields: [auditId], references: [id], onDelete: Cascade)
  auditId   String
  content   String   @db.Text
  createdBy String
  createdAt DateTime @default(now())
}

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

Initialize Prisma:

```bash
npx prisma init
npx prisma generate
npx prisma db push
```

### Step 4: Set Up Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/seo_audit_tool"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# SEMRush API
SEMRUSH_API_KEY="your-semrush-key"

# SendGrid
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="audits@yourcompany.com"

# Slack
SLACK_BOT_TOKEN="xoxb-..."
SLACK_CHANNEL_ID="C1234567890"

# Email Recipients
PROJECT_MANAGER_EMAIL="pm@yourcompany.com"
WEB_TEAM_EMAIL="webteam@yourcompany.com"

# Storage (AWS S3 or Vercel Blob)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="your-bucket"
AWS_REGION="us-east-1"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 5: Set Up Clerk Authentication

1. Install Clerk:
```bash
npm install @clerk/nextjs
```

2. Create `src/middleware.ts`:

```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks(.*)"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

3. Wrap app with ClerkProvider in `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Step 6: Create Basic Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── api/
│   │   ├── audits/
│   │   │   ├── route.ts                    # GET, POST /api/audits
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PATCH /api/audits/:id
│   │   │       ├── run/route.ts            # POST /api/audits/:id/run
│   │   │       └── status/route.ts         # PATCH /api/audits/:id/status
│   │   ├── sitemap-audit/
│   │   │   └── route.ts                    # POST /api/sitemap-audit
│   │   ├── reports/
│   │   │   ├── route.ts                    # GET, POST /api/reports
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PATCH, DELETE
│   │   │       └── generate/route.ts       # POST /api/reports/:id/generate
│   │   └── webhooks/
│   │       └── clerk/route.ts              # Clerk webhook handler
│   ├── dashboard/
│   │   └── page.tsx                        # Main dashboard
│   ├── audits/
│   │   └── [id]/page.tsx                   # Audit detail view
│   ├── reports/
│   │   ├── page.tsx                        # Reports list
│   │   ├── new/page.tsx                    # Create new report
│   │   └── [id]/page.tsx                   # Report detail
│   └── sitemap-audit/
│       └── page.tsx                        # Sitemap audit interface
├── components/
│   ├── ui/                                 # shadcn/ui components
│   ├── audit-card.tsx
│   ├── audit-form.tsx
│   ├── status-badge.tsx
│   ├── keyword-trend-chart.tsx
│   └── ...
├── lib/
│   ├── prisma.ts                           # Prisma client singleton
│   ├── claude.ts                           # Claude API wrapper
│   ├── puppeteer.ts                        # Puppeteer utilities
│   ├── semrush.ts                          # SEMRush API wrapper
│   ├── email.ts                            # Email utilities
│   ├── slack.ts                            # Slack utilities
│   ├── storage.ts                          # File storage utilities
│   └── workflows/
│       ├── audit-workflow.ts               # Main audit execution
│       ├── semrush-workflow.ts             # Signed status workflow
│       └── sitemap-workflow.ts             # Sitemap analysis
└── types/
    └── index.ts                            # TypeScript types
```

## Phase 2: Core Audit Functionality

### Priority 1: Basic Audit Creation

1. **Create API endpoint** `/api/audits` (POST)
   - Accept URL input
   - Validate URL format
   - Create audit record in database
   - Return audit ID

2. **Create audit execution workflow** `lib/workflows/audit-workflow.ts`
   - Use Puppeteer to render page (desktop and mobile)
   - Capture screenshots
   - Run axe-core accessibility tests
   - Extract SEO data (title, meta, headers, etc.)
   - Upload screenshots to S3/Vercel Blob
   - Return structured audit data

3. **Integrate Claude Vision API** `lib/claude.ts`
   - Send screenshots to Claude Sonnet 4.5
   - Request UI/UX analysis
   - Parse and store Claude's response
   - Generate scored recommendations

### Priority 2: Homepage Detection & SEMRush Integration

1. **Homepage detection logic**
   ```typescript
   function isHomepage(url: string): boolean {
     const parsed = new URL(url);
     return parsed.pathname === '/' || parsed.pathname === '';
   }
   ```

2. **SEMRush conditional integration** `lib/semrush.ts`
   - If homepage detected:
     - Fetch total keyword count
     - Fetch keyword history (12 months)
     - Fetch top 5 pages by traffic
     - Store in audit record

3. **Keyword trend visualization**
   - Create Recharts component for trend graph
   - Display on audit detail page when `isHomepage === true`

### Priority 3: Sitemap Audit Feature

1. **Create sitemap parser** `lib/workflows/sitemap-workflow.ts`
   - Parse XML sitemap
   - Extract all URLs
   - Crawl each URL (with rate limiting)
   - Analyze URL structure
   - Identify content gaps using Claude
   - Detect missing essential pages

2. **Create sitemap audit UI** `app/sitemap-audit/page.tsx`
   - Input field for sitemap URL
   - Progress indicator during crawl
   - Results display with issues categorized

## Phase 3: Status Management & Workflows

### Priority 4: Status Change Workflow

1. **Create status change API** `/api/audits/[id]/status` (PATCH)
   - Validate status transition
   - Log status change to StatusChange table
   - If new status is SIGNED:
     - Trigger SEMRush workflow
     - Generate Excel report
     - Send email notifications
     - Post to Slack

2. **SEMRush signed workflow** `lib/workflows/semrush-workflow.ts`
   - Fetch keyword data
   - Generate Excel with ExcelJS
   - Send to Claude for strategic analysis
   - Email PM and Web Team
   - Post to Slack channel

## Phase 4: Multi-URL Reports

### Priority 5: Report Creation

1. **Create report management API** `/api/reports`
   - Create report with multiple audits
   - Reorder audits within report
   - Generate shareable link

2. **PDF generation** `lib/pdf-generator.ts`
   - Use Puppeteer to render combined report
   - Include table of contents
   - Include all selected audits
   - Upload PDF to storage
   - Return download URL

3. **Report UI** `app/reports/`
   - List all user reports
   - Create new report interface
   - Select audits to include
   - Generate PDF button

## Phase 5: Polish & Deployment

### Priority 6: Testing & Refinement

1. Add loading states
2. Error handling
3. Toast notifications
4. Responsive design verification
5. Performance optimization

### Priority 7: Deployment

1. Set up Vercel project
2. Configure environment variables
3. Set up production database
4. Configure custom domain
5. Test production deployment

## Key Implementation Notes

### Homepage Detection Logic
```typescript
// In audit-workflow.ts
const url = new URL(inputUrl);
const isHomepage = url.pathname === '/' || url.pathname === '';

if (isHomepage) {
  // Fetch SEMRush data
  const semrushData = await fetchSEMRushHomepageData(url.hostname);
  auditData.isHomepage = true;
  auditData.totalKeywords = semrushData.totalKeywords;
  auditData.keywordTrendData = semrushData.trends;
  auditData.topPages = semrushData.topPages;
}
```

### Claude Vision Integration
```typescript
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export async function analyzeWithClaude(
  desktopScreenshot: Buffer,
  mobileScreenshot: Buffer,
  auditData: any
) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: desktopScreenshot.toString('base64')
          }
        },
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: mobileScreenshot.toString('base64')
          }
        },
        {
          type: "text",
          text: `Analyze this website for a sales team audit report.
          
          URL: ${auditData.url}
          
          ACCESSIBILITY FINDINGS:
          - Total violations: ${auditData.a11yViolations.length}
          
          Please provide:
          1. Design Modernity Score (1-10)
          2. UI/UX Analysis
          3. Accessibility Impact
          4. Top 5 Recommendations
          5. Competitive Assessment`
        }
      ]
    }]
  });

  return message.content[0].text;
}
```

### Puppeteer Configuration
```typescript
// lib/puppeteer.ts
import puppeteer from 'puppeteer';

export async function captureWebsite(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Desktop capture
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  const desktopScreenshot = await page.screenshot({ 
    fullPage: true,
    type: 'png'
  });

  // Mobile capture
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  const mobileScreenshot = await page.screenshot({ 
    fullPage: true,
    type: 'png'
  });

  await browser.close();

  return { desktopScreenshot, mobileScreenshot };
}
```

## Development Workflow

1. **Start with Phase 1** - Get the basic project structure set up
2. **Build incrementally** - Complete each priority in order
3. **Test frequently** - Verify each feature works before moving on
4. **Refer to wireframes** - Match UI to the provided designs
5. **Follow SRS** - All requirements are documented in detail

## Commands Reference

```bash
# Development
npm run dev

# Database
npx prisma studio              # Open Prisma Studio
npx prisma generate            # Regenerate Prisma Client
npx prisma db push             # Push schema changes
npx prisma migrate dev         # Create and run migration

# Build & Deploy
npm run build
npm run start

# Testing
npm run lint
npm run type-check
```

## Important Notes

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use TypeScript strictly** - Enable strict mode in tsconfig.json
3. **Error boundaries** - Wrap components in error boundaries
4. **Rate limiting** - Implement rate limits for external API calls
5. **Caching** - Cache Claude and SEMRush responses when appropriate
6. **Security** - Validate all user inputs, sanitize URLs
7. **Performance** - Use React Query for data fetching and caching
8. **Accessibility** - Ensure UI meets WCAG 2.1 AA standards

## Getting Help

- **Prisma docs:** https://www.prisma.io/docs
- **Next.js docs:** https://nextjs.org/docs
- **Clerk docs:** https://clerk.com/docs
- **Anthropic docs:** https://docs.anthropic.com
- **shadcn/ui:** https://ui.shadcn.com

## Next Steps

Start by setting up the basic project structure (Phase 1), then move systematically through each phase. The SRS document contains detailed requirements for every feature. The wireframes show exactly how each screen should look and behave.

Begin with: `npx create-next-app@latest sales-seo-audit-tool --typescript --tailwind --app --src-dir`

Good luck! 🚀
