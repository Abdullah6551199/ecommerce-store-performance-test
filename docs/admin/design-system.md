# Nasrify Admin Design System

## 1. Overview & Philosophy

The **Nasrify Admin Portal** employs a fixed, professional, multi-tenant design system modeled after best-in-class commerce software (e.g. Shopify Admin). Unlike the storefront—which dynamically adapts to store-specific theme presets—the administration interface maintains an immutable, reliable, high-contrast visual architecture based on the **Nasrify Green & Dark Palette**.

---

## 2. Color Palette & Design Tokens

### Primary Brand Colors
- **Admin Primary**: `#25D366` — Primary actions, active navigation items, brand badges, and confirmation buttons.
- **Admin Primary Hover**: `#1EA855` — Hover and focus states for primary interactive elements.
- **Admin Primary Light**: `#DCFCE7` — Subtle badges, notification chips, and active table row highlights.
- **Admin Primary Dark**: `#15803D` — Pressed states and high-contrast indicators.

### Neutrals & Structural Surfaces
- **Admin Accent / Dark**: `#18181B` — Primary typography, dark headers, modal backdrops, and solid badge backgrounds.
- **Admin Background**: `#FFFFFF` (Light) / `#09090B` (Dark) — Canvas background for main viewports.
- **Admin Surface**: `#F4F4F5` (Light) / `#18181B` (Dark) — Card backgrounds, table containers, and sidebar surfaces.
- **Admin Surface Hover**: `#E4E4E7` (Light) / `#27272A` (Dark).
- **Admin Border**: `#E4E4E7` (Light) / `#27272A` (Dark) — Hairline separators, input borders, and table borders.
- **Admin Text**: `#18181B` (Light) / `#FAFAFA` (Dark) — Body text and headings.
- **Admin Text Muted**: `#71717A` (Light) / `#A1A1AA` (Dark) — Secondary descriptions and placeholders.

---

## 3. CSS Variables (`globals.css`)

```css
:root {
  --admin-primary: #25D366;
  --admin-primary-hover: #1EA855;
  --admin-primary-light: #DCFCE7;
  --admin-accent: #18181B;
  --admin-bg: #FFFFFF;
  --admin-surface: #F4F4F5;
  --admin-text: #18181B;
  --admin-text-muted: #71717A;
  --admin-border: #E4E4E7;
}

:root.dark, html.dark {
  --admin-bg: #09090B;
  --admin-surface: #18181B;
  --admin-accent: #25D366;
  --admin-text: #FAFAFA;
  --admin-text-muted: #A1A1AA;
  --admin-border: #27272A;
}
```

---

## 4. UI Components & Patterns

### A. Navigation & Shell (`AdminShell.tsx`)
- **Brand Header**: Rounded green badge (`#25D366`) with lightning glyph, title `Nasrify Admin`.
- **Navigation Links**:
  - Inactive: Neutral muted text (`text-zinc-600 dark:text-zinc-400`), hover background `bg-zinc-100 dark:bg-zinc-800/60`.
  - Active: Left border / pill border in green (`border-[#25D366]/40`), subtle background (`bg-[#25D366]/10`), green icon (`text-[#25D366]`), and active indicator pip (`bg-[#25D366]`).
- **Connection Indicator**: Animated green pulse (`bg-[#25D366]`) with status label `Live Database Connected`.

### B. Action Buttons
- **Primary Action**: `bg-[#25D366] hover:bg-[#1EA855] text-white font-bold rounded-xl shadow-md shadow-[#25D366]/20`.
- **Secondary Action**: `bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200`.
- **Danger Action**: `bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl`.
- **Ghost Action**: `hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400`.

### C. Visual Theme Editor UI
The Theme Editor UI (`TopBar`, `SectionsList`, `SettingsPanel`, `SectionPicker`) employs the admin green palette for controls, device switchers, and publish modals, while isolating the customer-facing storefront preview within the center iframe.
