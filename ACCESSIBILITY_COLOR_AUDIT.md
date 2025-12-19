# Visual Accessibility Color Audit

## Current Implementation Analysis

### ✅ What's Already Good

1. **Warm, welcoming base**: Current palette uses soft warm cream background (`oklch(0.98 0.01 80)`) - already aligned with recommendation for off-white backgrounds
2. **Dark text on light background**: Using dark blue-gray (`oklch(0.25 0.02 250)`) for foreground - good contrast
3. **Avoiding pure white/black**: Already using soft colors instead of harsh extremes
4. **Family-friendly aesthetic**: Current blue/orange/green palette is warm and approachable
5. **OKLCH color space**: Already using modern OKLCH which provides better perceptual uniformity

### 🔄 Areas for Improvement

#### 1. **Primary Action Color**
- **Current**: Friendly blue `oklch(0.55 0.15 230)`
- **Recommended**: Deep forest green `#1F5E4B` (approximately `oklch(0.38 0.08 160)`)
- **Rationale**: Green conveys nature, stability, trust, and is less stimulating than blue
- **Decision**: Update to forest green for better alignment with community/nature theme

#### 2. **Secondary Accent**
- **Current**: Warm orange `oklch(0.65 0.12 50)`
- **Recommended**: Muted terracotta/clay `#C46A4A` (approximately `oklch(0.58 0.10 40)`)
- **Rationale**: Current orange is good but slightly bright; terracotta is warmer and more muted
- **Decision**: Adjust to more muted terracotta

#### 3. **Card Backgrounds**
- **Current**: Pure white `oklch(1 0 0)`
- **Recommended**: Soft warm off-white matching page background
- **Rationale**: Reduces harsh contrast and glare
- **Decision**: Update cards to match background or use very subtle difference

#### 4. **Status Colors**
- **Current**: Standard destructive red
- **Recommended**: Deep muted red `#B91C1C`, muted green `#2F7D5D`, warm amber `#D97706`
- **Rationale**: Less anxiety-inducing, better for neurodivergent users
- **Decision**: Update to muted status colors

#### 5. **Neutral Grays**
- **Current**: Various OKLCH grays
- **Recommended**: `#E5E7EB` and `#9CA3AF`
- **Rationale**: Ensure no gray text lighter than `#6B7280` for readability
- **Decision**: Verify all grays meet minimum contrast requirements

## Recommended Color System Update

### Core Palette (OKLCH Format)

```css
:root {
  /* Base */
  --background: oklch(0.98 0.01 80);        /* Soft warm off-white - KEEP */
  --foreground: oklch(0.25 0.02 250);       /* Deep charcoal - KEEP */
  
  /* Cards - match background for consistency */
  --card: oklch(0.99 0.01 80);              /* Slightly lighter than background */
  --card-foreground: oklch(0.25 0.02 250);  /* Same as foreground */
  
  /* Primary - Forest Green (trust, nature, community) */
  --primary: oklch(0.38 0.08 160);          /* Deep forest green */
  --primary-foreground: oklch(0.99 0 0);    /* White text on green */
  
  /* Secondary - Muted Terracotta (warm, friendly) */
  --secondary: oklch(0.58 0.10 40);         /* Muted terracotta/clay */
  --secondary-foreground: oklch(0.99 0 0);  /* White text */
  
  /* Muted - Soft neutrals */
  --muted: oklch(0.94 0.01 80);             /* Soft beige - KEEP */
  --muted-foreground: oklch(0.50 0.02 250); /* Medium gray - KEEP */
  
  /* Accent - Keep calm green but adjust */
  --accent: oklch(0.55 0.08 160);           /* Lighter forest green for variety */
  --accent-foreground: oklch(0.99 0 0);
  
  /* Status Colors - Muted and accessible */
  --success: oklch(0.45 0.10 160);          /* Muted green #2F7D5D */
  --warning: oklch(0.60 0.15 60);           /* Warm amber #D97706 */
  --destructive: oklch(0.50 0.18 25);       /* Deep muted red #B91C1C */
  --destructive-foreground: oklch(0.99 0 0);
  
  /* Borders and inputs */
  --border: oklch(0.88 0.01 250);           /* Soft gray - KEEP */
  --input: oklch(0.92 0.01 250);            /* Slightly lighter - KEEP */
  --ring: oklch(0.38 0.08 160);             /* Match primary for focus */
}
```

## Typography & Spacing (Already Compliant)

✅ **Font size**: Body text appears to be 16px (default)
✅ **Line height**: Should verify ≥ 1.5
✅ **Font families**: Inter (body) and Poppins (headings) are both highly readable

## Focus States & Interactive Elements

### Current Implementation
- Using `outline-ring/50` globally
- Focus rings are visible

### Recommendations
✅ **Keep visible focus rings** - already implemented
✅ **Ensure focus isn't color-only** - rings provide visual boundary
⚠️ **Verify hover states** - should change more than just color (underline, scale, etc.)

## Badge System (Critical for Accessibility Info)

### Current Status
Need to verify badges use:
1. ✅ Icons + text labels (not color alone)
2. ✅ Consistent background with optional accent
3. ✅ Sufficient contrast ratios

### Example Pattern
```tsx
<Badge variant="outline" className="gap-1">
  <CheckIcon className="w-3 h-3" />
  <span>Change table available</span>
</Badge>
```

## Action Items

1. ✅ **Keep current warm background** - already optimal
2. 🔄 **Update primary color** - blue → forest green
3. 🔄 **Adjust secondary** - orange → muted terracotta
4. 🔄 **Soften card backgrounds** - pure white → soft off-white
5. 🔄 **Update status colors** - to muted versions
6. ✅ **Verify focus states** - check they're not color-only
7. ✅ **Audit badge system** - ensure icons + text
8. ✅ **Check line height** - verify ≥ 1.5
9. ✅ **Test contrast ratios** - all text meets WCAG AA minimum

## Contrast Ratio Verification Needed

Test these combinations:
- [ ] Primary green on white background
- [ ] Primary green with white text
- [ ] Secondary terracotta on white background
- [ ] Secondary terracotta with white text
- [ ] Muted foreground gray on backgrounds
- [ ] Status colors with their foregrounds
- [ ] Border colors visibility

## Seasonal Strategy (Future)

Current palette provides excellent base for seasonal overlays:
- **Christmas**: Add muted evergreen + soft cranberry accents
- **Summer**: Add sage + soft sky blue accents
- **Fall**: Add clay + warm mustard accents
- **Spring**: Add eucalyptus + soft lilac accents

Core colors remain unchanged - only accent highlights shift.
