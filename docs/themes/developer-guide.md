# Nasrify Themes Framework — Developer Guide

## 1. Architecture Overview

The **Nasrify Themes Framework** is an edge-first, declarative rendering system engineered for Next.js on Cloudflare Workers. It enables dynamic store layout composition, custom design tokens, and hot theme activation with cross-worker cache invalidation and a sub-10ms CPU render budget.

```
┌─────────────────────────────────────────────────────────────┐
│                       Cloudflare Edge                       │
│                                                             │
│   nasrify-admin                        nasrify-store        │
│  ┌───────────────────────┐            ┌───────────────────┐ │
│  │ /admin/themes UI      │            │ RootLayout        │ │
│  │ Theme Duplication     │            │  ↳ CSS Variables  │ │
│  │ Theme Activation      │            │  ↳ Active Theme   │ │
│  └──────────┬────────────┘            └─────────┬─────────┘ │
│             │                                   │           │
│   D1 Write  │  Cross-Worker Invalidation Hook   │ D1 Read   │
│             ▼                                   ▼           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             D1 Database (ecommerce-perf-db)            │ │
│  │  - themes (built-in & custom themes with theme_json)   │ │
│  │  - active_theme (singleton active theme snapshot)      │ │
│  │  - theme_audit_log (full audit tracking)               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Design Philosophy & Performance Budget

1. **Sub-10ms Edge CPU Target**: Themes compile to pure React JSX components mounted at request time without heavy runtime parsers or runtime CSS generation.
2. **Deterministic CSS Tokens**: Global styling (colors, fonts, spacing, border-radius) is translated directly into standard CSS custom properties (`--theme-*`) injected into `<style id="nasrify-theme-vars">`.
3. **Resilient Section Isolation**: Every section component is executed within an isolated error boundary. A failure or missing property in one section never breaks the rest of the page.
4. **Instant Switch / Zero Cold-Start Delay**: Activating a theme updates `active_theme` in D1 and triggers cross-worker cache invalidation on `nasrify-store`. Next incoming visitor requests immediately render the new theme.

---

## 3. Schema Specification: `theme.json`

Every theme is defined by a JSON structure adhering to the `1.0` schema version:

```json
{
  "schema_version": "1.0",
  "name": "Nasrify Default",
  "version": "1.0.0",
  "description": "Clean, minimal modern storefront theme",
  "category": "minimal",
  "is_built_in": 1,
  "settings": {
    "colors": {
      "primary": "#18181B",
      "secondary": "#52525B",
      "accent": "#2563EB",
      "background": "#FFFFFF",
      "surface": "#F4F4F5",
      "text": "#18181B",
      "text_muted": "#71717A",
      "border": "#E4E4E7"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "layout": {
      "container_width": "1280px",
      "section_spacing": "64px",
      "border_radius": "8px"
    }
  },
  "sections": [
    {
      "id": "sec-announcement",
      "type": "announcement",
      "variant": "solid",
      "enabled": true,
      "settings": {
        "text": "Free shipping on orders over $50",
        "link": "/shop",
        "bg_color": "#18181B",
        "text_color": "#FFFFFF",
        "dismissible": true
      }
    }
  ]
}
```

### Settings Schema

| Path | Type | Default | Description |
|---|---|---|---|
| `colors.primary` | HEX/HSL | `#18181B` | Primary branding color (buttons, badges) |
| `colors.secondary` | HEX/HSL | `#52525B` | Secondary branding color |
| `colors.accent` | HEX/HSL | `#2563EB` | Interactive accent highlights and CTAs |
| `colors.background` | HEX/HSL | `#FFFFFF` | Global page background color |
| `colors.surface` | HEX/HSL | `#F4F4F5` | Card and input background color |
| `colors.text` | HEX/HSL | `#18181B` | Primary typography color |
| `colors.text_muted` | HEX/HSL | `#71717A` | Secondary/caption typography color |
| `colors.border` | HEX/HSL | `#E4E4E7` | Border and divider line color |
| `fonts.heading` | String | `Inter` | Font family for headings (`h1`–`h6`) |
| `fonts.body` | String | `Inter` | Font family for body and labels |
| `layout.container_width` | String | `1280px` | Maximum content width (`max-w-*`) |
| `layout.section_spacing` | String | `64px` | Margin/padding between consecutive sections |
| `layout.border_radius` | String | `8px` | Default corner rounding (`rounded-*`) |

---

## 4. CSS Variables Generation

The loader generates standard CSS variables from `theme.settings`:

```css
:root {
  --theme-primary: #18181B;
  --theme-secondary: #52525B;
  --theme-accent: #2563EB;
  --theme-background: #FFFFFF;
  --theme-surface: #F4F4F5;
  --theme-text: #18181B;
  --theme-text-muted: #71717A;
  --theme-border: #E4E4E7;
  --theme-font-heading: 'Inter', sans-serif;
  --theme-font-body: 'Inter', sans-serif;
  --theme-container-width: 1280px;
  --theme-section-spacing: 64px;
  --theme-border-radius: 8px;
}
```

Sections utilize CSS custom properties via utility classes or inline styling for dynamic color overrides.

---

## 5. Rendering Engine

Located at `nasrify-store/lib/themes/engine.tsx`:

```tsx
export function renderTheme(theme: ThemeConfig, storeData: StoreData): React.ReactNode {
  if (!theme || !theme.sections || !Array.isArray(theme.sections)) {
    return null;
  }

  return (
    <>
      {theme.sections
        .filter((s) => s.enabled)
        .map((section) => renderSection(section, theme.settings, storeData))}
    </>
  );
}
```

The rendering engine mounts components matching `section.type`:
- `announcement`: Announcement banner
- `header`: Navigation header with links and controls
- `hero`: Full-width or split hero showcase
- `product_grid`: Responsive grid of catalog items
- `product_carousel`: Horizontal swipeable product carousel
- `categories`: Category showcase
- `testimonials`: Customer reviews and proof
- `newsletter`: Email subscription bar
- `banner`: Promotional marketing banner
- `image_text`: 50/50 split media and storytelling
- `faq`: Interactive collapsible questions and answers
- `footer`: Multi-column footer navigation and social links

---

## 6. Page-Specific Layouts: `page_defaults` System

Beginning in Stage 42.8b, the Themes Framework supports defining page-specific layouts directly within `theme.json` via the `page_defaults` dictionary:

```json
{
  "page_defaults": {
    "product": [
      { "id": "pd-gallery", "type": "product_gallery", "variant": "classic", "enabled": true, "settings": { ... } },
      { "id": "pd-info", "type": "product_info", "variant": "standard", "enabled": true, "settings": { ... } },
      { "id": "pd-tabs", "type": "product_tabs", "variant": "standard", "enabled": true, "settings": { ... } },
      { "id": "pd-reviews", "type": "product_reviews_section", "enabled": true, "settings": { ... } },
      { "id": "pd-related", "type": "product_related", "variant": "grid", "enabled": true, "settings": { ... } }
    ],
    "category": [
      { "id": "pd-cat-hdr", "type": "category_header", "variant": "simple", "enabled": true, "settings": { ... } },
      { "id": "pd-cat-flt", "type": "category_filters", "variant": "sidebar", "enabled": true, "settings": { ... } },
      { "id": "pd-cat-grd", "type": "category_grid", "variant": "standard", "enabled": true, "settings": { ... } }
    ],
    "cart": [
      { "id": "pd-cart", "type": "cart_page_layout", "variant": "standard", "enabled": true, "settings": { ... } }
    ],
    "checkout": [
      { "id": "pd-checkout", "type": "checkout_page_layout", "variant": "single_page", "enabled": true, "settings": { ... } }
    ],
    "account": [
      { "id": "pd-account", "type": "account_dashboard", "variant": "sidebar", "enabled": true, "settings": { ... } }
    ],
    "shop": [
      { "id": "pd-shop-hdr", "type": "page_header", "variant": "simple", "enabled": true, "settings": { ... } },
      { "id": "pd-shop-flt", "type": "category_filters", "variant": "sidebar", "enabled": true, "settings": { ... } },
      { "id": "pd-shop-grd", "type": "category_grid", "variant": "standard", "enabled": true, "settings": { ... } }
    ],
    "page": [
      { "id": "pd-page-hdr", "type": "page_header", "variant": "simple", "enabled": true, "settings": { ... } },
      { "id": "pd-page-cnt", "type": "page_content", "variant": "standard", "enabled": true, "settings": { ... } }
    ]
  }
}
```

### Rendering Page Themes (`renderPageTheme`)
Pages invoke `renderPageTheme(theme, pageType, storeData)` in `nasrify-store/lib/themes/engine.tsx`:

```tsx
import { renderPageTheme } from "@/lib/themes/engine";
import { getActiveTheme } from "@/lib/themes/loader";

export default async function ProductPage({ params }) {
  const theme = await getActiveTheme();
  const storeData = await getProductStoreData(params.slug);

  return (
    <div className="theme-page theme-page-product">
      {renderPageTheme(theme, "product", storeData)}
    </div>
  );
}
```

---

## 7. Cache Invalidation Flow

When an administrator activates a theme via `/admin/themes`:
1. `nasrify-admin` updates `active_theme` in D1 and writes an entry in `theme_audit_log`.
2. `nasrify-admin` sends a signed cross-worker request to `https://nasrify-store.zia291930.workers.dev/api/cache/invalidate`.
3. `nasrify-store` invalidates in-memory micro-cache (`invalidateActiveThemeCache()`) and purges edge HTML cache for `/`.
4. Subsequent requests to the storefront immediately read and render the new active theme.

---

## 8. Advanced Theme Editor (Stage 42.6)

For stores requiring Elementor-like granular design controls, the `advanced-theme-editor` paid app adds an **Advanced** tab to the Theme Editor via the `admin.theme-editor.advanced` extension point:

### Section `_advanced` Configuration
Each section's settings object can store an optional `_advanced` payload containing:
- `style`: Typography, classic/gradient/image background, border, box-shadow, and CSS filters/transform effects.
- `advanced`: Margin/padding layout, entrance motion animations, per-device visibility, and sanitized custom CSS.

```json
{
  "id": "sec-hero",
  "type": "hero",
  "settings": {
    "title": "Welcome",
    "_advanced": {
      "style": {
        "typography": { "fontSize": "32px", "fontWeight": "800", "color": "#0f172a" },
        "background": { "type": "gradient", "gradient": { "color1": "#f8fafc", "color2": "#e2e8f0" } },
        "border": { "type": "solid", "color": "#cbd5e1", "width": { "top": "1px", "bottom": "1px" } },
        "boxShadow": { "x": 0, "y": 8, "blur": 24, "color": "rgba(0,0,0,0.06)" }
      },
      "advanced": {
        "motion": { "entranceAnimation": "fadeInUp", "animationDuration": 800 },
        "customCss": "selector { transition: transform 0.3s ease; }"
      }
    }
  }
}
```

### Storefront Performance Target
The storefront engine (`nasrify-store/lib/themes/engine.tsx`) automatically compiles `_advanced` section data into `<style id="theme-advanced-css">` with a 60-second micro-cache keyed on section configuration fingerprints (<10ms CPU target). All custom CSS is sanitized to eliminate external requests and security risks.

