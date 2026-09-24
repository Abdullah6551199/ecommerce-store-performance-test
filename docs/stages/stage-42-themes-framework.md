# Stage 42 — Themes Framework

## 1. Overview & Architecture
Stage 42 delivers the core **Themes Framework** for the Nasrify e-commerce platform. It transforms the storefront homepage into a dynamic, section-based modular layout engine driven by JSON configurations stored in Cloudflare D1.

- **D1 Database**: `ecommerce-perf-db` (ID: `3a60804b-1009-4451-972b-87cec6d46bcb`)
- **Storefront Worker**: `nasrify-store` (`https://nasrify-store.zia291930.workers.dev`)
- **Admin Worker**: `nasrify-admin` (`https://nasrify-admin.zia291930.workers.dev`)
- **Theme Engine CPU**: <10ms edge rendering budget
- **Cross-Worker Cache Invalidation**: Automatic purge of storefront edge cache and in-memory isolate micro-cache on theme activation

---

## 2. Database Migration 0027 (`0027_stage_42_themes_framework.sql`)
Executed on both local and remote D1 databases:

### Tables
1. **`themes`**:
   - `id`: TEXT PRIMARY KEY
   - `slug`: TEXT NOT NULL UNIQUE
   - `name`: TEXT NOT NULL
   - `version`: TEXT DEFAULT '1.0.0'
   - `description`: TEXT
   - `author`: TEXT DEFAULT 'Nasrify'
   - `author_url`: TEXT
   - `preview_url`: TEXT
   - `screenshot_urls`: TEXT
   - `category`: TEXT
   - `theme_json`: TEXT NOT NULL
   - `is_built_in`: INTEGER DEFAULT 0
   - `status`: TEXT DEFAULT 'published'
   - `created_at`: INTEGER
   - `updated_at`: INTEGER

2. **`active_theme`**:
   - `id`: TEXT PRIMARY KEY DEFAULT 'default'
   - `theme_id`: TEXT NOT NULL
   - `theme_json`: TEXT NOT NULL
   - `activated_at`: INTEGER
   - `activated_by`: TEXT

3. **`theme_audit_log`**:
   - `id`: TEXT PRIMARY KEY
   - `theme_id`: TEXT NOT NULL
   - `action`: TEXT NOT NULL
   - `performed_by`: TEXT
   - `created_at`: INTEGER

### Indexes
- `idx_themes_slug` ON `themes(slug)`
- `idx_themes_status` ON `themes(status)`
- `idx_theme_audit_theme_id` ON `theme_audit_log(theme_id)`

---

## 3. Core Components Implemented

### 12 Section Components (`nasrify-store/components/themes/sections/`)
1. `AnnouncementBar.tsx`: Top bar with optional dismissal and URL link.
2. `Header.tsx`: Brand navigation with search, cart, and account links.
3. `Hero.tsx`: Headline, call-to-action button, and background imagery.
4. `ProductGrid.tsx`: Dynamic catalog grid with price, ratings, and Add-to-Cart.
5. `ProductCarousel.tsx`: Horizontal slider with scroll controls.
6. `Categories.tsx`: Visual category collection cards.
7. `Testimonials.tsx`: Customer quotes and verified badges.
8. `Newsletter.tsx`: Newsletter sign-up with email input and submit CTA.
9. `Banner.tsx`: Marketing discount/sale callout.
10. `ImageText.tsx`: Side-by-side editorial media and copy.
11. `FAQ.tsx`: Accordion-style frequently asked questions.
12. `Footer.tsx`: Multi-column links, copyright, and social links.

### Rendering Engine (`nasrify-store/lib/themes/engine.tsx`)
- Maps theme sections to React components.
- Section error isolation: malformed sections do not crash the page.
- Injects `--theme-*` CSS variables into `<style id="nasrify-theme-vars">`.

### Admin Management (`nasrify-admin`)
- Route: `/admin/themes`
- Theme grid with Built-in / Custom filter tabs.
- Active theme indicator and one-click Activate button.
- Theme duplication to customizable draft.
- Built-in theme deletion protection (deleting built-in themes is disallowed).
- Detail view at `/admin/themes/[id]` with JSON inspector and audit log.

---

## 4. Verification Checklist
- [x] Migration 0027 applied to local & remote D1
- [x] All 12 section components built and exported
- [x] Default theme seeded to D1 (`themes` and `active_theme`)
- [x] Storefront homepage renders via dynamic theme engine
- [x] Theme CSS variables injected into storefront `<head>`
- [x] Non-homepage storefront routes (/cart, /shop) continue rendering properly
- [x] Admin `/admin/themes` management UI operational
- [x] Theme duplication produces draft custom theme
- [x] Theme activation updates D1 and triggers cross-worker cache invalidation
- [x] Built-in themes protected against deletion
- [x] Custom themes deletable

---

## 5. Stage 42.5 — Basic Visual Theme Editor (`/admin/theme-editor`)
- **Full-Screen Workspace**: Dedicated editor layout bypassing AdminShell.
- **Drag-and-Drop Sections**: `@dnd-kit/core` & `@dnd-kit/sortable` vertical reordering with accessibility and touch support.
- **Section Controls**: Presets for all 12 section components with visibility toggle, delete, and add.
- **Global Theme Tokens**: Theme-wide color pickers, typography fonts, container max width, section spacing, and logo management.
- **Draft vs. Publish**:
  - `theme_drafts` D1 table for staging changes.
  - Auto-saved debounced 2 seconds.
  - One-click publish with confirmation modal flushing storefront edge cache.
  - Discard draft restoring live active theme.
- **Live Preview Frame**: Iframe communication via `postMessage` (`UPDATE_THEME`), hot-swapping CSS variables and section tree with 0ms server latency and zero D1 writes.
- **Responsive Device Switcher**: Desktop (100%), Tablet (768px), and Mobile (375px).
