# Rival Outranker Design System

This document outlines the design system used throughout the Rival Outranker application, including colors, typography, spacing, components, and patterns.

## Table of Contents

- [Brand Identity](#brand-identity)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Animations](#animations)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)

---

## Brand Identity

Rival Outranker uses the **Rival Digital** brand identity featuring:
- **Primary Color**: Navy Blue (`#002264`)
- **Secondary Color**: Orange (`#f78d30`)
- **Design Philosophy**: Professional, modern, data-driven with interactive elements

---

## Color System

### Semantic Color Tokens

The application uses a semantic color system with HSL-based CSS variables for consistent theming and dark mode support.

#### Light Mode

```css
--background: 0 0% 100%           /* White */
--foreground: 217 100% 19%        /* Navy Blue #002264 */
--primary: 217 100% 19%           /* Navy Blue #002264 */
--primary-foreground: 0 0% 100%   /* White */
--secondary: 29 92% 58%           /* Orange #f78d30 */
--secondary-foreground: 0 0% 100% /* White */
--accent: 29 92% 58%              /* Orange #f78d30 */
--accent-foreground: 0 0% 100%    /* White */
--muted: 217 30% 96%              /* Light Navy */
--muted-foreground: 217 30% 40%   /* Medium Navy */
--destructive: 0 84.2% 60.2%      /* Red */
--destructive-foreground: 60 9.1% 97.8%
--card: 0 0% 100%                 /* White */
--card-foreground: 217 100% 19%   /* Navy Blue */
--border: 217 10% 90%             /* Light Gray */
--input: 217 10% 90%              /* Light Gray */
--ring: 217 100% 19%              /* Navy Blue */
```

#### Dark Mode

```css
--background: 148 30% 6%          /* Dark Green */
--foreground: 150 10% 98%         /* Off-white */
--primary: 150 35% 45%            /* Teal/Green */
--primary-foreground: 0 0% 100%   /* White */
--secondary: 148 20% 15%          /* Dark Green */
--secondary-foreground: 150 10% 98%
--accent: 150 35% 45%             /* Teal/Green */
--accent-foreground: 0 0% 100%
--muted: 148 20% 15%
--muted-foreground: 150 10% 70%
--destructive: 0 62.8% 30.6%      /* Dark Red */
--destructive-foreground: 0 0% 98%
--card: 148 30% 6%
--card-foreground: 150 10% 98%
--border: 148 20% 20%
--input: 148 20% 20%
--ring: 150 35% 45%
```

### Utility Color Classes

#### Status/Semantic Colors
- **Success**: `bg-green-100 text-green-800` (light) / `bg-green-500` (solid)
- **Warning**: `bg-yellow-100 text-yellow-800` (light) / `bg-amber-500` (solid)
- **Info**: `bg-blue-100 text-blue-800` (light) / `bg-blue-400` (solid)
- **Error**: `bg-red-100 text-red-800` (light) / `bg-red-500` (solid)

#### Chart Colors
```css
--chart-1: hsl(var(--chart-1))
--chart-2: hsl(var(--chart-2))
--chart-3: hsl(var(--chart-3))
--chart-4: hsl(var(--chart-4))
--chart-5: hsl(var(--chart-5))
```

#### Custom Gradient Classes

**Text Gradients**:
```css
.gradient-heading    /* Orange gradient for headings */
.gradient-text       /* Orange gradient for text */
```

**Background Gradients**:
```css
.sage-bg-gradient    /* Primary color gradient */
.sage-bg-subtle      /* Subtle primary background */
.bg-gradient-primary /* Animated primary gradient */
```

**Border Gradients**:
```css
.gradient-border     /* Orange gradient border */
.sage-border         /* Primary border with opacity */
.subtle-border       /* Interactive border with hover */
```

### Score-Based Colors

**Score Badges**:
- **Excellent**: `from-primary/90 to-primary/80` (Navy gradient)
- **Good**: `from-primary/80 to-primary/60` (Medium Navy gradient)
- **Needs Work**: `from-amber-500 to-amber-400` (Orange/Yellow gradient)
- **Poor**: `from-red-500 to-red-400` (Red gradient)

---

## Typography

### Font Stack

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Applied via**: `@apply font-sans antialiased`

### Type Scale

#### Base Sizes (Mobile-first)

| Element | Mobile | Desktop | 1440p | 4K | 8K |
|---------|--------|---------|-------|----|----|
| `h1` | `text-3xl` (1.75rem) | `text-4xl` | `text-5xl` | `text-6xl` | `text-7xl` |
| `h2` | `text-xl` | `text-3xl` | `text-3xl` | `text-4xl` | `text-6xl` |
| `h3` | `text-lg` | `text-2xl` | — | `text-2xl` | — |
| `body` | `text-base` | `text-base` | — | `text-lg` | `text-xl` |

### Font Weights

- **Regular**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semibold**: `font-semibold` (600)
- **Bold**: `font-bold` (700)

### Line Heights

- **Tight**: `leading-tight` (1.25)
- **Normal**: `leading-normal` (1.5)
- **Relaxed**: `leading-relaxed` (1.625)
- **Headings**: `leading-none` (1.0) with `tracking-tight`

### Typography Utilities

```css
.text-muted-foreground  /* Reduced emphasis text */
.text-card-foreground   /* Card body text */
.text-sm                /* Small text (0.875rem) */
.text-xs                /* Extra small (0.75rem) */
```

---

## Spacing & Layout

### Spacing Scale (Tailwind Default)

Uses Tailwind's default spacing scale based on `0.25rem` (4px) increments:

| Token | Value | Use Case |
|-------|-------|----------|
| `0` | 0px | No spacing |
| `1` | 4px | Tiny gaps |
| `2` | 8px | Small gaps |
| `3` | 12px | Medium gaps |
| `4` | 16px | Default spacing |
| `6` | 24px | Large spacing |
| `8` | 32px | Extra large |
| `10` | 40px | Section spacing |
| `12` | 48px | Major sections |

### Border Radius

```css
--radius: 0.5rem        /* Base radius (8px) */
border-radius-lg: var(--radius)
border-radius-md: calc(var(--radius) - 2px)  /* 6px */
border-radius-sm: calc(var(--radius) - 4px)  /* 4px */
```

**Common uses**:
- `rounded-md` - Most UI elements (8px)
- `rounded-lg` - Cards, panels (8px)
- `rounded-full` - Badges, pills, avatars

### Container Widths

| Breakpoint | Max Width | Class |
|------------|-----------|-------|
| Mobile | 100% | — |
| Desktop | — | `max-w-3xl` (48rem) |
| 1440p | 1360px | `max-w-[1360px]` |
| 4K | 2200px | `max-w-[2200px]` |
| 8K | 3840px | `max-w-[3840px]` |

**Layout Classes**:
```css
.high-res-layout        /* Responsive container with padding */
.container              /* Centered container with responsive max-width */
```

### Grid System

```css
.high-res-grid          /* Responsive grid layout */
```

**Breakpoint behavior**:
- Mobile: 1 column
- Tablet (640px+): 2 columns
- Desktop (1024px+): 3 columns
- 1440p+: 4 columns
- 4K+: 5-6 columns

---

## Components

### Buttons

**Variants** (via `buttonVariants`):

```typescript
variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
size: 'default' | 'sm' | 'lg' | 'icon'
```

**Variant Styles**:
- `default`: Navy blue background, white text
- `secondary`: Orange background, white text
- `outline`: Border with transparent background
- `ghost`: Transparent, hover accent
- `destructive`: Red background for dangerous actions
- `link`: Underlined text, no background

**Size Presets**:
- `sm`: `h-9 px-3` - Compact buttons
- `default`: `h-10 px-4 py-2` - Standard buttons
- `lg`: `h-11 px-8` - Prominent CTAs
- `icon`: `h-10 w-10` - Square icon buttons

**Custom Classes**:
```css
.rival-button         /* Brand primary button */
.rival-button-outline /* Brand outline button */
.button-glow          /* Hover glow effect */
.button-scale         /* Scale on hover/active */
```

### Cards

**Base Component**:
```tsx
<Card>
  <CardHeader>
    <CardTitle />
    <CardDescription />
  </CardHeader>
  <CardContent />
  <CardFooter />
</Card>
```

**Styling**:
- Background: `bg-card`
- Border: `border` with `shadow-sm`
- Padding: `p-6` for header/content/footer
- Border radius: `rounded-lg`

**Effect Classes**:
```css
.card-hover-effect    /* Lift and shadow on hover */
.card-hover           /* Border color change on hover */
.card-glow            /* Glow shadow effect */
.card-scale           /* Scale transform on hover */
.card-container       /* Responsive padding */
```

### Badges

**Variants**:

```typescript
variant: 'default' | 'secondary' | 'destructive' | 'outline' |
         'success' | 'warning' | 'info' | 'gradient'
```

**Styling**:
- Size: `px-2.5 py-0.5`
- Text: `text-xs font-semibold`
- Shape: `rounded-full`
- Border: `border` (for outline variant)

**Score Badges**:
```css
.score-badge              /* Base score badge */
.score-badge-excellent    /* Navy gradient */
.score-badge-good         /* Light navy gradient */
.score-badge-needs-work   /* Amber gradient */
.score-badge-poor         /* Red gradient */
```

### Recommendation Cards

```css
.recommendation-card       /* Base card with left border */
.recommendation-card-high  /* Navy left border */
.recommendation-card-medium /* Amber left border */
.recommendation-card-low   /* Blue left border */
```

**Structure**:
- Padding: `p-4`
- Left border: `border-l-4`
- Shadow: `shadow-sm` with hover lift
- Margin: `mb-3`

### Other Components

**Input Fields**:
- Border: `border-input`
- Background: `bg-background`
- Focus ring: `ring-2 ring-ring ring-offset-2`

**Separators**:
- Color: `bg-border`
- Standard component from Radix UI

**Loading States**:
- Skeleton: `bg-muted` with pulse animation
- Spinners: Uses animation utilities

---

## Animations

### Keyframe Animations

| Animation | Use Case | Duration |
|-----------|----------|----------|
| `fadeIn` | Element entrance | 0.5s |
| `slideUp` | Content reveal | 0.6s |
| `accordion-down` | Accordion expand | 0.2s |
| `accordion-up` | Accordion collapse | 0.2s |
| `bounce` | Attention-grabbing | 1.5-2s infinite |
| `pulse` | Loading states | 2-3s infinite |
| `pulse-glow` | Button emphasis | 2s infinite |
| `sparkle` | Celebratory effect | 2s infinite |
| `float` | Floating elements | 6s infinite |
| `celebrate` | Success celebration | 1.5s |
| `badge-pop` | Badge entrance | 0.5s |

### Animation Utility Classes

```css
.animate-fadeIn           /* Fade in entrance */
.animate-slideUp          /* Slide up entrance */
.animate-bounce-slow      /* Slow bounce (2s) */
.animate-bounce-delay-0   /* Staggered bounce (0ms delay) */
.animate-bounce-delay-300 /* Staggered bounce (300ms delay) */
.animate-bounce-delay-600 /* Staggered bounce (600ms delay) */
.animate-pulse-slow       /* Slow pulse (3s) */
.animate-pulse-glow       /* Glowing pulse */
.animate-sparkle          /* Sparkle effect */
.animate-float            /* Floating animation */
.animate-celebrate        /* Celebration animation */
.animate-badge-pop        /* Badge pop-in */
```

### Transition Classes

**Default transitions**:
```css
transition-colors  /* Color changes - 150ms */
transition-all     /* All properties - 300ms */
```

**Custom durations**:
```css
duration-200       /* Quick interactions */
duration-300       /* Standard interactions */
duration-500       /* Smooth transitions */
```

---

## Responsive Design

### Breakpoints

| Name | Min Width | Tailwind Prefix |
|------|-----------|-----------------|
| Mobile | 0px | (default) |
| Tablet | 640px | `sm:` |
| Desktop | 1024px | `lg:` |
| Large Desktop | 1280px | `xl:` |
| 1440p | 1440px | Custom media query |
| 4K | 2560px | Custom media query |
| 8K | 4320px | Custom media query |

### Mobile Optimizations

**Layout**:
```css
.mobile-padding       /* px-3 py-4 */
.mobile-stack         /* flex-col gap-4 */
.mobile-full-width    /* w-full */
.mobile-text-center   /* text-center */
```

**Touch Targets**:
- Minimum button size: `min-h-[44px] min-w-[44px]`
- Increased padding for better tap accuracy

**Typography**:
- Reduced heading sizes
- Line height adjustments for readability

**SEO Buddy Mobile**:
- Special positioning for mobile chat interface
- Fixed positioning with optimized viewport sizing

### High-Resolution Displays

**1440p+ Enhancements**:
- Increased container widths
- Larger typography scale
- More grid columns
- Enhanced spacing

**4K+ Enhancements**:
- Scale UI elements by 1.05-1.1x
- Larger icons (1.25x)
- Increased text sizes
- Wider containers (80% viewport)

**8K Optimizations**:
- Base font size: 20px (vs 16px)
- Scale UI by 1.1x
- Maximum container: 3840px

---

## Accessibility

### Focus States

All interactive elements include visible focus rings:
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

### Color Contrast

- Primary text on background: WCAG AAA compliant
- Secondary text: WCAG AA minimum
- Interactive elements: Clear hover/active states

### Motion & Animation

- Smooth scroll behavior: `scroll-behavior: smooth`
- Respects `prefers-reduced-motion` (via Tailwind)
- Optional animations for enhanced UX

### Screen Reader Support

- Semantic HTML structure
- ARIA labels on interactive components
- Radix UI primitives with built-in accessibility

---

## Usage Guidelines

### Importing Styles

```tsx
import "@/index.css"  // Includes all design system styles
```

### Using Color Tokens

```tsx
<div className="bg-primary text-primary-foreground">
  Navy blue background with white text
</div>

<div className="bg-secondary text-secondary-foreground">
  Orange background with white text
</div>
```

### Component Composition

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="secondary" size="lg">
      Call to Action
    </Button>
  </CardContent>
</Card>
```

### Custom Utilities

```tsx
// Gradient text
<h1 className="gradient-heading">Branded Heading</h1>

// Hover effects
<Card className="card-hover card-glow">Animated Card</Card>

// Responsive layout
<div className="high-res-layout high-res-grid">
  {/* Grid items */}
</div>
```

---

## Design Tokens Reference

### CSS Variables Location

All design tokens are defined in: `client/src/index.css`

**Root variables**:
```css
:root { /* Light mode tokens */ }
.dark { /* Dark mode tokens */ }
```

### Tailwind Configuration

Tailwind extensions defined in: `tailwind.config.ts`

**Includes**:
- Custom color mappings to CSS variables
- Animation keyframes
- Border radius tokens
- Theme extensions

---

## Related Files

| File | Purpose |
|------|---------|
| `client/src/index.css` | Global styles, CSS variables, custom utilities |
| `tailwind.config.ts` | Tailwind configuration and theme extensions |
| `client/src/components/ui/` | Reusable component library (Radix UI) |
| `client/src/lib/utils.ts` | Utility functions (cn for className merging) |

---

## Version History

- **v1.0** - Initial design system documentation (2025)
- Based on modular 2025 architecture refactoring

---

## Contributing

When adding new styles or components:

1. Follow existing naming conventions
2. Use semantic color tokens, not hardcoded values
3. Ensure responsive behavior across all breakpoints
4. Include hover/focus states for interactivity
5. Test in both light and dark modes
6. Document new patterns in this file

---

**Maintained by**: Rival Digital
**Framework**: React + Tailwind CSS + Radix UI
**Design System**: Custom semantic tokens with HSL color system
