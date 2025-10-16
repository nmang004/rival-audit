# Phase 7: How to Resume Work

**Quick guide for starting/resuming Phase 7 UX Transformation in any conversation**

---

## 🚀 Starting Fresh (New Conversation)

### Step 1: Share Context with AI
```
I'm working on Phase 7 of my Sales SEO Audit Tool - a professional UX transformation.
Please read these files to understand the plan:
1. docs/PHASE-7-UX-TRANSFORMATION.md
2. docs/PHASE-7-QUICK-CHECKLIST.md

The app is a Next.js 15 project with:
- Tailwind CSS v4
- shadcn/ui components
- Rival Digital brand (Navy #002264 + Orange #f78d30)
- Clerk authentication
- Prisma + PostgreSQL

Current git status shows modified files in src/app and src/components.

Let's continue Phase 7 from where we left off.
```

### Step 2: Check Progress
Open `docs/PHASE-7-QUICK-CHECKLIST.md` and see which phases are checked off.

### Step 3: Start Next Phase
Tell the AI which phase to start:
```
Let's start Phase 7.1 - Navigation & Layout Architecture
```

---

## 📋 Mid-Phase Resume

If you're in the middle of a phase:

```
I was working on Phase 7.2 (Dashboard Enhancements).

Completed so far:
- ✅ stats-card.tsx
- ✅ score-trend-chart.tsx
- ⬜ status-distribution-chart.tsx (next)

Let's continue with the status distribution chart component.
```

---

## 🔍 Quick Status Check

Ask the AI to check progress:
```
Please check docs/PHASE-7-QUICK-CHECKLIST.md and tell me:
1. Which phases are complete
2. What files have been created/modified
3. What's the next task
```

---

## 📦 After Installing Dependencies

If you just installed dependencies (recharts, etc.):
```
I've installed the dependencies:
npm install recharts @radix-ui/react-popover @radix-ui/react-separator

Now let's continue with Phase [X.X] - [Component Name]
```

---

## 🐛 If You Hit an Error

```
I got this error when building/running:
[paste error]

Context: Working on Phase 7.[X] - [Component Name]
File: [file path]

Please help debug and fix.
```

---

## ✅ Marking Progress

After completing each sub-phase, update the checklist:
```
We just completed Phase 7.1 (Navigation & Layout).
Please update:
1. docs/PHASE-7-QUICK-CHECKLIST.md - check off Phase 1 tasks
2. docs/PHASE-7-UX-TRANSFORMATION.md - update Progress Tracking section
```

---

## 🎯 Priority Order (if time limited)

**Must Have:**
1. Phase 7.1 - Sidebar Navigation ← Start here
2. Phase 7.2 - Dashboard Stats & Charts

**Should Have:**
3. Phase 7.3 - Audit Table View
4. Phase 7.5 - Skeleton Loading States

**Nice to Have:**
5. Phase 7.4 - Audit Detail Tabs
6. Phase 7.6 - Reports Enhancements

---

## 📝 Useful Commands During Development

```bash
# Run dev server
npm run dev

# Build (check for errors)
npm run build

# Check TypeScript
npx tsc --noEmit

# Check Prisma
npx prisma studio

# Format code (if you have prettier)
npm run format
```

---

## 🔗 File References

Key files to reference:
- **Full Plan:** `docs/PHASE-7-UX-TRANSFORMATION.md`
- **Quick Checklist:** `docs/PHASE-7-QUICK-CHECKLIST.md`
- **Dev Checklist:** `docs/Development-Checklist.md`
- **Design System:** `src/app/globals.css`
- **Current Dashboard:** `src/app/dashboard/page.tsx`
- **Current Audit Detail:** `src/app/audits/[id]/page.tsx`

---

## 💡 Pro Tips

1. **Always check the build** after creating new components:
   ```bash
   npm run build
   ```

2. **Test responsiveness** on different screen sizes in browser DevTools

3. **Keep brand colors consistent**:
   - Primary: `oklch(0.24 0.13 265)` (Navy)
   - Secondary: `oklch(0.71 0.15 60)` (Orange)

4. **Use existing components** from shadcn/ui when possible

5. **Follow the file structure** outlined in the plan

6. **Update checklists** as you go - don't wait until the end

---

## 🎬 Example Full Session

**You:**
```
I'm continuing Phase 7 of my Sales SEO Audit Tool UX transformation.
Please read docs/PHASE-7-QUICK-CHECKLIST.md to see progress.

Current status:
- ✅ Phase 7.1 complete (Navigation & Layout)
- ⬜ Phase 7.2 in progress (Dashboard Enhancements)

Let's build the stats-card.tsx component next.
```

**AI Response:**
```
I'll create src/components/dashboard/stats-card.tsx...
[creates component]

Done! The StatsCard component is ready.
Next: score-trend-chart.tsx
```

**You:**
```
Great! Let's continue with the score trend chart.
```

---

## ⚠️ Common Issues & Solutions

### Issue: Build fails with module not found
**Solution:** Check imports and file paths match exactly

### Issue: TypeScript errors in new components
**Solution:** Make sure to import types from correct locations

### Issue: Recharts not rendering
**Solution:** Make sure component is marked 'use client'

### Issue: Styles not applying
**Solution:** Check Tailwind classes are valid and CSS file imported

---

**Last Updated:** October 15, 2025
