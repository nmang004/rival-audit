# PHASE 7 - PHASE 5 PROMPT: Visual Design Enhancements

I'm continuing Phase 7 (UX Transformation) of my Sales SEO Audit Tool.

## PROJECT CONTEXT:
- Next.js 15 app with Tailwind CSS v4, shadcn/ui, Prisma, Clerk auth
- Brand colors: Navy #002264 (primary), Orange #f78d30 (secondary)
- Already have: Basic animations, card effects, button styles in globals.css
- Already completed: Phases 7.1-7.4 (Sidebar, Dashboard, Audit List, Audit Detail)

## COMPLETED SO FAR:
✅ Phase 7.1: Sidebar navigation, app header, breadcrumbs, app shell layout
✅ Phase 7.2: Dashboard stats cards, score trend chart, status distribution chart
✅ Phase 7.3: Audit table view, view toggle, advanced filters, bulk actions, enhanced search
✅ Phase 7.4: Regular audit detail page with sticky header, tabs, score comparisons, activity timeline

## NEXT TASK - PHASE 5: Visual Design Enhancements (30-45 min)

Please read the Phase 5 specifications in `docs/PHASE-7-UX-TRANSFORMATION.md` (lines 403-472).

## OBJECTIVE:
Add professional loading states, empty states, and enhanced micro-interactions to create a polished, production-ready experience.

---

## BUILD THE FOLLOWING:

### 1. Skeleton Loading Components (15 min)

**File:** `src/components/ui/skeleton.tsx`

Create a base `Skeleton` component with shimmer animation:

```tsx
// Base skeleton with shimmer effect
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}
```

**Specialized Skeleton Variants:**

1. **SkeletonCard** - For audit cards and stat cards
   - Mimics card layout with title, content areas
   - Use in dashboard and audit list loading states

2. **SkeletonTable** - For table view loading
   - Rows and columns structure
   - Use in table view loading states

3. **SkeletonChart** - For chart placeholders
   - Rectangular/circular placeholder for charts
   - Use in dashboard chart loading states

**Add shimmer animation to globals.css:**
```css
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

### 2. Apply Skeleton Loaders (10 min)

Update these pages with skeleton loading states:

**Dashboard Page** (`src/app/dashboard/page.tsx`):
- Replace spinner with skeleton stat cards (4 cards)
- Add skeleton charts (2 placeholders)
- Add skeleton audit cards (3-4 cards)

**Audit Table View** (`src/components/audit/audit-table-view.tsx`):
- Show skeleton table rows when loading (5-8 rows)
- Match actual table column structure

**Audit Detail Page** (`src/app/audits/[id]/page.tsx`):
- Replace spinner with skeleton header
- Add skeleton for score cards (3 cards)
- Add skeleton for content sections

**Reports Page** (`src/app/reports/page.tsx`):
- Skeleton for report cards (3-4 cards)
- Skeleton for stats if showing stats

### 3. Enhanced Empty States (10 min)

**File:** `src/components/ui/empty-state.tsx`

Create a flexible empty state component:

```tsx
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}
```

Features:
- Large animated icon (using lucide-react)
- Headline and description
- Primary CTA button (optional)
- Secondary link/action (optional)
- Gentle floating animation on icon

**Apply Empty States:**

1. **No Audits Yet** - Dashboard when no audits exist
   - Icon: FileSearch
   - Title: "No audits yet"
   - Description: "Create your first audit to get started with SEO analysis"
   - Action: "Create Audit" button

2. **No Reports Yet** - Reports page when empty
   - Icon: FileStack
   - Title: "No reports generated"
   - Description: "Combine multiple audits into a professional report"
   - Action: "Create Report" button

3. **No Search Results** - When search returns empty
   - Icon: SearchX
   - Title: "No results found"
   - Description: "Try adjusting your search terms or filters"
   - Action: "Clear Filters" button

4. **No Filter Results** - When filters return empty
   - Icon: Filter
   - Title: "No matches found"
   - Description: "No audits match your current filters"
   - Action: "Reset Filters" button

### 4. Enhanced Micro-interactions (Already mostly done!)

**Update:** `src/app/globals.css` (if needed)

Review and ensure we have:
- ✅ Button loading states - Add spinner + opacity when loading
- ✅ Form field focus states - Glow effect on focus
- ✅ Card hover elevations - Already have `.card-hover-effect`
- ✅ Smooth page transitions - Already have fadeIn/slideUp
- ✅ Toast notifications - Already using Sonner
- ✅ Dropdown menu animations - Check shadcn/ui defaults
- ✅ Modal/dialog animations - Check shadcn/ui defaults

**Add button loading state utility:**
```css
.button-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.6;
}

.button-loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: button-spinner 0.6s linear infinite;
}

@keyframes button-spinner {
  from { transform: rotate(0turn); }
  to { transform: rotate(1turn); }
}
```

**Add form focus glow:**
```css
.input-glow:focus {
  box-shadow: 0 0 0 3px oklch(0.24 0.13 265 / 0.1);
  border-color: oklch(0.24 0.13 265);
}
```

### 5. Progress Indicators (10 min)

**File:** `src/components/ui/progress-ring.tsx`

Create circular progress component for scores:

```tsx
interface ProgressRingProps {
  value: number;        // 0-100 or 0-10
  max: number;          // 100 or 10
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}
```

Features:
- SVG-based circular progress
- Animated stroke drawing
- Customizable size and color
- Optional value display in center
- Smooth animations with CSS transitions

**Use Cases:**
- Score displays in audit cards
- Score comparison components
- Dashboard stat cards
- Any percentage/score visualization

**File:** `src/components/ui/progress.tsx` (linear progress)

Create or enhance linear progress bar:
- Striped/animated background for loading
- Color variants for different states
- Percentage label option

### 6. Data Visualization Enhancements (OPTIONAL - if time allows)

**Only if recharts is already installed**

Check if recharts is installed:
```bash
npm list recharts
```

If installed, create chart wrapper utilities:

**File:** `src/lib/utils/chart-config.ts`

```typescript
export const chartTheme = {
  colors: {
    primary: 'oklch(0.24 0.13 265)',
    secondary: 'oklch(0.71 0.15 60)',
    success: 'oklch(0.6 0.118 184.704)',
    // ... brand colors
  },
  tooltip: {
    // Consistent tooltip styling
  },
  grid: {
    stroke: 'oklch(0.92 0.01 265)',
    strokeDasharray: '3 3',
  }
};
```

Update existing charts to use consistent theme.

---

## IMPLEMENTATION ORDER:

1. **Start with Skeleton components** (Base + Variants)
   - Create `src/components/ui/skeleton.tsx`
   - Add shimmer animation to globals.css
   - Create SkeletonCard, SkeletonTable, SkeletonChart

2. **Apply Skeletons to pages**
   - Dashboard loading state
   - Audit list/table loading states
   - Audit detail loading state
   - Reports loading state

3. **Create Empty State component**
   - Build `src/components/ui/empty-state.tsx`
   - Make it flexible and reusable

4. **Apply Empty States**
   - No audits
   - No reports
   - No search results
   - No filter results

5. **Add Progress Ring component**
   - Create `src/components/ui/progress-ring.tsx`
   - Optionally use in score displays

6. **Enhance micro-interactions** (if needed)
   - Review existing animations
   - Add button loading states
   - Add input focus glow

---

## TECHNICAL REQUIREMENTS:

### TypeScript
- Properly type all component props
- Use existing types from `src/types/index.ts`
- Add new types as needed

### Accessibility
- Skeleton components need `role="status"` and `aria-label`
- Empty states need proper heading hierarchy
- Progress rings need `role="progressbar"` and `aria-valuenow`

### Performance
- Use CSS animations over JS where possible
- Optimize skeleton shimmer performance
- Lazy load components if heavy

### Consistency
- Match existing design system (globals.css)
- Use brand colors throughout
- Follow shadcn/ui patterns
- Maintain responsive design

---

## EXAMPLE CODE PATTERNS:

### Skeleton Usage
```tsx
{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
) : (
  // ... actual content
)}
```

### Empty State Usage
```tsx
{audits.length === 0 && !isLoading && (
  <EmptyState
    icon={FileSearch}
    title="No audits yet"
    description="Create your first audit to get started with SEO analysis"
    action={{
      label: "Create Audit",
      onClick: () => setShowAuditForm(true)
    }}
  />
)}
```

### Progress Ring Usage
```tsx
<ProgressRing
  value={seoScore}
  max={100}
  size="lg"
  color="primary"
  showValue={true}
/>
```

---

## SUCCESS CRITERIA:

- ✅ Skeleton components created and working
- ✅ All major loading states use skeletons (not just spinners)
- ✅ Empty state component is flexible and reusable
- ✅ All empty scenarios have friendly empty states
- ✅ Progress ring component works for scores
- ✅ Micro-interactions feel smooth and professional
- ✅ Animations perform well (no jank)
- ✅ Build succeeds with no TypeScript errors
- ✅ All components are accessible
- ✅ Responsive on all screen sizes

---

## CURRENT PAGES TO UPDATE:

1. **`src/app/dashboard/page.tsx`**
   - Loading: Skeleton cards and charts
   - Empty: No audits state

2. **`src/components/audit/audit-table-view.tsx`**
   - Loading: Skeleton table rows

3. **`src/app/audits/[id]/page.tsx`**
   - Loading: Skeleton header and cards

4. **`src/app/reports/page.tsx`**
   - Loading: Skeleton report cards
   - Empty: No reports state

5. **Search results anywhere**
   - Empty: No search results state

6. **Filtered lists anywhere**
   - Empty: No filter results state

---

## STYLING NOTES:

Use existing classes from `src/app/globals.css`:
- `.animate-fadeIn` - Fade in animation
- `.animate-slideUp` - Slide up animation
- `.animate-float` - Floating animation (for empty state icons)
- `.card-hover-effect` - Card hover
- `.button-scale` - Button scale on hover

Brand colors already in CSS variables:
- `var(--primary)` - Navy Blue
- `var(--secondary)` - Orange
- `var(--muted)` - Light backgrounds

---

## NOTES:

- **DO NOT** install new dependencies without checking first
- **DO NOT** break existing functionality
- **REUSE** existing animations and styles where possible
- **KEEP** loading states fast and smooth
- **MAKE** empty states helpful and actionable
- **TEST** all animations for performance

---

**Start with the Skeleton components - they'll have the biggest visual impact!**
