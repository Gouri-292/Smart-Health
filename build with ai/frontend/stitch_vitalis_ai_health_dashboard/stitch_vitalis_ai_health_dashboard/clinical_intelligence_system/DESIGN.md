---
name: Clinical Intelligence System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#727783'
  outline-variant: '#c2c6d4'
  surface-tint: '#005db6'
  primary: '#00478d'
  on-primary: '#ffffff'
  primary-container: '#005eb8'
  on-primary-container: '#c8daff'
  inverse-primary: '#a9c7ff'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#90f4e8'
  on-secondary-container: '#007169'
  tertiary: '#00514f'
  on-tertiary: '#ffffff'
  tertiary-container: '#006b68'
  on-tertiary-container: '#6beee9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468c'
  secondary-fixed: '#90f4e8'
  secondary-fixed-dim: '#73d7cc'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#74f7f1'
  tertiary-fixed-dim: '#53dad5'
  on-tertiary-fixed: '#00201f'
  on-tertiary-fixed-variant: '#00504d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 280px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for public sector healthcare environments, prioritizing high-stakes clarity and institutional trust. The brand personality is professional, calm, and intelligent, designed to reduce cognitive load for health administrators and practitioners. 

The aesthetic is **Corporate Modern** with a focus on functional clarity. It blends the structural reliability of Material Design with a refined, airy minimalism. While the overall interface remains grounded and accessible, AI-driven features are distinguished by subtle glassmorphism and soft glows to indicate "living" intelligence without sacrificing the system's serious, governmental tone.

## Colors
The palette is rooted in "Trust Blue" (#005EB8), a standard for authoritative healthcare and government communication. 

- **Primary (Trust Blue):** Used for primary actions, navigation headers, and core branding.
- **Secondary (Teal):** Used for data visualization and distinguishing healthcare-specific workflows.
- **Tertiary (Mint Green):** Used for success states, AI-driven insights, and positive health indicators.
- **Neutral:** A range of cool grays (Slate) ensures high contrast against the stark white (#FFFFFF) background.
- **Semantic Colors:** Green, Yellow, and Red are reserved strictly for status pins and critical alerts on the map and data tables.

## Typography
The design system utilizes **Inter** for all UI elements to maximize legibility across varying screen resolutions. 

1. **Hierarchy:** Large displays are used for dashboard headings to provide immediate context. 
2. **Readability:** Body text maintains a minimum of 14px for accessibility. 
3. **Labels:** Uppercase letter spacing is applied to small labels to ensure they remain distinct from body copy in data-heavy tables.
4. **Data:** Monospaced numerals (from JetBrains Mono) may be used within data tables for alignment of health metrics and financial figures.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop, centered within a 1440px max-width container to prevent line-lengths from becoming unreadable.

- **Grid:** A 12-column grid with 24px gutters.
- **Sidebar:** A persistent 280px vertical navigation occupies the left side, providing a clear hierarchy of sections.
- **Responsive Behavior:** 
  - **Desktop (>1024px):** Sidebar is expanded; 3-column stats cards.
  - **Tablet (768px - 1023px):** Sidebar collapses to icons; 2-column stats cards.
  - **Mobile (<767px):** Sidebar becomes a bottom navigation or "hamburger" menu; 1-column layout; margins reduced to 16px.

## Elevation & Depth
This design system uses **Tonal Layers** and **Ambient Shadows** to define hierarchy.

- **Surface 0 (Background):** #F8FAFC (Neutral Slate).
- **Surface 1 (Cards/Panels):** #FFFFFF with a soft, 4% opacity shadow (Y: 2px, Blur: 8px) and a subtle 1px border (#E2E8F0).
- **Surface 2 (Active States/Modals):** A more pronounced 12% opacity shadow (Y: 8px, Blur: 24px) to draw focus.
- **AI Recommendation Panels:** These use a background blur (12px) and a semi-transparent white fill (80% opacity) to create a "glass" effect that suggests a separate, intelligent layer of the interface.

## Shapes
The shape language is modern and approachable. A standard radius of **16px (rounded-lg)** is applied to all primary cards, AI panels, and larger containers. 

Buttons and input fields utilize a slightly tighter **8px (rounded-md)** to maintain a professional, structured feel. Map pins and status indicators use a full circle (pill-shaped) to distinguish them as interactive or high-visibility markers.

## Components
- **Sidebar:** Features a high-contrast background (Primary Blue or Dark Slate) with "active" states indicated by a Mint Green vertical bar on the left edge of the menu item.
- **Statistics Cards:** Include a top-left icon (24px, Secondary Teal), a large display value, and a "Trend Indicator" at the bottom (green/red text with a small arrow icon).
- **Data Tables:** Use a header with a subtle gray fill (#F1F5F9). Rows have a 1px bottom border; on hover, the entire row shifts to a 2% Teal tint.
- **AI Recommendation Panels:** Framed with a 1.5px gradient border (Trust Blue to Mint Green) and a light backdrop blur to signify AI-generated content.
- **Interactive Charts:** Use a specific color sequence: Secondary Teal, Primary Blue, then Tertiary Mint. Line charts should use a 2px stroke width with smoothed (Bezier) curves.
- **Buttons:** Primary buttons are solid Trust Blue with white text. Secondary buttons are outlined with 1px borders. Actionable icons use a 40x40px touch target.