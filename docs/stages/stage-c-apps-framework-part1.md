# Stage C — Apps Framework Part 1 (Foundation / Skeleton)

**Date**: 2026-09-16  
**Environment**: Cloudflare Workers (Test)  
**Status**: Completed & Verified  

---

## 1. Executive Summary
Stage C establishes the foundation and skeleton for the pluggable App/Plugin system for the Nasrify e-commerce platform. No existing platform features (Reviews, Wishlist, Bundles, etc.) were modified or converted in this stage. A working demo app (`hello-world`) was implemented to prove the end-to-end lifecycle: registration, installation, permission validation, runtime enable/disable toggling, uninstallation, data preservation, and injection into extension points.

---

## 2. Infrastructure & Topology
- **Cloudflare Account ID**: `ab9b528badc7cbd3e583a9ff7935a07f`
- **Subdomain**: `zia291930`
- **D1 Database**: `ecommerce-perf-db` (`3a60804b-1009-4451-972b-87cec6d46bcb`)
- **R2 Bucket**: `ecommerce-perf-assets`
- **Active Workers**:
  1. `nasrify-admin`: `https://nasrify-admin.zia291930.workers.dev` (Version ID: `2ccf0451-1080-404f-8951-ad99db44d74a`)
  2. `nasrify-store`: `https://nasrify-store.zia291930.workers.dev` (Version ID: `60946eff-2ee2-4551-a889-163ef330324b`)
  3. `ecommerce-store-perf-test` (Monolith): `https://ecommerce-store-perf-test.zia291930.workers.dev` (Untouched backup)

---

## 3. Database Migration (D1)
Applied via migration `drizzle/migrations/0015_stage_c_apps_framework.sql`:

### `installed_apps` Table
```sql
CREATE TABLE IF NOT EXISTS installed_apps (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  installed_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  settings TEXT,
  permissions TEXT,
  installed_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_installed_apps_enabled ON installed_apps(enabled);
```

### `app_install_log` Table
```sql
CREATE TABLE IF NOT EXISTS app_install_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_at INTEGER NOT NULL,
  performed_by TEXT,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_app_install_log_app_id ON app_install_log(app_id);
```

---

## 4. Manifest Schema & Permissions
Defined in `types/apps.ts`:

### Permissions
- `read:products`, `write:products`
- `read:orders`, `write:orders`
- `read:customers`, `write:customers`
- `read:settings`, `write:settings`
- `read:media`, `write:media`
- `read:analytics`

### Extension Points
- `admin.sidebar`
- `admin.dashboard.widget`
- `admin.route`
- `storefront.product.below`
- `storefront.homepage.section`
- `storefront.cart.below`
- `storefront.checkout.below`
- `storefront.header`
- `storefront.footer`

---

## 5. API Routes
All routes are protected by admin session authentication:
- `GET /api/admin/apps`: Lists all available apps merged with installation status
- `POST /api/admin/apps/install`: Validates manifest, checks permissions, registers app in `installed_apps`, records install audit log
- `POST /api/admin/apps/toggle`: Enables or disables an installed app, records enable/disable audit log
- `POST /api/admin/apps/uninstall`: Removes app from `installed_apps`, records uninstall audit log (CRITICAL: Preserves all app data tables)
- `GET /api/admin/apps/[appId]`: Returns manifest, install status, and complete audit trail
- `PUT /api/admin/apps/[appId]/settings`: Updates app configuration JSON

---

## 6. Extension Point System
Components created with built-in error isolation (`AppErrorBoundary`):
- **Admin**:
  - `components/apps/AdminSidebarExtension.tsx`
  - `components/apps/AdminDashboardWidgets.tsx`
  - `components/apps/AdminRouteExtension.tsx`
- **Storefront**:
  - `components/apps/StorefrontProductBelow.tsx`
  - `components/apps/StorefrontHomepageSection.tsx`
  - `components/apps/StorefrontCartBelow.tsx`
  - `components/apps/StorefrontCheckoutBelow.tsx`
  - `components/apps/StorefrontHeaderExtension.tsx`
  - `components/apps/StorefrontFooterExtension.tsx`

Each component renders `null` with zero DOM or styling overhead if no apps are installed and enabled for that point.

---

## 7. Hello World Demo App
- Folder: `apps/hello-world/`
  - `manifest.json`: ID `hello-world`, Version 1.0.0, Free, Permission `read:settings`, Extension points: `admin.dashboard.widget`, `storefront.homepage.section`
  - `icon.svg`: Puzzle piece icon
  - `admin/HelloWorldWidget.tsx`: Themed card component
  - `storefront/HelloWorldBanner.tsx`: Top banner component
  - `api/hello/route.ts`: API endpoint
  - `lib/hello.ts`: Helper functions

---

## 8. Verification Results
Automated suite: `scripts/verify-stage-c.ts` (15/15 tests passed):

| Test Item | Status | TTFB | Result |
|---|---|---|---|
| POST `/api/admin/login` | 200 | 1990ms | ✅ PASS (Session Acquired) |
| GET `/admin/apps` (UI Page) | 200 | 1275ms | ✅ PASS |
| GET `/api/admin/apps` (List) | 200 | 671ms | ✅ PASS (hello-world found) |
| POST `/api/admin/apps/install` | 200 | 1031ms | ✅ PASS (status: installed) |
| D1 `installed_apps` validation | 200 | <1ms | ✅ PASS (enabled: 1) |
| POST `/api/admin/apps/toggle` (Disable) | 200 | 1025ms | ✅ PASS (enabled: false) |
| D1 `installed_apps` disable check | 200 | <1ms | ✅ PASS (enabled: 0) |
| POST `/api/admin/apps/toggle` (Enable) | 200 | 1043ms | ✅ PASS (enabled: true) |
| POST `/api/admin/apps/uninstall` | 200 | 1051ms | ✅ PASS (status: uninstalled) |
| D1 `installed_apps` record removed | 200 | <1ms | ✅ PASS (count: 0) |
| **DATA SAFETY**: Table `app_hello-world_test` preserved | 200 | <1ms | ✅ PASS (data intact) |
| D1 `app_install_log` audit trail | 200 | <1ms | ✅ PASS (install → disable → enable → uninstall) |
| Storefront Worker: GET `/` | 200 | 1945ms | ✅ PASS |
| Storefront Worker: GET `/shop` | 200 | 1331ms | ✅ PASS |
| Monolith Worker: GET `/` | 200 | 2439ms | ✅ PASS |

---

## 9. Performance & Bundle Metrics
- **Dependencies added**: 0 (zero new dependencies)
- **Storefront Worker (`nasrify-store`)**:
  - Upload Size: 10,109.61 KiB (+3.43 KiB delta, +0.03%)
  - Startup Time: 23 ms
- **Admin Worker (`nasrify-admin`)**:
  - Upload Size: 11,117.00 KiB (+123.56 KiB delta, +1.1%)
  - Startup Time: 23 ms

---

## 10. Rollback Instructions
If needed:
1. `git checkout pre-stage-c`
2. Drop new tables in D1:
   ```bash
   npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="DROP TABLE IF EXISTS installed_apps; DROP TABLE IF EXISTS app_install_log;"
   ```
3. Redeploy `nasrify-admin` and `nasrify-store` from `pre-stage-c`.
4. Monolith worker `ecommerce-store-perf-test` remains live and unaffected.
