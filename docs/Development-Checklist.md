# Sales-SEO Audit Tool - Development Checklist

## Phase 1: Project Setup ⏳

- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Install all core dependencies
- [ ] Set up Prisma with PostgreSQL database
- [ ] Create and push database schema
- [ ] Configure Clerk authentication
- [ ] Set up middleware for protected routes
- [ ] Install and configure shadcn/ui components
- [ ] Create basic project folder structure
- [ ] Set up environment variables (.env.local)
- [ ] Configure Prisma client singleton

## Phase 2: Core Audit Functionality ⏳

### 2.1 Basic Audit Creation
- [ ] Create dashboard page with URL input form
- [ ] Build `/api/audits` POST endpoint
- [ ] Implement URL validation
- [ ] Create Audit record in database
- [ ] Return audit ID to frontend

### 2.2 Audit Execution Workflow
- [ ] Set up Puppeteer configuration
- [ ] Implement page rendering (desktop + mobile)
- [ ] Capture and save screenshots
- [ ] Run axe-core accessibility tests
- [ ] Extract SEO data (title, meta, headers)
- [ ] Calculate Core Web Vitals
- [ ] Upload screenshots to storage (S3/Vercel Blob)
- [ ] Store structured audit data

### 2.3 Claude Vision Integration
- [ ] Create Claude API wrapper (`lib/claude.ts`)
- [ ] Send screenshots to Claude Sonnet 4.5
- [ ] Format prompt for UI/UX analysis
- [ ] Parse Claude's response
- [ ] Generate design modernity score
- [ ] Store analysis in database
- [ ] Display results on audit detail page

### 2.4 Audit Detail View
- [ ] Create audit detail page (`/audits/[id]`)
- [ ] Display audit scores (SEO, Accessibility, Design)
- [ ] Show desktop and mobile screenshots
- [ ] Render Claude's analysis
- [ ] Display recommendations
- [ ] Add status badge
- [ ] Implement export PDF button

## Phase 3: Homepage Detection & SEMRush ⏳

### 3.1 Homepage Detection Logic
- [ ] Implement `isHomepage()` function
- [ ] Check URL path in audit workflow
- [ ] Set `isHomepage` flag in database

### 3.2 SEMRush Integration (Conditional)
- [ ] Create SEMRush API wrapper (`lib/semrush.ts`)
- [ ] Fetch total keyword count
- [ ] Fetch 12-month keyword trend data
- [ ] Fetch top 5 pages by traffic
- [ ] Store data in audit record (`keywordTrendData`, `topPages`)

### 3.3 Homepage UI Components
- [ ] Create keyword trend chart component (Recharts)
- [ ] Build top pages display component
- [ ] Show homepage-specific data conditionally
- [ ] Add "Homepage Detected" indicator
- [ ] Display total keywords metric

## Phase 4: Sitemap Audit Feature ⏳

### 4.1 Sitemap Parser
- [ ] Create sitemap workflow (`lib/workflows/sitemap-workflow.ts`)
- [ ] Parse XML sitemap using fast-xml-parser
- [ ] Extract all URLs from sitemap
- [ ] Implement URL crawling with rate limiting
- [ ] Analyze URL structure patterns

### 4.2 Content Gap Analysis
- [ ] Send sitemap data to Claude for analysis
- [ ] Identify missing essential pages
- [ ] Detect content gaps vs competitors
- [ ] Find URL structure inconsistencies
- [ ] Store findings in database

### 4.3 Sitemap Audit UI
- [ ] Create sitemap audit page (`/sitemap-audit`)
- [ ] Add sitemap URL input form
- [ ] Show crawling progress indicator
- [ ] Display analysis results
- [ ] Show URL count statistics
- [ ] List critical issues and warnings
- [ ] Display content gaps
- [ ] Show URL structure problems

## Phase 5: Status Management & Workflows ⏳

### 5.1 Status Change System
- [ ] Create status change API (`/api/audits/[id]/status`)
- [ ] Implement status validation
- [ ] Log changes to StatusChange table
- [ ] Update audit status in database
- [ ] Add status change UI component

### 5.2 SIGNED Status Workflow
- [ ] Create SEMRush workflow (`lib/workflows/semrush-workflow.ts`)
- [ ] Fetch comprehensive keyword data
- [ ] Generate Excel report (ExcelJS)
  - [ ] Create "Top Keywords" sheet
  - [ ] Create "Top Pages" sheet
  - [ ] Style headers and formatting
- [ ] Upload Excel to storage
- [ ] Send data to Claude for strategic analysis
- [ ] Format analysis results

### 5.3 Email Notifications
- [ ] Create email utility (`lib/email.ts`)
- [ ] Configure SendGrid
- [ ] Design email template
- [ ] Send to Project Manager
- [ ] Send to Web Team
- [ ] Include Excel attachment
- [ ] Include audit summary

### 5.4 Slack Notifications
- [ ] Create Slack utility (`lib/slack.ts`)
- [ ] Configure Slack Bot
- [ ] Design Slack message with blocks
- [ ] Add action buttons
- [ ] Post to designated channel

## Phase 6: Multi-URL Reports ⏳

### 6.1 Report Management
- [ ] Create reports list page (`/reports`)
- [ ] Create new report page (`/reports/new`)
- [ ] Build report creation API (`/api/reports`)
- [ ] Implement audit selection interface
- [ ] Add reorder functionality (drag & drop)
- [ ] Save report with audit relationships

### 6.2 PDF Generation
- [ ] Create PDF generator (`lib/pdf-generator.ts`)
- [ ] Generate combined report HTML
- [ ] Add table of contents
- [ ] Include executive summary
- [ ] Add individual audit sections
- [ ] Use Puppeteer to convert to PDF
- [ ] Upload PDF to storage

### 6.3 Report Sharing
- [ ] Generate unique shareable link
- [ ] Create public report view page
- [ ] Implement link expiration (optional)
- [ ] Add download PDF button
- [ ] Track report views/downloads

### 6.4 Report Management UI
- [ ] Display user's reports list
- [ ] Show report details
- [ ] Add edit/delete functionality
- [ ] Add duplicate report feature
- [ ] Show audit count and creation date

## Phase 7: Professional UX Transformation ⏳

**📖 See detailed documentation:** `docs/PHASE-7-UX-TRANSFORMATION.md`
**⚡ Quick checklist:** `docs/PHASE-7-QUICK-CHECKLIST.md`

### 7.1 Navigation & Layout Architecture (30-45 min)
- [ ] Sidebar navigation component
- [ ] App header with search
- [ ] App shell layout wrapper
- [ ] Breadcrumb navigation
- [ ] Update root layout

### 7.2 Dashboard Enhancements (45-60 min)
- [ ] Statistics overview cards
- [ ] Score trend chart (Recharts)
- [ ] Status distribution chart
- [ ] Quick actions panel
- [ ] Activity timeline
- [ ] Full dashboard redesign

### 7.3 Audit List View Improvements (45-60 min)
- [ ] Audit table view component
- [ ] Grid/Table view toggle
- [ ] Advanced filters panel
- [ ] Bulk operations bar
- [ ] Enhanced search with autocomplete
- [ ] Sortable columns

### 7.4 Audit Detail Page Redesign (30-45 min)
- [ ] Sticky header with actions
- [ ] Tabbed navigation (Overview, SEO, A11y, Performance)
- [ ] Score comparison component
- [ ] Activity timeline
- [ ] Hash-based navigation

### 7.5 Visual Design Enhancements (30-45 min)
- [ ] Skeleton loading components
- [ ] Enhanced empty states
- [ ] Micro-interactions
- [ ] Progress indicators
- [ ] Chart theming (Recharts)
- [ ] Install dependencies: recharts, etc.

### 7.6 Reports Dashboard (30 min)
- [ ] Reports statistics cards
- [ ] Report table view
- [ ] Grid/Table toggle for reports
- [ ] Advanced filters for reports

### 7.7 Responsive Design
- [ ] Test on mobile devices
- [ ] Verify tablet layouts
- [ ] Adjust navigation for mobile
- [ ] Optimize charts for small screens
- [ ] Test all forms on mobile

### 7.8 Error Handling
- [ ] Add error boundaries
- [ ] Implement retry logic
- [ ] Show user-friendly error messages
- [ ] Log errors for debugging
- [ ] Handle API timeouts gracefully

### 7.9 Accessibility
- [ ] Test with screen readers
- [ ] Verify keyboard navigation
- [ ] Check color contrast ratios
- [ ] Add ARIA labels
- [ ] Test focus indicators

## Phase 8: Testing & Optimization ⏳

### 8.1 Testing
- [ ] Test audit creation end-to-end
- [ ] Test homepage detection logic
- [ ] Test sitemap audit workflow
- [ ] Test status change workflow
- [ ] Test multi-URL report generation
- [ ] Test email and Slack notifications
- [ ] Test all user roles

### 8.2 Performance Optimization
- [ ] Optimize image loading
- [ ] Implement caching (React Query)
- [ ] Minimize API calls
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Compress images
- [ ] Enable Next.js image optimization

### 8.3 Security
- [ ] Validate all user inputs
- [ ] Sanitize URLs
- [ ] Implement rate limiting
- [ ] Secure API endpoints
- [ ] Test authentication flows
- [ ] Review CORS settings

## Phase 9: Deployment ⏳

### 9.1 Vercel Setup
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set up production database
- [ ] Configure custom domain

### 9.2 Database Migration
- [ ] Run Prisma migrations in production
- [ ] Verify database connection
- [ ] Test data persistence

### 9.3 External Services
- [ ] Configure Clerk for production
- [ ] Set up SendGrid sender verification
- [ ] Configure Slack workspace app
- [ ] Set up AWS S3 bucket
- [ ] Verify SEMRush API limits

### 9.4 Production Testing
- [ ] Test complete audit workflow
- [ ] Verify email delivery
- [ ] Test Slack notifications
- [ ] Check file uploads
- [ ] Verify PDF generation
- [ ] Test shareable links

### 9.5 Monitoring & Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Add analytics (optional)

## Phase 10: Documentation & Handoff ⏳

- [ ] Write API documentation
- [ ] Document environment variables
- [ ] Create deployment guide
- [ ] Write user guide
- [ ] Document known issues
- [ ] Create troubleshooting guide

---

## Progress Tracking

**Overall Progress:** 0/100 tasks completed (0%)

**Current Phase:** Phase 1 - Project Setup

**Blocked Items:** None

**Notes:**
- 

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Database
npx prisma studio
npx prisma generate
npx prisma db push

# Build
npm run build
npm run start
```
