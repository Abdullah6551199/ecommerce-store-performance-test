# Stage B — Pre-Execution Backup Summary

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
3. **Admin Worker** (Stage B - in progress):
   - **Worker Name**: `nasrify-admin`
   - **Target Worker URL**: `https://nasrify-admin.zia291930.workers.dev`

## 2. Shared Cloudflare Resources
- **Cloudflare Account ID**: `ab9b528badc7cbd3e583a9ff7935a07f`
- **Subdomain**: `zia291930`
- **D1 Database Name**: `ecommerce-perf-db`
- **D1 Database ID**: `3a60804b-1009-4451-972b-87cec6d46bcb`
- **R2 Bucket Name**: `ecommerce-perf-assets` (binding: `R2`)

## 3. Git Tags & Release State
- **Pre-Execution Tag**: `pre-stage-b` (Commit: `6733ca5`, pushed to origin)
- **Previous Release Tag**: `v3.0-stage-a` (Stage A: Storefront Worker Split)
- **Prior Production Tag**: `v2.4.3` (Full Optimization Audit)

## 4. Database Backup
- **Backup File**: `backups/d1-pre-stage-b.sql`
- **Export Command**:
  ```bash
  npx.cmd wrangler d1 export ecommerce-perf-db --remote --output=backups/d1-pre-stage-b.sql
  ```

## 5. Deployment Commands
- **Monolith Worker**:
  ```bash
  npm run deploy:worker
  ```
- **Storefront Worker (`nasrify-store`)**:
  ```bash
  cd nasrify-store
  npx.cmd wrangler deploy
  ```
- **Admin Worker (`nasrify-admin`)**:
  ```bash
  cd nasrify-admin
  npx.cmd wrangler deploy
  ```

## 6. Rollback Instructions
If any issues arise during Stage B:
1. Revert to `pre-stage-b`:
   ```bash
   git checkout pre-stage-b
   ```
2. If `nasrify-admin` was deployed and needs removal:
   ```bash
   npx.cmd wrangler delete --name nasrify-admin
   ```
3. If database restoration is needed:
   ```bash
   npx.cmd wrangler d1 execute ecommerce-perf-db --remote --file=backups/d1-pre-stage-b.sql
   ```
4. Monolith worker `ecommerce-store-perf-test` and storefront worker `nasrify-store` remain untouched and live.
