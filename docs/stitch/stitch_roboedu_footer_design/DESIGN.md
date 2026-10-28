---
name: Kinetic Education System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d8dae1'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fa'
  surface-container: '#eceef4'
  surface-container-high: '#e6e8ef'
  surface-container-highest: '#e0e2e9'
  on-surface: '#181c21'
  on-surface-variant: '#404751'
  inverse-surface: '#2d3136'
  inverse-on-surface: '#eff0f7'
  outline: '#707882'
  outline-variant: '#c0c7d3'
  surface-tint: '#0062a2'
  primary: '#005f9e'
  on-primary: '#ffffff'
  primary-container: '#0b78c4'
  on-primary-container: '#fdfcff'
  inverse-primary: '#9dcaff'
  secondary: '#45607f'
  on-secondary: '#ffffff'
  secondary-container: '#bedafe'
  on-secondary-container: '#445f7e'
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
  on-primary-fixed-variant: '#00497b'
  secondary-fixed: '#d1e4ff'
  secondary-fixed-dim: '#adc9ec'
  on-secondary-fixed: '#001d35'
  on-secondary-fixed-variant: '#2d4966'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#ffb875'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6b3b00'
  background: '#f8f9ff'
  on-background: '#181c21'
  surface-variant: '#e0e2e9'
typography:
  display-hero:
    fontFamily: Unbounded
    fontSize: 120px
    fontWeight: '900'
    lineHeight: 110%
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Unbounded
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 120%
  headline-lg-mobile:
    fontFamily: Unbounded
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 120%
  headline-md:
    fontFamily: Unbounded
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 130%
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 160%
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 160%
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 140%
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 140%
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system is built for an energetic, future-forward educational platform. The brand personality is **playful yet technically precise**, aiming to evoke a sense of curiosity and modern reliability in students and educators alike.

The aesthetic blends **Modern Minimalism** with **High-Contrast** elements. It utilizes large, expressive typography and a vibrant primary color to create a high-energy environment. The interface remains approachable through the use of a refined neutral foundation that balances the technical blue and earthy secondary tones, maintaining a distinct, high-impact identity without causing digital eye strain.

## Colors

The color palette has been updated to a more sophisticated, multi-tonal professional palette while retaining its energetic core.

- **Primary Blue (#137BC7):** A deep, active blue used for core branding, primary actions, and critical UI states.
- **Muted Steel (#5E7999):** A professional secondary blue-grey used for supporting elements and tonal variation.
- **Amber Accent (#BB6B00):** A warm tertiary color used for highlights, warnings, or specific "call-to-attention" moments.
- **Neutral Grey (#74777D):** A balanced neutral used for secondary text, borders, and UI scaffolding.

The system utilizes these colors to maintain high contrast and accessibility, ensuring clear hierarchy between interactive elements and content surfaces.

## Typography

The system uses a duo of geometric sans-serifs to balance personality with legibility.

- **Unbounded:** A wide, expressive typeface used for headlines and brand-heavy moments. Its variable-width feel gives the UI a contemporary, "robotic" yet friendly edge.
- **Outfit:** A clean, geometric sans-serif used for all body text, links, and functional labels. It ensures high readability even at small sizes.

For large display text (e.g., footers or hero sections), use `display-hero` with tight letter spacing to create a graphic "block" effect. Headlines scale down on mobile to ensure readability.

## Layout & Spacing

The layout follows a **Fluid Grid** system based on an 8px rhythm. 

- **Desktop (1200px+):** 12-column grid with 64px side margins and 24px gutters.
- **Tablet (768px - 1199px):** 8-column grid with 32px side margins.
- **Mobile (Up to 767px):** 4-column grid with 16px side margins.

Spacing is used to create clear content grouping. Sections should be separated by `xl` (80px) spacing to maintain a sense of "air" and premium quality. Small components like list items use `sm` (12px) vertical gaps.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Flat Hierarchy:** Depth is created by contrasting different surface containers (Low to Highest) derived from the neutral and primary palettes.
- **Tonal Layering:** Surfaces use subtle shifts in saturation and brightness to indicate hierarchy, rather than heavy drop shadows.
- **Refined Outlines:** Use `outline` and `outline-variant` colors to define boundaries of cards and inputs. This maintains a clean, graphic look that feels structured and modern.

## Shapes

The shape language is **Rounded (0.5rem base)**. 

While the typography (Unbounded) can feel quite sharp and geometric, the UI containers use a 0.5rem (8px) radius to soften the interface and make it feel more approachable. 
- **Buttons and Inputs:** 0.5rem (Rounded).
- **Cards and Large Containers:** 1rem (Rounded-LG).
- **Interactive Elements:** Maintain consistent 0.5rem rounding to match the "Soft" yet precise aesthetic.

## Components

### Buttons
Primary buttons use the **Primary Blue (#137BC7)** background with white text. Hover states should utilize the `primary-container` color. Secondary buttons use the `secondary` or `outline` treatment.

### Cards
Cards should be flat with a 1px border using the `outline-variant` color or a subtle surface container background. For high-impact cards, use a solid Primary Blue background.

### Input Fields
Inputs use a clear background with a 1px `outline` border. On focus, the border shifts to `primary` blue. Labels (Outfit Semi-Bold) sit above the field.

### Lists
Lists are clean and vertically stacked with no bullets. Use `body-md` for list items and `headline-md` for category titles to ensure a clear typographic scale.

### Chips
Used for tags or filters. Pill-shaped (fully rounded) with `secondary-container` backgrounds and `on-secondary-container` text.