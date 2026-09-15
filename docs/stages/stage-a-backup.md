# Stage A — Pre-Execution Backup Summary

**Date**: 2026-09-16
**Environment**: Cloudflare Workers (Test)

## 1. Monolith Worker Configuration
- **Worker Name**: `ecommerce-store-perf-test`
- **Worker URL**: `https://ecommerce-store-perf-test.zia291930.workers.dev`
- **Cloudflare Account ID**: `ab9b528badc7cbd3e583a9ff7935a07f`
- **Subdomain**: `zia291930`

## 2. Shared Cloudflare Resources
- **D1 Database Name**: `ecommerce-perf-db`
- **D1 Database ID**: `3a60804b-1009-4451-972b-87cec6d46bcb`
- **R2 Bucket Name**: `ecommerce-perf-assets` (binding: `R2`)

## 3. Git Tags & Release State
- **Pre-Execution Tag**: `pre-stage-a` (Commit: `252b1bd`, pushed to remote)
- **Latest Production / Stage Tag**: `v2.4.3` (Full Optimization Audit)

## 4. Database Backup
- **Backup File**: `backups/d1-pre-stage-a.sql`
- **Export Command**:
  ```bash
  npx wrangler d1 export ecommerce-perf-db --remote --output=backups/d1-pre-stage-a.sql
  ```

## 5. Monolith Build & Deploy Commands
- **Build Worker**:
  ```bash
  npm run build:worker
  # (which runs opennextjs-cloudflare build)
  ```
- **Deploy Worker**:
  ```bash
  npm run deploy:worker
  # or npx wrangler deploy
  ```

## 6. Rollback Procedure
If any unexpected failure occurs during Stage A:
1. Revert to `pre-stage-a`:
   ```bash
   git checkout pre-stage-a
   ```
2. Redeploy the monolith worker:
   ```bash
   npm run deploy:worker
   ```
3. If database changes ever need to be restored:
   ```bash
   npx wrangler d1 execute ecommerce-perf-db --remote --file=backups/d1-pre-stage-a.sql
   ```
4. The original monolith worker `ecommerce-store-perf-test` remains untouched and functional.
