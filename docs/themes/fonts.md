# Typography & Font System Architecture

## Overview
Stage 42.7 implements a high-performance, self-hosted web font delivery subsystem for Nasrify themes. Fonts are stored directly within Cloudflare R2 (`ecommerce-perf-assets/fonts/`) and streamed by the storefront edge worker (`/api/fonts/[...path]`). This completely removes third-party CDN latency, privacy tracking, and external dependencies.

---

## 1. Two-Tiered Architecture

| Tier | Availability | Catalog Size | Destination |
| :--- | :--- | :--- | :--- |
| **Basic Visual Editor (Core)** | Free / Built-in | 21 Curated Fonts (`is_curated = 1`) | Core Themes Engine |
| **Advanced Editor (Stage 42.6)** | Paid App / Premium | 300+ Google Fonts | Advanced Design App |

### Curated Fonts (21 Active Families)
- **Sans-Serif (11)**: Inter, Poppins, Roboto, Open Sans, Lato, Montserrat, Raleway, DM Sans, Manrope, Plus Jakarta Sans, Outfit
- **Serif (5)**: Playfair Display, Merriweather, Lora, Cormorant Garamond, Libre Baskerville
- **Display (2)**: Bebas Neue, Anton
- **Handwriting (2)**: Caveat, Pacifico
- **Monospace (1)**: JetBrains Mono

---

## 2. R2 Asset Storage & Organization

All fonts are compressed into modern `.woff2` files and organized by slug, weight, style, and character subset:

```text
ecommerce-perf-assets/
└── fonts/
    ├── inter/
    │   ├── 400-normal-latin.woff2
    │   ├── 400-normal-latin-ext.woff2
    │   ├── 700-normal-latin.woff2
    │   └── 700-normal-latin-ext.woff2
    ├── playfair-display/
    │   ├── 400-normal-latin.woff2
    │   └── 700-normal-latin.woff2
    └── ...
```

### Storage Headers & Caching
All font files served through `/api/fonts/[...path]` include:
- `Content-Type: font/woff2`
- `Cache-Control: public, max-age=31536000, immutable`
- `Access-Control-Allow-Origin: *`

---

## 3. Subsetting & Loading Strategy

1. **Only Used Fonts Loaded**:
   The active theme's `settings.fonts.heading` and `settings.fonts.body` are inspected at render time. Only these two families are ever injected into the DOM.
2. **Subsets**:
   - `latin` (default)
   - `arabic` (stored and ready for future RTL / Urdu support)
3. **Weights**:
   - Heading: 400, 700
   - Body: 400, 700
4. **Preloading**:
   The primary regular weight (400) for heading and body fonts is injected as `<link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous">` in the document `<head>`.
5. **No Flash of Invisible Text (FOIT)**:
   All `@font-face` rules specify `font-display: swap;`, guaranteeing text remains readable immediately with tailored system fallbacks.

---

## 4. Robust Fallback Chains

Each font category features an optimized system fallback chain to eliminate Cumulative Layout Shift (CLS):
- **Sans**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Serif**: `Georgia, Cambria, "Times New Roman", Times, serif`
- **Display**: `"Impact", "Arial Black", system-ui, sans-serif`
- **Handwriting**: `"Comic Sans MS", "Brush Script MT", cursive, sans-serif`
- **Mono**: `"JetBrains Mono", "SF Mono", Monaco, Consolas, monospace`

---

## 5. Admin Font Manager & Theme Editor

- **Font Manager UI**: Located at `/admin/settings/fonts`. Allows super-admins to view font previews, filter by category, toggle curated status, and trigger font syncs.
- **FontPicker Component**: Embedded inside the Theme Editor (`GlobalSettings.tsx`). Displays preview samples rendered directly in the selected font family, filtered by category tabs.
- **Real-Time Live Preview**: Theme changes broadcast font settings over `postMessage` (`UPDATE_THEME`). The preview iframe dynamically applies `@font-face` definitions and updates `--theme-font-heading` and `--theme-font-body` CSS variables instantly.

---

## 6. How to Add Custom Fonts

Store owners or admins can upload `.woff2` files directly:
1. Provide font metadata (family, category, weights, license).
2. Upload `.woff2` files to R2 under `fonts/{slug}/{weight}-{style}-{subset}.woff2`.
3. Register the record in D1 `fonts` table via API or Admin UI.

---

## 7. Performance Targets & Metrics

- **Total Font Payload Target**: < 100 KB per theme (verified ~83 KB for Inter, ~20 KB for Playfair Display).
- **Storefront Response Time**: < 10 ms CPU time on Cloudflare Workers.
- **No Third-Party Requests**: 0 requests to `fonts.googleapis.com` or `fonts.gstatic.com`.
