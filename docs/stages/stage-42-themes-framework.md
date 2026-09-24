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

---

## 6. Stage 42.7 — Font System & Self-Hosted Typography
- **Self-Hosted R2 Storage**: Fonts hosted in Cloudflare R2 bucket `ecommerce-perf-assets/fonts/` with 0 external CDN requests.
- **Curated 21 Fonts**: Sans (11), Serif (5), Display (2), Handwriting (2), Mono (1).
- **Subsets & Weights**: latin & latin-ext (arabic uploaded for future Urdu RTL support); 400 & 700 weights.
- **Storefront Optimization**:
  - Critical weights preloaded via `<link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous">`.
  - `@font-face` rules injected with `font-display: swap` to prevent FOIT.
  - Tailored fallback chains per category to eliminate CLS.
  - Total font payload < 100 KB per theme.
- **Admin Font Manager (`/admin/settings/fonts`)**: Font catalog with live preview, category filtering, and curated toggling.
- **Theme Editor FontPicker (`FontPicker.tsx`)**: Modal picker in Global Settings syncing in real-time to preview iframe via postMessage.
- **D1 Migration 0029**: `fonts` and `font_settings` tables with indexes.

---

## 7. Stage 42.8b — Default Theme Design & 13 New Page Sections
- **Brand Color Palette Finalized**:
  - Primary: `#25D366` (WhatsApp Green)
  - Primary Dark: `#1EA855` (Hover)
  - Primary Light: `#DCFCE7` (Light backgrounds / badges)
  - Secondary: `#52525B`
  - Accent: `#18181B` (Headings & buttons)
  - Background: `#FFFFFF`
  - Surface: `#F4F4F5`
  - Text: `#18181B`
  - Text Muted: `#71717A`
  - Border: `#E4E4E7`
- **13 New Page Sections Created**:
  1. `ProductGallery.tsx`
  2. `ProductInfo.tsx`
  3. `ProductTabs.tsx`
  4. `ProductReviewsSection.tsx`
  5. `ProductRelated.tsx`
  6. `CategoryHeader.tsx`
  7. `CategoryFilters.tsx`
  8. `CategoryGrid.tsx`
  9. `CartPageLayout.tsx`
  10. `CheckoutPageLayout.tsx`
  11. `AccountDashboard.tsx`
  12. `PageHeader.tsx`
  13. `PageContent.tsx`
- **5 Shared UI Blocks**: `ProductCard`, `PriceTag`, `RatingStars`, `Button`, `Badge` in `nasrify-store/components/themes/blocks/`.
- **`page_defaults` System**: Added default page presets to `theme.json` for `product`, `category`, `cart`, `checkout`, `account`, and `page`.
- **Theme Engine (`renderPageTheme`)**: Extended `engine.tsx` to mount all 24 section types and render page presets cleanly.
- **Admin Section Picker**: Categorized into 4 clear groups: Content (9), Products (10), Marketing (2), Commerce (3).
- **CSS Variables Injected**: `--theme-primary-dark`, `--theme-primary-light`, `--theme-button-radius` alongside core theme tokens.
- **Deployment Status**:
  - `nasrify-store`: `c9a95506-a95a-4535-8fa1-ec4372fa5b52`
  - `nasrify-admin`: `d64e1c5b-7eee-47c2-80cc-0fe21e5e9758`

---

## 8. Stage 42.8c — Storefront Theme Wiring & Complete Color Unification
- **Full Storefront Page Wiring**:
  - Product Page (`/product/[slug]`): Wired with `renderPageTheme(theme, "product", storeData)` (`product_gallery`, `product_info`, `product_tabs`, `product_reviews_section`, `product_related`). Buy Now, Add to Cart, Wishlist, Compare, and WhatsApp Order buttons completely integrated and verified.
  - Category Page (`/category/[slug]`): Wired with `renderPageTheme(theme, "category", storeData)` (`category_header`, `category_filters`, `category_grid`).
  - Shop Page (`/shop`): Wired with `renderPageTheme(theme, "shop", storeData)`.
  - Cart Page (`/cart`): Wired with `renderPageTheme(theme, "cart", {})` (`cart_page_layout` with live quantity adjustments, coupon validation via Coupons app, and WhatsApp cart ordering).
  - Checkout Page (`/checkout`): Wired with `renderPageTheme(theme, "checkout", {})` (`checkout_page_layout` with dynamic shipping/tax calculators, Cash on Delivery submission, and WhatsApp checkout option).
  - Order Success (`/order-success/[orderId]`): Fully themed with design tokens and `Button`/`Badge` blocks.
  - Account Pages (`/account`): Dashboard wired with `renderPageTheme(theme, "account", {})` (`account_dashboard`). Subpages (`/orders`, `/addresses`, `/profile`, `/downloads`, `/wishlist`) themed with CSS variables.
  - CMS & Static Pages (`/about`, `/contact`, `/privacy-policy`, `/terms`, `/faq`, `/cookie-policy`, `/pages/[slug]`): Wired with `renderPageTheme(theme, "page", { page })`.
  - App Storefront Pages (`/bundles`, `/compare`, `/wishlist`, `/track-order`): Updated to use theme tokens and shared blocks.
- **Purge of Hardcoded Chronicles Purple**:
  - Over 400+ instances of `#960DF2`, `#3C0561`, and `purple-*` classes systematically replaced with CSS variables (`--theme-primary`, `--theme-accent`, `--theme-surface`, `--theme-text`, `--theme-border`) across app routes, components, overlays, and apps.
  - Fixed legacy D1 `settings.theme_settings` escaping to ensure fallback theme tokens match `#25D366` / `#18181B`.
  - Verified 0 purple remnants across all storefront routes.
- **Header, Footer & Global Overlays**:
  - Universal layout header and footer synchronized to use theme tokens (`--theme-accent` for brand, `--theme-text` for navigation, `--theme-primary` for active state and badges).
  - Search overlay, Cart drawer, and Mobile navigation menus unified under theme tokens.
- **Performance Budget**:
  - Sub-10ms CPU render budget maintained across all theme sections.
  - 60s micro-cache on active theme configuration.


