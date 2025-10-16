# UX Improvement - Apply Rival Digital Design System

## Context

The Sales SEO Audit Tool is currently functional but has a barebones UI. We need to apply the **Rival Digital brand identity and design system** (documented in `DESIGN_SYSTEM.md`) to create a professional, modern, and visually appealing application.

## Design System Overview

**Brand Identity:**
- **Primary Color**: Navy Blue `#002264` (HSL: `217 100% 19%`)
- **Secondary Color**: Orange `#f78d30` (HSL: `29 92% 58%`)
- **Design Philosophy**: Professional, modern, data-driven with interactive elements

## Current Application Status

**Completed Functionality (Phases 1-6):**
- ✅ Single URL audits with SEO, Accessibility, Design scores
- ✅ Homepage detection & keyword tracking
- ✅ Sitemap audits with content gap analysis
- ✅ Status management workflows
- ✅ Email & Slack notifications
- ✅ Multi-URL reports with PDF generation
- ✅ Shareable public links

**Current UI State:**
- Basic shadcn/ui components (default blue theme)
- Minimal styling
- No brand identity
- Missing animations and interactive effects
- Generic gradients and colors

## Your Task

Transform the Sales SEO Audit Tool into a visually stunning application using the Rival Digital design system. Focus on:

1. **Brand Identity Application**
2. **Visual Polish & Consistency**
3. **Interactive Elements & Animations**
4. **Professional Data Visualization**
5. **Enhanced User Experience**

---

## Priority 1: Global Styles & Theme Configuration

### File: `src/app/globals.css`

Update the CSS variables to match the Rival Digital design system:

**Light Mode Colors:**
```css
:root {
  --background: 0 0% 100%;           /* White */
  --foreground: 217 100% 19%;        /* Navy Blue #002264 */
  --primary: 217 100% 19%;           /* Navy Blue #002264 */
  --primary-foreground: 0 0% 100%;   /* White */
  --secondary: 29 92% 58%;           /* Orange #f78d30 */
  --secondary-foreground: 0 0% 100%; /* White */
  --accent: 29 92% 58%;              /* Orange #f78d30 */
  --accent-foreground: 0 0% 100%;    /* White */
  --muted: 217 30% 96%;              /* Light Navy */
  --muted-foreground: 217 30% 40%;   /* Medium Navy */
  --destructive: 0 84.2% 60.2%;      /* Red */
  --destructive-foreground: 60 9.1% 97.8%;
  --card: 0 0% 100%;                 /* White */
  --card-foreground: 217 100% 19%;   /* Navy Blue */
  --border: 217 10% 90%;             /* Light Gray */
  --input: 217 10% 90%;              /* Light Gray */
  --ring: 217 100% 19%;              /* Navy Blue */
  --radius: 0.5rem;
}
```

**Dark Mode Colors:**
```css
.dark {
  --background: 148 30% 6%;          /* Dark Green */
  --foreground: 150 10% 98%;         /* Off-white */
  --primary: 150 35% 45%;            /* Teal/Green */
  --primary-foreground: 0 0% 100%;   /* White */
  --secondary: 148 20% 15%;          /* Dark Green */
  --secondary-foreground: 150 10% 98%;
  --accent: 150 35% 45%;             /* Teal/Green */
  --accent-foreground: 0 0% 100%;
  --muted: 148 20% 15%;
  --muted-foreground: 150 10% 70%;
  --destructive: 0 62.8% 30.6%;      /* Dark Red */
  --destructive-foreground: 0 0% 98%;
  --card: 148 30% 6%;
  --card-foreground: 150 10% 98%;
  --border: 148 20% 20%;
  --input: 148 20% 20%;
  --ring: 150 35% 45%;
}
```

**Add Custom Utility Classes:**

```css
/* Gradient Text */
.gradient-heading {
  background: linear-gradient(135deg, #f78d30 0%, #ff9f4d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text {
  background: linear-gradient(90deg, #f78d30 0%, #ff9f4d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Background Gradients */
.sage-bg-gradient {
  background: linear-gradient(135deg, #002264 0%, #003399 100%);
}

.sage-bg-subtle {
  background: linear-gradient(135deg, rgba(0, 34, 100, 0.05) 0%, rgba(0, 51, 153, 0.05) 100%);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #002264 0%, #003399 50%, #002264 100%);
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Border Gradients */
.gradient-border {
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #f78d30, #ff9f4d) border-box;
}

.sage-border {
  border-color: rgba(0, 34, 100, 0.2);
}

.subtle-border {
  border: 1px solid rgba(0, 34, 100, 0.1);
  transition: border-color 0.3s ease;
}

.subtle-border:hover {
  border-color: rgba(0, 34, 100, 0.3);
}

/* Score Badges */
.score-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
}

.score-badge-excellent {
  background: linear-gradient(135deg, rgba(0, 34, 100, 0.9) 0%, rgba(0, 34, 100, 0.8) 100%);
  color: white;
}

.score-badge-good {
  background: linear-gradient(135deg, rgba(0, 34, 100, 0.8) 0%, rgba(0, 34, 100, 0.6) 100%);
  color: white;
}

.score-badge-needs-work {
  background: linear-gradient(135deg, #f59e0b 0%, #f78d30 100%);
  color: white;
}

.score-badge-poor {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

/* Card Effects */
.card-hover-effect {
  transition: all 0.3s ease;
}

.card-hover-effect:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 34, 100, 0.15);
}

.card-hover {
  transition: border-color 0.3s ease;
}

.card-hover:hover {
  border-color: rgba(0, 34, 100, 0.3);
}

.card-glow {
  box-shadow: 0 0 20px rgba(247, 141, 48, 0.1);
}

.card-glow:hover {
  box-shadow: 0 0 30px rgba(247, 141, 48, 0.2);
}

.card-scale {
  transition: transform 0.3s ease;
}

.card-scale:hover {
  transform: scale(1.02);
}

/* Recommendation Cards */
.recommendation-card {
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recommendation-card-high {
  border-left-color: #002264;
}

.recommendation-card-medium {
  border-left-color: #f78d30;
}

.recommendation-card-low {
  border-left-color: #3b82f6;
}

/* Button Effects */
.rival-button {
  background: #002264;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.rival-button:hover {
  background: #003399;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 34, 100, 0.3);
}

.rival-button-outline {
  border: 2px solid #002264;
  color: #002264;
  background: transparent;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.rival-button-outline:hover {
  background: #002264;
  color: white;
}

.button-glow:hover {
  box-shadow: 0 0 20px rgba(247, 141, 48, 0.4);
}

.button-scale {
  transition: transform 0.2s ease;
}

.button-scale:hover {
  transform: scale(1.05);
}

.button-scale:active {
  transform: scale(0.98);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(247, 141, 48, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(247, 141, 48, 0.6);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes celebrate {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes badge-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slideUp {
  animation: slideUp 0.6s ease-out;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-celebrate {
  animation: celebrate 1.5s ease-in-out;
}

.animate-badge-pop {
  animation: badge-pop 0.5s ease-out;
}

/* Responsive Utilities */
.high-res-layout {
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 1024px) {
  .high-res-layout {
    padding: 2rem;
  }
}

@media (min-width: 1440px) {
  .high-res-layout {
    max-width: 1360px;
  }
}

@media (min-width: 2560px) {
  .high-res-layout {
    max-width: 2200px;
    padding: 3rem;
  }
}

.high-res-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .high-res-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .high-res-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1440px) {
  .high-res-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 2560px) {
  .high-res-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

---

## Priority 2: Dashboard Page Redesign

### File: `src/app/dashboard/page.tsx`

**Current State:** Basic list of audits with minimal styling

**Transform to:**

1. **Hero Section** with gradient background:
```tsx
<div className="sage-bg-gradient py-12 px-4 mb-8 rounded-lg">
  <div className="max-w-4xl mx-auto text-center text-white">
    <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
      Sales SEO Audit Tool
    </h1>
    <p className="text-lg lg:text-xl opacity-90 mb-6">
      AI-powered website analysis for closing more deals
    </p>
    <Button size="lg" variant="secondary" className="animate-pulse-glow">
      <Plus className="w-5 h-5 mr-2" />
      Create New Audit
    </Button>
  </div>
</div>
```

2. **Stats Cards** with gradient borders and animations:
```tsx
<div className="high-res-grid mb-8">
  <Card className="gradient-border card-hover-effect animate-fadeIn">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Audits</p>
          <p className="text-3xl font-bold text-primary">{totalAudits}</p>
        </div>
        <FileText className="w-12 h-12 text-secondary opacity-20" />
      </div>
    </CardContent>
  </Card>
  {/* Repeat for other stats */}
</div>
```

3. **Audit Cards** with hover effects and score badges:
```tsx
<Card className="card-hover-effect card-hover subtle-border">
  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardTitle className="text-xl mb-2">{audit.url}</CardTitle>
        {audit.clientName && (
          <CardDescription>{audit.clientName}</CardDescription>
        )}
      </div>
      <Badge className={`score-badge-${getScoreClass(audit.seoScore)} animate-badge-pop`}>
        SEO: {audit.seoScore}
      </Badge>
    </div>
  </CardHeader>
  {/* ... rest of card */}
</Card>
```

4. **Empty State** with illustration and gradient text:
```tsx
<div className="text-center py-16 sage-bg-subtle rounded-lg">
  <FileText className="w-24 h-24 text-secondary mx-auto mb-6 opacity-50 animate-float" />
  <h2 className="text-2xl font-bold gradient-heading mb-4">
    No audits yet
  </h2>
  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
    Create your first SEO audit to start analyzing websites and closing deals
  </p>
  <Button size="lg" className="rival-button button-scale">
    <Plus className="w-5 h-5 mr-2" />
    Create Your First Audit
  </Button>
</div>
```

---

## Priority 3: Audit Detail Page Enhancement

### File: `src/app/audits/[id]/page.tsx`

**Enhancements:**

1. **Header Section** with gradient background:
```tsx
<div className="bg-gradient-primary text-white rounded-lg p-6 lg:p-8 mb-8 animate-fadeIn">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h1 className="text-3xl lg:text-4xl font-bold mb-2">{audit.url}</h1>
      {audit.clientName && (
        <p className="text-lg opacity-90">{audit.clientName}</p>
      )}
    </div>
    <Badge className="bg-white/20 text-white hover:bg-white/30">
      {audit.status}
    </Badge>
  </div>
  <p className="text-sm opacity-75">
    Created {formatDate(audit.createdAt)}
  </p>
</div>
```

2. **Score Cards** with circular progress and gradients:
```tsx
<div className="high-res-grid mb-8">
  <Card className="card-hover-effect text-center">
    <CardContent className="p-6">
      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center">
        <span className="text-4xl font-bold text-white">
          {audit.seoScore}
        </span>
      </div>
      <h3 className="font-semibold text-lg">SEO Score</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {getScoreLabel(audit.seoScore)}
      </p>
    </CardContent>
  </Card>
  {/* Repeat for A11y and Design */}
</div>
```

3. **Claude Analysis** with styled card:
```tsx
<Card className="mb-8 sage-bg-subtle border-l-4 border-l-secondary">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-secondary animate-sparkle" />
      AI Analysis
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="prose max-w-none">
      {audit.claudeAnalysis}
    </div>
  </CardContent>
</Card>
```

4. **Screenshots** with hover zoom effect:
```tsx
<div className="grid md:grid-cols-2 gap-6 mb-8">
  <div className="relative group">
    <h3 className="font-semibold mb-3">Desktop View</h3>
    <div className="overflow-hidden rounded-lg border-2 sage-border">
      <img
        src={audit.screenshotDesktop}
        alt="Desktop"
        className="w-full transition-transform duration-300 group-hover:scale-110"
      />
    </div>
  </div>
  {/* Same for mobile */}
</div>
```

5. **Recommendations** with priority indicators:
```tsx
<div className="space-y-3">
  {recommendations.map((rec, index) => (
    <div
      key={index}
      className={`recommendation-card recommendation-card-${rec.priority}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
          rec.priority === 'high' ? 'text-primary' :
          rec.priority === 'medium' ? 'text-secondary' : 'text-blue-500'
        }`} />
        <div>
          <h4 className="font-semibold mb-1">{rec.title}</h4>
          <p className="text-sm text-muted-foreground">{rec.description}</p>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## Priority 4: Reports Pages Polish

### File: `src/app/reports/page.tsx`

**Enhancements:**

1. **Page Header** with gradient and actions:
```tsx
<div className="mb-8">
  <div className="sage-bg-gradient rounded-lg p-6 lg:p-8 mb-6 text-white">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Reports</h1>
        <p className="text-lg opacity-90">
          Create professional multi-URL audit reports
        </p>
      </div>
      <Button size="lg" variant="secondary" className="button-scale">
        <Plus className="w-5 h-5 mr-2" />
        New Report
      </Button>
    </div>
  </div>
</div>
```

2. **Report Cards** with enhanced styling:
```tsx
<Card className="card-hover-effect gradient-border">
  <CardHeader className="sage-bg-subtle">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardTitle className="text-xl gradient-text mb-2">
          {report.name}
        </CardTitle>
        {report.description && (
          <CardDescription className="line-clamp-2">
            {report.description}
          </CardDescription>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="button-scale">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="button-scale text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="pt-4">
    {/* ... */}
  </CardContent>
</Card>
```

### File: `src/app/reports/[id]/page.tsx`

**Enhancements:**

1. **PDF Section** with status indicators:
```tsx
<Card className="card-glow mb-6">
  <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
    <CardTitle className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-primary" />
      PDF Report
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-6">
    {report.pdfUrl ? (
      <div className="flex items-center gap-4 animate-fadeIn">
        <CheckCircle2 className="w-8 h-8 text-green-500 animate-celebrate" />
        <div className="flex-1">
          <p className="font-semibold text-lg">PDF Generated</p>
          <p className="text-sm text-muted-foreground">Ready to download</p>
        </div>
        <Button className="rival-button button-glow">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    ) : (
      <Button className="rival-button button-scale animate-pulse-glow">
        <FileText className="w-4 h-4 mr-2" />
        Generate PDF
      </Button>
    )}
  </CardContent>
</Card>
```

---

## Priority 5: Public Report View Enhancement

### File: `src/app/reports/share/[token]/page.tsx`

**Transform to:**

1. **Professional Header** with branding:
```tsx
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
  <div className="sage-bg-gradient py-8 px-4 mb-8">
    <div className="max-w-6xl mx-auto text-center text-white">
      <div className="mb-4">
        <span className="text-4xl font-bold">Rival Digital</span>
        <p className="text-sm opacity-75 mt-1">SEO Audit Report</p>
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold mb-2">
        {report.name}
      </h1>
      {report.description && (
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          {report.description}
        </p>
      )}
      {report.pdfUrl && (
        <Button size="lg" variant="secondary" className="mt-6 button-scale">
          <Download className="w-5 h-5 mr-2" />
          Download Full Report
        </Button>
      )}
    </div>
  </div>
  {/* ... rest of content */}
</div>
```

2. **Audit Cards** with professional styling:
```tsx
<Card className="card-hover-effect overflow-hidden">
  <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {index + 1}. {audit.url}
        </h2>
        {audit.clientName && (
          <p className="opacity-90">{audit.clientName}</p>
        )}
      </div>
      {audit.isHomepage && (
        <Badge className="bg-secondary text-white">
          Homepage
        </Badge>
      )}
    </div>
  </div>
  {/* ... scores and content */}
</Card>
```

---

## Priority 6: Navigation & Layout

### File: `src/app/layout.tsx` or create navigation component

**Add Professional Navigation:**

```tsx
<nav className="sage-bg-gradient text-white">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-bold">
          Sales SEO Audit Tool
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-secondary transition-colors">
            Dashboard
          </Link>
          <Link href="/reports" className="hover:text-secondary transition-colors">
            Reports
          </Link>
          <Link href="/sitemap-audit" className="hover:text-secondary transition-colors">
            Sitemap Audit
          </Link>
        </div>
      </div>
      <UserButton />
    </div>
  </div>
</nav>
```

---

## Priority 7: Component Library Updates

### File: Update existing shadcn components

**Button Component:**
- Update default variant to use `bg-primary` (navy)
- Update secondary variant to use `bg-secondary` (orange)
- Add hover effects and transitions

**Badge Component:**
- Add gradient variants
- Update color schemes to match brand

**Card Component:**
- Add hover effects by default
- Update border colors

---

## Priority 8: Loading States & Skeletons

**Add branded loading states:**

```tsx
<div className="flex items-center justify-center min-h-[400px]">
  <div className="text-center">
    <div className="w-16 h-16 border-4 border-primary border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
    <p className="text-muted-foreground animate-pulse">Loading...</p>
  </div>
</div>
```

---

## Success Criteria

After implementing these changes, the application should have:

✅ **Consistent Brand Identity**
- Navy blue (#002264) as primary color throughout
- Orange (#f78d30) as secondary/accent color
- Professional gradients and color combinations

✅ **Enhanced Visual Appeal**
- Smooth animations and transitions
- Hover effects on interactive elements
- Gradient backgrounds and borders
- Professional card designs

✅ **Improved User Experience**
- Clear visual hierarchy
- Intuitive navigation
- Engaging empty states
- Loading states with brand colors
- Responsive design across all breakpoints

✅ **Professional Polish**
- Consistent spacing and typography
- Score badges with gradient backgrounds
- Recommendation cards with priority indicators
- Screenshot galleries with zoom effects
- Status badges with semantic colors

✅ **Data Visualization**
- Circular progress indicators
- Color-coded scores (excellent/good/needs work/poor)
- Chart integrations (if applicable)
- Interactive elements

---

## Implementation Notes

1. **Start with `globals.css`** - Apply the base color system and utility classes
2. **Update major pages** - Dashboard, audit detail, reports
3. **Polish components** - Cards, badges, buttons with new styling
4. **Add animations** - Subtle entrance animations and hover effects
5. **Test responsiveness** - Ensure everything works on mobile/tablet/desktop
6. **Review consistency** - Check that all pages use the same design language

---

## Testing Checklist

- [ ] All pages use navy blue as primary color
- [ ] Orange accents used appropriately for CTAs and highlights
- [ ] Gradients applied to headers and key sections
- [ ] Hover effects work on all interactive elements
- [ ] Animations are smooth and professional
- [ ] Loading states show brand colors
- [ ] Empty states are engaging
- [ ] Score badges use gradient backgrounds
- [ ] Cards have subtle hover effects
- [ ] Typography is consistent (headings, body text)
- [ ] Spacing follows design system
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode looks professional (if implemented)

---

## Reference Files

- **Design System**: `/docs/DESIGN_SYSTEM.md`
- **Current Globals**: `src/app/globals.css`
- **All Pages**: `src/app/**/*.tsx`
- **Components**: `src/components/**/*.tsx`

Apply this design system comprehensively to transform the Sales SEO Audit Tool into a visually stunning, professional application that matches the Rival Digital brand identity!
