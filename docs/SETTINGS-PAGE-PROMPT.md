# Settings Page Development Prompt

Build a comprehensive, functional Settings page for the Sales SEO Audit Tool with full database integration and real-time updates.

## Project Context

**Tech Stack:**
- Next.js 15 with App Router
- Prisma ORM with PostgreSQL
- Clerk for authentication
- TypeScript
- Tailwind CSS v4 with Rival Digital design system
- Existing integrations: Claude AI, SEMRush, SendGrid, AWS S3, Slack

**Design System:**
- Primary: Navy Blue `oklch(0.24 0.13 265)` (#002264)
- Secondary: Orange `oklch(0.71 0.15 60)` (#f78d30)
- Use existing utility classes from `src/app/globals.css`
- Follow the established card styling patterns (subtle borders, gradient backgrounds)

## Core Requirements

### 1. Database Schema Updates

Create a new `UserSettings` model in `prisma/schema.prisma`:

```prisma
model UserSettings {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // API Keys (encrypted at rest)
  semrushApiKey       String?
  claudeApiKey        String?
  sendgridApiKey      String?
  slackWebhookUrl     String?

  // Email Preferences
  emailNotifications  Boolean @default(true)
  digestFrequency     String  @default("WEEKLY") // DAILY, WEEKLY, MONTHLY, NONE
  notifyOnComplete    Boolean @default(true)
  notifyOnStatusChange Boolean @default(true)

  // Report Branding
  companyName         String?
  companyLogo         String?
  brandPrimaryColor   String? // OKLCH format
  brandSecondaryColor String? // OKLCH format
  reportFooterText    String? @db.Text

  // Export Preferences
  defaultExportFormat String  @default("PDF") // PDF, EXCEL, JSON
  includeScreenshots  Boolean @default(true)
  includeClaudeAnalysis Boolean @default(true)

  // UI Preferences
  theme               String  @default("LIGHT") // LIGHT, DARK, AUTO
  defaultView         String  @default("GRID") // GRID, TABLE
  itemsPerPage        Int     @default(12)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

Also add the relation to the User model:
```prisma
model User {
  // ... existing fields
  settings  UserSettings?
}
```

### 2. Page Structure

Create the settings page at `src/app/settings/page.tsx` with these sections:

**A. Account Section**
- Display user info from Clerk (name, email, profile picture)
- Link to Clerk user profile for password/2FA management
- Account creation date
- Current role badge

**B. API Keys Section** (Admin/Sales only)
- SEMRush API Key (masked, show/hide toggle)
- Claude API Key (masked, show/hide toggle)
- SendGrid API Key (masked, show/hide toggle)
- Slack Webhook URL (masked, show/hide toggle)
- "Test Connection" button for each API
- Last verified timestamp for each key
- Warning indicator if keys are missing or invalid

**C. Email Notifications**
- Toggle for email notifications (on/off)
- Digest frequency dropdown (Daily, Weekly, Monthly, None)
- Toggle for "Notify when audit completes"
- Toggle for "Notify on status changes"
- "Send Test Email" button

**D. Report Branding**
- Company name input
- Company logo upload (with preview, max 2MB)
- Brand colors with color pickers (primary & secondary)
- Report footer text (textarea)
- Live preview card showing how reports will look
- "Reset to Default" button

**E. Export Preferences**
- Default export format (radio buttons: PDF, Excel, JSON)
- Toggle for "Include screenshots in exports"
- Toggle for "Include Claude analysis in exports"

**F. UI Preferences**
- Theme selector (Light, Dark, Auto)
- Default view mode (Grid, Table)
- Items per page slider (6, 12, 24, 48)

### 3. API Routes

Create these API endpoints:

**`/api/settings` (GET, PUT)**
- GET: Fetch user settings (with API keys masked)
- PUT: Update user settings
- Validate and sanitize all inputs
- Encrypt API keys before storing
- Return success/error messages

**`/api/settings/test-api` (POST)**
- Test API connections (SEMRush, Claude, SendGrid, Slack)
- Body: `{ service: "semrush" | "claude" | "sendgrid" | "slack", apiKey?: string }`
- Return connection status and any errors

**`/api/settings/send-test-email` (POST)**
- Send a test email to the user's email address
- Use SendGrid integration from `src/lib/email.ts`

**`/api/settings/upload-logo` (POST)**
- Handle company logo uploads
- Validate file type (png, jpg, svg only) and size (max 2MB)
- Upload to AWS S3 via `src/lib/storage.ts`
- Return the logo URL

### 4. Components to Create

**`src/components/settings/settings-section.tsx`**
- Reusable section wrapper with title, description, and divider
- Props: title, description, children

**`src/components/settings/api-key-input.tsx`**
- Masked input with show/hide toggle
- Test connection button
- Last verified badge
- Props: label, value, onSave, onTest, service name

**`src/components/settings/brand-preview-card.tsx`**
- Live preview of report branding
- Shows company name, logo, and color scheme
- Props: companyName, logoUrl, primaryColor, secondaryColor

**`src/components/settings/theme-selector.tsx`**
- Radio group with icons for Light/Dark/Auto
- Props: value, onChange

**`src/components/ui/color-picker.tsx`**
- Color picker component with OKLCH support
- Shows color preview swatch
- Props: value, onChange, label

### 5. Security & Validation

**API Key Encryption:**
- Use `bcrypt` or `crypto` module to encrypt API keys before storing
- Never send full API keys to the client (mask them like `sk-ant-••••••••1234`)
- Only allow updating keys, not viewing full keys

**Input Validation:**
- Validate all user inputs on both client and server
- Use Zod schemas for type-safe validation
- Sanitize HTML in footer text
- Validate color formats (OKLCH)
- Validate file uploads (type, size)

**Authorization:**
- Only allow users to access/modify their own settings
- Use Clerk's `auth()` helper to verify user identity
- Check user role for admin-only features

### 6. UX Requirements

**Form Behavior:**
- Auto-save on blur for simple inputs
- "Save Changes" button for complex sections
- Show loading states during API calls
- Display success toasts on save
- Display error messages clearly
- Unsaved changes warning when navigating away

**Responsive Design:**
- Mobile-first approach
- Stack sections vertically on mobile
- Collapse sections into accordions on small screens
- Ensure color pickers work on touch devices

**Accessibility:**
- All form inputs must have proper labels
- Color pickers must have keyboard navigation
- Success/error states must be announced to screen readers
- Maintain proper heading hierarchy
- Ensure 4.5:1 color contrast ratios

### 7. Integration Points

**Clerk Integration:**
- Use `useUser()` hook to get current user info
- Display user profile data (name, email, avatar)
- Link to Clerk's user profile page for account management

**Existing Lib Integration:**
- Test Claude API via `src/lib/claude.ts`
- Test SEMRush API via `src/lib/semrush.ts`
- Test SendGrid via `src/lib/email.ts`
- Upload logos via `src/lib/storage.ts`

**Apply Settings Throughout App:**
- Use settings in audit workflows
- Apply branding to generated PDFs (`src/lib/pdf-generator.ts`)
- Apply branding to public share pages
- Use UI preferences (theme, view mode) throughout app
- Store preferences in localStorage for instant loading

### 8. Testing & Validation

Before marking complete, ensure:
- [ ] All form inputs save to database correctly
- [ ] API keys are encrypted in database
- [ ] API key masking works properly
- [ ] Test connection buttons work for all services
- [ ] Logo upload and preview works
- [ ] Color pickers work and update preview
- [ ] Test email sends successfully
- [ ] Settings persist across sessions
- [ ] Responsive design works on mobile
- [ ] No TypeScript errors
- [ ] Build succeeds with no warnings
- [ ] Loading states show during operations
- [ ] Error handling works for invalid inputs
- [ ] Success toasts appear on save

### 9. UI/UX Polish

**Design Guidelines:**
- Use the same card styling as audit cards (subtle navy border, gentle gradient)
- Section headers should use navy blue
- Use the `rival-button` class for primary actions
- Implement smooth transitions for show/hide toggles
- Add subtle hover effects on interactive elements
- Use existing animation classes (`animate-slideUp`, `card-hover-effect`)
- Maintain consistent spacing (use Tailwind's spacing scale)

**Visual Hierarchy:**
- Page title: text-3xl font-bold
- Section titles: text-xl font-semibold
- Labels: text-sm font-medium
- Helper text: text-sm text-muted-foreground

### 10. Nice-to-Have Features (Bonus)

If time permits, add:
- Export/import settings as JSON
- Settings search/filter
- Settings change history log
- Keyboard shortcuts panel
- Usage statistics (API calls made, emails sent, etc.)
- Billing information section (if implementing paid features)
- Team settings (if implementing team features)
- Webhook configuration for custom integrations

## Implementation Order

1. Create database schema and run migration
2. Build API routes with validation
3. Create UI components
4. Build the settings page layout
5. Implement form handling and auto-save
6. Add API key testing functionality
7. Implement logo upload
8. Build brand preview
9. Test all integrations
10. Polish UI and add animations
11. Test responsive design
12. Final build and verification

## Success Criteria

The settings page is complete when:
✅ Users can update all settings and they persist in the database
✅ API keys are securely stored and can be tested
✅ Email notifications work with customizable preferences
✅ Report branding can be customized with live preview
✅ UI preferences apply throughout the application
✅ All forms validate properly with clear error messages
✅ The page is fully responsive and accessible
✅ The design matches the Rival Digital brand guidelines
✅ Build completes with no errors or warnings

## Reference Files

Key files to review before starting:
- `prisma/schema.prisma` - Database models
- `src/app/globals.css` - Design system utilities
- `src/components/audit/audit-card.tsx` - Card styling reference
- `src/lib/claude.ts` - Claude API integration
- `src/lib/semrush.ts` - SEMRush API integration
- `src/lib/email.ts` - Email integration
- `src/lib/storage.ts` - File upload handling
- `src/app/dashboard/page.tsx` - Page structure reference

## Notes

- Use React Query for data fetching and caching
- Follow the existing patterns for API routes (check `/api/audits` for reference)
- Maintain consistency with existing form styling
- Use Sonner for toast notifications (already installed)
- All user-facing text should be clear and professional
- Add helpful tooltips for technical settings
