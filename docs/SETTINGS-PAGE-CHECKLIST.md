# Settings Page Development Checklist

Quick reference checklist for implementing the Settings page.

## Phase 1: Database & Schema
- [ ] Update `prisma/schema.prisma` with UserSettings model
- [ ] Add settings relation to User model
- [ ] Create and run migration: `npx prisma migrate dev --name add-user-settings`
- [ ] Verify schema in database

## Phase 2: API Routes
- [ ] Create `src/app/api/settings/route.ts` (GET, PUT)
- [ ] Create `src/app/api/settings/test-api/route.ts` (POST)
- [ ] Create `src/app/api/settings/send-test-email/route.ts` (POST)
- [ ] Create `src/app/api/settings/upload-logo/route.ts` (POST)
- [ ] Add API key encryption utilities
- [ ] Add Zod validation schemas
- [ ] Test all endpoints with Postman/Thunder Client

## Phase 3: Core Components
- [ ] Create `src/components/settings/settings-section.tsx`
- [ ] Create `src/components/settings/api-key-input.tsx`
- [ ] Create `src/components/settings/brand-preview-card.tsx`
- [ ] Create `src/components/settings/theme-selector.tsx`
- [ ] Create `src/components/ui/color-picker.tsx`

## Phase 4: Settings Page
- [ ] Create `src/app/settings/page.tsx`
- [ ] Implement Account section
- [ ] Implement API Keys section
- [ ] Implement Email Notifications section
- [ ] Implement Report Branding section
- [ ] Implement Export Preferences section
- [ ] Implement UI Preferences section

## Phase 5: Form Logic
- [ ] Set up React Query hooks for fetching/updating settings
- [ ] Implement auto-save functionality
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success toasts

## Phase 6: Features
- [ ] API key masking (show/hide toggle)
- [ ] Test connection buttons for each API
- [ ] Logo upload with preview
- [ ] Color pickers with live preview
- [ ] Send test email functionality
- [ ] Theme switching
- [ ] Unsaved changes warning

## Phase 7: Integration
- [ ] Apply theme preference throughout app
- [ ] Apply view mode preference (grid/table)
- [ ] Apply branding to PDF generation
- [ ] Apply branding to public share pages
- [ ] Test all API integrations (Claude, SEMRush, SendGrid)

## Phase 8: Polish & Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Add animations and transitions
- [ ] Test all form validations
- [ ] Test error states
- [ ] Test success states
- [ ] Cross-browser testing
- [ ] Performance optimization

## Phase 9: Security
- [ ] API keys encrypted in database
- [ ] API keys masked on client
- [ ] Authorization checks on all routes
- [ ] Input sanitization
- [ ] File upload validation
- [ ] Rate limiting on API routes

## Phase 10: Final Verification
- [ ] No TypeScript errors
- [ ] Build succeeds: `npm run build`
- [ ] All linting passes: `npm run lint`
- [ ] Settings persist across sessions
- [ ] All sections save properly
- [ ] Navigation added to main menu/header
- [ ] Documentation updated

## Quick Command Reference

```bash
# Create migration
npx prisma migrate dev --name add-user-settings

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Testing Commands

```bash
# Test API key encryption
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"semrushApiKey":"test-key-123"}'

# Test connection
curl -X POST http://localhost:3000/api/settings/test-api \
  -H "Content-Type: application/json" \
  -d '{"service":"claude"}'

# Test email
curl -X POST http://localhost:3000/api/settings/send-test-email
```

## Common Issues & Solutions

**Issue:** Settings not persisting
- Check if userId is being passed correctly
- Verify Prisma client is updated: `npx prisma generate`
- Check database connection

**Issue:** API keys not encrypting
- Install crypto: `npm install bcryptjs` or use built-in crypto
- Verify encryption function is called before save
- Check environment variables

**Issue:** Logo upload failing
- Check AWS credentials in `.env`
- Verify file size limit (2MB)
- Check allowed MIME types

**Issue:** Color picker not working
- Verify OKLCH format conversion
- Check CSS variable syntax
- Test in different browsers

## Navigation Integration

Add settings link to main navigation:
```tsx
// In your header/nav component
<Link href="/settings">
  <Settings className="w-4 h-4 mr-2" />
  Settings
</Link>
```

## Example Usage

Once complete, users should be able to:
1. Go to `/settings`
2. Update their company branding
3. Add API keys for integrations
4. Customize email preferences
5. See changes reflected immediately in the app
6. Have settings persist across sessions

## Priority Order

**Must Have (P0):**
- Database schema ✓
- Basic API routes ✓
- Settings page UI ✓
- Save/load functionality ✓

**Should Have (P1):**
- API key testing ✓
- Email preferences ✓
- Brand customization ✓
- Theme switching ✓

**Nice to Have (P2):**
- Usage statistics
- Export/import settings
- Change history
- Keyboard shortcuts
