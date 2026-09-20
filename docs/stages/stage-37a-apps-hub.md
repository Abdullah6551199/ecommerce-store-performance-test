# Stage 37A — Apps Hub Worker, Public Marketplace & Developer Portal

## 1. Overview & Objectives
Stage 37A delivers the **Nasrify Apps Hub** (`nasrify-apps`), a dedicated, high-performance Cloudflare Worker that powers the public app marketplace, the developer ecosystem portal, and the super-administrative approval queue.

- **Worker Name**: `nasrify-apps`
- **Worker URL**: `https://nasrify-apps.zia291930.workers.dev`
- **Current Version ID**: `4e0b34f0-49a8-46af-a8e4-88901f565710`
- **Total Upload Size**: 6290.00 KiB / gzip: 1261.63 KiB
- **Worker Startup Time**: 14 ms
- **Edge Runtime**: Cloudflare Workers with `nodejs_compat` + OpenNext 1.20.6 + Next.js 16.3.4
- **Shared Infrastructure**: D1 Database (`ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`), R2 Bucket (`ecommerce-perf-assets`), Account (`ab9b528badc7cbd3e583a9ff7935a07f`).

---

## 2. Database Migration (0020_stage_37_apps_marketplace.sql)
Applied to both local and remote D1 databases:

### Tables
1. **`app_marketplace_listings`**:
   - `id`: TEXT PRIMARY KEY
   - `app_id`: TEXT NOT NULL (kebab-case identifier)
   - `version`: TEXT NOT NULL
   - `name`: TEXT NOT NULL
   - `description`: TEXT
   - `author`: TEXT
   - `author_url`: TEXT
   - `icon_url`: TEXT
   - `category`: TEXT
   - `pricing`: TEXT ('free' | 'paid')
   - `price`: REAL
   - `status`: TEXT ('draft' | 'pending' | 'approved' | 'rejected' | 'delisted')
   - `submitted_by`: TEXT
   - `submitted_at`: INTEGER
   - `approved_by`: TEXT
   - `approved_at`: INTEGER
   - `rejection_reason`: TEXT
   - `download_url`: TEXT
   - `manifest_json`: TEXT
   - `changelog`: TEXT
   - `created_at`: INTEGER
   - `updated_at`: INTEGER

2. **`app_marketplace_versions`**:
   - `id`: TEXT PRIMARY KEY
   - `listing_id`: TEXT NOT NULL
   - `version`: TEXT NOT NULL
   - `submitted_at`: INTEGER
   - `manifest_json`: TEXT
   - `download_url`: TEXT
   - `status`: TEXT ('pending' | 'approved' | 'rejected')
   - `notes`: TEXT

3. **`app_marketplace_installs`**:
   - `id`: TEXT PRIMARY KEY
   - `listing_id`: TEXT NOT NULL
   - `store_id`: TEXT
   - `installed_at`: INTEGER
   - `uninstalled_at`: INTEGER
   - `status`: TEXT ('active' | 'uninstalled')

### Indexes
- `idx_listings_app_id` ON `app_marketplace_listings (app_id)`
- `idx_listings_status` ON `app_marketplace_listings (status)`
- `idx_versions_listing_id` ON `app_marketplace_versions (listing_id)`
- `idx_installs_listing_id` ON `app_marketplace_installs (listing_id)`
- `idx_installs_store_id` ON `app_marketplace_installs (store_id)`

---

## 3. Implemented Routes & Capabilities

| Route | Type | Description |
|---|---|---|
| `/` | Page (SSR) | Public marketplace discovery grid with live search, category tabs, and sorting |
| `/apps/[appId]` | Page (SSR) | Public app detail page with large icon, pricing, permissions, extensions, changelog, reviews placeholder, and related apps |
| `/developer` | Page (SSR/CSR) | Developer portal with shared session auth, listing status view, draft editor, rejection feedback, and submission form |
| `/super/pending` | Page (SSR/CSR) | Super Admin approval queue with manifest security inspector, one-click approve, reject with notes, and delist |
| `/api/marketplace/apps` | API (GET) | Public JSON feed of approved apps with 20s edge micro-cache headers |
| `/api/marketplace/apps/[appId]` | API (GET) | Detail JSON for an individual approved app with active install counts |
| `/api/marketplace/install` | API (GET) | Records app install event in `app_marketplace_installs` and 302-redirects to `nasrify-admin/admin/apps?install=<appId>` |
| `/api/developer/login` | API (POST) | Authenticates admin/developer credentials, issues HTTP-only `admin_session` cookie |
| `/api/developer/logout` | API (POST) | Invalidates and destroys developer session |
| `/api/developer/my-apps` | API (GET) | Returns all submissions created by the authenticated developer |
| `/api/developer/submit` | API (POST) | Zod-validated app creation and update endpoint (draft or pending status) |
| `/api/super/pending` | API (GET) | Returns all submissions awaiting review (Super Admin only) |
| `/api/super/review` | API (POST) | Super admin approve, reject (with reasons), and delist handler |

---

## 4. Live Verification Results

1. **GET `/`**: Loaded HTTP 200 with all 10 live platform apps displayed in the responsive marketplace grid (`whatsapp-order`, `reviews`, `bundles`, `order-tracking`, `broadcast`, `trust-badges`, `cookie-consent`, `wishlist`, `compare`, `hello-world`).
2. **GET `/apps/whatsapp-order`**: Loaded complete detail view with capabilities, permissions (`read:products`, `read:settings`), storefront extensions, and recommended apps.
3. **1-Click Install Redirect**: Requesting `/api/marketplace/install?appId=whatsapp-order` returned `HTTP 302 Found` with `Location: https://nasrify-admin.zia291930.workers.dev/admin/apps?install=whatsapp-order` and registered an active record in `app_marketplace_installs`.
4. **Developer Auth & Portal**: Unauthenticated `GET /developer` presented the sign-in modal. Authenticating with `admin@apexstore.com` issued `admin_session` and unlocked the Developer Workspace.
5. **Developer Submission**: Successfully submitted `test-sms-notifier` with status `pending`.
6. **Approval Queue Inspection**: Super Admin loaded `/super/pending`, audited the declared permissions and manifest JSON.
7. **Approval Action**: Super Admin approved `test-sms-notifier`, immediately clearing the queue and publishing the app live to the marketplace (11 total approved apps).
8. **Data Safety**: Verified that uninstallations mark `app_marketplace_installs` as `status="uninstalled"` without deleting records or dropping underlying app data tables.
9. **Latency**:
   - `/`: ~980ms cold start / sub-250ms warm
   - `/api/marketplace/apps`: ~594ms
   - `/developer`: ~248ms
   - `/super/pending`: ~156ms
