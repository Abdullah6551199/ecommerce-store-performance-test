# Stage 37B — Themes Hub Worker, Themes Marketplace & Developer Portal

## 1. Overview & Objectives
Stage 37B delivers the **Nasrify Themes Hub** (`nasrify-themes`), a dedicated, high-performance Cloudflare Worker that powers the public themes marketplace, live interactive theme preview/mockups, the developer portal, and the super-administrative approval queue.

- **Worker Name**: `nasrify-themes`
- **Worker URL**: `https://nasrify-themes.zia291930.workers.dev`
- **Current Version ID**: `013569ca-c970-4278-b8ae-8205fb8186cc`
- **Total Upload Size**: 6388.22 KiB / gzip: 1275.70 KiB
- **Worker Startup Time**: 13 ms
- **Edge Runtime**: Cloudflare Workers with `nodejs_compat` + OpenNext 1.20.6 + Next.js 16.3.4
- **Shared Infrastructure**: D1 Database (`ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`), R2 Bucket (`ecommerce-perf-assets`), Account (`ab9b528badc7cbd3e583a9ff7935a07f`).

---

## 2. Database Migration (0021_stage_37_themes_marketplace.sql)
Applied to both local and remote D1 databases:

### Tables
1. **`theme_marketplace_listings`**:
   - `id`: TEXT PRIMARY KEY
   - `theme_id`: TEXT NOT NULL (kebab-case identifier)
   - `version`: TEXT NOT NULL
   - `name`: TEXT NOT NULL
   - `description`: TEXT
   - `author`: TEXT
   - `author_url`: TEXT
   - `preview_url`: TEXT
   - `screenshot_urls`: TEXT (JSON array)
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
   - `config_json`: TEXT
   - `changelog`: TEXT
   - `created_at`: INTEGER
   - `updated_at`: INTEGER

2. **`theme_marketplace_versions`**:
   - `id`: TEXT PRIMARY KEY
   - `listing_id`: TEXT NOT NULL
   - `version`: TEXT NOT NULL
   - `submitted_at`: INTEGER
   - `config_json`: TEXT
   - `download_url`: TEXT
   - `status`: TEXT ('pending' | 'approved' | 'rejected')
   - `notes`: TEXT

3. **`theme_marketplace_installs`**:
   - `id`: TEXT PRIMARY KEY
   - `listing_id`: TEXT NOT NULL
   - `store_id`: TEXT
   - `installed_at`: INTEGER
   - `uninstalled_at`: INTEGER
   - `status`: TEXT ('active' | 'uninstalled')

### Indexes
- `idx_theme_listings_theme_id` ON `theme_marketplace_listings (theme_id)`
- `idx_theme_listings_status` ON `theme_marketplace_listings (status)`
- `idx_theme_listings_category` ON `theme_marketplace_listings (category)`
- `idx_theme_versions_listing_id` ON `theme_marketplace_versions (listing_id)`
- `idx_theme_installs_listing_id` ON `theme_marketplace_installs (listing_id)`
- `idx_theme_installs_store_id` ON `theme_marketplace_installs (store_id)`

---

## 3. Implemented Routes & Capabilities

| Route | Type | Description |
|---|---|---|
| `/` | Page (SSR) | Public themes marketplace discovery grid with live search, category pills, and sorting |
| `/themes/[themeId]` | Page (SSR) | Public theme detail page with large screenshot, gallery, color swatches, font pairing, changelog, and live interactive mockup preview |
| `/developer` | Page (SSR/CSR) | Developer portal with shared session auth, submitted themes list, status badges, rejection feedback, and theme submission form with R2 upload |
| `/super/pending` | Page (SSR/CSR) | Super Admin approval queue with design tokens inspector, live storefront preview mockup, one-click approve, and reject with reasons |
| `/api/themes/marketplace` | API (GET) | Public JSON feed of approved themes with 20s edge micro-cache headers |
| `/api/themes/[themeId]` | API (GET) | Detail JSON for an individual approved theme with active install counts |
| `/api/themes/install` | API (GET) | Records theme install in `theme_marketplace_installs` and 302-redirects to `nasrify-admin/admin/themes?install=<themeId>` |
| `/api/developer/login` | API (POST) | Authenticates admin/developer credentials, issues HTTP-only `admin_session` cookie |
| `/api/developer/logout` | API (POST) | Invalidates and destroys developer session |
| `/api/developer/my-themes` | API (GET) | Returns all submissions created by the authenticated developer |
| `/api/developer/submit` | API (POST) | Zod-validated theme creation and update endpoint (draft or pending status) |
| `/api/super/pending` | API (GET) | Returns all theme submissions awaiting review (Super Admin only) |
| `/api/super/review` | API (POST) | Super admin approve, reject (with reasons), and delist handler |
| `/api/media/upload` | API (POST) | Authenticated R2 upload for theme preview images and screenshots |
| `/api/media/[...path]` | API (GET) | Direct Cloudflare R2 asset streaming with 1-year immutable cache headers |

---

## 4. Live Verification Results

1. **GET `/`**: Loaded HTTP 200 with approved showcase themes (`Minimal Noir`, `Bold Velocity`, `Luxe Atelier`, `Nordic Aurora`).
2. **GET `/themes/minimal-noir`**: Loaded complete detail view with full screenshots, color swatches (`#18181B`, `#27272A`, `#71717A`, `#FAFAFA`, `#FFFFFF`, `#09090B`), font pairing tokens, and interactive mockup preview.
3. **1-Click Install Redirect**: Requesting `/api/themes/install?themeId=minimal-noir` returned `HTTP 302 Found` with `Location: https://nasrify-admin.zia291930.workers.dev/admin/themes?install=minimal-noir` and registered an active record in `theme_marketplace_installs`.
4. **Developer Auth & Portal**: Authenticated with `admin@apexstore.com` issued `admin_session` and unlocked the Themes Developer Studio.
5. **Developer Submission**: Successfully submitted `nordic-aurora` with status `pending`.
6. **Approval Queue Inspection**: Super Admin loaded `/super/pending`, reviewed design tokens and live mockup.
7. **Approval Action**: Super Admin approved `nordic-aurora`, immediately clearing the queue and publishing the theme live to the marketplace.
8. **R2 Media Upload & Streaming**: Uploaded test preview image to Cloudflare R2 bucket `ecommerce-perf-assets`, streamed back via `/api/media/themes/<id>.svg` with `HTTP 200 OK`, `ETag`, and `Cache-Control: public, max-age=31536000, immutable`.
9. **Category & Search Filters**: Tested `category=Luxury` (returned 1 theme), `search=scandinavian` (returned 1 theme).
10. **Data Safety**: Verified that uninstallations mark `theme_marketplace_installs` as `status="uninstalled"` with `uninstalled_at` timestamp without dropping tables.
