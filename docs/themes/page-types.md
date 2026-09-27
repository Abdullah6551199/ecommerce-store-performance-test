# Theme Editor Page Types Guide (Multi-Page Editing)

## Overview
Starting in **Stage 47.3 & 47.4**, the Nasrify Visual Theme Editor supports full **multi-page editing**. Store owners and designers can customize the layout, sections, and component properties across every page of the storefront from a single interface.

Each page type maintains an **independent draft** stored in the Cloudflare D1 `theme_page_drafts` table, ensuring work-in-progress modifications on product pages do not interfere with live homepage campaigns or vice versa.

---

## Supported Built-in Page Types

The Page Switcher groups pages logically into Core, Commerce, Content, and Dynamic CMS categories:

### 1. Core Pages
| Page Type ID | UI Label | Icon | Default Sections | Target URL |
|---|---|---|---|---|
| `homepage` | Homepage | 🏠 | Announcement, Header, Hero, Product Grid, Categories, Testimonials, Newsletter, Footer | `/?preview=1` |

### 2. Commerce Pages
| Page Type ID | UI Label | Icon | Default Sections | Target URL |
|---|---|---|---|---|
| `shop` | Shop / Catalog | 🛍️ | `page_header`, `category_filters`, `category_grid` | `/?preview=1&page=shop` |
| `product` | Product Page | 🏷️ | `product_gallery`, `product_info`, `product_tabs`, `product_reviews_section`, `product_related` | `/?preview=1&page=product` |
| `category` | Category Page | 📁 | `category_header`, `category_filters`, `category_grid` | `/?preview=1&page=category` |
| `cart` | Cart | 🛒 | `cart_page_layout` | `/?preview=1&page=cart` |
| `checkout` | Checkout | 💳 | `checkout_page_layout` | `/?preview=1&page=checkout` |
| `order_success` | Order Success | ✅ | `page_header`, `page_content` | `/?preview=1&page=order_success` |
| `bundles` | Bundles | 📦 | `page_header`, `product_grid` | `/?preview=1&page=bundles` |
| `wishlist` | Wishlist | ❤️ | `page_header`, `product_grid` | `/?preview=1&page=wishlist` |
| `compare` | Compare | ⚖️ | `page_header`, `page_content` | `/?preview=1&page=compare` |
| `track_order` | Track Order | 🚚 | `page_header`, `page_content` | `/?preview=1&page=track_order` |

### 3. Content Pages
| Page Type ID | UI Label | Icon | Default Sections | Target URL |
|---|---|---|---|---|
| `account` | Customer Account | 👤 | `account_dashboard` | `/?preview=1&page=account` |
| `custom_page` | Page Template | 📄 | `page_header`, `page_content` | `/?preview=1&page=custom_page` |

### 4. Dynamic CMS Pages (Auto-Discovered)
Any page created in the admin CMS (`/admin/pages` or D1 `pages` table) is **automatically discovered and listed** in the Page Switcher under **Dynamic (CMS Pages)**:
- Identifier: `page_{slug}` (e.g., `page_about`, `page_contact`, `page_faq`)
- Auto-fallback: uses `DEFAULT_THEME.page_defaults.page` (`page_header` + `page_content`)
- Customizable: add sections, remove sections, edit inline text, and style with Elementor-level controls.

---

## Multi-Page Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TopBar (Page Switcher)                   │
│   Active: [ 🏷️ Product Page ▾ ]                             │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Switch page triggers handlePageSwitch()
            1. Saves current page draft if dirty
            2. Fetches /api/admin/theme-editor/draft?page=product
            3. Resets undo/redo history for new page
            4. Updates preview iframe src to ?preview=1&page=product
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               D1 Table: theme_page_drafts                   │
│   id: "{theme_id}::{page_type}" (composite primary key)     │
│   draft_json: JSON string of active page theme sections      │
│   updated_at: Epoch timestamp                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
            postMessage UPDATE_THEME / FORCE_REFRESH
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           ThemePreviewWrapper (nasrify-store)               │
│   Reads ?page=product query parameter                       │
│   Executes renderPageTheme(theme, "product", storeData)     │
│   Mounts ThemePreviewOverlay with Edit & Delete buttons     │
└─────────────────────────────────────────────────────────────┘
```

---

## How to Add a New Page Type

### Option 1: Create a CMS Page (Zero Code Required)
1. Go to Admin -> Pages (`/admin/pages`).
2. Click **Create Page**, enter title and slug (e.g., `returns-policy`).
3. Open Visual Theme Editor (`/admin/theme-editor`).
4. Click the Page Switcher dropdown in the top bar. The new page appears immediately under **Dynamic (CMS Pages)**.

### Option 2: Add a Built-in System Page
To add a permanent new system page type with custom presets:
1. **Define Schema Defaults**: Add default section definitions in `themes/default/theme.json` and `nasrify-admin/lib/themes/default-theme.ts` under `page_defaults[newPageType]`.
2. **Register in PageSwitcher**: Add an entry to `BUILT_IN_PAGES` in `nasrify-admin/components/theme-editor/PageSwitcher.tsx`:
   ```ts
   { id: "loyalty", name: "Loyalty Program", icon: "⭐", group: "Commerce", urlParam: "loyalty" }
   ```
3. **Storefront Routing**: Ensure the public Next.js route imports and renders `renderPageTheme(theme, "loyalty", storeData)`.
