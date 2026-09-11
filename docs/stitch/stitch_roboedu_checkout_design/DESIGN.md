---
name: RoboEdu Neo-Brutalist
colors:
  surface: '#fdf9ee'
  surface-dim: '#dddacf'
  surface-bright: '#fdf9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3e8'
  surface-container: '#f2eee3'
  surface-container-high: '#ece8dd'
  surface-container-highest: '#e6e2d7'
  on-surface: '#1c1c15'
  on-surface-variant: '#404751'
  inverse-surface: '#323129'
  inverse-on-surface: '#f5f0e5'
  outline: '#707882'
  outline-variant: '#c0c7d3'
  surface-tint: '#0062a2'
  primary: '#005f9e'
  on-primary: '#ffffff'
  primary-container: '#0a78c5'
  on-primary-container: '#fdfcff'
  inverse-primary: '#9dcaff'
  secondary: '#745a2b'
  on-secondary: '#ffffff'
  secondary-container: '#ffdba0'
  on-secondary-container: '#795e2f'
  tertiary: '#894d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ac6200'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#9dcaff'
  on-primary-fixed: '#001d35'
  on-primary-fixed-variant: '#00497c'
  secondary-fixed: '#ffdea9'
  secondary-fixed-dim: '#e4c289'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5a4316'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#ffb875'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6b3b00'
  background: '#fdf9ee'
  on-background: '#1c1c15'
  surface-variant: '#e6e2d7'
  accent-yellow: '#FFF37E'
  accent-purple: '#A3B1FF'
  accent-soft-blue: '#C9E9F6'
  accent-green: '#A9E8AE'
  accent-pink: '#FFC0DD'
  accent-orange: '#FFD9A0'
  accent-peach: '#FFAFA3'
  muted-fg: '#8F8267'
  muted-bg: '#ECEAE6'
typography:
  display-lg:
    fontFamily: anybody
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: anybody
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: anybody
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: anybody
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: outfit
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  label-sm:
    fontFamily: outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-page: 2rem
  gutter: 1.5rem
  section-gap: 4rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
---

## Brand & Style

The brand personality is energetic, educational, and unpretentious. It targets a dual audience: hobbyists/students looking for excitement, and institutional buyers seeking reliability. The design system leverages **Neo-Brutalism** to stand out in the e-commerce space, moving away from traditional "clean/corporate" SaaS aesthetics toward something that feels tactile, mechanical, and fun—much like the robotics kits it sells.

Key visual pillars:
- **High Contrast:** Sharp definitions between elements using thick dark borders.
- **Physicality:** Use of "Neo-shadows" (hard, unblurred offsets) to make UI elements feel like physical modules.
- **Playfulness:** A warm, neutral base paired with a vibrant palette of pastel accents to categorize products and states.
- **Directness:** Large, bold typography that mirrors the "BUILD. LEARN. CREATE." philosophy.

## Colors

This design system uses a non-traditional palette centered around a warm paper-like neutral (`#F3EFE4`). 

- **Primary & Secondary:** The Primary Blue is reserved for critical calls to action and interactive states. The Dark Brown (`#3D2900`) serves as the "Ink" color, used for all borders, headings, and high-contrast text.
- **Pastel Accents:** These are functional colors used to distinguish product categories or add "stickers" to the UI. For example, a "Robo Kit" might always use an `accent-pink` background on its card, while "Spareparts" use `accent-yellow`.
- **Muted Tones:** Used for secondary information (captions, disabled states) to ensure the hierarchy remains clear despite the high-contrast style.

## Typography

The typography system relies on the interplay between the technical, wide-set character of **Anybody** (substituting for Unbounded) for headlines and the clean, approachable nature of **Outfit** for body text.

- **Headlines:** Should always be high-weight (700+) to withstand the visual weight of the 2px borders. Use "Display" sizes for Hero sections with tight letter spacing.
- **Body Text:** Designed for high legibility on the warm neutral background. 
- **Interactive Labels:** Buttons and navigation items use `label-bold` with uppercase treatment to emphasize the "Neo-brutalist" character.

## Layout & Spacing

This design system uses a **fixed grid** model for desktop to maintain a "modular box" feel, and a fluid layout for mobile. 

- **Grid:** A 12-column grid for desktop with 24px gutters. Elements should align strictly to the grid edges to reinforce the "built" aesthetic.
- **Rhythm:** Spacing follows a strict 8px base unit. 
- **Margins:** Page margins are generous (32px on mobile, 64px+ on desktop) to allow the "hard shadows" of containers to breathe without clipping.
- **Mobile Reflow:** On mobile, complex card layouts stack vertically, and horizontal padding reduces to 16px.

## Elevation & Depth

Depth is not communicated through light and air (soft shadows), but through **hard offsets** and **borders**.

- **Neo-Shadow:** Elements appear elevated by using a solid, non-blurred shadow (`4px 4px 0px 0px #3D2900`). This shadow never fades; it represents a physical offset.
- **Interactive States:** When an element is hovered, it should simulate being "pressed" into the page. The element translates `2px, 2px` towards the shadow, and the shadow itself shrinks to `2px 2px`.
- **Tonal Layering:** Use the `muted-bg` (`#ECEAE6`) for inset areas like input fields or code blocks to show they are "cut into" the surface, while primary cards sit "on top."

## Shapes

The shape language is "Soft-Square." While Neo-brutalism often uses sharp 0px corners, this design system uses a slight radius (`4px` or `0.25rem`) to maintain the "Edu" (educational/friendly) aspect of the brand.

- **Containers:** All primary containers (cards, modals, sections) use the standard `rounded-sm`.
- **Inner Elements:** Elements inside containers (like tags or variant selectors) use the same radius to maintain nested harmony.
- **Exceptions:** Badge icons or "New" tags may use `rounded-full` (pill) to provide visual variety against the modular grid.

## Components

### Buttons
- **Style:** 2px solid border (`#3D2900`), `neo-shadow`, and `label-bold` text.
- **Variants:** Primary (Blue), Secondary (Butter), or Accent (Pink/Yellow/Green).
- **Behavior:** On hover, the button moves down-right by 2px and the shadow reduces.

### Product Cards
- **Structure:** A container with a 2px border and a background color from the Pastel Accent palette.
- **Image:** Housed in a sub-box with a bottom border, separating the visual from the product metadata.
- **Metadata:** Price and Variant options must be clearly demarcated.

### Input Fields
- **Style:** Background `#ECEAE6`, 2px border, no shadow (to appear "sunken").
- **Focus State:** The border remains `#3D2900`, but a primary blue shadow appears.

### Status Indicators (Timeline)
- **Logic:** Follow the `PENDING` → `COMPLETED` order. 
- **Visual:** Use thick vertical lines (2px) and solid circles for completed steps, and dashed lines for upcoming steps.

### Chips & Tags
- **Style:** Small, uppercase text in a box with a 1px border. No shadow for secondary tags; small `neo-shadow-icon` (2px) for primary category tags.