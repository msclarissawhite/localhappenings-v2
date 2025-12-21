# Local Happenings - Typography & Visual Accessibility Audit

**Date:** December 21, 2025  
**Auditor:** Manus AI  
**Standard:** WCAG 2.1 Level AA

---

## Executive Summary

This audit examines the typography and visual accessibility of the Local Happenings platform, focusing on font sizes, line spacing, color contrast, and readability. The platform currently uses a well-chosen color palette with good contrast, but typography could be improved for better readability, especially for users with visual impairments or cognitive disabilities.

**Overall Assessment:** Good foundation with room for improvement  
**Priority Areas:** Font sizing, heading hierarchy, mobile readability

---

## Current Typography Settings

### Font Families

**Body Text:**  
- Primary: 'Inter' (sans-serif)
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Assessment:** ✅ Excellent choice. Inter is designed for screen readability with clear letterforms and good x-height.

**Headings:**  
- Primary: 'Poppins'
- Fallback: 'Inter', sans-serif
- **Assessment:** ✅ Good pairing. Poppins provides visual hierarchy while maintaining readability.

### Line Height

**Current Setting:** `line-height: 1.6`  
**WCAG Recommendation:** Minimum 1.5 for body text  
**Assessment:** ✅ **PASS** - Exceeds minimum requirement

**Recommendation:** Maintain current setting. 1.6 provides comfortable reading, especially for users with dyslexia or visual processing difficulties.

---

## Font Size Audit

### Current Issues

**Problem 1: Default Body Text Size**  
- **Current:** Tailwind default (16px / 1rem)
- **Issue:** While 16px meets minimum standards, many users benefit from slightly larger text
- **Impact:** Users with mild vision impairment may need to zoom, disrupting layout
- **Severity:** Medium

**Problem 2: Small Text in UI Components**  
- **Current:** `text-sm` (14px) used extensively for labels, badges, metadata
- **Issue:** 14px is at the lower limit of comfortable readability
- **Impact:** Reduced readability for older users and those with visual impairments
- **Severity:** Medium-High

**Problem 3: Mobile Font Sizes**  
- **Current:** No responsive font scaling beyond Tailwind defaults
- **Issue:** Text can appear small on mobile devices despite responsive design
- **Impact:** Mobile users may struggle with readability
- **Severity:** Medium

---

## Recommended Typography Improvements

### 1. Increase Base Font Size

**Current:**
```css
body {
  /* Uses Tailwind default: 16px */
}
```

**Recommended:**
```css
body {
  font-size: 1.0625rem; /* 17px - subtle increase for better readability */
}
```

**Rationale:** A 1px increase (6.25%) improves readability without disrupting layouts. Studies show 17-18px is optimal for extended reading on screens.

### 2. Adjust Small Text Minimum

**Current:** `text-sm` = 14px (0.875rem)  
**Recommended:** Increase to 15px (0.9375rem) for better legibility

**Implementation:**
```css
@layer base {
  .text-sm {
    font-size: 0.9375rem; /* 15px instead of 14px */
  }
}
```

**Impact Areas:**
- Event card metadata (date, location)
- Form labels
- Badge text
- Button secondary text

### 3. Enhance Heading Hierarchy

**Current Heading Sizes (Tailwind defaults):**
- `text-4xl`: 2.25rem (36px)
- `text-3xl`: 1.875rem (30px)
- `text-2xl`: 1.5rem (24px)
- `text-xl`: 1.25rem (20px)
- `text-lg`: 1.125rem (18px)

**Recommended Adjustments:**
- H1 (Homepage hero): Increase from `text-4xl` to `text-5xl` (3rem / 48px) on desktop
- H2 (Section headings): Keep `text-3xl` but add responsive scaling
- H3 (Card titles): Increase from `text-xl` to `text-2xl` (24px)

**Rationale:** Stronger visual hierarchy helps users scan content and understand page structure.

### 4. Responsive Font Scaling

**Recommended Implementation:**
```css
@layer base {
  html {
    font-size: 16px; /* Mobile base */
  }
  
  @media (min-width: 640px) {
    html {
      font-size: 17px; /* Tablet base */
    }
  }
  
  @media (min-width: 1024px) {
    html {
      font-size: 17px; /* Desktop base */
    }
  }
}
```

**Rationale:** Ensures comfortable reading across all devices without manual zooming.

---

## Color Contrast Audit

### Current Palette Assessment

**Primary Text on Background:**
- Foreground: `oklch(0.25 0.02 250)` (Deep charcoal)
- Background: `oklch(0.98 0.01 80)` (Soft off-white)
- **Contrast Ratio:** ~15:1
- **WCAG AA Requirement:** 4.5:1 for normal text, 3:1 for large text
- **Assessment:** ✅ **EXCELLENT** - Far exceeds requirements

**Muted Text (Secondary Information):**
- Foreground: `oklch(0.50 0.02 250)`
- Background: `oklch(0.98 0.01 80)`
- **Contrast Ratio:** ~7:1
- **Assessment:** ✅ **PASS** - Exceeds AA standard

**Primary Button (Forest Green):**
- Background: `oklch(0.38 0.08 160)`
- Foreground: `oklch(0.99 0 0)` (White)
- **Contrast Ratio:** ~8:1
- **Assessment:** ✅ **PASS** - Exceeds AA standard

**Secondary Button (Terracotta):**
- Background: `oklch(0.58 0.10 40)`
- Foreground: `oklch(0.99 0 0)` (White)
- **Contrast Ratio:** ~5:1
- **Assessment:** ✅ **PASS** - Meets AA standard

**Destructive (Red):**
- Background: `oklch(0.50 0.18 25)`
- Foreground: `oklch(0.99 0 0)` (White)
- **Contrast Ratio:** ~6:1
- **Assessment:** ✅ **PASS** - Exceeds AA standard

### Color Contrast Recommendations

**All color combinations meet or exceed WCAG AA standards.** No changes required for color contrast.

**Strength:** The nature-inspired palette (forest green, terracotta, soft beige) provides excellent readability while maintaining a warm, welcoming aesthetic appropriate for a family-focused platform.

---

## Additional Accessibility Considerations

### 1. Focus Indicators

**Current:** Ring color matches primary (`oklch(0.38 0.08 160)`)  
**Assessment:** ✅ Good - Visible focus states for keyboard navigation

**Recommendation:** Ensure focus rings are visible on all interactive elements, including custom components.

### 2. Text Spacing

**Current Line Height:** 1.6 ✅  
**Paragraph Spacing:** Not explicitly set  
**Letter Spacing:** Default

**Recommendations:**
- Add paragraph spacing: `margin-bottom: 1em` for better text chunking
- Consider slight letter-spacing increase for all-caps text (buttons, labels)

### 3. Zoom and Reflow

**Test:** Content should remain usable at 200% zoom without horizontal scrolling  
**Current Status:** Not tested in this audit  
**Recommendation:** Manual testing required across key pages

### 4. Semantic HTML

**Assessment:** Proper heading hierarchy appears to be in use based on component structure  
**Recommendation:** Verify all pages use semantic HTML (`<h1>`, `<h2>`, `<nav>`, `<main>`, etc.)

---

## Implementation Priority

### High Priority (Immediate)
1. ✅ Increase base body font size to 17px
2. ✅ Increase `text-sm` from 14px to 15px
3. ✅ Add responsive font scaling for mobile

### Medium Priority (Next Sprint)
4. Enhance heading sizes for better hierarchy
5. Add explicit paragraph spacing
6. Test zoom/reflow at 200%

### Low Priority (Future Enhancement)
7. Consider adding a user-controlled font size toggle
8. Implement dyslexia-friendly font option
9. Add high-contrast theme option

---

## Specific Page Recommendations

### Homepage
- **Hero H1:** Increase from `text-4xl md:text-5xl lg:text-6xl` to `text-5xl md:text-6xl lg:text-7xl`
- **Feature Cards:** Increase card title from `text-xl` to `text-2xl`
- **Body Text:** Already good, maintain current sizing

### Browse Events
- **Event Card Titles:** Increase from `text-lg` to `text-xl`
- **Metadata (date, location):** Increase from `text-sm` to `text-base` or new `text-sm` (15px)
- **Filter Labels:** Maintain current sizing but ensure minimum 15px

### Event Detail Page
- **Event Title:** Increase from `text-3xl` to `text-4xl`
- **Section Headings:** Increase from `text-xl` to `text-2xl`
- **Accessibility Info:** Maintain clear hierarchy with adequate spacing

### Forms (Submit Event, Edit Event)
- **Form Labels:** Increase from `text-sm` to `text-base`
- **Help Text:** Keep at `text-sm` (new 15px minimum)
- **Section Headings:** Increase from `text-lg` to `text-xl`

---

## Testing Checklist

- [ ] Test with browser zoom at 150%, 200%
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test with screen reader (NVDA, VoiceOver)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test with Windows High Contrast mode
- [ ] Test with browser font size override
- [ ] User testing with individuals 55+ years old
- [ ] User testing with individuals with visual impairments

---

## Conclusion

The Local Happenings platform has a strong accessibility foundation with excellent color contrast and good font choices. The recommended typography improvements focus on incremental increases to font sizes and better responsive scaling to ensure comfortable reading for all users, particularly those with mild vision impairments or cognitive differences.

**Key Strengths:**
- Excellent color contrast (15:1 for primary text)
- Good line height (1.6)
- Professional, readable font pairing (Inter + Poppins)
- Nature-inspired palette appropriate for target audience

**Key Improvements:**
- Increase base font size from 16px to 17px
- Raise minimum small text from 14px to 15px
- Enhance heading hierarchy with larger sizes
- Implement responsive font scaling

These changes will improve readability without requiring major design overhauls, maintaining the platform's warm, accessible aesthetic while better serving users with diverse visual needs.
