# Stage B — Admin Worker Split Documentation

## Executive Summary
In Stage B, the admin portal was extracted from the monolith into an isolated Cloudflare Worker named `nasrify-admin` deployed to [`https://nasrify-admin.zia291930.workers.dev`](https://nasrify-admin.zia291930.workers.dev).

Both existing workers remain completely functional:
1. `nasrify-store` at [`https://nasrify-store.zia291930.workers.dev`](https://nasrify-store.zia291930.workers.dev) (storefront worker, 0 admin routes).
2. `ecommerce-store-perf-test` at [`https://ecommerce-store-perf-test.zia291930.workers.dev`](https://ecommerce-store-perf-test.zia291930.workers.dev) (original monolith worker, serving both).

All three workers share the same D1 SQLite database (`ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`) and R2 bucket (`ecommerce-perf-assets`).

---

## 1. Cloudflare Worker Configuration & Bindings

### 1.1 New Admin Worker (`nasrify-admin`)
- **Worker Name**: `nasrify-admin`
- **Worker URL**: `https://nasrify-admin.zia291930.workers.dev`
- **Current Version ID**: `168f4618-5fc4-45ae-a1ae-eced3003227a`
- **Cloudflare Account ID**: `ab9b528badc7cbd3e583a9ff7935a07f`
- **Bindings**:
  - `env.DB` (D1 Database: `ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`)
  - `env.R2` (R2 Bucket: `ecommerce-perf-assets`)
  - `env.ASSETS` (Static asset binding)
  - `env.NEXT_PUBLIC_APP_URL` (`https://nasrify-admin.zia291930.workers.dev`)
  - `env.SESSION_SECRET`, `env.JWT_SECRET`
  - `env.ADMIN_SECRET` (`admin_perf_test_secret_2026`)
  - `env.ADMIN_EMAIL` (`admin@apexstore.com`)
- **Upload Size**: `10,993.83 KiB / gzip: 1,955.16 KiB`
- **Worker Startup Time**: `25 ms`

---

## 2. Files Copied, Deleted, and Skipped

### 2.1 Files Copied into `nasrify-admin/`
- **Directories**:
  - `app/admin/`: All 20 admin dashboard routes and admin login interface
  - `app/api/`: All API endpoints used by admin dashboard and management
  - `components/`: Admin dashboard components, modals, tables, icons, and overlays
  - `lib/`: ORM schema, D1 database singleton, admin authentication (`lib/auth.ts`), caching, R2 helpers, settings
  - `drizzle/`: Database migrations and Drizzle kit configuration
  - `public/`: Brand assets and SVGs
  - `config/`: Environment, token, and site configurations
  - `types/`: TypeScript definitions
  - `services/`: Service handlers
- **Files**:
  - `package.json` (name updated to `"nasrify-admin"`)
  - `package-lock.json`
  - `next.config.ts` (configured with `nasrify-admin` remote image pattern)
  - `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `open-next.config.ts`, `next-env.d.ts`, `cloudflare-env.d.ts`
  - `middleware.ts` (tailored to protect `/admin`, `/admin/*`, and `/api/admin/*`)
  - `wrangler.toml` (created for `nasrify-admin`)
  - `.env.local` (copied locally, gitignored)

### 2.2 Files Deleted from `nasrify-admin/app/`
- `app/page.tsx` (Homepage)
- `app/shop/`
- `app/product/`
- `app/category/`
- `app/cart/`
- `app/checkout/`
- `app/order-success/`
- `app/account/`
- `app/track-order/`
- `app/compare/`
- `app/bundles/`
- `app/about/`, `contact/`, `privacy-policy/`, `terms/`, `faq/`, `cookie-policy/`
- `app/forgot-password/`, `reset-password/`, `signup/`, `login/`, `wishlist/`, `search/`, `returns/`, `shipping/`, `pages/`
- `app/sitemap.ts`

### 2.3 Files Skipped (with Rationale)
- `nasrify-store/`: Excluded; already deployed as a standalone storefront worker.
- `.git/`: Kept single monorepo root.
- `node_modules/`: Freshly installed inside `nasrify-admin/`.
- `.next/`, `.open-next/`, `.wrangler/`: Generated cleanly during local worker build.

---

## 3. Bundle Size & Optimization Comparison

| Metric | Monolith Worker (`ecommerce-store-perf-test`) | Admin Worker (`nasrify-admin`) | Difference |
|---|---|---|---|
| **Total OpenNext JS Bundle** | `21,337.12 KB` (~21.3 MB) | `18,322.75 KB` (~18.3 MB) | **-3,014.37 KB (~3.0 MB smaller, -14.1%)** |
| **Public Storefront Routes** | 28 storefront pages | **0 public pages (all return 404)** | Storefront completely pruned |
| **Admin Route Presence** | All 20 routes | All 20 routes | Preserved & active |
| **D1 Singleton** | Active (`_cachedDb`, `_cachedD1`) | Active (`_cachedDb`, `_cachedD1`) | Preserved |
| **Dynamic Cryptography** | `bcryptjs` dynamic import | `bcryptjs` dynamic import | Preserved |

---

## 4. Complete Verification Checklist (27 / 27 Passed)

### Admin Worker (`https://nasrify-admin.zia291930.workers.dev`)
- [x] `GET /admin/login` — HTTP 200 (1,484.8 ms) — Admin login page loaded
- [x] `POST /api/admin/login` (`admin@example.com` / `admin123`) — HTTP 200 (1,375.9 ms) — `admin_session` cookie issued
- [x] `GET /admin/dashboard` — HTTP 200 (578.6 ms) — Admin dashboard overview loaded
- [x] `GET /admin/products` — HTTP 200 (518.7 ms) — Products list loads from D1
- [x] `GET /admin/orders` — HTTP 200 (514.7 ms) — Orders list loads from D1
- [x] `GET /admin/categories` — HTTP 200 (506.4 ms) — Categories load from D1
- [x] `GET /admin/coupons` — HTTP 200 (526.4 ms) — Coupons manager loads
- [x] `GET /admin/bundles` — HTTP 200 (507.3 ms) — Bundles manager loads
- [x] `GET /admin/reviews` — HTTP 200 (512.0 ms) — Reviews manager loads
- [x] `GET /admin/settings/tax` — HTTP 200 (505.5 ms) — Tax settings load
- [x] `GET /admin/settings/shipping-zones` — HTTP 200 (498.2 ms) — Shipping zones load
- [x] `GET /admin/settings/trust-badges` — HTTP 200 (496.5 ms) — Trust badges load
- [x] `GET /admin/analytics` — HTTP 200 (487.7 ms) — Analytics dashboard loads
- [x] `GET /admin/pages` — HTTP 200 (850.5 ms) — CMS pages manager loads
- [x] `GET /admin/appearance` — HTTP 200 (508.3 ms) — Theme & appearance settings load
- [x] `GET /admin/media` — HTTP 200 (619.6 ms) — Media manager loads
- [x] `GET /` — **HTTP 404** (175.5 ms) — Storefront homepage returns 404
- [x] `GET /shop` — **HTTP 404** (1,176.9 ms) — Storefront /shop returns 404
- [x] `POST /api/media/upload` — **HTTP 201** (1,346.2 ms) — Image uploaded to Cloudflare R2
- [x] `GET /api/media/test/...` — **HTTP 200** (358.4 ms) — Uploaded R2 image served directly through admin worker

### Storefront Worker (`https://nasrify-store.zia291930.workers.dev`) — Untouched
- [x] `GET /` — HTTP 200 (1,797.4 ms) — Storefront homepage active
- [x] `GET /shop` — HTTP 200 (1,074.0 ms) — Storefront catalog active
- [x] `GET /product/apex-velocity-runner-x1` — HTTP 200 (917.0 ms) — Product detail active
- [x] `GET /api/media/products/c1942822-8838-45d9-b2ca-7156aa40a512.png` — HTTP 200 (185.9 ms) — R2 media served

### Monolith Worker (`https://ecommerce-store-perf-test.zia291930.workers.dev`) — Untouched
- [x] `GET /` — HTTP 200 (2,209.7 ms) — Monolith homepage active
- [x] `GET /admin/login` — HTTP 200 (1,711.7 ms) — Monolith admin login active
- [x] `POST /api/admin/login` — HTTP 200 (1,443.7 ms) — Monolith admin authentication succeeds

---

## 5. Errors Encountered & Resolutions

1. **Upload Status Code Assertion in Verification Script**:
   - *Error*: Initial test expected HTTP 200 for upload, while Next.js `/api/media/upload` correctly returns `HTTP 201 Created`.
   - *Resolution*: Updated test assertion in `scripts/verify-stage-b.ts` to accept HTTP 201 Created and verify immediate image serving via edge proxy.

---

## 6. Rollback Instructions

If rollback is ever required:
1. Revert Git state to pre-stage tag:
   ```bash
   git checkout pre-stage-b
   ```
2. If `nasrify-admin` needs removal from Cloudflare:
   ```bash
   npx.cmd wrangler delete --name nasrify-admin
   ```
3. If D1 database restoration is needed:
   ```bash
   npx.cmd wrangler d1 execute ecommerce-perf-db --remote --file=backups/d1-pre-stage-b.sql
   ```
4. Monolith worker `ecommerce-store-perf-test` and storefront worker `nasrify-store` remain completely untouched and live.
