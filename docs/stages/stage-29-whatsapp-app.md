# Stage 29 — WhatsApp App, storefront.floating Extension Point, & Flat Shopify-Style Toggle

## Overview
Stage 29 introduces the `storefront.floating` extension point to the Nasrify Apps Framework, bundles and integrates the full production-ready `whatsapp-order` app, creates an accessible, reusable, Shopify-style flat `Toggle` component, and replaces legacy switch/checkbox controls across the administrative interface.

---

## Key Changes

### 1. New Extension Point: `storefront.floating`
- **Definition**: Added `storefront.floating` to `AppExtensionPoint` union in `types/apps.ts` (mirrored across `nasrify-admin` and `nasrify-store`).
- **Contract**: `StorefrontFloatingProps` interface receiving empty props `{}`.
- **Components**:
  - `components/apps/StorefrontFloating.tsx`: Server component reading enabled apps with `storefront.floating` extension point.
  - `components/apps/StorefrontFloatingClient.tsx`: Client island with SSR-safe lazy loading and `AppErrorBoundary` wrapper. Renders fixed at viewport bottom-right corner (`z-50`).
- **Layout Integration**: Mounted inside `<body>` in `nasrify-store/app/layout.tsx`.

### 2. WhatsApp Order & Chat App (`apps/whatsapp-order/`)
- **Manifest (`manifest.json`)**:
  - App ID: `whatsapp-order`, Version: `1.0.0`, Pricing: `free`, Category: `sales`
  - Permissions: `read:products`, `read:settings`
  - Extension points: `storefront.floating`, `storefront.product.below`
- **Icon (`icon.svg`)**: Custom Canva-designed vector SVG.
- **Shared Types (`shared/types.ts`)**: `WhatsAppOrderSettings` interface and defaults.
- **Helper Library (`lib/whatsapp.ts`)**: Phone number sanitization, validation, `wa.me` URL builder, and product message interpolation (`{product_name}`, `{product_price}`, `{product_url}`).
- **Admin Configuration (`admin/WhatsAppSettings.tsx`)**:
  - Full configuration form for phone number, message templates, and feature toggles.
  - Test WhatsApp link launcher.
  - Integrated with flat `Toggle` components.
- **Storefront Floating Widget (`storefront/WhatsAppFloatingButton.tsx`)**:
  - Bottom-right fixed floating chat button with tooltip and hover micro-animations.
  - Client micro-cache for settings (`/api/apps/whatsapp-order/settings`).
- **Storefront Product Order Button (`storefront/WhatsAppProductButton.tsx`)**:
  - "Order on WhatsApp" button embedded below product details via `storefront.product.below`.
  - Automatically captures product title, price, and URL on click.

### 3. Reusable Flat Toggle Component (`components/ui/Toggle.tsx`)
- **Design**: Shopify-style flat pill toggle switch with smooth slide animation.
- **Tokens**:
  - Checked: Theme primary purple (`bg-[var(--primary,#9333ea)] bg-purple-600`)
  - Unchecked: Neutral gray (`bg-gray-300 dark:bg-zinc-700`)
  - Knob: Circular white disk with elevation shadow
- **Sizes**: `sm` (20px), `md` (24px), `lg` (28px).
- **Accessibility**: Full `role="switch"` semantics, `aria-checked`, keyboard events (Space / Enter), focus-visible rings, and `prefers-reduced-motion` compliance.
- **Admin Integrations**:
  - `AppSettingsClient.tsx`
  - `WhatsAppSettings.tsx`
  - `ReviewsManager.tsx`
  - `TrustBadgesManager.tsx`
  - `ShippingZonesManager.tsx`
  - `TaxManager.tsx`
  - `CouponsManager.tsx`
  - `ProductModal.tsx`
  - `PageEditorModal.tsx`
  - `FaqManager.tsx`
  - `CookieCustomizeModal.tsx`
  - `CookieConsentManager.tsx`
  - `HomepageManager.tsx`

---

## Deployment Summary

### Nasrify Admin Worker
- **URL**: `https://nasrify-admin.zia291930.workers.dev`
- **Version ID**: `2c12a583-ce3e-405d-bc58-8e6be53fb72e`
- **Upload Size**: `11273.12 KiB / gzip: 1974.13 KiB`

### Nasrify Storefront Worker
- **URL**: `https://nasrify-store.zia291930.workers.dev`
- **Version ID**: `ac610dd2-0f24-42df-9299-fbb4fe52d2b6`
- **Upload Size**: `10230.17 KiB / gzip: 1890.79 KiB`

---

## Live Verification Results

The automated end-to-end verification suite (`scripts/verify-stage-29.ts`) executed on production Cloudflare Workers with 100% pass rate:
- ✅ Admin Authentication (`POST /api/admin/login`): PASS
- ✅ Catalog Discovery (`GET /api/admin/apps`): WhatsApp app detected with `storefront.floating` and `storefront.product.below` extension points.
- ✅ Installation (`POST /api/admin/apps/install`): Installed & enabled successfully.
- ✅ Settings Persistence (`PUT /api/admin/apps/whatsapp-order/settings`): Phone number and templates saved to D1.
- ✅ Storefront Public API (`GET /api/apps/whatsapp-order/settings`): Valid JSON returned with micro-cache headers.
- ✅ Storefront Layout (`GET /`): Status 200 OK.
- ✅ Storefront Product Page (`GET /product/apex-velocity-runner-x1`): Status 200 OK.
- ✅ Settings Toggle Test: Disabling floating button updates D1 and unmounts button.
- ✅ Admin Pages Navigation: All 7 admin routes with flat toggles loaded with 200 OK.
- ✅ Uninstall / Reinstall Lifecycle: Verified clean uninstallation and reinstallation cycle.

### Performance & CPU Benchmark
- Observed Worker CPU execution time via `wrangler tail`: **943 µs (0.94 ms)** on `GET /` with WhatsApp floating button enabled (< 10% of the 10ms Cloudflare Free Plan limit).

---

## Stage 29.5 — WhatsApp App Fixes & Cart/Checkout Ordering

### 1. Overview & Issues Resolved
- **Issue 1: Product Page Button Width**: Previously stretched full-screen width below product details. Redesigned and repositioned as `ProductOrderButton` placed directly below the "Buy Now" button inside `ProductInfoPanel`, matching its exact size, padding (`py-4 px-8`), font (`text-lg font-bold`), and border-radius (`rounded-xl`).
- **Issue 2: Missing WhatsApp Buttons in Cart and Checkout**:
  - Added new `storefront.cart.below` extension point: Renders `CartOrderButton` directly below "Proceed to Checkout" in `/cart`, styled with matching `py-3.5 text-sm font-bold rounded-xl`.
  - Added new `storefront.checkout.below` extension point: Renders `CheckoutOrderButton` directly below the "Place Order" button in `/checkout`, styled with matching `py-4 text-sm font-extrabold rounded-xl`.
- **Issue 3: Incomplete WhatsApp Message**:
  - Implemented structured single-item message formatting in `buildProductMessage()`:
    ```
    Hello! I want to order:

    *Product:* <name>
    *Price:* <price>
    *Quantity:* <qty>
    *Link:* <url>
    *Image:* <image_url>

    Please confirm availability.
    ```
  - Implemented structured multi-item message formatting in `buildCartMessage()`:
    ```
    Hello! I want to place this order:

    1. <name>
       Price: <price> x <qty> = <line_total>
       Link: <url>

    2. <name>
       Price: <price> x <qty> = <line_total>
       Link: <url>

    *Subtotal:* <subtotal>
    *Total:* <total>

    Please confirm availability.
    ```
- **Settings Cache Invalidation**:
  - Previously, when an admin modified WhatsApp settings (e.g. phone number), aggressive browser and edge caching prevented storefront from reflecting the update immediately.
  - Fix 1: Storefront endpoint `/api/apps/[appId]/settings` now responds with `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`.
  - Fix 2: Admin PUT route `/api/admin/apps/[appId]/settings` invalidates local app cache and broadcasts cross-worker invalidation `invalidateStorefront({ target: "apps" })`. Updates reflect immediately on next storefront request.

### 2. Deployment Version IDs (Stage 29.5)
- **Nasrify Admin Worker**:
  - URL: `https://nasrify-admin.zia291930.workers.dev`
  - Version ID: `46e65a1c-8ad7-4749-9330-ab4739a45771`
  - Upload Size: `11283.97 KiB / gzip: 1979.39 KiB`
- **Nasrify Storefront Worker**:
  - URL: `https://nasrify-store.zia291930.workers.dev`
  - Version ID: `8d1b380c-fc0b-4ccd-97b8-02c298151427`
  - Upload Size: `10292.11 KiB / gzip: 1897.08 KiB`

---

## Rollback Procedure
If rollback is required:
```bash
git checkout pre-stage-29-5
cd nasrify-admin && npx.cmd wrangler deploy
cd nasrify-store && npx.cmd wrangler deploy
```
Database backup exists at `backups/d1-pre-stage-29.sql` and git tag `pre-stage-29-5`.

