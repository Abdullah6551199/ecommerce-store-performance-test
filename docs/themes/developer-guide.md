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

## 6. Cache Invalidation Flow

When an administrator activates a theme via `/admin/themes`:
1. `nasrify-admin` updates `active_theme` in D1 and writes an entry in `theme_audit_log`.
2. `nasrify-admin` sends a signed cross-worker request to `https://nasrify-store.zia291930.workers.dev/api/cache/invalidate`.
3. `nasrify-store` invalidates in-memory micro-cache (`invalidateActiveThemeCache()`) and purges edge HTML cache for `/`.
4. Subsequent requests to the storefront immediately read and render the new active theme.
