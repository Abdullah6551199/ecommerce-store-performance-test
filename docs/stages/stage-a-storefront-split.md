# Stage A — Storefront Worker Split Documentation

## Executive Summary
In Stage A, the storefront application was extracted from the monolith into an isolated Cloudflare Worker named `nasrify-store` deployed at `https://nasrify-store.zia291930.workers.dev`.

The original monolith worker (`ecommerce-store-perf-test` at `https://ecommerce-store-perf-test.zia291930.workers.dev`) remains completely intact and serves the admin dashboard and APIs. Both workers share the same D1 SQLite database (`ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`) and the same R2 bucket (`ecommerce-perf-assets`).

---

## 1. Cloudflare Worker Configuration & Bindings

### 1.1 New Storefront Worker (`nasrify-store`)
- **Worker Name**: `nasrify-store`
- **Worker URL**: `https://nasrify-store.zia291930.workers.dev`
- **Version ID**: `77eeba64-6f43-477b-b7dc-c04e468af455`
- **Account ID**: `ab9b528badc7cbd3e583a9ff7935a07f`
- **Bindings**:
  - `env.DB` (D1 Database: `ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`)
  - `env.R2` (R2 Bucket: `ecommerce-perf-assets`)
  - `env.ASSETS` (Static open-next asset handler)
  - `env.NEXT_PUBLIC_APP_URL` (`https://nasrify-store.zia291930.workers.dev`)
  - `env.SESSION_SECRET`, `env.JWT_SECRET`
- **Total Upload Size**: `10,106.66 KiB / gzip: 1,874.37 KiB`
- **Worker Startup Time**: `23 ms`

### 1.2 Original Monolith Worker (`ecommerce-store-perf-test`)
- **Worker Name**: `ecommerce-store-perf-test`
- **Worker URL**: `https://ecommerce-store-perf-test.zia291930.workers.dev`
- **Status**: Untouched, fully operational (admin dashboard & login active)

---

## 2. Files Copied, Removed, and Skipped

### 2.1 Files Copied to `nasrify-store/`
- **Directories**:
  - `app/`: Storefront pages, dynamic routes, layout, SEO routes (`robots.ts`, `sitemap.ts`)
  - `components/`: Storefront UI components, cards, navigation, overlays, modals, search
  - `lib/`: Storefront business logic, D1 database client, Drizzle schema, caching, SEO, utilities
  - `drizzle/`: Schema and migrations definitions
  - `public/`: Static brand assets and SVGs
  - `config/`: Site settings, tokens, environment configs
  - `types/`: Global and environment TypeScript definitions
  - `services/`: Client-side service handlers
- **Files**:
  - `package.json` (configured with package name `"nasrify-store"`)
  - `package-lock.json`
  - `next.config.ts` (updated without admin headers)
  - `tailwind.config.ts`
  - `postcss.config.mjs`
  - `tsconfig.json`
  - `open-next.config.ts`
  - `next-env.d.ts`
  - `cloudflare-env.d.ts`
  - `.env.example`
  - `middleware.ts` (decoupled from admin auth)
  - `wrangler.toml` (created for `nasrify-store`)

### 2.2 Files Removed from `nasrify-store/`
- `app/admin/` (entire directory, 20 routes)
- `app/api/admin/` (entire directory, all admin API endpoints)
- `components/admin/` (entire directory, all admin dashboard components)
- `lib/auth.ts` (admin authentication session and token verification)
- `app/api/media/upload/route.ts` & `app/api/media/route.ts` (admin-only media endpoints; `[...path]` retained for public R2 delivery)
- Removed `drizzle-kit` devDependency and `db:*` CLI scripts from `nasrify-store/package.json`

### 2.3 Files Skipped (with Rationale)
- `.git/`: Kept single git repository root to avoid git submodule complexity.
- `node_modules/`: Freshly installed inside `nasrify-store/` via `npm install`.
- `.next/`, `.open-next/`, `.wrangler/`: Rebuilt from scratch inside `nasrify-store/`.
- `scripts/`: Development and audit test suites kept at root level.
- `docs/`: Centralized documentation maintained at workspace root.

---

## 3. Bundle Size & Optimization Comparison

| Metric | Monolith Worker (`ecommerce-store-perf-test`) | Storefront Worker (`nasrify-store`) | Difference |
|---|---|---|---|
| **Total OpenNext JS Bundle** | `21,337.12 KB` (~21.3 MB) | `17,452.71 KB` (~17.5 MB) | **-3,884.41 KB (~3.9 MB smaller, -18.2%)** |
| **Next.js App Router Routes** | 52 routes (including admin) | 51 routes (100% storefront) | Admin removed |
| **Admin Route Presence** | `/admin/*` routes present | **404 Not Found** | Fully stripped |
| **D1 Singleton** | Active (`_cachedDb`, `_cachedD1`) | Active (`_cachedDb`, `_cachedD1`) | Preserved |
| **React.cache() Wrappers** | Active | Active | Preserved |
| **Dynamic Cryptography** | `bcryptjs` dynamic import | `bcryptjs` dynamic import | Preserved |

---

## 4. Complete Verification Checklist (16 / 16 Passed)

### Storefront Worker: `https://nasrify-store.zia291930.workers.dev`
- [x] `GET /` — HTTP 200 (1,847.1 ms cold SSR) — Homepage rendered
- [x] `GET /shop` — HTTP 200 (517.8 ms) — Shop page loaded products from D1
- [x] `GET /product/apex-velocity-runner-x1` — HTTP 200 (882.7 ms) — Product detail loaded from D1
- [x] `GET /category/footwear` — HTTP 200 (671.3 ms) — Category page loaded from D1
- [x] `GET /cart` — HTTP 200 (1,798.9 ms) — Cart page loaded
- [x] `GET /checkout` — HTTP 200 (190.9 ms) — Checkout page loaded
- [x] `GET /track-order` — HTTP 200 (234.8 ms) — Track order page loaded
- [x] `GET /compare` — HTTP 200 (150.1 ms) — Compare page loaded
- [x] `GET /bundles` — HTTP 200 (574.7 ms) — Bundles page loaded from D1
- [x] `GET /admin` — **HTTP 404** (157.7 ms) — Admin route correctly returns 404
- [x] `GET /admin/login` — **HTTP 404** (197.3 ms) — Admin login route correctly returns 404
- [x] `GET /api/media/products/c1942822-8838-45d9-b2ca-7156aa40a512.png` — HTTP 200 (801.3 ms) — R2 product media served successfully via edge proxy

### Original Monolith Worker: `https://ecommerce-store-perf-test.zia291930.workers.dev`
- [x] `GET /` — HTTP 200 (1,908.6 ms) — Original monolith homepage operational
- [x] `GET /admin/login` — HTTP 200 (1,173.2 ms) — Original monolith admin login page still loads
- [x] `POST /api/admin/login` — HTTP 200 (1,256.4 ms) — Admin authentication succeeded (`admin_session` cookie issued)
- [x] `GET /admin/dashboard` — HTTP 200 (520.1 ms) — Admin dashboard loaded with active session

---

## 5. Errors Encountered & Resolutions

1. **PowerShell Script Execution Policy (`npx.ps1`)**:
   - *Error*: Windows blocked `npx.ps1` and `npm.ps1`.
   - *Resolution*: Ran `npx.cmd` and `npm.cmd` directly.
2. **Missing `CLOUDFLARE_API_TOKEN` during Deploy**:
   - *Error*: Initial non-interactive deploy inside `nasrify-store` lacked `.env.local`.
   - *Resolution*: Copied `.env.local` from root and explicitly set `$env:CLOUDFLARE_API_TOKEN` and `$env:CLOUDFLARE_ACCOUNT_ID` in the deployment process.

---

## 6. Rollback Instructions

If rollback is ever required:
1. Revert Git state to pre-stage tag:
   ```bash
   git checkout pre-stage-a
   ```
2. Redeploy the original monolith worker:
   ```bash
   npm run deploy:worker
   ```
3. To delete the `nasrify-store` worker:
   ```bash
   npx wrangler delete --name nasrify-store
   ```
4. Restore D1 database from backup (if necessary):
   ```bash
   npx wrangler d1 execute ecommerce-perf-db --remote --file=backups/d1-pre-stage-a.sql
   ```
5. Original monolith worker `ecommerce-store-perf-test` is completely untouched and remains live at `https://ecommerce-store-perf-test.zia291930.workers.dev`.
