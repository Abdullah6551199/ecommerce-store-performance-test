# Advanced Theme Editor App (Stage 42.6)

## Overview
The **Advanced Theme Editor** is a premium paid modular app (`apps/advanced-theme-editor/`) that extends the Nasrify Theme Editor with Elementor-like visual design capabilities. It integrates seamlessly via the `admin.theme-editor.advanced` extension point and injects high-performance scoped CSS directly into the storefront rendering engine with zero runtime JavaScript overhead.

## Architecture

```
apps/advanced-theme-editor/
├── manifest.json                  # App metadata, permissions, extension point
├── icon.svg                       # Elementor-style visual logo
├── shared/
│   └── types.ts                   # Complete TypeScript types for styling, motion, and layout
├── lib/
│   ├── css-generator.ts           # CSS compiler for scoped section styles, media queries & keyframes
│   ├── animation-presets.ts       # 20 curated entrance animations & CSS keyframe blocks
│   ├── responsive.ts              # Breakpoint configurations (Desktop, Tablet, Mobile)
│   ├── presets.ts                 # Style preset library (typography, button, shadow, spacing)
│   └── settings.ts                # App settings fetcher with 20s micro-cache & React.cache
├── admin/
│   ├── AdvancedEditorWrapper.tsx   # Elementor-style editor panel & sub-tab switcher
│   ├── tabs/
│   │   ├── ContentTab.tsx         # Section content controls (inherited from basic editor)
│   │   ├── StyleTab.tsx           # Visual styling: Typography, Background, Border, Shadow, Effects
│   │   └── AdvancedTab.tsx        # Layout, Motion Effects, Responsive Visibility, Custom CSS
│   ├── controls/
│   │   ├── TypographyControl.tsx   # Font family, weight, responsive font-size, line-height, letter-spacing
│   │   ├── ColorControl.tsx        # Hex + native color picker
│   │   ├── BackgroundControl.tsx   # Classic, Gradient (linear/radial), Image upload & overlays
│   │   ├── BorderControl.tsx       # Solid/dashed/dotted, linkable widths, per-corner radii
│   │   ├── BoxShadowControl.tsx    # Offset X/Y, blur, spread, color, inset/outline
│   │   ├── SpacingControl.tsx      # Linkable margin & padding controls
│   │   ├── ResponsiveControl.tsx   # Desktop / Tablet / Mobile breakpoint switcher
│   │   ├── AnimationControl.tsx    # Entrance animation picker, duration, delay, easing
│   │   ├── CustomCSSControl.tsx    # Scoped custom CSS editor with 'selector' keyword support
│   │   └── ZIndexControl.tsx       # Stacking context control
│   └── api/
│       └── settings/route.ts      # Settings API with Zod validation
```

## Features

### 1. Elementor-Style Tab Navigation
- **Content Tab**: Modify section text, buttons, images, and content toggles.
- **Style Tab**:
  - **Typography**: 21 curated Google Fonts + 300+ advanced fonts, responsive font sizes, font weights (100–900), text transform, decoration, and font styling.
  - **Background**: Classic solid colors, Linear/Radial gradients with customizable angles, and background images with size, repeat, and attachment modes.
  - **Border**: Border style, linkable widths (top/right/bottom/left), custom colors, and per-corner border radii.
  - **Box Shadow**: Inset/outline positions, X/Y offsets, blur, spread, and RGBA color picker.
  - **Effects**: Section opacity, CSS filters (blur, brightness, contrast, saturate, hue-rotate), mix blend modes, and 2D transforms.
- **Advanced Tab**:
  - **Layout**: Linkable margins, linkable paddings, width modes (auto/full/custom), max-width, min-height, overflow, positioning (relative/absolute/fixed/sticky), and z-index.
  - **Motion Effects**: 20 curated entrance animations (`fadeIn`, `fadeInUp`, `slideInUp`, `zoomIn`, `bounceIn`, etc.) with customizable duration, delay, and easing.
  - **Responsive Controls**: Device visibility toggles (hide on desktop, tablet, or mobile).
  - **Custom CSS**: Scoped CSS editor with automatic sanitization (blocks `@import` and external URLs) and dynamic `selector` replacement with `.section-{id}`.

### 2. High-Performance CSS Generation
- Section styles are stored under `section.settings._advanced` in the theme JSON.
- `generateAdvancedCSS` compiles styles into minified scoped CSS rules:
  - Scoped to `.section-{id}`.
  - Media queries for tablet (`<=1024px`) and mobile (`<=767px`).
  - Active animation `@keyframes` deduplicated and appended.
  - Sanitized custom CSS appended with `selector` resolved.
- Output is injected on the storefront page via `<style id="theme-advanced-css">` with a 60-second micro-cache keyed on section configuration fingerprints (<10ms CPU target).

### 3. Presets Library
- Global style presets stored in `advanced_editor_presets` D1 table.
- One-click application of typography, button, and shadow styles across sections.

## Database Schema (Migration 0031)
- `advanced_editor_settings`: Master toggles (`enable_custom_css`, `enable_animations`, `enable_responsive`, `breakpoints`).
- `advanced_editor_presets`: Pre-built reusable style presets.
- `idx_advanced_presets_type`: Index on preset types for instant querying.

## Security & Sanitization
Custom CSS inputs are strictly sanitized before compilation:
- Strips `@import` declarations to avoid external stylesheet injection.
- Strips `url(http...)` and `url(//...)` to block external assets.
- Strips `expression()` and `javascript:` pseudo-protocols.
