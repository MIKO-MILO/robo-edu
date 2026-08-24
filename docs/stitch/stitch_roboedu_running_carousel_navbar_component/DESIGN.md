---
name: Cognitive Edge
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#404751'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#707882'
  outline-variant: '#c0c7d3'
  surface-tint: '#0062a2'
  primary: '#005f9e'
  on-primary: '#ffffff'
  primary-container: '#0a78c5'
  on-primary-container: '#fdfcff'
  inverse-primary: '#9dcaff'
  secondary: '#5b5f64'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e7'
  on-secondary-container: '#5f6369'
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
  secondary-fixed: '#dfe2e9'
  secondary-fixed-dim: '#c3c7cd'
  on-secondary-fixed: '#181c21'
  on-secondary-fixed-variant: '#43474d'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#ffb875'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6b3b00'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  logo:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  nav-link:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system for this educational platform is rooted in a **Modern Corporate** aesthetic with a focus on clarity, accessibility, and professional growth. It is designed to evoke a sense of structured innovation—bridging the gap between technical robotics and approachable learning.

The visual direction prioritizes high-contrast legibility and a systematic "Digital Lab" feel. It utilizes a clean, airy layout with purposeful whitespace to reduce cognitive load, ensuring that complex educational content remains digestible. The emotional response should be one of confidence, reliability, and forward-looking optimism.

## Colors
The color palette is built around a primary "Trust Blue" intended for high-level branding elements and navigation backgrounds. 

- **Primary (#2483D0):** Used for the global navbar, primary action buttons, and active states.
- **Secondary/Surface (#F2F5FC):** Acts as the primary canvas color for sections and the main background for components, providing a soft contrast against pure white.
- **Text/Neutral (#1A1C1E):** A deep, near-black charcoal used for body text to ensure maximum readability and WCAG AA compliance.
- **Accent (#FF9D00):** A warm amber used sparingly for notifications, highlights, or "New" badges to create visual interest without overwhelming the blue/white core.

## Typography
The system exclusively uses **Outfit**, a geometric sans-serif that balances technical precision with friendly, rounded terminals.

- **Headings & Logo:** Set in Bold (700) weight. The logo and H1 levels share the 32px sizing to maintain a strong brand presence.
- **Navigation:** SemiBold (600) at 20px ensures high visibility and touch-target clarity in the primary header.
- **Body Text:** Standardized at 16px for optimal reading density, using the Regular (400) weight.
- **Mobile Scaling:** Large headlines scale down to 28px on mobile devices to prevent awkward line breaks while maintaining impact.

## Layout & Spacing
The design system employs a **Fixed Grid** philosophy for desktop to maintain structural integrity of educational dashboards, transitioning to a **Fluid Grid** for mobile devices.

- **Grid:** A 12-column system for desktop (1280px max-width) with 24px gutters.
- **Rhythm:** An 8px linear scale is used for all internal component padding and margins (8, 16, 24, 32, 48, 64).
- **Navigation:** The navbar is fixed to the top with a height of 80px, utilizing the primary color background with secondary color text/links.

## Elevation & Depth
To maintain a "clean and modern" look, the system uses **Tonal Layering** supplemented by **Ambient Shadows**. 

Depth is communicated through:
1.  **Level 0 (Base):** The secondary color (#F2F5FC) acting as the main page background.
2.  **Level 1 (Surface):** Pure white (#FFFFFF) cards and containers. These use a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)) to appear slightly lifted.
3.  **Level 2 (Interactive):** Elements like dropdowns or hovered cards use a slightly more pronounced shadow (0px 8px 30px rgba(36, 131, 208, 0.08)) to indicate interactivity, often tinted with the primary blue.

## Shapes
The shape language is defined as **Rounded**, mirroring the circular motifs in the Outfit typeface. 

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) corner radius.
- **Large Containers:** Content sections and main dashboard cards use a 1rem (16px) radius.
- **Interactive Triggers:** Search bars and specific pill-style tags may use the "Full" (999px) roundedness to distinguish them from structural content boxes.

## Components
- **Buttons:** Primary buttons use the #2483D0 background with #F2F5FC text. They feature a subtle 2px transform on hover (lift) and a darken state on click.
- **Navigation Bar:** The global header uses the primary blue. Links are #F2F5FC with an underline or opacity shift (0.8 to 1.0) on hover.
- **Cards:** White backgrounds with 16px padding and 1rem rounded corners. They should use the Level 1 shadow defined in the Elevation section.
- **Input Fields:** 8px rounded corners, 1px border using a muted version of the primary blue (#2483D0 at 20% opacity). On focus, the border becomes the solid primary color with a 3px soft outer glow.
- **Progress Indicators:** For learning modules, use a thick 8px stroke weight with the primary color for the "completed" track and the secondary color for the "remaining" track.
- **Chips/Badges:** Small, 4px rounded elements using the secondary color as a background and the primary color for the label text.