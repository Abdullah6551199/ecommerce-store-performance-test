# Stage C — Pre-Execution Backup Summary

**Date**: 2026-09-16
**Environment**: Cloudflare Workers (Test)

## 1. Cloudflare Workers Topology
1. **Monolith Worker** (Storefront + Admin):
   - **Worker Name**: `ecommerce-store-perf-test`
   - **Worker URL**: `https://ecommerce-store-perf-test.zia291930.workers.dev`
   - **Status**: Active, serving storefront & admin (retained as backup)
2. **Storefront Worker** (Stage A):
   - **Worker Name**: `nasrify-store`
   - **Worker URL**: `https://nasrify-store.zia291930.workers.dev`
   - **Status**: Active, serving storefront only (0 admin routes)
3. **Admin Worker** (Stage B):
   - **Worker Name**: `nasrify-admin`
   - **Worker URL**: `https://nasrify-admin.zia291930.workers.dev`
   - **Status**: Active, serving admin only (0 storefront public routes)

## 2. Shared Cloudflare Resources
- **Cloudflare Account ID**: `ab9b528badc7cbd3e583a9ff7935a07f`
- **Subdomain**: `zia291930`
- **D1 Database Name**: `ecommerce-perf-db`
- **D1 Database ID**: `3a60804b-1009-4451-972b-87cec6d46bcb`
- **R2 Bucket Name**: `ecommerce-perf-assets` (binding: `R2`)

## 3. Git Tags & Release State
- **Pre-Execution Tag**: `pre-stage-c` (Commit: `ef3cd06`, pushed to origin)
- **Previous Release Tag**: `v3.1-stage-b` (Stage B: Admin Worker Split)
- **Stage A Release Tag**: `v3.0-stage-a` (Stage A: Storefront Worker Split)

## 4. Database Backup
- **Backup File**: `backups/d1-pre-stage-c.sql`
- **Export Command**:
  ```bash
  $env:CLOUDFLARE_API_TOKEN="..."; $env:CLOUDFLARE_ACCOUNT_ID="ab9b528badc7cbd3e583a9ff7935a07f"; npx.cmd wrangler d1 export ecommerce-perf-db --remote --output=backups/d1-pre-stage-c.sql
  ```

## 5. Deployment Commands
- **Storefront Worker (`nasrify-store`)**:
  ```bash
  cd nasrify-store
  npm run build
  npm run build:worker
  npx.cmd wrangler deploy
  ```
- **Admin Worker (`nasrify-admin`)**:
  ```bash
  cd nasrify-admin
  npm run build
  npm run build:worker
  npx.cmd wrangler deploy
  ```
- **Monolith Worker (Untouched Backup)**:
  ```bash
  npm run deploy:worker
  ```

## 6. Rollback Instructions
If any issues arise during Stage C:
1. Revert repository state:
   ```bash
   git checkout pre-stage-c
   ```
2. Rollback D1 database migrations if needed:
   ```sql
   DROP TABLE IF EXISTS installed_apps;
   DROP TABLE IF EXISTS app_install_log;
   ```
3. If necessary, restore full database from backup:
   ```bash
   npx.cmd wrangler d1 execute ecommerce-perf-db --remote --file=backups/d1-pre-stage-c.sql
   ```
4. Redeploy `nasrify-admin` and `nasrify-store` from `pre-stage-c`.
5. Monolith worker `ecommerce-store-perf-test` remains untouched and live.
