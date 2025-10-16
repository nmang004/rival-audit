# Rival Digital Design System - Sales SEO Audit Tool

> **Updated**: October 2025
> **Version**: 2.0
> **Status**: Fully Implemented ✅

This document outlines the complete Rival Digital design system as implemented in the Sales SEO Audit Tool, including colors, typography, animations, components, and usage patterns.

---

## Table of Contents

- [Brand Identity](#brand-identity)
- [Color System](#color-system)
- [Typography](#typography)
- [Animations](#animations)
- [Utility Classes](#utility-classes)
- [Component Patterns](#component-patterns)
- [Responsive Design](#responsive-design)
- [Usage Examples](#usage-examples)
- [Implementation Notes](#implementation-notes)

---

## Brand Identity

### Core Brand Elements

**Rival Digital** brand identity featuring:

- **Primary Color**: Navy Blue `#002264`
- **Secondary Color**: Orange `#f78d30`
- **Design Philosophy**: Professional, modern, data-driven with interactive elements
- **Animation Style**: Smooth, purposeful, celebrating success

### Visual Hierarchy

1. **Headers**: Navy gradient backgrounds with white text
2. **Accent Elements**: Orange for CTAs, highlights, and interactive feedback
3. **Cards**: Subtle navy tinted backgrounds with gradient borders
4. **Scores**: Navy gradients for SEO/Accessibility, orange for Design

---

## Color System

### OKLCH Color Values

All colors are defined using the OKLCH color space for Next.js Tailwind v4 compatibility.

#### Light Mode

```css
:root {
  /* Backgrounds & Surfaces */
  --background: oklch(1 0 0);                      /* White */
  --card: oklch(1 0 0);                            /* White */
  --popover: oklch(1 0 0);                         /* White */

  /* Text Colors */
  --foreground: oklch(0.24 0.13 265);              /* Navy Blue #002264 */
  --card-foreground: oklch(0.24 0.13 265);         /* Navy Blue */
  --popover-foreground: oklch(0.24 0.13 265);      /* Navy Blue */

  /* Brand Colors */
  --primary: oklch(0.24 0.13 265);                 /* Navy Blue #002264 */
  --primary-foreground: oklch(1 0 0);              /* White */
  --secondary: oklch(0.71 0.15 60);                /* Orange #f78d30 */
  --secondary-foreground: oklch(1 0 0);            /* White */
  --accent: oklch(0.71 0.15 60);                   /* Orange #f78d30 */
  --accent-foreground: oklch(1 0 0);               /* White */

  /* Muted Colors */
  --muted: oklch(0.96 0.01 265);                   /* Light Navy */
  --muted-foreground: oklch(0.45 0.08 265);        /* Medium Navy */

  /* Borders & Inputs */
  --border: oklch(0.92 0.01 265);                  /* Light Gray with navy tint */
  --input: oklch(0.92 0.01 265);                   /* Light Gray */
  --ring: oklch(0.24 0.13 265);                    /* Navy Blue */

  /* Semantic Colors */
  --destructive: oklch(0.577 0.245 27.325);        /* Red */

  /* Chart Colors */
  --chart-1: oklch(0.71 0.15 60);                  /* Orange */
  --chart-2: oklch(0.6 0.118 184.704);             /* Teal */
  --chart-3: oklch(0.398 0.07 227.392);            /* Blue */
  --chart-4: oklch(0.828 0.189 84.429);            /* Yellow */
  --chart-5: oklch(0.769 0.188 70.08);             /* Amber */
}
```

#### Dark Mode

```css
.dark {
  /* Backgrounds & Surfaces */
  --background: oklch(0.16 0.02 148);              /* Dark Green */
  --card: oklch(0.16 0.02 148);                    /* Dark Green */
  --popover: oklch(0.205 0 0);                     /* Dark */

  /* Text Colors */
  --foreground: oklch(0.98 0.01 150);              /* Off-white */
  --card-foreground: oklch(0.98 0.01 150);         /* Off-white */
  --popover-foreground: oklch(0.985 0 0);          /* White */

  /* Brand Colors */
  --primary: oklch(0.56 0.09 150);                 /* Teal/Green */
  --primary-foreground: oklch(1 0 0);              /* White */
  --secondary: oklch(0.23 0.02 148);               /* Dark Green */
  --secondary-foreground: oklch(0.98 0.01 150);    /* Off-white */
  --accent: oklch(0.56 0.09 150);                  /* Teal/Green */
  --accent-foreground: oklch(1 0 0);               /* White */

  /* Muted Colors */
  --muted: oklch(0.23 0.02 148);                   /* Dark Green */
  --muted-foreground: oklch(0.70 0.01 150);        /* Light gray-green */

  /* Borders & Inputs */
  --border: oklch(0.28 0.02 148);                  /* Dark border */
  --input: oklch(0.28 0.02 148);                   /* Dark input */
  --ring: oklch(0.56 0.09 150);                    /* Teal/Green */

  /* Semantic Colors */
  --destructive: oklch(0.45 0.15 27);              /* Dark Red */
}
```

### Color Conversion Reference

| Brand Color | Hex       | OKLCH                    | Usage                          |
|-------------|-----------|--------------------------|--------------------------------|
| Navy Blue   | `#002264` | `oklch(0.24 0.13 265)`  | Primary brand, headers, scores |
| Orange      | `#f78d30` | `oklch(0.71 0.15 60)`   | Secondary, CTAs, accents       |
| Light Navy  | -         | `oklch(0.96 0.01 265)`  | Subtle backgrounds             |
| Medium Navy | -         | `oklch(0.45 0.08 265)`  | Muted text                     |

---

## Typography

### Font Stack

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;
```

Applied via Geist Sans font (Next.js default).

### Type Scale

| Element     | Mobile         | Desktop        | Usage                |
|-------------|----------------|----------------|----------------------|
| Hero        | `text-4xl`     | `text-5xl`     | Main page headings   |
| H1          | `text-3xl`     | `text-4xl`     | Page titles          |
| H2          | `text-2xl`     | `text-3xl`     | Section headings     |
| H3          | `text-xl`      | `text-2xl`     | Subsection headings  |
| Body        | `text-base`    | `text-base`    | Normal text          |
| Small       | `text-sm`      | `text-sm`      | Metadata, labels     |
| Tiny        | `text-xs`      | `text-xs`      | Fine print           |

### Font Weights

- **Regular**: `font-normal` (400) - Body text
- **Medium**: `font-medium` (500) - Emphasis
- **Semibold**: `font-semibold` (600) - Subheadings
- **Bold**: `font-bold` (700) - Headings, important text

### Special Text Classes

```css
.gradient-heading    /* Orange gradient for hero headings */
.gradient-text       /* Orange gradient for emphasized text */
```

**Usage**:
```tsx
<h1 className="text-4xl font-bold gradient-heading">
  Your Heading
</h1>
```

---

## Animations

### Keyframe Animations

All animations are defined in `globals.css` with performance optimization.

#### Entrance Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 0.5s ease-in-out */

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Duration: 0.6s ease-out */
```

#### Interactive Animations

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
/* Duration: 6s ease-in-out infinite */

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
/* Duration: 2s ease-in-out infinite */

@keyframes celebrate {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
/* Duration: 1.5s ease-in-out */
```

#### Background Animations

```css
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
/* Duration: 3s ease infinite */

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px oklch(0.71 0.15 60 / 0.3); }
  50% { box-shadow: 0 0 20px oklch(0.71 0.15 60 / 0.6); }
}
/* Duration: 2s ease-in-out infinite */
```

#### Badge Animations

```css
@keyframes badge-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
/* Duration: 0.5s ease-out */
```

### Animation Utility Classes

```css
.animate-fadeIn        /* Fade in entrance */
.animate-slideUp       /* Slide up entrance */
.animate-float         /* Floating animation */
.animate-sparkle       /* Sparkle effect */
.animate-celebrate     /* Celebration animation */
.animate-pulse-glow    /* Glowing pulse */
.animate-badge-pop     /* Badge pop-in */
.animate-bounce-slow   /* Slow bounce (2s) */
.animate-pulse-slow    /* Slow pulse (3s) */
```

**Usage**:
```tsx
<div className="animate-fadeIn">Fades in on mount</div>
<Card className="animate-slideUp">Slides up on mount</Card>
<Icon className="animate-sparkle">Sparkles continuously</Icon>
```

---

## Utility Classes

### Gradient Classes

#### Text Gradients

```css
.gradient-heading {
  background: linear-gradient(135deg, oklch(0.71 0.15 60) 0%, oklch(0.75 0.14 55) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text {
  background: linear-gradient(90deg, oklch(0.71 0.15 60) 0%, oklch(0.75 0.14 55) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

#### Background Gradients

```css
.sage-bg-gradient          /* Navy blue gradient */
.sage-bg-subtle            /* Subtle navy background with 5% opacity */
.bg-gradient-primary       /* Animated navy gradient (shifts) */
```

**Usage**:
```tsx
<div className="sage-bg-gradient text-white p-8 rounded-lg">
  Hero Section with Navy Gradient
</div>
```

#### Border Gradients

```css
.gradient-border           /* Orange gradient border (2px) */
.sage-border               /* Navy border with 20% opacity */
.subtle-border             /* Navy border with hover effect */
```

### Score Badge Classes

```css
.score-badge               /* Base badge styling */
.score-badge-excellent     /* Navy gradient (score >= 80) */
.score-badge-good          /* Medium navy gradient (score >= 60) */
.score-badge-needs-work    /* Amber/orange gradient (score >= 40) */
.score-badge-poor          /* Red gradient (score < 40) */
```

**Usage**:
```tsx
<div className="score-badge score-badge-excellent">
  SEO: 95
</div>
```

### Card Effect Classes

```css
.card-hover-effect         /* Lift on hover with shadow */
.card-hover                /* Border color change on hover */
.card-glow                 /* Orange glow effect */
.card-scale                /* Scale transform on hover */
```

**Usage**:
```tsx
<Card className="card-hover-effect card-glow">
  Enhanced Card with Hover Effects
</Card>
```

### Button Effect Classes

```css
.rival-button              /* Primary navy button with hover lift */
.rival-button-outline      /* Outline button with fill on hover */
.button-scale              /* Scale on hover/active */
.button-glow               /* Orange glow on hover */
```

**Usage**:
```tsx
<Button className="button-scale button-glow">
  Download Report
</Button>
```

### Recommendation Card Classes

```css
.recommendation-card           /* Base card with left border */
.recommendation-card-high      /* Navy left border (4px) */
.recommendation-card-medium    /* Orange left border (4px) */
.recommendation-card-low       /* Blue left border (4px) */
```

---

## Component Patterns

### Hero Sections

```tsx
<div className="sage-bg-gradient py-12 px-8 mb-8 rounded-lg animate-fadeIn">
  <div className="max-w-4xl mx-auto text-center text-white">
    <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
      Page Title
    </h1>
    <p className="text-lg lg:text-xl opacity-90 mb-6">
      Subtitle or description
    </p>
    <Button variant="secondary" size="lg" className="button-scale">
      Call to Action
    </Button>
  </div>
</div>
```

### Circular Score Displays

```tsx
<Card className="card-hover-effect text-center">
  <CardContent className="py-8">
    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
      <span className="text-5xl font-bold text-white">
        {score}
      </span>
    </div>
    <h3 className="font-semibold text-lg text-primary">SEO Score</h3>
    <p className="text-sm text-muted-foreground mt-1">
      {scoreLabel}
    </p>
  </CardContent>
</Card>
```

### Branded Cards

```tsx
<Card className="card-hover-effect gradient-border">
  <CardHeader className="sage-bg-subtle">
    <CardTitle className="text-2xl gradient-text">
      Card Title
    </CardTitle>
    <CardDescription>
      Card description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Empty States

```tsx
<Card className="sage-bg-subtle border-2 border-dashed sage-border">
  <CardContent className="py-16">
    <div className="flex flex-col items-center text-center">
      <Icon className="w-24 h-24 text-secondary opacity-50 mb-6 animate-float" />
      <h3 className="text-2xl font-bold gradient-heading mb-4">
        No Items Yet
      </h3>
      <p className="text-muted-foreground max-w-md mb-6 text-lg">
        Helpful message explaining what to do
      </p>
      <Button size="lg" className="button-scale animate-pulse-glow">
        <Plus className="w-5 h-5 mr-2" />
        Create First Item
      </Button>
    </div>
  </CardContent>
</Card>
```

### AI Analysis Sections

```tsx
<Card className="sage-bg-subtle border-l-4 border-l-secondary card-glow">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="w-6 h-6 text-secondary animate-sparkle" />
      AI-Powered Analysis
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="prose max-w-none">
      {analysisContent}
    </div>
  </CardContent>
</Card>
```

### Screenshot Galleries

```tsx
<div className="relative group">
  <h3 className="text-sm font-semibold text-primary mb-3">Desktop View</h3>
  <div className="relative border-2 sage-border rounded-lg overflow-hidden bg-gray-100">
    <Image
      src={screenshot}
      alt="Screenshot"
      className="object-contain transition-transform duration-300 group-hover:scale-105"
    />
  </div>
</div>
```

### Status Indicators

```tsx
{/* Success State */}
<div className="flex items-center gap-4">
  <CheckCircle2 className="w-10 h-10 text-green-500 animate-celebrate" />
  <div className="flex-1">
    <p className="font-semibold text-lg text-primary">Success!</p>
    <p className="text-sm text-muted-foreground">Action completed</p>
  </div>
</div>

{/* In Progress State */}
<div className="flex items-center gap-3">
  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
  <div>
    <p className="font-medium">Processing...</p>
    <p className="text-sm text-muted-foreground">Please wait</p>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

| Name       | Min Width | Tailwind Prefix | Usage                    |
|------------|-----------|-----------------|--------------------------|
| Mobile     | 0px       | (default)       | Mobile-first base styles |
| Tablet     | 640px     | `sm:`           | Small tablets            |
| Desktop    | 1024px    | `lg:`           | Desktop displays         |
| Large      | 1280px    | `xl:`           | Large desktops           |
| 1440p      | 1440px    | Custom          | High-res displays        |
| 4K         | 2560px    | Custom          | 4K displays              |

### Responsive Utilities

```css
.high-res-layout {
  margin: 0 auto;
  padding: 1rem;                  /* Mobile */
}

@media (min-width: 1024px) {
  .high-res-layout {
    padding: 2rem;                /* Desktop */
  }
}

@media (min-width: 1440px) {
  .high-res-layout {
    max-width: 1360px;            /* 1440p */
  }
}

@media (min-width: 2560px) {
  .high-res-layout {
    max-width: 2200px;            /* 4K */
    padding: 3rem;
  }
}
```

### Responsive Grid

```css
.high-res-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;           /* Mobile: 1 column */
}

@media (min-width: 640px) {
  .high-res-grid {
    grid-template-columns: repeat(2, 1fr);  /* Tablet: 2 columns */
  }
}

@media (min-width: 1024px) {
  .high-res-grid {
    grid-template-columns: repeat(3, 1fr);  /* Desktop: 3 columns */
  }
}

@media (min-width: 1440px) {
  .high-res-grid {
    grid-template-columns: repeat(4, 1fr);  /* 1440p: 4 columns */
  }
}

@media (min-width: 2560px) {
  .high-res-grid {
    grid-template-columns: repeat(5, 1fr);  /* 4K: 5 columns */
  }
}
```

**Usage**:
```tsx
<div className="high-res-layout">
  <div className="high-res-grid">
    {items.map(item => <Card key={item.id}>{item.name}</Card>)}
  </div>
</div>
```

---

## Usage Examples

### Complete Page Example

```tsx
export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="sage-bg-gradient py-12 px-6 mb-8 rounded-lg animate-fadeIn">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Page Title
            </h1>
            <p className="text-lg lg:text-xl opacity-90 mb-2">
              Professional subtitle
            </p>
            <p className="text-sm opacity-75">
              Powered by Rival Digital
            </p>
          </div>
        </div>

        {/* Content Card */}
        <Card className="mb-8 card-hover-effect animate-slideUp">
          <CardHeader className="sage-bg-subtle">
            <CardTitle className="text-2xl">Section Title</CardTitle>
            <CardDescription>
              Section description
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Content here */}
          </CardContent>
        </Card>

        {/* Grid of Items */}
        <div className="high-res-grid">
          {items.map((item, index) => (
            <Card key={item.id} className="card-hover-effect subtle-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-primary">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Button Variations

```tsx
{/* Primary Action */}
<Button size="lg" className="button-scale">
  Primary Action
</Button>

{/* Secondary Action */}
<Button variant="secondary" size="lg" className="button-scale button-glow">
  <Download className="w-5 h-5 mr-2" />
  Download
</Button>

{/* Outline Action */}
<Button variant="outline" className="button-scale">
  Secondary Action
</Button>

{/* Destructive Action */}
<Button variant="destructive" className="button-scale">
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</Button>
```

### Score Display Variations

```tsx
{/* SEO Score (Navy) */}
<div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
  <span className="text-5xl font-bold text-white">95</span>
</div>

{/* Accessibility Score (Navy) */}
<div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
  <span className="text-5xl font-bold text-white">88</span>
</div>

{/* Design Score (Orange) */}
<div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg">
  <span className="text-5xl font-bold text-white">8.5</span>
</div>
```

---

## Implementation Notes

### File Structure

```
src/
├── app/
│   ├── globals.css              # Complete design system
│   ├── dashboard/page.tsx       # Hero + enhanced UI
│   ├── audits/[id]/page.tsx     # Gradient headers + scores
│   ├── reports/
│   │   ├── page.tsx             # Branded header + cards
│   │   ├── [id]/page.tsx        # PDF/share sections
│   │   └── share/[token]/page.tsx  # Public branded view
│   └── ...
└── components/
    ├── audit/
    │   └── audit-card.tsx       # Enhanced card styling
    └── reports/
        └── report-card.tsx      # Gradient borders + text
```

### Best Practices

1. **Always use semantic color tokens**, not hardcoded OKLCH values:
   ```tsx
   ✅ className="bg-primary text-primary-foreground"
   ❌ style={{ background: 'oklch(0.24 0.13 265)' }}
   ```

2. **Combine utility classes for effects**:
   ```tsx
   <Card className="card-hover-effect gradient-border card-glow">
   ```

3. **Use animations purposefully**:
   - Entrance: `animate-fadeIn`, `animate-slideUp`
   - Continuous: `animate-float`, `animate-sparkle`
   - Celebratory: `animate-celebrate`, `animate-badge-pop`

4. **Maintain consistent spacing**:
   - Section margins: `mb-8`
   - Card padding: `p-6` or `p-8`
   - Hero padding: `py-12 px-6` or `py-12 px-8`

5. **Respect the responsive grid**:
   ```tsx
   <div className="high-res-layout">
     <div className="high-res-grid">
       {/* Items */}
     </div>
   </div>
   ```

6. **Use proper text hierarchy**:
   ```tsx
   <h1 className="text-4xl lg:text-5xl font-bold">Hero</h1>
   <h2 className="text-2xl font-semibold">Section</h2>
   <p className="text-base text-muted-foreground">Body</p>
   ```

### Accessibility Considerations

- **Color Contrast**: All text/background combinations meet WCAG AA standards
- **Focus States**: All interactive elements have visible focus rings
- **Motion**: Animations respect `prefers-reduced-motion` (via Tailwind)
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

### Performance Optimizations

- **CSS Variables**: All colors defined as CSS variables for efficient updates
- **Animation Performance**: Using `transform` and `opacity` for GPU acceleration
- **Gradient Optimization**: Background gradients sized appropriately
- **Responsive Images**: All images use Next.js Image component with proper sizing

---

## Version History

### Version 2.0 (October 2025) - Current
- Complete Rival Digital brand implementation
- OKLCH color system for Tailwind v4
- 50+ custom utility classes
- 12 animation keyframes
- Comprehensive responsive system
- Full documentation

### Version 1.0 (Previous)
- Basic shadcn/ui components
- Default blue theme
- Minimal custom styling

---

## Related Documentation

- [Next.js Tailwind v4 Documentation](https://tailwindcss.com/docs)
- [OKLCH Color Space Guide](https://oklch.com/)
- [shadcn/ui Component Library](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)

---

## Maintenance

When updating the design system:

1. ✅ Test in both light and dark modes
2. ✅ Verify responsive behavior across breakpoints
3. ✅ Check color contrast ratios
4. ✅ Test animations on various devices
5. ✅ Update this documentation
6. ✅ Run build to verify no errors

---

**Maintained by**: Rival Digital
**Framework**: Next.js 15 + Tailwind v4 + Radix UI
**Color System**: OKLCH for perceptual uniformity
**Status**: Production Ready ✅
