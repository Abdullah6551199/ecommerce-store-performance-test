# Nasrify Apps Framework — Developer Guide

This guide explains how to build, package, and deploy modular apps for the Nasrify e-commerce platform.

---

## 1. Directory Structure

Every app lives inside its own folder in `apps/<app-id>/`:

```
apps/<app-id>/
├── manifest.json            # App definition, metadata, permissions, extension points
├── icon.svg                 # Vector icon (currentColor stroke/fill)
├── admin/                   # Admin panel widgets and page views
│   └── <AppWidget>.tsx
├── storefront/              # Public storefront components
│   └── <AppBanner>.tsx
├── api/                     # App-specific API routes
│   └── <route-name>/route.ts
└── lib/                     # Utilities and backend helpers
    └── <helper>.ts
```

---

## 2. Manifest Schema (`manifest.json`)

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
    "storefront.homepage.section"
  ],
  "databaseTables": [
    "app_my-custom-app_data"
  ]
}
```

### Manifest Fields
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique kebab-case identifier (e.g. `customer-rewards`) |
| `name` | `string` | Display name shown in Admin Apps manager |
| `version` | `string` | Valid SemVer format (e.g. `1.0.0`) |
| `description` | `string` | Human-readable overview |
| `author` | `string` | Author or publisher name |
| `authorUrl` | `string?` | Optional URL linking to author site |
| `icon` | `string` | Path to icon relative to app directory |
| `pricing` | `"free" \| "paid"` | Pricing tier |
| `price` | `number?` | Required only if `pricing: "paid"` |
| `category` | `string` | App category (e.g. `tools`, `marketing`, `analytics`) |
| `permissions` | `AppPermission[]` | Privileges requested by the app |
| `extensionPoints` | `AppExtensionPoint[]` | Injection slots where the app renders |
| `databaseTables` | `string[]?` | App-owned D1 tables (`app_<id>_*`) |

---

## 3. Supported Permissions
Apps must declare minimum required permissions:
- `read:products`, `write:products`: Access product catalog & variants
- `read:orders`, `write:orders`: Access customer orders and line items
- `read:customers`, `write:customers`: Access customer profiles & addresses
- `read:settings`, `write:settings`: Read/write global store configuration
- `read:media`, `write:media`: Access R2 media bucket assets
- `read:analytics`: Query store performance, sales, and traffic analytics

---

## 4. Supported Extension Points
- `admin.sidebar`: Injects navigation items into the admin drawer
- `admin.dashboard.widget`: Injects metric cards into the main admin dashboard
- `admin.route`: Injects dedicated views under `/admin/apps/<app-id>`
- `storefront.header`: Top announcement / promotional banner
- `storefront.footer`: Custom footer links or badges
- `storefront.homepage.section`: Custom section inserted into the storefront home
- `storefront.product.below`: Recommendations or tabs below product details
- `storefront.cart.below`: Upsells or notices on the cart page
- `storefront.checkout.below`: Custom trust or assistance blocks during checkout

---


## 5. Component Isolation & Best Practices
1. **Always use `"use client"`** for interactive widgets.
2. **Error Boundary Guarantee**: All extension points are wrapped in `AppErrorBoundary`. If your component throws an uncaught error, it will gracefully unmount without affecting the rest of the store.
3. **Data Safety**: All app-owned tables must begin with `app_<id>_` or use declared platform tables in `databaseTables`. The platform guarantees that uninstalling an app will NEVER delete app database tables.

---

## 6. Real-World Case Study: The Reviews App (`apps/reviews/`)

The Reviews App converted an existing monolithic module into an installable, lifecycle-managed application without modifying D1 schemas.

### Directory Structure
```
apps/reviews/
├── manifest.json
├── icon.svg
├── admin/
│   └── ReviewsManager.tsx        # Moderation UI (loaded into /admin/reviews)
├── storefront/
│   └── ReviewsList.tsx           # Customer review list & form (injected below product)
├── api/
│   ├── list/route.ts             # Public query endpoint
│   ├── submit/route.ts           # Customer submission endpoint
│   └── moderate/route.ts         # Admin moderation endpoint
└── lib/
    └── reviews.ts                # D1 queries & React.cache() wrappers
```

### Manifest Definition
```json
{
  "id": "reviews",
  "name": "Reviews & Ratings",
  "version": "1.0.0",
  "description": "Let customers leave star ratings and written reviews on products",
  "author": "Nasrify",
  "authorUrl": "",
  "icon": "icon.svg",
  "pricing": "free",
  "category": "sales",
  "permissions": [
    "read:products",
    "read:orders",
    "read:customers",
    "read:media"
  ],
  "extensionPoints": [
    "storefront.product.below",
    "admin.dashboard.widget"
  ],
  "databaseTables": [
    "reviews",
    "review_images"
  ],
  "settingsSchema": {
    "autoApprove": { "type": "boolean", "default": false, "label": "Auto-approve new reviews" },
    "requirePurchase": { "type": "boolean", "default": false, "label": "Only verified buyers can review" },
    "allowImages": { "type": "boolean", "default": true, "label": "Allow image uploads" }
  },
  "changelog": "1.0.0 — Initial release"
}
```

### Extension Point Wiring
On the product details page (`app/product/[slug]/page.tsx`), the extension point is embedded:
```tsx
<StorefrontProductBelow productId={product.id} />
```
- When `reviews` is installed & enabled: `StorefrontProductBelow` dynamically loads `ReviewsList`.
- When uninstalled: `StorefrontProductBelow` evaluates the 60s TTL cache and immediately returns `null` (zero markup, zero bundle overhead).

### Admin Route Integration
In `app/admin/(dashboard)/reviews/page.tsx`:
- If installed: Loads `ReviewsManager` dynamically with skeleton loading.
- If uninstalled: Displays a dedicated prompt directing the administrator to `/admin/apps` to install the app.

