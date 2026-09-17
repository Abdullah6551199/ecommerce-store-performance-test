# Local D1 Database Recovery Guide (Stage F0.5a)

## Overview
This document provides complete diagnostic root-cause analysis, disaster recovery instructions, and forward-looking maintenance procedures for Nasrify's local Cloudflare D1 development database.

---

## 1. What Went Wrong
During local development (`npm run dev`) inside `nasrify-store`, navigating to `/shop`, `/`, or `/product/[slug]` resulted in empty state messages ("No Matching Products Found"), whereas the live production storefront and admin dashboard displayed all 12 products.

Local query logs showed:
```
D1_ERROR: no such table: products: SQLITE_ERROR
```

Because `lib/products.ts` and `lib/categories.ts` had silent catch-blocks falling back to empty in-memory arrays (`memoryProducts = []`), errors were suppressed, masking the underlying database failure.

---

## 2. Why It Happened (Root Cause Analysis)

1. **Local SQLite State Never Initialized**:
   Cloudflare Miniflare / OpenNext creates a local SQLite database under `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`. Unlike remote D1, local databases start completely empty (0 tables, 0 rows) until migrations or seed files are applied.

2. **Migration Foreign Key Deadlock (0013_stage21_bundles_compare.sql)**:
   Migration `0013` contained both DDL (`CREATE TABLE product_bundles`, `CREATE TABLE bundle_items`) and DML starter bundle inserts (`INSERT INTO bundle_items ... VALUES ('bitem-endurance-1', ..., 'prod-apex-vrx1', ...)`).
   Because `bundle_items` enforces `FOREIGN KEY (product_id) REFERENCES products(id)` and the database had 0 products at migration time, running migrations on a clean database failed with:
   ```
   FOREIGN KEY constraint failed: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_FOREIGNKEY)
   ```
   Commenting out the DML inserts in migration `0013` (which are already part of the remote data export) allowed all 16 migrations (`0000` to `0015`) to apply cleanly.

3. **Missing Drizzle Migration for Stage 14 (Coupons & Discounts)**:
   Stage 14 schema additions (`discount_amount`, `discount_code`, `discount_type` on `orders`, and tables `coupons` / `coupon_usages`) existed in `scripts/stage14-coupons.sql`, but had never been generated as a formal Drizzle migration. Local D1 therefore lacked these columns until `scripts/stage14-coupons.sql` was applied.

4. **Directory Scoping in Multi-Worker Architecture**:
   In a monorepo or multi-worker architecture, Wrangler executes relative to the working directory:
   - Root commands use `.wrangler/state/v3/d1/`
   - `nasrify-store` dev commands use `nasrify-store/.wrangler/state/v3/d1/`
   - `nasrify-admin` dev commands use `nasrify-admin/.wrangler/state/v3/d1/`
   The `.wrangler` state must be synced across the workers so both storefront and admin share the identical local database state.

---

## 3. Difference Between Local and Remote D1

| Feature / Behavior | Remote Cloudflare D1 (`ecommerce-perf-db`) | Local Miniflare D1 (`.wrangler/state/v3/d1`) |
| :--- | :--- | :--- |
| **Engine** | Cloudflare Serverless SQLite (Distributed V3) | Local `better-sqlite3` via Miniflare/workerd |
| **Persistence** | Global Cloudflare Edge storage | Local `.sqlite` & `.sqlite-wal` files on disk |
| **Schema State** | All 44 tables applied through Stage E | Empty on fresh clone until migrations are applied |
| **Data State** | 12 products, 6 categories, 38 orders, 2 bundles | 0 records until backup export is imported |
| **Isolation** | Single shared database accessed via Worker bindings | Directory-dependent (`.wrangler` in root, store, admin) |

---

## 4. Exact Recovery Procedure

To recreate or fix local D1 from scratch, execute the following commands from the workspace root:

### Step A: Reset Local Wrangler State
```powershell
# Stop any running dev servers (kill process on port 3000/3001)
Remove-Item -Path ".wrangler" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "nasrify-store\.wrangler" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "nasrify-admin\.wrangler" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step B: Apply All 16 Schema Migrations
```powershell
# Set non-interactive CI flag for Wrangler migration runner
$env:CI="true"
npx.cmd wrangler d1 migrations apply ecommerce-perf-db --local
```

### Step C: Apply Unmigrated Stage 14 Coupon Schema
```powershell
npx.cmd wrangler d1 execute ecommerce-perf-db --local --file=scripts/stage14-coupons.sql
```

### Step D: Import Production Data
```powershell
# 1. Export fresh production data without schema DDL:
npx.cmd wrangler d1 export ecommerce-perf-db --remote --no-schema --output=backups/d1-remote-data.sql

# 2. Run the cleaner script to strip d1_migrations conflicts and ensure idempotent INSERTs:
node scratch/prepare_data_import.js

# 3. Execute the clean data import:
npx.cmd wrangler d1 execute ecommerce-perf-db --local --file=backups/d1-remote-data-clean.sql
```

### Step E: Sync `.wrangler` Database State to Storefront & Admin
```powershell
Copy-Item -Path ".wrangler" -Destination "nasrify-store" -Recurse -Force
Copy-Item -Path ".wrangler" -Destination "nasrify-admin" -Recurse -Force
```

### Step F: Verify Data Counts
```powershell
npx.cmd wrangler d1 execute ecommerce-perf-db --local --command="SELECT COUNT(*) FROM products;"
# Result: 12

npx.cmd wrangler d1 execute ecommerce-perf-db --local --command="SELECT COUNT(*) FROM categories;"
# Result: 6

npx.cmd wrangler d1 execute ecommerce-perf-db --local --command="SELECT COUNT(*) FROM orders;"
# Result: 38
```

---

## 5. Developer Error Visibility Fix (Fail Loudly in Dev)

In `lib/products.ts` and `lib/categories.ts`, silent fallbacks have been replaced with environment-aware error handling:
```typescript
try {
  // Execute D1 Query
  ...
} catch (err) {
  console.error("[products] D1 query failed:", err);
  if (process.env.NODE_ENV === "development") {
    throw err; // Fail loudly in local dev so developers immediately see the real issue
  }
  // Safe fallback in production to protect customer storefront availability
  return memoryProducts;
}
```

This ensures that any future broken D1 schema, missing column, or bad SQL query surfaces immediately as a visible Next.js runtime error during local development instead of silently displaying "No Matching Products Found".
