# Stage 29.6 — WhatsApp Order Tracking, Source Badge, & Fast Settings Cache

## Overview
Stage 29.6 enhances the WhatsApp Order app with end-to-end order lifecycle tracking, attribution badges, and high-velocity settings propagation:
1. **Order Source Attribution**: Migration 0019 adds `source` column with index `idx_orders_source` to `orders` table (default: `"web"`).
2. **Transactional Order Saving**: Storefront endpoint `/api/whatsapp-order/save-order` creates orders in D1 with `source="whatsapp"`, linking order items and dispatching non-blocking customer notifications with foreign key validation.
3. **Structured WhatsApp Order Messages**: Formats order messages with products first, subtotal/shipping/total, customer delivery details, and order reference `#WA-XXXXXX`.
4. **Admin WhatsApp Attribution Badge**: WhatsApp badge displayed on orders list and details modal in `OrdersManager.tsx`.
5. **Admin Source Filtering**: Filter orders by `source` (`"all"`, `"web"`, `"whatsapp"`) in the admin interface and `/api/admin/orders` endpoint.
6. **Dashboard KPI Widget**: `WhatsAppStatsWidget.tsx` renders monthly WhatsApp orders, revenue, and last order timestamp via `admin.dashboard.widget` extension point.
7. **Sub-5s Settings Cache Reflection**: Storefront settings route implements a 3s TTL microcache and edge Cache-Control header, paired with 3-attempt invalidation retry and client timestamp busting, ensuring admin changes reflect in under 5 seconds.

---

## Key Changes

### 1. Database Migration 0019 (`0019_stage_29_6_order_source.sql`)
```sql
ALTER TABLE orders ADD COLUMN source TEXT DEFAULT 'web';
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);
```
- Applied to both local and remote D1 databases (`ecommerce-perf-db`).
- All existing records defaulted to `"web"`.
- Indexed for fast filtering in admin queries.

### 2. Save Order Endpoint (`/api/whatsapp-order/save-order`)
- **Location**: `apps/whatsapp-order/storefront/api/save-order/route.ts` (re-exported at `/api/whatsapp-order/save-order`).
- **Validation**: Strict Zod schema for items, customer address/contact, and monetary totals.
- **Foreign Key Safety**: Resolves product IDs against active `products` records and validates `variantId` against `productVariants` to avoid SQLite foreign key constraint failures.
- **Transaction Safety**: Batch insertion of order header and order items into D1.
- **Customer Linking & Notifications**: Automatically detects existing customer accounts by email and queues non-blocking customer notifications.
- **Fallback**: If save fails or network drops, storefront button gracefully opens the WhatsApp link without blocking the user.

### 3. Clean Message Formatting (`apps/whatsapp-order/lib/whatsapp.ts`)
- Products listed first with quantities and prices.
- Subtotal, shipping, and total.
- Customer delivery details (name, phone, address, city, notes).
- Unique order reference `#WA-XXXXXX` generated from order ID.

### 4. Admin Orders Manager & WhatsApp Badge (`OrdersManager.tsx`)
- Green pill badge (`bg-emerald-500/10 border-emerald-500/30 text-emerald-600`) with WhatsApp SVG icon for orders with `source === "whatsapp"`.
- Dedicated "Source: WhatsApp" / "Source: Website" badge in order details modal.
- Tabbed source filtering (`All`, `Web`, `WhatsApp`) alongside status filters.
- API route `/api/admin/orders` accepts `?source=` query parameter and filters via `eq(orders.source, sourceFilter)`.

### 5. Admin Dashboard WhatsApp Stats Widget (`WhatsAppStatsWidget.tsx`)
- Injected via `admin.dashboard.widget` extension point into admin overview.
- Endpoint `/api/admin/whatsapp-order/stats` calculates current month's order count, total revenue, and last order timestamp.
- Micro-cached with 20s TTL for fast navigation.

### 6. Sub-5s Settings Reflection Pipeline
- **Storefront Route (`/api/apps/[appId]/settings`)**: 3s in-memory isolate microcache and `Cache-Control: public, max-age=3, s-maxage=3, stale-while-revalidate=2` for `whatsapp-order`.
- **Client Cache Busting**: Buttons append `?t=${Date.now()}` and listen to `focus` and `visibilitychange` events.
- **Cross-Worker Invalidation**: Admin settings update triggers `invalidateStorefront({ target: "apps" })` with 3 retries and 500ms backoff.
- **Result**: Measured live settings propagation time of **3,145 ms** (< 5s requirement).

---

## Deployment Summary

### Nasrify Admin Worker
- **URL**: `https://nasrify-admin.zia291930.workers.dev`
- **Version ID**: `12a42d60-c1df-42c9-b446-86eb3edc474a`
- **Upload Size**: `11432.25 KiB / gzip: 2013.75 KiB`

### Nasrify Storefront Worker
- **URL**: `https://nasrify-store.zia291930.workers.dev`
- **Version ID**: `39591e4a-269c-4bce-8647-054138f4b0cf`
- **Upload Size**: `10407.79 KiB / gzip: 1918.44 KiB`

---

## Live Verification Results

The automated end-to-end verification suite (`scripts/verify-stage-29-6.ts`) executed on production Cloudflare Workers with 100% pass rate:

| # | Check / Requirement | Status | Live Result |
|---|---|---|---|
| 1 | Admin Authentication (`POST /api/admin/login`) | ✅ PASS | Status 200, Session Cookie Acquired |
| 2 | WhatsApp App Installation/Enablement | ✅ PASS | App active in D1 `installed_apps` |
| 3 | Admin Settings PUT & Sub-5s Reflection | ✅ PASS | Reflected on storefront in **3,145 ms** (< 5s) |
| 4 | Order Creation via `/api/whatsapp-order/save-order` | ✅ PASS | Order ID `4711c1d5-2d19-47d2-b1de-65c8aabe9353`, Ref `#WA-4711C1` |
| 5 | Clean Message Formatting (Products first, Customer, Ref) | ✅ PASS | Formatted with products block, delivery details, and order ref |
| 6 | Order in Admin Orders List with `source='whatsapp'` | ✅ PASS | Identified with green WhatsApp badge |
| 7 | Source Filter: `source=whatsapp` | ✅ PASS | Filtered exclusively WhatsApp orders (2 found) |
| 8 | Source Filter: `source=web` | ✅ PASS | Filtered standard web orders (20 found) |
| 9 | Admin Dashboard Stats Widget (`/api/admin/whatsapp-order/stats`) | ✅ PASS | 2 orders, $419.98 revenue |
| 10 | Data Safety on Uninstall / Reinstall | ✅ PASS | Orders and source column preserved across app lifecycle |
| 11 | Storefront Latency & Execution Benchmark | ✅ PASS | Average latency 1,094 ms across 5 consecutive requests |
| 12 | Worker CPU Execution Time | ✅ PASS | **78 µs (0.078 ms)** via `wrangler tail` (< 1% of 10ms CPU limit) |
