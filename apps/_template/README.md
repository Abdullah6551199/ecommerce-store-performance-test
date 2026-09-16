# Nasrify App Starter Template (`_template/`)

This directory is a complete, copy-paste starter template for building a new Nasrify App in **< 30 minutes**.

---

## Quick Start in 4 Steps

### 1. Copy & Rename
Duplicate the `_template` folder and give it your unique kebab-case app ID:
```bash
cp -r apps/_template apps/customer-badges
```

### 2. Update `manifest.json`
Open `apps/customer-badges/manifest.json` and replace the placeholder fields:
- `id`: `"customer-badges"` (must match folder name)
- `name`: `"Customer Trust Badges"`
- `version`: `"1.0.0"`
- `permissions`: Declare what data you need (e.g. `["read:products"]`)
- `extensionPoints`: Choose where your UI renders (e.g. `["storefront.product.below"]`)
- `settingsSchema`: Define any options you want admins to configure in `/admin/apps/<id>`

### 3. Build Your Components
- **Admin UI**: Write admin dashboard widgets or views in `admin/`.
- **Storefront UI**: Write customer-facing components in `storefront/`. (Always include `"use client"`).
- **Backend Queries**: Write shared D1 queries or utilities in `lib/`. (Must NOT import `@/lib/auth`).

### 4. Register & Sync
Register your manifest in `lib/apps/registry.ts`, register your component in `lib/apps/loader.ts`, then run:
```bash
npx tsx scripts/sync-apps.ts --target=all
```
Your app is now ready to install from `/admin/apps`!

---

## Directory Conventions
| Path | Target Worker | Description |
|---|---|---|
| `manifest.json` | Both | App metadata, permissions, settings schema |
| `icon.svg` | Both | Vector app icon (`currentColor` stroke) |
| `admin/` | `nasrify-admin` | Admin widgets and routes (isolated from storefront) |
| `storefront/` | `nasrify-store` | Customer components (isolated from admin) |
| `lib/` | Both | Shared queries and data helpers (auth-agnostic) |
| `shared/` | Both | Shared TypeScript types and constants |
