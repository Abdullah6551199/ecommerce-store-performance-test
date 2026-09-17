# Stage F0 — Complete Project Audit & Diagnostic Report
**Project:** Nasrify Multi-Tenant SaaS E-Commerce Platform  
**Repository:** `Abdullah6551199/ecommerce-store-performance-test`  
**Latest Baseline Tag:** `v3.4-stage-e` | **Diagnostic Tag:** `pre-stage-f0`  
**Date:** September 17, 2026  
**Status:** Diagnostic Complete  
**Update (Stage F0.5a):** Issue #1 (Local D1 connection & product visibility) is **RESOLVED**. Local D1 has all 16 schema migrations applied, remote data imported (12 products, 6 categories, 38 orders), and dev fallbacks now fail loudly. Full recovery steps documented in [local-d1-recovery.md](file:///c:/Users/User/Desktop/antigravity%20workspace/docs/stages/local-d1-recovery.md).

---

## 1. Executive Summary (For Store Owner & Non-Technical Readers)

### The Bottom Line
Your Nasrify e-commerce platform is **fully alive, healthy, and operational on Cloudflare Workers in production**, with working product catalogs, shopping carts, checkout, customer accounts, and an extensible modular Apps Framework. However, three distinct friction points exist today:

1. **Local Development Shows No Products (Not Broken in Production):**
   When running the storefront locally (`npm run dev`), the catalog appears completely empty and displays *"No Matching Products Found"*. This is **not a bug in your production store**. Your live store connects to Cloudflare's remote cloud database where all 12 products exist. Your local computer, however, connects to a local, empty temporary SQLite database on your machine that has never had any tables or sample products added to it. When local code fails to find the tables, it silently falls back to an empty in-memory list.

2. **Admin Pages Spike CPU to 650ms–725ms (Free Limit is 10ms):**
   In Cloudflare Workers, code execution is billed in CPU time (actual processor work). Cloudflare's Free Worker tier allows **10ms of CPU per request** before it terminates the worker with Error 1102 (*Worker Exceeded Resource Limits*). During real live profiling of `nasrify-admin`:
   - Opening `/admin/products` consumed **659ms of CPU** (65x the limit).
   - Calling `/api/admin/dashboard` consumed **468ms of CPU** (46x the limit).
   - Opening `/admin/orders` consumed **331ms of CPU** (33x the limit).
   - Today, your admin is allowed to run either because it is on a paid/burst plan or because Cloudflare does not immediately kill admin dashboard routes with low request volume. However, the root cause is known: **the admin queries all historical orders without limits and performs heavy arithmetic, sparkline calculations, and array loops directly inside the Cloudflare Worker.**

3. **Intermittent 1102 Errors on Storefront Hard Refreshes:**
   Over the past 7 days, Cloudflare's internal telemetry recorded **41 Error 1102 incidents on `nasrify-store`** and **394 Error 1102 incidents on the legacy monolith (`ecommerce-store-perf-test`)**. These happen when a user performs a hard refresh (bypassing browser cache) on pages like the homepage or product page during a Cloudflare "cold start" (when a new worker server spins up). The combined weight of compiling Next.js server components, evaluating Drizzle ORM schemas, and running multiple D1 database queries pushes CPU past the threshold.

---

## 2. Stage-by-Stage Timeline & Historical Audit (Stage 1 → Stage E)

### 2.1 Git Tag & Commit Audit Table

| Tag | Stage | Commit | Date | Files Changed | Summary |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `2ca6d46` | Stage 1–8 | `2ca6d46` | 2026-09-09 | 82 | Baseline edge platform (D1, R2, Next.js 15/16, OpenNext). |
| `fb64343` | Stage 8.5 | `fb64343` | 2026-09-09 | 14 | Migration to `ecommerce-store-v2` and live verification scripts. |
| `v1.1` | Stage 13 | `adfa429` | 2026-09-12 | 18 | Analytics dashboard with smart pattern insights & dark/light mode. |
| `v1.1.5` | Stage 13.5 | `032b81f` | 2026-09-12 | 12 | Admin CSR conversion, dark/light mode polish, bulk order actions. |
| `v1.2` | Stage 14 | `c52367b` | 2026-09-12 | 16 | Coupons & discount system + customer wishlist. |
| `v1.2.5` | Stage 14.5 | `f458457` | 2026-09-12 | 6 | Wishlist bulk add-to-cart + light mode text contrast fix. |
| `v1.3` | Stage 15 | `45a116d` | 2026-09-12 | 22 | Separate pages CMS, header menu, admin category management. |
| `v1.3.5` | Stage 15.5 | `6320c76` | 2026-09-12 | 8 | Cart drawer coupon UX, apply best everywhere, slider bounce fix. |
| `v1.3.6` | Stage 15.5.1 | `557c763` | 2026-09-13 | 5 | Cart drawer bounce v2, compact products, simplified coupon UI. |
| `v1.4` | Stage 16 | `524a151` | 2026-09-13 | 19 | Reviews & star ratings system + drawer bounce v3. |
| `v1.5` | Stage 17 | `0e9b476` | 2026-09-13 | 24 | Customer accounts + in-app customer notifications. |
| `v1.6` | Stage 18.1 | `447060f` | 2026-09-13 | 14 | Visual redesign: Purple color system + homepage redesign. |
| `v1.7` | Stage 18.2 | `206c4ed` | 2026-09-13 | 11 | Cart, shop, and category pages redesign with purple theme. |
| `v1.8` | Stage 18.3 | `a5edac0` | 2026-09-13 | 12 | Product page redesign with zoom, tabs, reviews layout. |
| `v1.9` | Stage 18.4 | `55f0e73` | 2026-09-13 | 10 | Checkout, order success, and auth pages purple theme. |
| `v2.0` | Stage 18.5 | `3c6252a` | 2026-09-13 | 15 | Custom pages builder + account pages redesign. |
| `v2.1` | Stage 19 | `50c7858` | 2026-09-14 | 12 | Order tracking + critical admin security fix (session token validation). |
| `v2.1.1` | Stage 19.1 | `407ad8b` | 2026-09-14 | 4 | Fix theme toggle moon icon & sync `theme_settings` in D1. |
| `v2.2` | Stage 20 | `664687d` | 2026-09-14 | 16 | Tax management + shipping zones engine. |
| `v2.3` | Stage 21 | `7b3c3c6` | 2026-09-15 | 18 | Product bundles + product comparison matrix. |
| `v2.4` | Stage 22 | `5966317` | 2026-09-15 | 19 | Trust badges + cookie consent + GDPR compliance banners. |
| `v2.4.1` | Stage 22.5 | `1baf584` | 2026-09-15 | 8 | Performance fix: lazy loading overlays to reduce initial CPU. |
| `v2.4.3` | Stage 22.6 | `252b1bd` | 2026-09-15 | 14 | Full optimization audit across stages 9–22.5. |
| `v3.0-stage-a` | Stage A | `6733ca5` | 2026-09-16 | 74 | Storefront Worker split (`nasrify-store`). |
| `v3.1-stage-b` | Stage B | `ef3cd06` | 2026-09-16 | 68 | Admin Worker split (`nasrify-admin`). |
| `v3.2-stage-c` | Stage C | `307d025` | 2026-09-16 | 28 | Apps Framework Part 1 (D1 tables, manifest, hello-world demo). |
| `v3.3-stage-d` | Stage D | `9241858` | 2026-09-16 | 22 | Converted reviews subsystem into modular installable app. |
| `v3.4-stage-e` | Stage E | `b458704` | 2026-09-16 | 31 | Apps Framework Part 2 (workerScope separation, sync-apps.ts). |
| `pre-stage-f0` | Stage F0 | `b458704` | 2026-09-17 | 0 | Diagnostic baseline tag (pinned to `v3.4-stage-e`). |

### 2.2 Cross-Reference with `docs/stages/`
- **Documented Stages:** All stages from Stage 13 through Stage E have dedicated `.md` walkthroughs in `docs/stages/` (total 28 documentation files).
- **Missing Individual Documentation:** Stages 1 to 12 do not have separate files in `docs/stages/` because they were built prior to the introduction of the stage documentation convention and are summarized in `docs/architecture.md` and `docs/performance-budget.md`.
- **Documented Features Not Completed / TODOs Found:**
  - `docs/stages/performance-fix-lazy-loading.md` noted a goal of achieving <10ms CPU across all routes. Storefront achieved ~10.5ms median, but Admin remains at 400ms–700ms.
  - Automated CI/CD deployment via GitHub Actions (`.github/workflows/deploy.yml`) was disabled in commit `cc010b8` in favor of manual deployment via `opennextjs-cloudflare deploy`.

---

## 3. Current Architecture Reconstruction

### 3.1 Worker Separation Overview
```
                          ┌────────────────────────┐
                          │   Cloudflare Network   │
                          └───────────┬────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│    nasrify-store     │   │    nasrify-admin     │   │ ecommerce-store-perf │
│  (Storefront Worker) │   │    (Admin Worker)    │   │  (Monolith Backup)   │
│   Public Shoppers    │   │   Store Operations   │   │  Untouched Baseline  │
└──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        ┌─────────────────────┐               ┌─────────────────────┐
        │   Cloudflare D1     │               │   Cloudflare R2     │
        │  ecommerce-perf-db  │               │ecommerce-perf-assets│
        │     (44 Tables)     │               │  (Images & Media)   │
        └─────────────────────┘               └─────────────────────┘
```

### 3.2 Storefront Worker (`nasrify-store`)
- **Route Tree (`app/`):** 36 routes including `/` (home), `/shop`, `/product/[slug]`, `/category/[slug]`, `/bundles`, `/cart`, `/checkout`, `/account/*`, `/search`, `/track-order`, `/pages/[slug]`, `/cookie-policy`, `/faq`, `/terms`, `/privacy-policy`.
- **Components (`components/`):** 84 components including `Header`, `Footer`, `StorefrontOverlays`, `CartDrawer`, `CartContext`, `WishlistContext`, `CompareContext`, `HomepageSections`, and storefront app extension components.
- **Middleware (`middleware.ts`):** Matches `/cart`, `/checkout`, `/api/cart/*`, `/api/orders/*`. Injects `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`. Storefront public pages bypass middleware header modification.
- **`next.config.ts`:** Uses `initOpenNextCloudflareForDev()`. Configures 1-year immutable edge caching for `/_next/static/*` and `/api/media/*`. Configures `s-maxage=60` for API endpoints, `s-maxage=300` for `/`, `/product/*`, `/category/*`.
- **D1 Tables Read:** `settings`, `homepage_sections`, `categories`, `products`, `product_images`, `product_variants`, `product_bundles`, `bundle_items`, `pages`, `faqs`, `trust_badges`, `payment_icons`, `shipping_zones`, `tax_settings`, `tax_rates`, `installed_apps`, `reviews`, `broadcasts`, `cookie_consent_settings`.
- **R2 Serving:** Streams assets through `/api/media/[...path]` with format negotiation (`avif`/`webp`), composite ETags, and edge cache integration (`caches.default`).

### 3.3 Admin Worker (`nasrify-admin`)
- **Route Tree (`app/`):** 24 routes including `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/categories`, `/admin/coupons`, `/admin/customers`, `/admin/media`, `/admin/analytics`, `/admin/homepage`, `/admin/pages`, `/admin/reviews`, `/admin/apps`, `/admin/appearance`, `/admin/settings/*`.
- **AdminShell Navigation Items:** Dashboard, Analytics, Products, Bundles, Categories, Orders, Coupons, Customers, Broadcasts, Media, Homepage, Pages, Reviews, Appearance, Tax Settings, Shipping Zones, Apps.
- **Middleware (`middleware.ts`):** Matches `/admin`, `/admin/*`, `/api/admin/*`. Queries D1 on every request to validate `admin_session` cookie via `verifyAdminSessionToken(token)`. Injects strict `no-store` headers on all responses.
- **D1 Tables Read/Written:** All 44 database tables.

### 3.4 Monolith Worker (`ecommerce-store-perf-test`)
- **Status:** **Untouched backup.** Confirmed clean in repository. Code resides in root `/app`, `/components`, `/lib`. Drift from active workers is intentional: active workers have workerScope app isolation and stripped unused routes.

### 3.5 Apps Framework Architecture
- **Apps Directory (`apps/`):**
  - `apps/hello-world`: Uninstalled test app. Extension points: `admin.dashboard.widget`, `storefront.homepage.section`.
  - `apps/reviews`: **Installed & active in D1**. Extension points: `storefront.product.below`, `admin.dashboard.widget`.
  - `apps/_template`: Scaffolding template for new third-party apps.
- **Build Synchronizer (`scripts/sync-apps.ts`):** Reads each app's `manifest.json` `workerScope`. When building `nasrify-store`, excludes `admin/` code. When building `nasrify-admin`, excludes `storefront/` code. Generates typed `loader.ts` for dynamic component injection.
- **D1 State:** `installed_apps` contains 1 row (`reviews`, version `1.0.0`, `enabled: 1`). `app_install_log` contains 16 historical action logs.

### 3.6 Request Lifecycles

#### Storefront Request Lifecycle (e.g. Hard Refresh on `/product/apex-velocity-runner`)
1. **Cloudflare Edge Routing:** Request arrives at nearest PoP. Edge checks `Cache-Control: public, s-maxage=300`. If cache expired/miss:
2. **Worker Invocation:** `nasrify-store` isolate is selected or spun up.
3. **Middleware:** Checks path against `/cart`, `/checkout`. Route is public; passes through with zero D1 overhead.
4. **Server Component Execution:** Next.js renders `app/product/[slug]/page.tsx`:
   - `getStoreSettings()` & `getThemeSettings()` execute in parallel (cached with `React.cache()`).
   - `getProductBySlug(slug)` queries D1 (`products` table joined with `categories`).
   - `productImages` query fetches gallery images.
   - `getVariantsByProductId()` queries `product_variants`.
   - `getInstalledApps()` checks if reviews app is active (cached with in-memory 60s TTL).
   - `getRelatedProducts()` queries 4 related products in the same category.
5. **Streaming HTML Output:** Server component renders HTML tree, injects theme CSS, embeds client hydration bundle (`StorefrontOverlays`, `CartContext`), and returns 200 OK.

#### Admin Request Lifecycle (e.g. Navigating to `/admin/dashboard`)
1. **Browser Request:** Client requests `https://nasrify-admin.zia291930.workers.dev/admin/dashboard`.
2. **Middleware Execution:**
   - Reads `admin_session` cookie.
   - **Queries D1 `sessions` joined with `users`** (`SELECT ... FROM sessions WHERE token = ?`).
   - Injects `no-store` headers.
3. **Server Layout Execution (`app/admin/(dashboard)/layout.tsx`):**
   - Calls `getCurrentAdmin()`, which **queries D1 `sessions` a second time**.
   - Renders `AdminShell` (sidebar, nav, header).
4. **Page Component Execution (`app/admin/(dashboard)/dashboard/page.tsx`):**
   - Page is marked `"use client"` with `dynamic(..., { ssr: false })`.
   - Renders `AdminLoadingSkeleton`.
5. **Client-Side API Request:** Browser receives skeleton and fires `GET /api/admin/dashboard`.
6. **API Middleware Execution:**
   - Middleware intercepts API request and **queries D1 `sessions` a third time**.
7. **API Route Handler (`app/api/admin/dashboard/route.ts`):**
   - Calls `getCurrentAdmin()`, **querying D1 `sessions` a fourth time**.
   - Runs `Promise.all` for counts: 4 D1 queries (`products`, `categories`, `media`, `settings`).
   - Calls `getAnalyticsKpis("last_30_days")`:
     - **Runs unbounded full table scan:** `SELECT * FROM orders ORDER BY created_at DESC`.
     - JavaScript loops over all orders, calculates revenue, unique customers, and 7 sparkline points.
   - Calls `getTodaySmartInsights()`:
     - Calls `getWeeklyPatterns()`: **Runs full join query** on `order_items` joined with `orders`.
     - Loops over all order items in JavaScript, building nested Maps per day of week.
     - Queries `products` for low stock items.
8. **Response Return:** Total CPU time spent across this single flow reaches **~468ms to ~700ms**.

---

## 4. The Three Issues — Root Cause Analysis

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ISSUE 1: LOCAL DEV NO PRODUCTS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Symptom:      npm run dev shows "No Matching Products Found".               │
│ Exact Error:  [cause]: Error: D1_ERROR: no such table: products             │
│ Root Cause:   initOpenNextCloudflareForDev() binds DB to an unseeded,       │
│               unmigrated local SQLite database (.wrangler/state/v3/d1).     │
│ Fallback:     lib/products.ts falls back to memoryProducts = [] (empty).    │
│ Impact:       100% LOCAL DEV ONLY. Production worker has all 12 products.   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      ISSUE 2: 1102 ERRORS ON HARD REFRESH                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Symptom:      Intermittent Error 1102 on hard refresh (storefront).         │
│ Telemetry:    41 exceededResources errors logged on nasrify-store in 7 days.│
│ Root Cause:   Uncached SSR on cold start. 6-8 D1 round trips + Next.js      │
│               Server Component compilation exceed 10ms CPU limit on initial │
│               render when browser hard-refreshes (Cache-Control: no-cache). │
│ Impact:       Occurs only on cold workers during uncached hard refreshes.   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       ISSUE 3: ADMIN CPU SPIKES TO 700ms                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Symptom:      Admin pages consume 300ms–725ms CPU (Free tier limit is 10ms).│
│ Profiled:     /admin/products: 659ms CPU | /api/admin/dashboard: 468ms CPU  │
│ Hotspots:     1. SELECT * FROM orders (unbounded, no LIMIT or WHERE)        │
│               2. Full scan 3-table join on order_items + orders + products  │
│               3. Redundant D1 session queries (3-4x per request in auth)    │
│               4. Zero caching on any admin API route (middleware no-store)  │
│ Impact:       Extremely vulnerable to 1102 termination if limits enforced.  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Full SSR vs CSR Map

### 5.1 Storefront Pages (`nasrify-store/app`)

| Route | File Path | Rendering Type | `"use client"`? | Revalidate | D1 Data Calls | Cache Headers |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `/` | `app/page.tsx` | **ISR** | No | 300s | 6 queries (`settings`, `theme`, `sections`, `categories`, `products`, `bundles`) | `public, s-maxage=300, stale-while-revalidate=600` |
| `/shop` | `app/shop/page.tsx` | **ISR** | No | 60s | 4 queries (`settings`, `theme`, `categories`, `products`) | `public, s-maxage=60, stale-while-revalidate=600` |
| `/product/[slug]` | `app/product/[slug]/page.tsx` | **ISR** | No | 300s | 5 queries (`product`, `images`, `variants`, `related`, `reviews`) | `public, s-maxage=300, stale-while-revalidate=600` |
| `/category/[slug]` | `app/category/[slug]/page.tsx` | **ISR** | No | 300s | 4 queries (`category`, `products`, `settings`, `theme`) | `public, s-maxage=300, stale-while-revalidate=600` |
| `/bundles` | `app/bundles/page.tsx` | **ISR** | No | 300s | 3 queries (`bundles`, `settings`, `theme`) | `public, s-maxage=60` |
| `/bundles/[slug]` | `app/bundles/[slug]/page.tsx` | **ISR** | No | 300s | 3 queries (`bundle`, `items`, `products`) | `public, s-maxage=60` |
| `/cart` | `app/cart/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/cart`) | `private, no-cache, no-store` |
| `/checkout` | `app/checkout/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/cart`, `/api/shipping/zones`) | `private, no-cache, no-store` |
| `/compare` | `app/compare/page.tsx` | **SSG/SSR** | No | None | Client localStorage driven | `public, s-maxage=60` |
| `/wishlist` | `app/wishlist/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/customer/wishlist`) | None |
| `/track-order` | `app/track-order/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/orders/track`) | None |
| `/account` | `app/account/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/customer/profile`) | None |
| `/account/orders` | `app/account/orders/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/customer/orders`) | None |
| `/account/orders/[id]`| `app/account/orders/[id]/page.tsx`| **CSR** | **Yes** | None | Client fetch (`/api/customer/orders/[id]`) | None |
| `/account/addresses`| `app/account/addresses/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/customer/addresses`) | None |
| `/account/profile` | `app/account/profile/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/customer/profile`) | None |
| `/account/reviews` | `app/account/reviews/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/customer/reviews`) | None |
| `/account/notifications`|`app/account/notifications/page.tsx`| **CSR** | **Yes** | None | Client fetch (`/api/customer/notifications`) | None |
| `/account/signout` | `app/account/signout/page.tsx` | **CSR** | **Yes** | None | Client fetch (`/api/customer/logout`) | None |
| `/about` | `app/about/page.tsx` | **ISR** | No | 60s | 2 queries (`pages`, `settings`) | `public, s-maxage=60` |
| `/contact` | `app/contact/page.tsx` | **ISR** | No | 60s | 2 queries (`settings`, `theme`) | `public, s-maxage=60` |
| `/faq` | `app/faq/page.tsx` | **ISR** | No | 60s | 3 queries (`faqs`, `settings`, `theme`) | `public, s-maxage=60` |
| `/pages/[slug]` | `app/pages/[slug]/page.tsx` | **ISR** | No | 60s | 3 queries (`page`, `settings`, `theme`) | `public, s-maxage=60` |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | **ISR** | No | 60s | 2 queries (`pages`, `settings`) | `public, s-maxage=60` |
| `/terms` | `app/terms/page.tsx` | **ISR** | No | 60s | 2 queries (`pages`, `settings`) | `public, s-maxage=60` |
| `/shipping` | `app/shipping/page.tsx` | **ISR** | No | 60s | 2 queries (`pages`, `settings`) | `public, s-maxage=60` |
| `/returns` | `app/returns/page.tsx` | **ISR** | No | 60s | 2 queries (`pages`, `settings`) | `public, s-maxage=60` |
| `/cookie-policy` | `app/cookie-policy/page.tsx` | **SSR** | No | None | Dynamic cookie check | `public, s-maxage=60` |
| `/search` | `app/search/page.tsx` | **ISR** | No | 60s | 3 queries (`searchParams` query) | `public, s-maxage=60` |
| `/login` | `app/login/page.tsx` | **CSR** | **Yes** | None | Client auth form | None |
| `/signup` | `app/signup/page.tsx` | **CSR** | **Yes** | None | Client auth form | None |
| `/forgot-password`| `app/forgot-password/page.tsx` | **CSR** | **Yes** | None | Client auth form | None |
| `/reset-password` | `app/reset-password/page.tsx` | **CSR** | **Yes** | None | Client auth form | None |
| `/order-success` | `app/order-success/page.tsx` | **SSG/SSR** | No | None | Fallback redirect | None |
| `/order-success/[orderId]`|`app/order-success/[orderId]/page.tsx`| **CSR** | **Yes** | None | Client fetch (`/api/orders/[id]`) | None |

---

### 5.2 Admin Pages (`nasrify-admin/app`)

| Route | File Path | Type | `"use client"`? | SSR: false? | Server D1 Calls | Client API Endpoints Called |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `/admin/login` | `app/admin/login/page.tsx` | **CSR** | **Yes** | No | None (Auth handled in API) | `/api/admin/login` |
| `/admin` | `app/admin/page.tsx` | **SSR** | No | No | Middleware auth check | Redirects to `/admin/dashboard` |
| `/admin/dashboard` | `app/admin/(dashboard)/dashboard/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/dashboard` |
| `/admin/products` | `app/admin/(dashboard)/products/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/products`, `/api/admin/categories` |
| `/admin/orders` | `app/admin/(dashboard)/orders/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/orders` |
| `/admin/categories`| `app/admin/(dashboard)/categories/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/categories` |
| `/admin/categories/[id]/products`|`app/.../categories/[id]/products/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/products?categoryId=...` |
| `/admin/coupons` | `app/admin/(dashboard)/coupons/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/coupons` |
| `/admin/customers` | `app/admin/(dashboard)/customers/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/customers` |
| `/admin/analytics` | `app/admin/(dashboard)/analytics/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | 7 endpoints: `/kpis`, `/sales-trend`, `/top-products`, `/categories`, `/patterns/*` |
| `/admin/media` | `app/admin/(dashboard)/media/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/media` |
| `/admin/bundles` | `app/admin/(dashboard)/bundles/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/bundles` |
| `/admin/broadcasts`| `app/admin/(dashboard)/broadcasts/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/broadcasts` |
| `/admin/homepage` | `app/admin/(dashboard)/homepage/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/homepage/sections` |
| `/admin/pages` | `app/admin/(dashboard)/pages/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/pages` |
| `/admin/reviews` | `app/admin/(dashboard)/reviews/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/reviews` |
| `/admin/appearance`| `app/admin/(dashboard)/appearance/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/appearance` |
| `/admin/apps` | `app/admin/(dashboard)/apps/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/apps` |
| `/admin/apps/[appId]`|`app/admin/(dashboard)/apps/[appId]/page.tsx`| **SSR** | No | No | 2 (`getCurrentAdmin`, `theme`) | Dynamic app-specific actions |
| `/admin/settings` | `app/admin/(dashboard)/settings/page.tsx` | **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/settings` |
| `/admin/settings/tax`|`app/admin/(dashboard)/settings/tax/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/settings/tax` |
| `/admin/settings/shipping-zones`|`app/.../shipping-zones/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/settings/shipping-zones` |
| `/admin/settings/trust-badges`|`app/.../trust-badges/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/settings/trust-badges` |
| `/admin/settings/cookie-consent`|`app/.../cookie-consent/page.tsx`| **CSR** | **Yes** | **Yes** | 2 (`getCurrentAdmin`, `theme`) | `/api/admin/settings/cookie-consent` |

---

## 6. Cache Gap Analysis

| Route / Asset URL | Current `Cache-Control` | Ideal `Cache-Control` | Reason for Gap | Priority |
| :--- | :--- | :--- | :--- | :---: |
| `/_next/static/:path*` | `public, max-age=31536000, immutable` | `public, max-age=31536000, immutable` | Already optimal. Cached at Cloudflare edge. | None |
| `/api/media/:path*` | `public, max-age=31536000, immutable` | `public, max-age=31536000, immutable` | Optimal; integrates `caches.default`. | None |
| `/` (Homepage HTML) | `public, s-maxage=300, stale-while-revalidate=600` | `public, s-maxage=300, stale-while-revalidate=600` | Good, but browser hard refresh ignores CDN cache. | Medium |
| `/product/:slug` | `public, s-maxage=300, stale-while-revalidate=600` | `public, s-maxage=300, stale-while-revalidate=600` | Good, but variant/stock changes take 300s to reflect. | Medium |
| `/shop` | `public, s-maxage=60, stale-while-revalidate=600` | `public, s-maxage=120, stale-while-revalidate=600` | Low TTL forces frequent worker wakeups. | Low |
| `/api/categories` | `public, s-maxage=60, stale-while-revalidate=600` | `public, s-maxage=300, stale-while-revalidate=3600` | Categories rarely change; 60s is too short. | Medium |
| `/api/settings` | `public, s-maxage=60, stale-while-revalidate=600` | `public, s-maxage=600, stale-while-revalidate=3600` | Store settings change infrequently. | Medium |
| `/api/admin/dashboard` | `private, no-cache, no-store` | In-memory isolate micro-cache (15s TTL) | Called repeatedly; triggers heavy calculations. | **High** |
| `/api/admin/analytics/*`| `private, no-cache, no-store` | In-memory isolate micro-cache (30s TTL) | 7 parallel API calls run identical heavy scans. | **High** |
| `/admin/*` HTML shells | `private, no-cache, no-store` | `private, no-cache, no-store` | Correct for authenticated admin shells. | None |

---

## 7. D1 Health & Database Audit

### 7.1 Table-by-Table Remote Row Counts & Indexing

| Table Name | Remote Rows | Purpose / Queried By | Existing Indexes | Health Flag / Risk |
| :--- | :---: | :--- | :--- | :--- |
| `products` | **12** | Core catalog (Store & Admin) | `idx_products_category_id`, `idx_products_status` | Healthy. |
| `product_variants` | **0** | SKU variants | `idx_product_variants_product_id` | Empty. |
| `product_images` | **34** | Image gallery | `idx_product_images_product_id` | Healthy. |
| `categories` | **6** | Categories | `idx_categories_parent_id`, `slug` unique | Healthy. |
| `orders` | **38** | Customer orders | `idx_orders_status`, `idx_orders_created_at`, `idx_orders_customer_id`, `idx_orders_tracking_number` | **HOTSPOT:** Queried with `SELECT *` without LIMIT/WHERE in analytics. |
| `order_items` | **61** | Order line items | `idx_order_items_order_id` | **HOTSPOT:** Joined across all orders in analytics without LIMIT. |
| `customers` | **8** | Registered buyers | `idx_customers_email` | Healthy. |
| `customer_addresses` | **3** | Shipping addresses | `idx_customer_addresses_customer_id` | Healthy. |
| `customer_sessions` | **10** | Storefront auth tokens | `idx_customer_sessions_token`, `idx_customer_sessions_customer_id` | Healthy. |
| `customer_wishlist` | **2** | Wishlist records | `idx_customer_wishlist_customer_id` | Healthy. |
| `carts` | **140** | Active/abandoned carts | `idx_carts_session_id`, `idx_carts_user_id` | **Highest row count in database.** Needs pruning/TTL cleanup. |
| `cart_items` | **1** | Items in active carts | `idx_cart_items_cart_id`, `idx_cart_items_product_id` | Healthy. |
| `coupons` | **8** | Promotional codes | Unique on code | Healthy. |
| `coupon_usages` | **4** | Coupon redemption log | None | Low volume currently. |
| `homepage_sections` | **9** | Homepage layout CMS | `idx_homepage_sections_sort_order`, `idx_homepage_sections_is_active` | Healthy. |
| `pages` | **6** | Static CMS pages | `idx_pages_slug`, `idx_pages_published` | Healthy. |
| `settings` | **2** | Store & theme settings | Primary key only | Small table (2 rows). |
| `media` | **9** | Asset library metadata | `idx_media_created_at` | Healthy. |
| `attributes` | **2** | Product attributes | Primary key only | Small table. |
| `attribute_values` | **4** | Attribute choices | Primary key only | Small table. |
| `product_bundles` | **2** | Bundles | `idx_bundles_status`, `idx_bundles_slug`, `idx_bundles_featured` | Healthy. |
| `bundle_items` | **5** | Bundle components | `idx_bundle_items_bundle`, `idx_bundle_items_product` | Healthy. |
| `reviews` | **4** | Customer ratings | `idx_reviews_product_id`, `idx_reviews_status`, `idx_reviews_rating`, `idx_reviews_created` | Healthy. |
| `review_images` | **1** | Review attachments | `idx_review_images_review_id` | Healthy. |
| `review_helpful` | **0** | Helpful votes | `idx_review_helpful_review_id` | Empty. |
| `broadcasts` | **3** | Announcement banners | `idx_broadcasts_status`, `idx_broadcasts_target`, `idx_broadcasts_created_at` | Healthy. |
| `broadcast_views` | **27** | Dismissal tracking | `idx_broadcast_views_broadcast_id`, `idx_broadcast_views_visitor_id`, `idx_broadcast_views_is_dismissed` | Healthy. |
| `trust_badges` | **6** | Footer trust badges | Primary key only | Small table. |
| `payment_icons` | **6** | Payment method logos | Primary key only | Small table. |
| `cookie_consent_settings`|**1**| GDPR configuration | Primary key only | Single row. |
| `shipping_zones` | **12** | Shipping rules | `idx_shipping_zones_active`, `idx_shipping_zones_sort` | Healthy. |
| `tax_rates` | **16** | Regional tax rates | `idx_tax_rates_country`, `idx_tax_rates_country_state` | Healthy. |
| `tax_settings` | **1** | Tax configuration | Primary key only | Single row. |
| `contact_messages` | **0** | Customer inquiries | `idx_contact_read` | Empty. |
| `faqs` | **8** | FAQ accordion list | `idx_faqs_active`, `idx_faqs_sort` | Healthy. |
| `notifications` | **41** | In-app customer alerts | `idx_notifications_customer_id`, `idx_notifications_is_read` | Healthy. |
| `installed_apps` | **1** | Active apps registry | Primary key only | Contains `reviews` app. |
| `app_install_log` | **16** | Audit trail of app ops | Primary key only | Audit trail. |
| `app_hello-world_test`| **1** | Test table from demo | Primary key only | Orphan table from uninstalled app. |
| `users` | **1** | Admin credentials | Unique on email | Single admin user (`admin@example.com`). |
| `sessions` | **79** | Admin active sessions | Primary key only | **MISSING INDEX:** `sessions.token` is queried on every request without index! |
| `login_attempts` | **35** | Security rate limiting | None | **MISSING INDEX:** `login_attempts.email` and `attempted_at`. |
| `d1_migrations` | **6** | D1 migration metadata | Primary key only | Internal table. |

---

## 8. Apps Framework Status

1. **Installed Apps:**
   - **`reviews` (Reviews & Ratings):** Installed and active (`enabled: 1`). Version 1.0.0. Tables: `reviews`, `review_images`. Extension points: `storefront.product.below`, `admin.dashboard.widget`.
   - **`hello-world`:** Uninstalled. Manifest remains in `apps/hello-world` as a reference implementation. Leftover test table `app_hello-world_test` remains in D1.
2. **Synchronization Determinism (`sync-apps.ts`):**
   - The script is completely deterministic. It reads `workerScope` from `manifest.json` and copies only `admin/` files to `nasrify-admin` and `storefront/` files to `nasrify-store`.
   - Generates worker-scoped `loader.ts` files ensuring storefront bundles do not contain admin code and vice versa.
3. **Template Quality (`apps/_template`):**
   - Contains a complete boilerplate: `manifest.json`, `icon.svg`, `admin/`, `storefront/`, `lib/`, and a comprehensive developer guide in `apps/_template/README.md`.

---

## 9. Top 10 Prioritized Recommended Fixes

> [!IMPORTANT]
> **No changes have been made during this stage.** The recommendations below are strictly for user review and planning.

| Priority | Area | Issue | Recommended Fix | Estimated CPU Reduction |
| :---: | :--- | :--- | :--- | :---: |
| **#1** | **Admin Auth** | D1 session lookup executed 3–4x per admin request (`middleware.ts`, `layout.tsx`, API route). | Wrap `validateSession` in `React.cache()` and add an in-memory 60s isolate cache for valid tokens. | **-80ms to -120ms per admin request** |
| **#2** | **D1 Indexes** | Missing index on `sessions.token` and `login_attempts.email`. | Add `CREATE INDEX idx_sessions_token ON sessions(token);` and `CREATE INDEX idx_login_attempts_email ON login_attempts(email);`. | **-40ms to -80ms per admin request** |
| **#3** | **Analytics Hotspot** | Unbounded `SELECT * FROM orders` in `lib/analytics.ts` (`getAnalyticsKpis`, `getSalesTrend`). | Add `WHERE created_at >= ?` date boundary and use SQL aggregate functions (`SUM`, `COUNT`, `AVG`) instead of fetching raw rows into JS. | **-150ms to -250ms on dashboard/analytics** |
| **#4** | **Analytics Joins** | 3-table full scan join on `order_items` + `orders` + `products` in `getTopProducts` and `getCategoryPerformance`. | Add date filters and `LIMIT 100` to the SQL query; calculate top categories directly in SQL with `GROUP BY`. | **-100ms to -180ms on dashboard/analytics** |
| **#5** | **Admin API Cache** | Zero caching on admin API routes (`no-store` injected across all responses). | Add a 15–30s in-memory isolate micro-cache for `/api/admin/dashboard` metrics and analytics KPIs. | **-350ms to -500ms on repeat admin hits** |
| **#6** | **Local D1 Dev** | Storefront shows 0 products locally because local SQLite database has no tables or seed data. | Provide a standard command: `npx wrangler d1 migrations apply ecommerce-perf-db --local` followed by executing a local seed script. | **Fixes local development product rendering 100%** |
| **#7** | **Storefront SSR** | Cold start compilation + multiple D1 round trips cause 1102 errors on hard refresh. | Pre-render top static routes and increase Cloudflare edge cache TTL for public API endpoints from 60s to 300s. | **Eliminates 1102 errors on public pages** |
| **#8** | **Cart Table Pruning** | `carts` table has 140 rows (highest in database) with abandoned sessions accumulating. | Implement a scheduled daily cron or cleanup query: `DELETE FROM carts WHERE updated_at < datetime('now', '-30 days')`. | **Prevents table bloat and scan slowdown** |
| **#9** | **Admin SVG Icons** | `AdminShell.tsx` renders dozens of raw inline SVG path strings on every render. | Extract navigation icons into memoized components or Lucide icon references to reduce JS evaluation time. | **-20ms to -40ms on initial SSR** |
| **#10**| **Orphan Table** | `app_hello-world_test` table remains in D1 despite app being uninstalled. | Drop the orphan test table: `DROP TABLE IF EXISTS "app_hello-world_test";`. | **Schema hygiene** |

---

## 10. What to Measure Next (After Stage F Fixes)

1. **Admin Median CPU:** Target reduction from **~468ms down to <15ms**.
2. **Storefront Error 1102 Count:** Target reduction from **41 errors/week down to 0**.
3. **Local Dev Verification:** Confirm running `npm run dev` in `nasrify-store` displays all 12 products on the homepage and `/shop`.
4. **Cloudflare P99 Worker CPU:** Verify P99 on `nasrify-store` drops below 50ms under load testing.

---

## 11. Questions for the Owner / Design Decisions

1. **Admin Analytics Accuracy vs Speed:** Are you comfortable with admin dashboard stats (revenue, order counts) updating every 30 seconds rather than real-time per millisecond? *(This allows a 30-second micro-cache that instantly eliminates 80% of admin CPU time).*
2. **Local Database Strategy:** For local development, do you prefer:
   - **Option A (Recommended):** Running local D1 migrations and seeding sample products so local dev is 100% offline and isolated.
   - **Option B:** Pointing local development directly to the remote Cloudflare D1 database using `--remote`.
3. **Cart Retention Window:** How long should abandoned shopping carts be kept before being automatically purged (e.g. 14 days, 30 days, or 90 days)?
