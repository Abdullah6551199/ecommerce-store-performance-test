# Nasrify Apps Framework — Developer Guide

This guide explains how to build, package, and deploy modular apps for the Nasrify e-commerce platform.

---

## 1. Quickstart: Your First App in 5 Minutes

The fastest way to build an app is using the starter template:

1. **Duplicate the Template**:
   ```bash
   cp -r apps/_template apps/quick-announcement
   ```
2. **Edit `apps/quick-announcement/manifest.json`**:
   Set `id` to `"quick-announcement"`, update `name`, and define your settings schema.
3. **Customize Your Component**:
   Edit `apps/quick-announcement/storefront/ExampleBanner.tsx` to render your custom UI.
4. **Register & Sync**:
   Add your app manifest to `lib/apps/registry.ts`, register in `lib/apps/loader.ts`, and run:
   ```bash
   npx tsx scripts/sync-apps.ts --target=all
   ```
5. **Install & Test**:
   Open `/admin/apps` in your browser, click **Install**, and visit any product page to see your live app!

---

## 2. Directory Structure & Worker Scope

Nasrify uses a split-worker architecture where administrative functionality runs on `nasrify-admin` and customer storefront functionality runs on `nasrify-store`.

To ensure maximum security and minimum worker bundle size, app folders are partitioned by worker scope:

```
apps/<app-id>/
├── manifest.json            # App definition, metadata, permissions, extension points, settings schema
├── icon.svg                 # Vector icon (currentColor stroke/fill)
├── shared/                  # Shared TypeScript interfaces and constants (both workers)
│   ├── types.ts
│   └── constants.ts
├── admin/                   # Admin panel widgets and page views (nasrify-admin worker ONLY)
│   ├── <Widget>.tsx
│   └── api/                 # Admin API routes (imports @/lib/auth safely)
│       └── <endpoint>/route.ts
├── storefront/              # Public storefront components (nasrify-store worker ONLY)
│   ├── <Component>.tsx
│   └── api/                 # Public customer-facing API routes
│       └── <endpoint>/route.ts
└── lib/                     # Database queries and cached helpers (auth-agnostic, both workers)
    └── <queries>.ts
```

### Worker Scope Rules
1. **Admin Isolation**: Code inside `admin/` is **never** copied to the storefront worker. Admin authentication (`@/lib/auth`) must only be imported inside `admin/` or `admin/api/`.
2. **Storefront Isolation**: Code inside `storefront/` is **never** copied to the admin worker.
3. **Shared Logic**: Code in `lib/` and `shared/` is deployed to both workers. It must remain **auth-agnostic**.

---

## 3. Manifest Schema (`manifest.json`)

The manifest is validated against `AppManifestSchema` at install time:

```json
{
  "id": "my-custom-app",
  "name": "My Custom App",
  "version": "1.0.0",
  "description": "Short explanation of what this app does.",
  "author": "Nasrify Partner",
  "authorUrl": "https://example.com",
  "icon": "icon.svg",
  "pricing": "free",
  "category": "marketing",
  "permissions": [
    "read:products",
    "read:settings"
  ],
  "extensionPoints": [
    "admin.dashboard.widget",
    "storefront.product.below"
  ],
  "workerScope": {
    "admin": ["admin/"],
    "storefront": ["storefront/"],
    "shared": ["manifest.json", "icon.svg", "lib/", "shared/"]
  },
  "settingsSchema": {
    "enableFeature": {
      "type": "boolean",
      "default": true,
      "label": "Enable Custom Feature",
      "description": "Toggle this app feature on or off"
    },
    "headerText": {
      "type": "string",
      "default": "Special Deal",
      "label": "Header Title"
    }
  },
  "databaseTables": [
    "app_my-custom-app_data"
  ]
}
```

---

## 4. Settings Schema & Dynamic Admin UI

When an app defines `settingsSchema`, Nasrify automatically renders a configuration form in `/admin/apps/<app-id>` under the **Settings** tab.

### Supported Field Types:
- **`boolean`**: Renders an accessible toggle switch.
- **`string`**: Renders a text input.
- **`number`**: Renders a numeric input.
- **`select`**: Renders a dropdown select box (provide `options` array).

Settings are automatically persisted to the D1 `installed_apps.settings` column and can be queried anywhere via:
```typescript
import { getAppSettings } from "@/lib/apps/installed";

const settings = await getAppSettings<{ enableFeature: boolean }>("my-custom-app");
```
Settings checks are cached with a **60s TTL** in worker memory for edge performance.

---

## 5. Supported Permissions
Apps must declare minimum required permissions:
- `read:products`, `write:products`: Access product catalog & variants
- `read:orders`, `write:orders`: Access customer orders and line items
- `read:customers`, `write:customers`: Access customer profiles & addresses
- `read:settings`, `write:settings`: Read/write global store configuration
- `read:media`, `write:media`: Access R2 media bucket assets
- `read:analytics`: Query store performance, sales, and traffic analytics

---

## 6. Supported Extension Points & Prop Contracts

| Extension Point | Prop Interface | Typical Use Case |
|---|---|---|
| `storefront.floating` | `StorefrontFloatingProps` (`{}`) | Sticky bottom corner floating buttons, live chat widgets, WhatsApp support |
| `storefront.product.below` | `StorefrontProductBelowProps` (`{ productId, productSlug }`) | Product reviews, cross-sells, sizing calculators |
| `storefront.homepage.section` | `StorefrontHomepageSectionProps` (`{ sectionId }`) | Custom hero banners, featured collection grids |
| `storefront.cart.below` | `StorefrontCartBelowProps` (`{ cartId }`) | Free shipping progress bars, upsell cards |
| `storefront.checkout.below` | `StorefrontCheckoutBelowProps` (`{ orderId }`) | Trust seals, checkout assistance notes |
| `admin.dashboard.widget` | `AdminDashboardWidgetProps` (`{ className }`) | KPI metric cards, quick action panels |
| `admin.sidebar` | `AdminSidebarProps` (`{ className }`) | Custom admin navigation links |
| `admin.route` | `Record<string, unknown>` | Dedicated views under `/admin/apps/<app-id>` |

---

## 7. Component Isolation & Runtime Error Logging
1. **Always use `"use client"`** for interactive widgets.
2. **Error Boundary Guarantee**: All extension points are wrapped in `AppErrorBoundary`. If your component throws an uncaught error:
   - The crashing component unmounts cleanly (zero host page breakage).
   - An error telemetry report is dispatched to `/api/apps/runtime-error`.
   - The crash is recorded in `app_install_log` with action `"runtime_error"`. Administrators can view crash logs directly in `/admin/apps/<app-id>` under the **Audit History** tab.
3. **Data Safety**: All app-owned tables must begin with `app_<id>_` or use declared platform tables in `databaseTables`. The platform guarantees that uninstalling an app will NEVER delete app database tables.

---

## 8. Real-World Case Study: The Reviews App (`apps/reviews/`)

The Reviews App is the platform's reference implementation demonstrating worker scope separation:
- `apps/reviews/admin/`: Contains `ReviewsManager.tsx` and admin routes (`api/moderate`, `api/stats`).
- `apps/reviews/storefront/`: Contains `ReviewsList.tsx` and public routes (`api/list`, `api/submit`).
- `apps/reviews/shared/`: Contains unified TypeScript types and defaults.
- `apps/reviews/lib/`: Contains shared, auth-agnostic D1 database queries.
