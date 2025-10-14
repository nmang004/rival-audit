# Phase 5: Status Management & Notifications

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
- ✅ Phase 4 Complete: Sitemap audit feature with content gap analysis
- ⏳ Phase 5 Starting: Status management workflows, email notifications, Slack integration

## Your Task - Phase 5: Status Management & Notifications

Phase 5 implements intelligent workflows triggered by status changes, particularly when deals are marked as "SIGNED". This automates the handoff from Sales to the Web/SEO team with comprehensive data and notifications.

### Priority 1: Email Service Setup

**File: `src/lib/email.ts`**

Create a SendGrid email service wrapper:

```typescript
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: {
    content: string; // Base64 encoded
    filename: string;
    type: string;
    disposition: 'attachment';
  }[];
}

// Send email using SendGrid
export async function sendEmail(options: EmailOptions): Promise<void>

// Send audit signed notification to PM and Web Team
export async function sendAuditSignedNotification(
  audit: Audit,
  excelUrl: string,
  claudeAnalysis: string
): Promise<void>
```

**Requirements:**
- Use SendGrid API (@sendgrid/mail package)
- Support multiple recipients
- Support file attachments (for Excel reports)
- HTML email formatting
- Error handling with retries
- Fallback if SendGrid not configured (log instead)
- Use environment variables for:
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM_EMAIL`
  - `PROJECT_MANAGER_EMAIL`
  - `WEB_TEAM_EMAIL`

**Email Template Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: #2563eb; color: white; padding: 20px; }
    .content { padding: 20px; }
    .metrics { background: #f3f4f6; padding: 15px; border-radius: 8px; }
    .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 New Project Signed!</h1>
  </div>
  <div class="content">
    <h2>Client: {clientName}</h2>
    <p><strong>Website:</strong> <a href="{url}">{url}</a></p>

    <div class="metrics">
      <h3>Quick Metrics</h3>
      <p>SEO Score: {seoScore}/100</p>
      <p>Accessibility Score: {accessibilityScore}/100</p>
      <p>Design Score: {designScore}/100</p>
      {isHomepage && <p>Total Keywords: {totalKeywords}</p>}
    </div>

    <h3>AI Analysis Summary</h3>
    <p>{claudeAnalysisSummary}</p>

    <p><a href="{auditUrl}" class="button">View Full Audit Report</a></p>

    <p>SEMRush keyword data and detailed analysis are attached.</p>
  </div>
</body>
</html>
```

### Priority 2: Slack Service Setup

**File: `src/lib/slack.ts`**

Create a Slack Web API wrapper:

```typescript
import { WebClient } from '@slack/web-api';
import { Audit } from '@prisma/client';

const slack = process.env.SLACK_BOT_TOKEN
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

export interface SlackNotificationOptions {
  audit: Audit;
  excelUrl: string;
  auditUrl: string;
}

// Send audit signed notification to Slack channel
export async function sendAuditSignedSlackNotification(
  options: SlackNotificationOptions
): Promise<void>
```

**Requirements:**
- Use Slack Web API (@slack/web-api package)
- Send to configured channel (env: `SLACK_CHANNEL_ID`)
- Rich message with blocks
- Include action buttons (View Audit, Download Excel)
- Color-coded based on scores
- Fallback if Slack not configured (log instead)
- Error handling

**Slack Message Format (Block Kit):**
```json
{
  "channel": "CHANNEL_ID",
  "text": "New Project Signed: {clientName}",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🎉 New Project Signed"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Client:*\n{clientName}"
        },
        {
          "type": "mrkdwn",
          "text": "*Website:*\n<{url}|{url}>"
        },
        {
          "type": "mrkdwn",
          "text": "*SEO Score:*\n{seoScore}/100"
        },
        {
          "type": "mrkdwn",
          "text": "*Accessibility:*\n{accessibilityScore}/100"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*AI Analysis Summary*\n{summary}"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "View Full Audit"
          },
          "url": "{auditUrl}",
          "style": "primary"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Download Excel"
          },
          "url": "{excelUrl}"
        }
      ]
    }
  ]
}
```

### Priority 3: Excel Report Generation

**File: `src/lib/excel-generator.ts`**

Create Excel report generator using ExcelJS:

```typescript
import ExcelJS from 'exceljs';
import { SEMRushData } from '@/types';

export interface ExcelGenerationOptions {
  domain: string;
  semrushData: SEMRushData;
  clientName?: string;
  auditDate: Date;
}

// Generate Excel report with keyword and traffic data
export async function generateSEMRushExcel(
  options: ExcelGenerationOptions
): Promise<Buffer>
```

**Requirements:**
- Use ExcelJS library
- Create workbook with 2 sheets:
  1. **Top Keywords Sheet**
     - Columns: Keyword, Position, Search Volume, Difficulty, URL
     - Sorted by position (best first)
     - Format numbers with commas
     - Color-code positions (1-3: green, 4-10: yellow, 11+: red)
     - Freeze header row
     - Auto-fit columns
  2. **Top Pages Sheet**
     - Columns: URL, Organic Traffic, Keywords, Avg Position
     - Sorted by traffic (highest first)
     - Format numbers with commas
     - Add clickable links
     - Freeze header row
     - Auto-fit columns

**Styling:**
- Header row: Bold, blue background (#2563eb), white text
- Alternating row colors for readability
- Border on all cells
- Professional formatting

**Return:**
- Buffer containing the Excel file
- File will be uploaded to storage and attached to email

### Priority 4: SEMRush Signed Workflow

**File: `src/lib/workflows/signed-workflow.ts`**

Create the comprehensive workflow triggered when audit status changes to SIGNED:

```typescript
import { Audit } from '@prisma/client';
import { getSEMRushData } from '../semrush';
import { generateSEMRushExcel } from '../excel-generator';
import { uploadFile } from '../storage';
import { sendAuditSignedNotification } from '../email';
import { sendAuditSignedSlackNotification } from '../slack';
import { analyzeWithClaudeForStrategy } from '../claude';
import prisma from '../prisma';

export interface SignedWorkflowResult {
  excelUrl: string;
  strategicAnalysis: string;
  notificationsSent: {
    email: boolean;
    slack: boolean;
  };
}

// Execute complete signed status workflow
export async function executeSignedWorkflow(
  auditId: string
): Promise<SignedWorkflowResult>
```

**Workflow Steps:**

1. **Fetch Full SEMRush Data** (if homepage)
   - Get top 50 keywords with positions, volume, difficulty
   - Get top 20 pages by traffic
   - Get domain overview (total keywords, traffic estimates)
   - Store in `semrushData` field

2. **Generate Excel Report**
   - Use ExcelJS to create formatted workbook
   - Two sheets: Keywords and Pages
   - Professional styling

3. **Upload Excel to Storage**
   - Use storage service (S3/Vercel Blob)
   - Generate public URL
   - Store URL in `excelReportUrl` field

4. **Generate Strategic Analysis with Claude**
   - Send SEMRush data to Claude
   - Ask for strategic SEO recommendations
   - Focus on quick wins and long-term strategy
   - Store enhanced analysis

5. **Send Email Notification**
   - To: PM and Web Team
   - Include: Audit summary, scores, Claude analysis
   - Attach: Excel report
   - Link: Full audit detail page

6. **Send Slack Notification**
   - Post to designated channel
   - Rich formatting with blocks
   - Action buttons for quick access
   - Color-coded based on scores

7. **Update Audit Record**
   - Store Excel URL
   - Store enhanced strategic analysis
   - Log status change

**Error Handling:**
- If SEMRush fails: Continue with existing data
- If Excel generation fails: Log error, continue
- If email fails: Log error, continue
- If Slack fails: Log error, continue
- Partial success is acceptable (some notifications may fail)

### Priority 5: Claude Strategic Analysis

**File: Update `src/lib/claude.ts`**

Add new function for strategic analysis:

```typescript
export async function analyzeWithClaudeForStrategy(
  audit: Audit,
  semrushData: SEMRushData
): Promise<string>
```

**Claude Prompt:**
```
You are an expert SEO strategist. Analyze this newly signed client and provide actionable strategic recommendations.

CLIENT INFORMATION:
- Website: {url}
- SEO Score: {seoScore}/100
- Accessibility Score: {accessibilityScore}/100
- Design Score: {designScore}/100

PREVIOUS ANALYSIS:
{existingClaudeAnalysis}

SEMRUSH DATA:
- Total Keywords: {totalKeywords}
- Top Keywords: {top10Keywords}
- Top Traffic Pages: {topPages}
- Estimated Monthly Traffic: {monthlyTraffic}

TASK:
Provide a strategic SEO roadmap for this client with the following sections:

1. **Quick Wins (0-30 days)**
   - Immediate actions that will show fast results
   - Focus on low-hanging fruit

2. **Medium-Term Strategy (1-3 months)**
   - Content strategy based on keyword gaps
   - Technical improvements needed
   - UX/UI enhancements

3. **Long-Term Growth (3-6 months)**
   - Authority building opportunities
   - Content expansion areas
   - Competitive positioning

4. **Priority Action Items**
   - Top 5 specific tasks to start immediately
   - Estimated impact and effort for each

5. **Keyword Opportunities**
   - Underperforming keywords to optimize
   - New keyword targets based on gaps
   - Content recommendations

Format as markdown with clear sections and bullet points.
Be specific and actionable.
```

### Priority 6: Status Change API Enhancement

**File: Update `src/app/api/audits/[id]/route.ts`**

Enhance the PATCH endpoint to trigger workflows:

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;

  // Validate status
  if (!['PROPOSAL', 'INITIAL_CALL', 'SIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Get current audit
  const currentAudit = await prisma.audit.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!currentAudit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  // Update audit status
  const audit = await prisma.audit.update({
    where: { id: resolvedParams.id },
    data: { status },
  });

  // Log status change
  await prisma.statusChange.create({
    data: {
      auditId: resolvedParams.id,
      fromStatus: currentAudit.status,
      toStatus: status,
      changedBy: userId,
    },
  });

  // TRIGGER SIGNED WORKFLOW (in background)
  if (status === 'SIGNED' && currentAudit.status !== 'SIGNED') {
    executeSignedWorkflow(resolvedParams.id)
      .then(() => {
        console.log(`[Signed Workflow ${resolvedParams.id}] Completed successfully`);
      })
      .catch((error) => {
        console.error(`[Signed Workflow ${resolvedParams.id}] Failed:`, error);
      });
  }

  return NextResponse.json({ success: true, data: audit });
}
```

### Priority 7: Environment Variables

**Add to `.env.local`:**

```env
# SendGrid Email
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="audits@yourcompany.com"
PROJECT_MANAGER_EMAIL="pm@yourcompany.com"
WEB_TEAM_EMAIL="webteam@yourcompany.com"

# Slack Integration
SLACK_BOT_TOKEN="xoxb-..."
SLACK_CHANNEL_ID="C1234567890"

# App URL (for email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Update `.env.example`:**
Add all the above variables with placeholder values for documentation.

### Priority 8: Storage Service Enhancement

**File: Update `src/lib/storage.ts`**

Add function to upload Excel files:

```typescript
// Upload Excel file to storage
export async function uploadExcel(
  buffer: Buffer,
  filename: string,
  auditId: string
): Promise<string>
```

**Requirements:**
- Upload to S3 or Vercel Blob
- Generate unique filename with timestamp
- Set proper MIME type (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- Return public URL
- Error handling

### Priority 9: Audit Detail Page Enhancement

**File: Update `src/app/audits/[id]/page.tsx`**

Add display for signed workflow results:

```typescript
{/* Signed Workflow Results - Show after status = SIGNED */}
{audit.status === 'SIGNED' && audit.excelReportUrl && (
  <Card className="mb-8 border-green-200 bg-green-50">
    <CardHeader>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <CardTitle className="text-green-900">Project Signed - Team Notified</CardTitle>
      </div>
      <CardDescription className="text-green-800">
        SEMRush data retrieved and notifications sent to project team
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Downloads</h4>
          <Button asChild variant="outline">
            <a href={audit.excelReportUrl} download>
              <Download className="w-4 h-4 mr-2" />
              Download SEMRush Excel Report
            </a>
          </Button>
        </div>

        {audit.semrushData && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">SEMRush Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Total Keywords</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit.semrushData as { totalKeywords?: number }).totalKeywords?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Organic Traffic</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit.semrushData as { organicTraffic?: number }).organicTraffic?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Top Keywords</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit.semrushData as { keywords?: unknown[] }).keywords?.length || '0'}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Backlinks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(audit.semrushData as { backlinks?: number }).backlinks?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold text-gray-900 mb-2">Notifications Sent</h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-green-600" />
              Email sent to PM and Web Team
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MessageSquare className="w-4 h-4 text-green-600" />
              Slack notification posted
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

### Priority 10: Install Required Packages

```bash
npm install @sendgrid/mail @slack/web-api exceljs
```

## Implementation Notes

### Package Dependencies
- `@sendgrid/mail` - Email service
- `@slack/web-api` - Slack integration
- `exceljs` - Excel file generation (already installed)

### Error Handling Strategy
- **Graceful Degradation**: If email/Slack fails, workflow continues
- **Logging**: All errors logged to console with context
- **Partial Success**: Some notifications can fail without blocking others
- **User Feedback**: Show what succeeded/failed in UI

### Testing Strategy
1. **Without API Keys**: All services should log instead of failing
2. **With Invalid Keys**: Should show clear error messages
3. **Status Change**: Verify workflow triggers only once
4. **Multiple Status Changes**: Handle rapid status changes gracefully
5. **Large Excel Files**: Test with 50 keywords + 20 pages

### Security Considerations
- Never expose API keys to frontend
- Validate all user inputs before status changes
- Ensure only audit creator or admins can change status
- Rate limit status change API
- Sanitize all data before sending to email/Slack

### Performance Considerations
- Run workflows in background (don't block API response)
- Generate Excel files asynchronously
- Cache SEMRush data to avoid duplicate API calls
- Set reasonable timeouts for all external services

## Expected File Structure

```
src/
├── lib/
│   ├── email.ts                           ✅ NEW
│   ├── slack.ts                           ✅ NEW
│   ├── excel-generator.ts                 ✅ NEW
│   ├── storage.ts                         ✅ UPDATED
│   ├── claude.ts                          ✅ UPDATED
│   └── workflows/
│       └── signed-workflow.ts             ✅ NEW
└── app/
    ├── api/
    │   └── audits/
    │       └── [id]/
    │           └── route.ts               ✅ UPDATED
    └── audits/
        └── [id]/page.tsx                  ✅ UPDATED
```

## Success Criteria

Phase 5 is complete when:
- ✅ Email service configured and sends formatted emails
- ✅ Slack service configured and posts rich messages
- ✅ Excel generator creates properly formatted reports
- ✅ Signed workflow executes all steps successfully
- ✅ Status change API triggers workflow
- ✅ Strategic analysis generated by Claude
- ✅ Audit detail page shows signed results
- ✅ All external services have fallbacks
- ✅ Code builds without errors
- ✅ Works with and without API keys configured

## Testing Checklist

### Email Service
- [ ] Sends email with valid SendGrid key
- [ ] Logs message without SendGrid key
- [ ] Includes Excel attachment
- [ ] HTML formatting renders correctly
- [ ] Multiple recipients work

### Slack Service
- [ ] Posts message with valid Slack token
- [ ] Logs message without Slack token
- [ ] Block Kit formatting correct
- [ ] Action buttons have correct URLs
- [ ] Color coding based on scores

### Excel Generation
- [ ] Creates workbook with 2 sheets
- [ ] Keywords sheet formatted correctly
- [ ] Pages sheet formatted correctly
- [ ] Numbers have proper formatting
- [ ] Colors applied based on metrics
- [ ] File downloads correctly

### Signed Workflow
- [ ] Triggers when status changes to SIGNED
- [ ] Doesn't trigger on other status changes
- [ ] Fetches SEMRush data (if homepage)
- [ ] Generates Excel file
- [ ] Uploads to storage
- [ ] Sends email notification
- [ ] Posts Slack notification
- [ ] Updates audit record
- [ ] Handles partial failures gracefully

### UI Updates
- [ ] Signed banner shows after status change
- [ ] Download button works
- [ ] SEMRush metrics display
- [ ] Notification status shows
- [ ] Responsive on mobile

## Next Steps After Phase 5

Phase 6 will include:
- Multi-URL report compilation
- PDF generation for combined reports
- Shareable report links
- Report management UI

Focus on completing Phase 5 first!

---

**Start by setting up the email and Slack services with proper fallbacks, then implement the signed workflow that orchestrates everything. Test thoroughly with both real and mock API keys.**
