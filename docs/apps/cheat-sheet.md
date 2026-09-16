# Nasrify Apps Framework — Cheat Sheet (1-Page Reference)

Everything you need to build, wire, and deploy a Nasrify app in one page.

---

## 1. Minimal Working App (2 Files)

### `apps/hello/manifest.json`
```json
{
  "id": "hello",
  "name": "Hello Banner",
  "version": "1.0.0",
  "description": "Displays a greeting message on product pages",
  "author": "Nasrify",
  "icon": "icon.svg",
  "pricing": "free",
  "category": "marketing",
  "permissions": ["read:products"],
  "extensionPoints": ["storefront.product.below"],
  "workerScope": {
    "storefront": ["storefront/"],
    "shared": ["manifest.json", "icon.svg"]
  }
}
```

### `apps/hello/storefront/HelloBanner.tsx`
```tsx
"use client";
import React from "react";
import type { StorefrontProductBelowProps } from "@/types/apps";

export default function HelloBanner({ productId }: StorefrontProductBelowProps) {
  return (
    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 text-xs font-bold text-center">
      👋 Thanks for viewing item #{productId}!
    </div>
  );
}
```

---

## 2. All Extension Points

| Extension Point | Where It Renders | Example Component |
|---|---|---|
| `admin.dashboard.widget` | Admin Dashboard KPI grid | `<RevenueForecastWidget />` |
| `admin.sidebar` | Admin navigation drawer | Custom sidebar navigation link |
| `admin.route` | Dedicated page `/admin/apps/<id>` | Full admin configuration page |
| `storefront.header` | Top announcement bar | Global promo / countdown banner |
| `storefront.footer` | Footer section | Trust seals, partner badges |
| `storefront.homepage.section` | Storefront Homepage | Custom product showcase carousel |
| `storefront.product.below` | Beneath product specifications | Product reviews, cross-sells, size guides |
| `storefront.cart.below` | Below cart item list | Recommended upsell add-ons |
| `storefront.checkout.below` | Checkout payment section | Security guarantee badges |

---

## 3. All Permissions

| Permission | When To Use |
|---|---|
| `read:products` | Read product titles, prices, images, stock |
| `write:products` | Modify inventory or update product details |
| `read:orders` | Access order history, totals, line items |
| `write:orders` | Update order status or tracking codes |
| `read:customers` | Display customer names or read email history |
| `write:customers` | Update customer profiles or addresses |
| `read:settings` | Read store currency, country, tax settings |
| `write:settings` | Modify global store configuration |
| `read:media` | Read R2 media assets and image URLs |
| `write:media` | Upload user images or generated assets |
| `read:analytics` | Query store sales, conversion rates, KPIs |

---

## 4. Manifest Fields Reference

| Field | Required | Type | Notes |
|---|---|---|---|
| `id` | Yes | `string` | Lowercase kebab-case (e.g. `reviews`, `loyalty-points`) |
| `name` | Yes | `string` | Human-readable title displayed in Apps manager |
| `version` | Yes | `string` | SemVer format (e.g. `1.0.0`) |
| `description`| Yes | `string` | 1-2 sentence overview |
| `author` | Yes | `string` | Creator name |
| `icon` | Yes | `string` | Path relative to app directory (usually `"icon.svg"`) |
| `pricing` | Yes | `"free" \| "paid"` | Pricing tier |
| `permissions`| Yes | `string[]` | Array of required permissions |
| `extensionPoints` | Yes | `string[]`| Target injection slots |
| `workerScope`| No | `object` | `{ admin: [...], storefront: [...], shared: [...] }` |
| `settingsSchema` | No | `object` | Auto-generates UI in `/admin/apps/<id>` |

---

## 5. Common Errors & Quick Fixes

- **`ssr: false is not allowed in Server Components`**: Move `next/dynamic` with `ssr: false` into a Client Component marked `"use client"`.
- **`Cannot find module '@/lib/auth'` in storefront**: Storefront worker does not have admin auth. Move admin routes into `admin/api/` so they are only built for `nasrify-admin`.
- **`Missing required field '<field>'`**: Check `manifest.json`. All required fields (`id`, `name`, `version`, `description`, `author`, `icon`, `pricing`, `permissions`, `extensionPoints`) must be defined.
- **Component not rendering**: Ensure the app is both **Installed** and **Enabled** in `/admin/apps`. Extension slots evaluate to `null` if disabled.
