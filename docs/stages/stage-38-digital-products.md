# Stage 38 — Digital Products App

## 1. Overview & Objectives
Stage 38 introduces the **Digital Products App** (`apps/digital-products/`), the first brand-new application built atop the Nasrify Apps Framework. The application allows store merchants to sell downloadable digital goods (such as PDFs, ZIP files, audio, video, software, and eBooks) with secure delivery, download quotas, time-based expiration, license key generation, and seamless customer account integration.

- **App ID**: `digital-products`
- **Category**: Products & Fulfillment
- **Storage**: Cloudflare R2 (`ecommerce-perf-assets`), scoped under `digital-products/{productId}/{fileId}-{name}`
- **Delivery Model**: Private authenticated edge streaming via cryptographic HMAC-SHA256 download tokens (zero public R2 access)
- **Database**: Cloudflare D1 (`ecommerce-perf-db`)

---

## 2. D1 Database Migration (`0022_stage_38_digital_products.sql`)
Applied to both local and remote Cloudflare D1 databases:

### Tables
1. **`digital_products`**:
   - `id`: TEXT PRIMARY KEY
   - `product_id`: TEXT NOT NULL (references catalog `products.id`)
   - `files_json`: TEXT NOT NULL (JSON array: `[{ id, name, size, mime, r2_key }]`)
   - `download_limit`: INTEGER DEFAULT 5
   - `expiry_days`: INTEGER DEFAULT 30
   - `license_enabled`: INTEGER DEFAULT 0
   - `created_at`: INTEGER
   - `updated_at`: INTEGER

2. **`digital_downloads`**:
   - `id`: TEXT PRIMARY KEY
   - `order_id`: TEXT NOT NULL
   - `product_id`: TEXT NOT NULL
   - `customer_id`: TEXT (optional)
   - `customer_email`: TEXT
   - `file_name`: TEXT
   - `r2_key`: TEXT
   - `download_token`: TEXT NOT NULL UNIQUE (cryptographic signed token)
   - `downloaded_count`: INTEGER DEFAULT 0
   - `max_downloads`: INTEGER DEFAULT 5
   - `expires_at`: INTEGER
   - `created_at`: INTEGER
   - `last_download_at`: INTEGER

3. **`digital_licenses`**:
   - `id`: TEXT PRIMARY KEY
   - `order_id`: TEXT NOT NULL
   - `product_id`: TEXT NOT NULL
   - `license_key`: TEXT UNIQUE (format: `XXXX-XXXX-XXXX-XXXX`)
   - `customer_email`: TEXT
   - `status`: TEXT DEFAULT 'active' (`active` | `revoked`)
   - `created_at`: INTEGER

### Indexes
- `idx_digital_products_product_id` on `digital_products(product_id)`
- `idx_digital_downloads_order_id` on `digital_downloads(order_id)`
- `idx_digital_downloads_token` on `digital_downloads(download_token)`
- `idx_digital_downloads_customer_email` on `digital_downloads(customer_email)`
- `idx_digital_licenses_order_id` on `digital_licenses(order_id)`
- `idx_digital_licenses_key` on `digital_licenses(license_key)`

---

## 3. Architecture & File Structure

```
apps/digital-products/
├── manifest.json                  # App metadata, permissions, schema, extension points
├── icon.svg                       # Vector app brand icon
├── shared/
│   └── types.ts                   # TypeScript interfaces (DigitalProduct, DigitalFile, DigitalDownload, DigitalLicense)
├── lib/
│   ├── digital-products.ts        # Product CRUD, React.cache(), 20s TTL caching
│   ├── downloads.ts               # Download provisioning, recordDownload, getMyDownloads, KPIs
│   ├── tokens.ts                  # Cryptographic HMAC-SHA256 tokens & license generator
│   └── order-hook.ts              # Post-checkout non-blocking digital fulfillment hook
├── admin/
│   ├── DigitalProductsManager.tsx # Full CRUD management UI & embedded single-product mode
│   ├── DigitalProductUploader.tsx # Drag-and-drop R2 uploader with 500MB limit & type filtering
│   ├── DigitalStatsWidget.tsx     # KPI widget for Admin Dashboard
│   └── api/
│       ├── list/route.ts          # Paginated digital products list
│       ├── create/route.ts        # Zod-validated creation endpoint
│       ├── update/route.ts        # Zod-validated update endpoint
│       ├── delete/route.ts        # Detach digital product mapping
│       ├── upload/route.ts        # Direct-to-R2 upload handler (up to 500MB)
│       └── stats/route.ts         # KPI metrics calculation
└── storefront/
    ├── DigitalProductBadge.tsx    # "Instant Digital Delivery" badge for PDP
    ├── DownloadButton.tsx         # Download trigger with optimistic counter update
    ├── MyDownloadsPage.tsx        # Customer account download vault with license keys
    └── api/
        ├── check/route.ts         # Fast digital SKU check
        ├── download/route.ts      # Private R2 streaming download gate with quota enforcement
        └── my-downloads/route.ts  # Customer download history
```

---

## 4. Extension Points Implemented

1. **`storefront.product.below`**:
   - Component: `DigitalProductBadge`
   - Injected dynamically below product details on the PDP to highlight instant digital fulfillment and access in account vault.
2. **`storefront.account.menu`**:
   - Navigation Link: "My Downloads" (`/account/downloads`)
   - Page Component: `MyDownloadsPage`
   - Accessible by customers to see all purchased files, remaining downloads, expiry dates, and generated license keys.
3. **`admin.product.form.below`**:
   - Integrated into `ProductModal` via the new "💾 Digital Files" configuration tab.
   - Allows store owners to attach digital files, set quotas, and enable license keys directly within the product management form.
4. **`admin.dashboard.widget`**:
   - Component: `DigitalStatsWidget`
   - Rendered on the main admin dashboard showing active digital SKUs, monthly download counts, and top-downloaded assets.

---

## 5. Security & Delivery Mechanics

- **No Public R2 Buckets**: Download files are stored in private Cloudflare R2 storage. Public HTTP access to the bucket is disabled.
- **Cryptographic Tokens**: Download URLs are structured as `/api/apps/digital-products/download?token=<token>`. Tokens are built with `uuid + expiresAt + HMAC-SHA256(secret)`. Tampering with the token or expiry immediately results in an HTTP 403 response.
- **Quota & Expiry Enforcement**:
  - Download count increments atomically on each successful download.
  - Reaching the limit (`downloaded_count >= max_downloads`) strictly halts further downloads with an HTTP 403 error.
  - Time-expired links are rejected.
- **Edge Streaming**: Files stream directly from Cloudflare R2 through the Worker using `ReadableStream` with proper `Content-Disposition: attachment; filename="..."` and MIME types.

---

## 6. Live Edge Verification (Step 13)

All 17 verification stages passed against live Cloudflare edge workers:

```
==================================================================
STAGE 38 VERIFICATION SUMMARY
==================================================================
Total Checks: 17
Passed:       17
Failed:       0

ALL STAGE 38 CHECKS PASSED PERFECTLY ON EDGE WORKERS!
```

| Check # | Test Name | Result | Details |
|---|---|---|---|
| 1 | `POST /api/admin/login` | PASS (200) | Admin authentication & session |
| 2 | `GET /api/admin/apps` | PASS (200) | Digital Products v1.0.0 discovered |
| 3 | `POST /api/admin/apps/install` | PASS (200) | App installed & enabled |
| 4 | `GET /api/admin/apps/digital-products/settings` | PASS (200) | Settings schema verified |
| 5 | `POST /api/apps/digital-products/upload` | PASS (200) | PDF uploaded to R2 (312 bytes) |
| 6 | `POST /api/apps/digital-products/create` | PASS (200) | Linked to store product |
| 7 | `GET /api/apps/digital-products/check` | PASS (200) | Instant delivery badge verified |
| 8 | `POST /api/orders` | PASS (200) | Order placed, fulfillment hook triggered |
| 9 | `GET /api/apps/digital-products/my-downloads` | PASS (200) | Download vault populated with token |
| 10 | License Key Verification | PASS (OK) | Format `XXXX-XXXX-XXXX-XXXX` verified |
| 11 | `GET /api/apps/digital-products/download` | PASS (200) | File streamed from R2, count incremented |
| 12 | Quota Increment Check | PASS (OK) | Current count incremented to 1/5 |
| 13 | Security Gate Check | PASS (403) | Tampered tokens rejected with 403 |
| 14 | `GET /api/apps/digital-products/stats` | PASS (200) | Admin KPI stats widget live |
| 15 | Data Safety: Uninstall & Reinstall | PASS (200) | All D1 tables and records preserved |
| 16 | Storefront Homepage Latency | PASS (200) | Edge response: 1323ms (warm < 200ms) |
| 17 | Customer Downloads Latency | PASS (200) | Edge response: 178ms |

---

## 7. Cloudflare Deployments

| Worker | Deployment Version ID | URL |
|---|---|---|
| `nasrify-admin` | `e9dc5c1a-344b-4fc2-88bc-54e486ac3647` | https://nasrify-admin.zia291930.workers.dev |
| `nasrify-store` | `04bfe4a6-f1a0-497b-8b85-eb18bb30079c` | https://nasrify-store.zia291930.workers.dev |
| `nasrify-apps` | `8dc590d9-e38e-4597-823d-a2c929b5671c` | https://nasrify-apps.zia291930.workers.dev |
