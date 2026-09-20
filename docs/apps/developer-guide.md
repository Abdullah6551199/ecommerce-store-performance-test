# Nasrify Apps Framework — Developer Guide

This guide explains how to build, package, and deploy modular apps for the Nasrify e-commerce platform.

---

## 1. Quickstart: Your First App in 5 Minutes

The fastest way to build an app is using the starter template:

1. **Duplicate the Template**:
   ```bash
   cp -r apps/_template apps/quick-announcement
   ```
2. **Edit `apps/quick-announcement/manifest.json`**:
   Set `id` to `"quick-announcement"`, update `name`, and define your settings schema.
3. **Customize Your Component**:
   Edit `apps/quick-announcement/storefront/ExampleBanner.tsx` to render your custom UI.
4. **Register & Sync**:
   Add your app manifest to `lib/apps/registry.ts`, register in `lib/apps/loader.ts`, and run:
   ```bash
   npx tsx scripts/sync-apps.ts --target=all
   ```
5. **Install & Test**:
   Open `/admin/apps` in your browser, click **Install**, and visit any product page to see your live app!

---

## 2. Directory Structure & Worker Scope

Nasrify uses a split-worker architecture where administrative functionality runs on `nasrify-admin` and customer storefront functionality runs on `nasrify-store`.

To ensure maximum security and minimum worker bundle size, app folders are partitioned by worker scope:

```
apps/<app-id>/
├── manifest.json            # App definition, metadata, permissions, extension points, settings schema
├── icon.svg                 # Vector icon (currentColor stroke/fill)
├── shared/                  # Shared TypeScript interfaces and constants (both workers)
│   ├── types.ts
│   └── constants.ts
├── admin/                   # Admin panel widgets and page views (nasrify-admin worker ONLY)
│   ├── <Widget>.tsx
│   └── api/                 # Admin API routes (imports @/lib/auth safely)
│       └── <endpoint>/route.ts
├── storefront/              # Public storefront components (nasrify-store worker ONLY)
│   ├── <Component>.tsx
│   └── api/                 # Public customer-facing API routes
│       └── <endpoint>/route.ts
└── lib/                     # Database queries and cached helpers (auth-agnostic, both workers)
    └── <queries>.ts
```

### Worker Scope Rules
1. **Admin Isolation**: Code inside `admin/` is **never** copied to the storefront worker. Admin authentication (`@/lib/auth`) must only be imported inside `admin/` or `admin/api/`.
2. **Storefront Isolation**: Code inside `storefront/` is **never** copied to the admin worker.
3. **Shared Logic**: Code in `lib/` and `shared/` is deployed to both workers. It must remain **auth-agnostic**.

---

## 3. Manifest Schema (`manifest.json`)

The manifest is validated against `AppManifestSchema` at install time:

```json
{
  "id": "my-custom-app",
  "name": "My Custom App",
  "version": "1.0.0",
  "description": "Short explanation of what this app does.",
  "author": "Nasrify Partner",
  "authorUrl": "https://example.com",
  "icon": "icon.svg",
  "pricing": "free",
  "category": "marketing",
  "permissions": [
    "read:products",
    "read:settings"
  ],
  "extensionPoints": [
    "admin.dashboard.widget",
    "storefront.product.below"
  ],
  "workerScope": {
    "admin": ["admin/"],
    "storefront": ["storefront/"],
    "shared": ["manifest.json", "icon.svg", "lib/", "shared/"]
  },
  "settingsSchema": {
    "enableFeature": {
      "type": "boolean",
      "default": true,
      "label": "Enable Custom Feature",
      "description": "Toggle this app feature on or off"
    },
    "headerText": {
      "type": "string",
      "default": "Special Deal",
      "label": "Header Title"
    }
  },
  "databaseTables": [
    "app_my-custom-app_data"
  ]
}
```

---

## 4. Settings Schema & Dynamic Admin UI

When an app defines `settingsSchema`, Nasrify automatically renders a configuration form in `/admin/apps/<app-id>` under the **Settings** tab.

### Supported Field Types:
- **`boolean`**: Renders an accessible toggle switch.
- **`string`**: Renders a text input.
- **`number`**: Renders a numeric input.
- **`select`**: Renders a dropdown select box (provide `options` array).

Settings are automatically persisted to the D1 `installed_apps.settings` column and can be queried anywhere via:
```typescript
import { getAppSettings } from "@/lib/apps/installed";

const settings = await getAppSettings<{ enableFeature: boolean }>("my-custom-app");
```
Settings checks are cached with a **60s TTL** in worker memory for edge performance.

---

## 5. Supported Permissions
Apps must declare minimum required permissions:
- `read:products`, `write:products`: Access product catalog & variants
- `read:orders`, `write:orders`: Access customer orders and line items
- `read:customers`, `write:customers`: Access customer profiles & addresses
- `read:settings`, `write:settings`: Read/write global store configuration
- `read:media`, `write:media`: Access R2 media bucket assets
- `read:analytics`: Query store performance, sales, and traffic analytics

---

## 6. Supported Extension Points & Prop Contracts

| Extension Point | Prop Interface | Typical Use Case |
|---|---|---|
| `storefront.floating` | `StorefrontFloatingProps` (`{}`) | Sticky bottom corner floating buttons, live chat widgets, WhatsApp support |
| `storefront.product.below` | `StorefrontProductBelowProps` (`{ productId, productSlug }`) | Product reviews, cross-sells, sizing calculators, wishlist action button |
| `storefront.header` | `StorefrontHeaderProps` (`{}`) | Header action buttons, wishlist counter badge, promotional notification pills |
| `storefront.account.menu` | `StorefrontAccountMenuProps` (`{}`) | Customer account portal menu links, saved items navigation |
| `storefront.homepage.section` | `StorefrontHomepageSectionProps` (`{ sectionId }`) | Custom hero banners, featured collection grids |
| `storefront.cart.below` | `StorefrontCartBelowProps` (`{ cartId }`) | Free shipping progress bars, upsell cards |
| `storefront.checkout.below` | `StorefrontCheckoutBelowProps` (`{ orderId }`) | Trust seals, checkout assistance notes |
| `admin.dashboard.widget` | `AdminDashboardWidgetProps` (`{ className }`) | KPI metric cards, quick action panels |
| `admin.sidebar` | `AdminSidebarProps` (`{ className }`) | Custom admin navigation links |
| `admin.route` | `Record<string, unknown>` | Dedicated views under `/admin/apps/<app-id>` |

---

## 7. Component Isolation & Runtime Error Logging
1. **Always use `"use client"`** for interactive widgets.
2. **Error Boundary Guarantee**: All extension points are wrapped in `AppErrorBoundary`. If your component throws an uncaught error:
   - The crashing component unmounts cleanly (zero host page breakage).
   - An error telemetry report is dispatched to `/api/apps/runtime-error`.
   - The crash is recorded in `app_install_log` with action `"runtime_error"`. Administrators can view crash logs directly in `/admin/apps/<app-id>` under the **Audit History** tab.
3. **Data Safety**: All app-owned tables must begin with `app_<id>_` or use declared platform tables in `databaseTables`. The platform guarantees that uninstalling an app will NEVER delete app database tables.

---

## 8. Real-World Case Study: The Reviews App (`apps/reviews/`)

The Reviews App is the platform's reference implementation demonstrating worker scope separation:
- `apps/reviews/admin/`: Contains `ReviewsManager.tsx` and admin routes (`api/moderate`, `api/stats`).
- `apps/reviews/storefront/`: Contains `ReviewsList.tsx` and public routes (`api/list`, `api/submit`).
- `apps/reviews/shared/`: Contains unified TypeScript types and defaults.
- `apps/reviews/lib/`: Contains shared, auth-agnostic D1 database queries.

---

## 9. Real-World Case Study: The Wishlist App (`apps/wishlist/`)

The Wishlist App demonstrates how to convert an existing core platform feature into a modular, installable app while maintaining 100% backward compatibility and zero database migrations:
- `apps/wishlist/manifest.json`: Declares permissions (`read:products`, `read:customers`, `read:media`), extension points (`storefront.product.below`, `storefront.header`, `storefront.account.menu`), and 4 configurable settings toggles.
- `apps/wishlist/storefront/`: Contains `WishlistButton.tsx` (product card heart + detail button + inline pill), `WishlistHeaderIcon.tsx` (sticky navigation heart + count badge), and `WishlistPage.tsx` (customer wishlist CSR island).
- `apps/wishlist/storefront/api/`: Customer API routes (`list`, `add`, `remove`, `toggle`) supporting both authenticated customers and guest session cookies (`requireLogin = false`).
- `apps/wishlist/shared/types.ts`: Strongly typed settings schema and defaults.
- `apps/wishlist/lib/wishlist.ts`: Auth-agnostic, date-bounded, cached database queries with 20s in-memory micro-cache.
- **Root Re-Exports**: Root `lib/wishlist.ts` re-exports from `@/apps/wishlist/lib/wishlist`, ensuring existing imports continue functioning seamlessly.
- **Data Preservation**: Uninstalling the app preserves all rows in `customer_wishlist`. Reinstalling restores previous items and restores previously saved configuration settings.

---

## 10. Real-World Case Study: The Product Compare App (`apps/compare/`)

The Compare App demonstrates client-side data isolation (zero database tables) with dynamic floating UI and side-by-side matrices:
- `apps/compare/manifest.json`: Declares permissions (`read:products`, `read:media`), extension points (`storefront.product.below`, `storefront.floating`), empty `databaseTables: []`, and configurable settings (`maxProducts`, `showInHeader`, `buttonStyle`).
- `apps/compare/storefront/`: Contains `CompareButton.tsx` (product card & detail toggles), `CompareBar.tsx` (floating bottom drawer gated by `storefront.floating`), and `ComparePage.tsx` (responsive side-by-side comparison table).
- `apps/compare/lib/compare.ts`: Provides product specification matrices and attributes normalization with micro-caching.
- **Client State & Data Safety**: All items are managed in customer `localStorage` (`ecommerce_compare_items`). When the app is uninstalled or disabled, the floating bar and buttons cleanly unmount from the DOM. Reinstalling restores the UI immediately with previous customer comparison items intact.

---

## 11. Real-World Case Study: The Bundles App (`apps/bundles/`)

The Bundles App demonstrates complex multi-item relationships, SQL aggregations, and cross-worker invalidation:
- `apps/bundles/manifest.json`: Declares permissions (`read:products`, `write:products`, `read:media`, `read:orders`), extension points (`storefront.homepage.section`, `storefront.product.below`, `storefront.cart.below`, `admin.dashboard.widget`), and platform database tables (`product_bundles`, `bundle_items`).
- `apps/bundles/admin/`: Contains `BundlesManager.tsx` with multi-product picker, drag-and-drop bundle assembly, pricing calculator, and admin API endpoints.
- `apps/bundles/storefront/`: Contains `BundleCard.tsx`, `FeaturedBundles.tsx` (homepage section), and `BundleCrossSell.tsx` (product page cross-sell).
- `apps/bundles/lib/bundles.ts`: Database query layer implementing SQL summation for regular price, savings calculation, `React.cache()`, and a 20s micro-cache with cross-worker invalidation via `CACHE_INVALIDATE_SECRET`.
- **Root Re-Exports**: Root `lib/bundles.ts`, `components/bundles/BundleCard.tsx`, and `components/admin/BundlesManager.tsx` re-export directly from `apps/bundles/`, ensuring legacy imports continue to function without changes.
- **Data Safety**: App uninstallation does NOT drop `product_bundles` or `bundle_items`. All bundle definitions and historical order associations are permanently safeguarded.

---

## 12. Real-World Case Study: The Order Tracking App (`apps/order-tracking/`)

The Order Tracking App demonstrates zero-database-migration conversion of critical order fulfillment pipelines:
- `apps/order-tracking/manifest.json`: Declares permissions (`read:orders`, `write:orders`, `read:customers`, `send:notifications`), extension points (`storefront.account.menu`, `admin.order.detail.below`), empty `databaseTables: []` (uses core `orders` table), and configurable settings (`enablePublicTracking`, `enableAutoNotifications`, `showCourierField`, `showTimeline`, `timelineStages`, `estimatedDeliveryDays`).
- `apps/order-tracking/admin/`: Contains `OrderTrackingSettings.tsx` and `api/update-status/route.ts` for updating fulfillment milestones, courier waybills, and dispatching non-blocking customer notifications.
- `apps/order-tracking/storefront/`: Contains `TrackOrderPage.tsx` (public CSR tracking island) and `OrderTimeline.tsx` (6-stage progress timeline with timestamps).
- `apps/order-tracking/lib/order-tracking.ts`: Micro-cached query helpers resolving orders by ID or waybill number without requiring customer authentication.
- **Root Re-Exports**: Root `lib/orders.ts`, `components/OrderStatusTimeline.tsx`, and `app/track-order/page.tsx` re-export from the app module.
- **Data Safety**: The `orders` table is completely untouched during uninstallation and reinstallation.

---

## 13. Real-World Case Study: The Broadcast Notifications App (`apps/broadcast/`)

The Broadcast App demonstrates modal overlay extensions, impression metrics, and campaign lifecycle management:
- `apps/broadcast/manifest.json`: Declares permissions (`read:customers`, `read:settings`), extension points (`storefront.floating`, `admin.dashboard.widget`), platform database tables (`broadcasts`, `broadcast_views`), and settings schema (`enablePopup`, `popupPosition`, `popupDelaySeconds`, `showOncePerCustomer`, `enableExpiryDate`, `maxActiveBroadcasts`).
- `apps/broadcast/admin/`: Contains `BroadcastManager.tsx` featuring live banner preview, schedule toggles, aggregate metrics, and administrative CRUD endpoints (`list`, `create`, `update`, `delete`, `stats`).
- `apps/broadcast/storefront/`: Contains `BroadcastPopup.tsx` rendered dynamically on `storefront.floating` with dismissal tracking.
- `apps/broadcast/lib/broadcasts.ts`: Database queries utilizing SQL aggregations (`count(*)`, `sum(case when is_dismissed then 1 else 0 end)`), auto-expiry filtering, and cross-worker invalidation.
- **Data Safety**: Preserves all campaigns in `broadcasts` and impressions in `broadcast_views`. Uninstallation disables display overlays while safeguarding historical campaign performance.

---

## 14. Real-World Case Study: The Trust Badges App (`apps/trust-badges/`)

The Trust Badges App demonstrates multi-extension-point component rendering, payment icon vector rendering, and drag-and-drop sort order:
- `apps/trust-badges/manifest.json`: Declares permissions (`read:products`, `read:media`, `read:settings`), extension points (`storefront.product.below`, `storefront.cart.below`, `storefront.checkout.below`, `admin.dashboard.widget`), database tables (`trust_badges`, `payment_icons`), and configurable settings (`showOnProductPage`, `showOnCartPage`, `showOnCheckoutPage`, `showPaymentIcons`, `badgeAlignment`, `badgeSize`).
- `apps/trust-badges/shared/payment-icons.tsx`: Shared vector SVG icons for credit card networks and digital wallets (Visa, Mastercard, AMEX, PayPal, Apple Pay, Google Pay) isolated from storefront DOM overhead.
- `apps/trust-badges/admin/`: Contains `TrustBadgesManager.tsx` featuring badge CRUD, toggle switches, custom payment icon creator, alignment and size preview, and live storefront simulation.
- `apps/trust-badges/storefront/`: Contains `TrustBadgesRow.tsx` and `PaymentIconsRow.tsx` rendering on product, cart, and checkout extension points.
- `apps/trust-badges/lib/trust-badges.ts`: Strict column projection (never SELECT *), React.cache, 20s micro-cache, and cross-worker invalidation via `sendStorefrontInvalidation`.
- **Root Re-Exports**: Root `lib/trust-badges.ts`, `components/TrustBadges.tsx`, `components/PaymentIcons.tsx`, and `components/admin/TrustBadgesManager.tsx` re-export directly from `apps/trust-badges/`.
- **Data Safety**: The `trust_badges` and `payment_icons` tables are preserved across uninstall and reinstall cycles.

---

## 15. Real-World Case Study: The Cookie Consent & GDPR App (`apps/cookie-consent/`)

The Cookie Consent App demonstrates zero-database-hit visitor consent tracking, client-side script blocker gating, and privacy regulation compliance:
- `apps/cookie-consent/manifest.json`: Declares permissions (`read:settings`, `write:settings`, `read:customers`), extension points (`storefront.floating`, `admin.dashboard.widget`), database table (`cookie_consent_settings`), and settings schema (`enabled`, `bannerPosition`, `theme`, `showCustomizeButton`, `analyticsCategory`, `marketingCategory`, `functionalCategory`, `consentExpiryDays`, `blockScriptsUntilConsent`).
- `apps/cookie-consent/admin/`: Contains `CookieConsentManager.tsx` with GDPR banner customization, per-category configuration, and consent analytics recording.
- `apps/cookie-consent/storefront/`: Contains `CookieConsentBanner.tsx` (responsive floating overlay), `CookieCustomizeModal.tsx` (granular preference modal with accessible toggles), and `ScriptBlocker.tsx` (client-side script blocker running with 0 worker CPU).
- `apps/cookie-consent/lib/cookie-consent.ts`: Dual localStorage and cookie storage engine ensuring zero database requests per page load, coupled with non-blocking asynchronous server-side logging.
- **Root Re-Exports**: Root `lib/cookie-consent.ts`, `components/CookieConsentBanner.tsx`, `components/CookieCustomizeModal.tsx`, and `components/ScriptBlocker.tsx` re-export from `apps/cookie-consent/`.
- **Data Safety**: All consent settings and records in `cookie_consent_settings` are permanently safeguarded across app uninstallation and reinstallation.

---

## 16. Real-World Case Study: The WhatsApp Order & Chat App (`apps/whatsapp-order/`)

The WhatsApp Order App demonstrates transactional order capture, attribution source tracking, and sub-5s settings propagation:
- `apps/whatsapp-order/manifest.json`: Declares permissions (`read:products`, `read:settings`), extension points (`storefront.floating`, `storefront.product.below`, `storefront.cart.below`, `storefront.checkout.below`, `admin.dashboard.widget`), and settings schema (`phoneNumber`, `enableFloating`, `enableProductButton`, `floatingMessage`, `productMessage`, `buttonText`).
- `apps/whatsapp-order/storefront/api/save-order/route.ts`: Transaction-safe endpoint persisting orders in D1 with `source="whatsapp"`. Implements schema validation via Zod, checks foreign key constraints on products and variants, and creates customer notifications.
- `apps/whatsapp-order/lib/whatsapp.ts`: Structured message generation putting products first, followed by subtotal and delivery details, and embedding reference `#WA-XXXXXX`.
- `apps/whatsapp-order/admin/WhatsAppStatsWidget.tsx`: KPI card reporting current month's WhatsApp order volume, revenue, and last order timestamp via `admin.dashboard.widget`.
- **Sub-5s Settings Cache Architecture**:
  * Storefront route `/api/apps/[appId]/settings` implements a 3s TTL isolate microcache and `Cache-Control: public, max-age=3, s-maxage=3`.
  * Storefront components use `?t=${Date.now()}` and attach `focus`/`visibilitychange` listeners.
  * Admin mutations trigger `invalidateStorefront` with 3 retries and exponential backoff.
- **Data Safety**: All orders created with `source="whatsapp"` are permanently preserved in the core `orders` and `order_items` tables during app uninstallation and reinstallation.

---

## 17. Nasrify Apps Hub & Marketplace Ecosystem (Stage 37A)

The **Nasrify Apps Hub** (`nasrify-apps`) is the centralized public marketplace, developer portal, and admin approval queue running as a dedicated Cloudflare Worker.

### 17.1 Public Marketplace (`/` & `/apps/[appId]`)
- **Discovery Grid**: Search, category filters, and sorting by newest, name, or price.
- **Micro-Caching**: All marketplace queries use `React.cache()` and an isolate-level in-memory cache with 20-second TTL.
- **App Detail Pages**: Shows app metadata, developer author links, version history, required permissions, extension points, changelog, and related apps.
- **1-Click Install Flow**:
  Clicking "Install App" routes through `/api/marketplace/install?appId=<appId>`, which registers an active install in the `app_marketplace_installs` table and returns a 302 redirect directly to `https://nasrify-admin.zia291930.workers.dev/admin/apps?install=<appId>`.

### 17.2 Developer Portal (`/developer`)
- **Shared Session Authentication**: Uses the shared D1 `sessions` table. Developers logged into `nasrify-admin` are recognized automatically via the HTTP-only `admin_session` cookie. Direct login is also available via `/api/developer/login`.
- **My Listings**: Real-time listing management displaying status tags (`draft`, `pending`, `approved`, `rejected`, `delisted`), version history, and rejection notes.
- **App Submission**: Form enforcing Zod schema validation for kebab-case App ID, semver, pricing, description, and manifest JSON validation. Submitting sets status to `pending` and inserts an initial record into `app_marketplace_versions`.

### 17.3 Super Admin Approval Queue (`/super/pending`)
- **Role & Access Verification**: Restricted to authenticated administrators defined in `SUPER_ADMIN_EMAILS`.
- **Manifest Security Inspection**: Super admins audit declared permissions (`read:products`, `read:orders`, etc.) and storefront extension points.
- **One-Click Actions**:
  - **Approve**: Sets status to `approved`, stamps `approved_by` and `approved_at`, invalidates the listings cache, and publishes the app live immediately.
  - **Reject**: Prompts for a mandatory rejection reason and flags the listing as `rejected` with clear feedback visible in the developer portal.
  - **Delist**: Removes the app from public marketplace discovery without deleting developer data.

---

## 18. Nasrify Themes Hub & Themes Marketplace (Stage 37B)

The **Nasrify Themes Hub** (`nasrify-themes`) is the parallel public marketplace, developer portal, and super admin approval queue for storefront themes, running as a dedicated Cloudflare Worker at `https://nasrify-themes.zia291930.workers.dev`.

### 18.1 Public Themes Marketplace (`/` & `/themes/[themeId]`)
- **Visual Discovery Grid**: Search, category filters (`Minimal`, `Bold`, `Luxury`, `Fashion`, `Kids`, `Corporate`, `Organic`), and sorting.
- **Interactive Mockup Previews**: Modal and embedded device simulator (desktop, tablet, mobile) allowing shoppers and developers to test the live storefront look and feel in real time.
- **Theme Detail Pages**: Large preview screenshot, multi-image gallery, color swatches palette from `config_json`, typography tokens, changelog, and related themes.
- **1-Click Theme Installation**:
  Clicking "Install to Admin" routes through `/api/themes/install?themeId=<themeId>`, which registers an active record in `theme_marketplace_installs` and 302-redirects to `https://nasrify-admin.zia291930.workers.dev/admin/themes?install=<themeId>`.

### 18.2 Themes Developer Portal (`/developer`)
- **Shared Session Authentication**: Integrates seamlessly with D1 `sessions` and `users` via the HTTP-only `admin_session` cookie or direct login at `/api/developer/login`.
- **Theme Studio**: Create and edit themes, upload preview and gallery images directly to Cloudflare R2 (`ecommerce-perf-assets`), and edit design tokens via visual JSON editors.
- **Submission & Version Tracking**: Submissions save to `theme_marketplace_listings` and create snapshots in `theme_marketplace_versions`.

### 18.3 Super Admin Approval Queue (`/super/pending`)
- **Access Control**: Super Admin only (`SUPER_ADMIN_EMAILS` or admin role).
- **Review & Mockup Auditing**: Real-time mockup rendering, design token validation, one-click live approval, or rejection with custom feedback.

---

## 19. Case Study: Digital Products App (Stage 38)

The **Digital Products App** (`apps/digital-products/`) represents the first net-new extension built using the Nasrify Apps Framework, demonstrating private R2 file storage, cryptographic token delivery, post-checkout fulfillment hooks, and custom extension points.

### 19.1 Architecture Highlights
- **No Direct R2 Exposure**: Download assets are kept completely private inside the `ecommerce-perf-assets` Cloudflare R2 bucket under `digital-products/{productId}/{fileId}-{name}`.
- **Cryptographic HMAC-SHA256 Tokens**: Download links use signed, tamper-evident tokens (`/api/apps/digital-products/download?token=<token>`). Modifying query params or expiry timestamps fails token verification with HTTP 403.
- **Fulfillment Hook (`order-hook.ts`)**:
  Integrated seamlessly into `createOrderFromCart`. When an order contains digital products, `hookAfterOrderPlaced()` provisions download tokens in `digital_downloads` and creates license keys in `digital_licenses` in a non-blocking operation.
- **Extension Points**:
  - `storefront.product.below`: Displays an "Instant Digital Delivery" badge on product pages.
  - `storefront.account.menu`: Integrates "My Downloads" vault page (`/account/downloads`) for customer file downloads and license keys.
  - `admin.product.form.below`: Adds a "💾 Digital Files" configuration tab directly to `ProductModal`.
  - `admin.dashboard.widget`: Live KPI metrics for active digital SKUs and monthly downloads.
- **Data Safety**: All `digital_products`, `digital_downloads`, and `digital_licenses` tables remain permanently intact during app uninstallation and reinstallation.

---

## 20. Case Study: Coupons & Discounts App (Stage 39)

The **Coupons & Discounts App** (`apps/coupons/`) demonstrates converting an existing, monolithic core e-commerce engine into a decoupled, installable modular application without breaking any backwards compatibility, database schemas, or checkout workflows.

### 20.1 Architecture Highlights
- **Engine Decoupling**: The 8 coupon calculation strategies (percentage, fixed amount, free shipping, BOGO / buy X get Y, category restriction, product restriction, minimum order value, and first-order restriction) were migrated into `apps/coupons/lib/coupons.ts` with React `cache()` and 20s micro-caching.
- **Root Delegation Pattern**: Existing monolith imports in `lib/coupons.ts`, `components/admin/CouponsManager.tsx`, `components/CouponsSection.tsx`, and `/api/admin/coupons/*` were preserved as one-line delegation wrappers pointing into `@/apps/coupons/*`.
- **Extension Points**:
  - `storefront.cart.below`: Dynamically renders `CouponInput` inside cart drawers and the `/cart` page.
  - `storefront.checkout.below`: Injects `CouponInput` directly into the `/checkout` order summary card.
  - `admin.dashboard.widget`: Displays `CouponsDashboardWidget` with total active promo codes, monthly discount savings, and top-performing coupon codes.
- **Data Safety & Lifecycle**:
  - Uninstallation cleanly removes the app from `installed_apps` and saves settings to `app_install_logs`.
  - The `coupons` and `coupon_usages` tables in Cloudflare D1 (`ecommerce-perf-db`) are **never dropped**.
  - Storefront gates cleanly hide coupon UI elements when uninstalled (`data === null || enabled === false`).
  - Reinstallation restores all promo codes and usage redemption history instantaneously.


