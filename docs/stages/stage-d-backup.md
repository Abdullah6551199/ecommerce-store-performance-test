# Stage D — Pre-Execution Backup Summary

**Date**: 2026-09-16  
**Environment**: Cloudflare Workers (Test)  

## 1. Cloudflare Workers Topology
1. **Monolith Worker** (Backup):
   - **Worker Name**: `ecommerce-store-perf-test`
   - **Worker URL**: `https://ecommerce-store-perf-test.zia291930.workers.dev`
   - **Status**: Active, untouched
2. **Storefront Worker** (Stage A & C):
   - **Worker Name**: `nasrify-store`
   - **Worker URL**: `https://nasrify-store.zia291930.workers.dev`
   - **Status**: Active, serving storefront only
3. **Admin Worker** (Stage B & C):
   - **Worker Name**: `nasrify-admin`
   - **Worker URL**: `https://nasrify-admin.zia291930.workers.dev`
   - **Status**: Active, serving admin only

## 2. Shared Cloudflare Resources
- **Cloudflare Account ID**: `ab9b528badc7cbd3e583a9ff7935a07f`
- **Subdomain**: `zia291930`
- **D1 Database Name**: `ecommerce-perf-db`
- **D1 Database ID**: `3a60804b-1009-4451-972b-87cec6d46bcb`
- **R2 Bucket Name**: `ecommerce-perf-assets` (binding: `R2`)

## 3. Git Tags & Release State
- **Pre-Execution Tag**: `pre-stage-d` (Commit: `6fd0f5a`, pushed to origin)
- **Previous Release Tag**: `v3.2-stage-c` (Stage C: Apps Framework Part 1)
- **Prior Pre-Tags**: `pre-stage-c5`, `pre-stage-c`, `pre-stage-b`, `pre-stage-a`

## 4. Database Backup
- **Backup File**: `backups/d1-pre-stage-d.sql`
- **Export Command**:
  ```bash
  $env:CLOUDFLARE_API_TOKEN="..."; $env:CLOUDFLARE_ACCOUNT_ID="ab9b528badc7cbd3e583a9ff7935a07f"; npx.cmd wrangler d1 export ecommerce-perf-db --remote --output=backups/d1-pre-stage-d.sql
  ```

## 5. Rollback Instructions
If any issues arise during Stage D:
1. Revert to `pre-stage-d`:
   ```bash
   git checkout pre-stage-d
   ```
2. If database restoration is needed:
   ```bash
   npx.cmd wrangler d1 execute ecommerce-perf-db --remote --file=backups/d1-pre-stage-d.sql
   ```
3. Redeploy `nasrify-admin` and `nasrify-store` from `pre-stage-d`.
4. Monolith worker `ecommerce-store-perf-test` remains untouched and live.
