# Stage 21: Product Bundles + Compare Products

## Overview
Stage 21 introduces two high-converting, revenue-amplifying ecommerce engines to the `ecommerce-store-perf-test` platform:
1. **Part A: Product Bundles** — A flexible multi-item bundling suite that allows store owners to group complementary products at discounted bundle prices, display rich bundle landing pages, feature bundles on the homepage, cross-sell bundles directly on individual product pages, and seamlessly add bundles to cart with proportional discount distribution and custom line-item badges.
2. **Part B: Compare Products** — A client-side, side-by-side product comparison system enabling shoppers to compare specifications, ratings, brands, stock status, categories, and prices across up to 4 items simultaneously, complete with difference highlighting, instant Add-to-Cart actions, a floating bottom tray, and shareable URLs.

---

## 1. Scope & Environment Parameters
- **Target Environment**: `ecommerce-store-perf-test` (Cloudflare Worker)
- **Live Worker URL**: `https://ecommerce-store-perf-test.zia291930.workers.dev`
- **Repository**: `Abdullah6551199/ecommerce-store-performance-test`
- **D1 Database**: `ecommerce-perf-db` (Cloudflare D1)
- **Design System**: Chronicles Purple Palette (`#960DF2`, `#AB3DF5`, `#3C0561`, `#EACFFC`), adhering strictly to the Zero Green Policy across all admin and customer storefront interfaces.
- **Backwards Compatibility**: 100% preservation of Stages 1-20 features (Authentication, Cart Drawer, Dynamic Tax Hierarchy, Shipping Zones, Coupon Engine, Order Tracking, Broadcasts).

---

## 2. PART A: Product Bundles Architecture

### 2.1 Database Schema (`0013_stage21_bundles_compare.sql`)
```sql
-- Product Bundles Table
CREATE TABLE IF NOT EXISTS product_bundles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  bundle_price REAL NOT NULL,
  original_price REAL NOT NULL,  -- Sum of individual products
  discount_percentage REAL,      -- Auto-calculated
  image_url TEXT,
  status TEXT DEFAULT 'active',  -- 'active', 'draft'
  is_featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Bundle Items (products included in bundle)
CREATE TABLE IF NOT EXISTS bundle_items (
  id TEXT PRIMARY KEY,
  bundle_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,               -- Optional variant
  quantity INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (bundle_id) REFERENCES product_bundles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bundles_status ON product_bundles(status);
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON product_bundles(slug);
CREATE INDEX IF NOT EXISTS idx_bundles_featured ON product_bundles(is_featured);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product ON bundle_items(product_id);
```

### 2.2 Pre-Seeded Starter Bundles
Two production starter bundles were applied to remote D1:
1. **Endurance Performance Trio (`bundle-endurance-trio`)**:
   - Items: Apex CloudRunner ($180) + Aero-Knit Performance Tee ($48) + Hydro-Charge Insulated Flask ($38) + Aero-Knit Performance Tee ($48) + Hydro-Charge Insulated Flask ($38) = Original total **$358.00**.
   - Bundle Price: **$268.00**
   - Discount: **25.14%** (Customer Saves $90.00)
   - Status: Active, Featured (Home + Catalog).
2. **Elite Marathon Duo (`bundle-elite-marathon-duo`)**:
   - Items: Apex CloudRunner ($180) + Apex Carbon Pace ($165) = Original total **$345.00**.
   - Bundle Price: **$275.00**
   - Discount: **20.29%** (Customer Saves $70.00)
   - Status: Active, Featured.

### 2.3 Admin Bundle Management UI (`/admin/bundles`)
- **Key Statistics Cards**:
  - Total Bundles count
  - Active Bundles count
  - Featured Bundles count
  - Average Discount % across active bundles
- **Filtering & Search**:
  - Instant client-side & server-side search by title or slug
  - Status filter tabs (`All`, `Active`, `Draft`, `Featured`)
  - Multi-column sorting (`Sort Order`, `Name`, `Price`, `Discount`, `Date`)
- **Interactive Create / Edit Modal**:
  - Auto-generating slug from bundle name
  - Real-time catalog product search and selection
  - Quantity controls per item, with auto-sum of original total
  - Instant calculation of savings ($) and discount percentage (%)
  - R2 image upload or 1-click adoption of first product's hero image
  - Status toggles (`Active` / `Draft`) and Homepage Featured toggle
- **Quick Row Actions**:
  - Edit bundle modal
  - Duplicate bundle with `(Copy)` naming and draft status
  - 1-click status activation/deactivation toggle
  - Safe delete confirmation modal
  - Direct link to view on storefront (`/bundles/[slug]`)

### 2.4 Customer Storefront Experience
1. **Bundles Listing Page (`/bundles`)**:
   - Chronicles purple gradient hero banner: *"Save More with Curated Bundles"*.
   - Responsive multi-column grid displaying bundle cards.
   - Each card highlights: product count badge, struck-through original total, highlighted bundle price, percentage savings badge, product thumbnails preview, and "View Bundle →" button.
2. **Individual Bundle Detail Page (`/bundles/[slug]`)**:
   - High-contrast Chronicles card layout.
   - Left side: Bundle primary image and interactive product gallery.
   - Right side: Large typography, savings summary banner, pricing breakdown, and one-click "Add Bundle to Cart" button.
   - Detailed "Products in this Bundle" grid with individual product cards and links.
   - Related Bundles recommendation carousel.
3. **Homepage Integration (`/`)**:
   - `FeaturedBundlesSection` dynamically renders after "Trending Products" whenever active bundles have `is_featured = 1`.
4. **Product Page Cross-Sell (`/product/[slug]`)**:
   - `ProductBundleCrossSell` checks if the active product is included in any active bundles.
   - Displays a clean callout box: *"Also available in bundle"* with discount badge, bundle name, and direct shortcut to save more.

### 2.5 Cart Bundle Integration (`CartContext.tsx` & `CartDrawer.tsx`)
- Clicking "Add Bundle to Cart" leverages `addBundleToCart(bundle)` in `CartContext`.
- **Proportional Price Allocation**: Rather than charging full price and relying on coupon codes, the bundle price is proportionally distributed to each bundle item:
  $$\text{Item Bundle Price} = \text{Item Original Price} \times \left(\frac{\text{Bundle Price}}{\text{Original Total Price}}\right)$$
  - Ensures that sum of line items exactly matches the advertised bundle price.
  - Automatically preserves tax and shipping calculations without custom discount hacking.
- Each line item stores metadata: `bundleId`, `bundleName`, and `originalPrice`.
- Cart Drawer and checkout displays a purple badge: `Bundle: [Bundle Name]` with original struck-through price and bundle discount indicator.

---

## 3. PART B: Compare Products Architecture

### 3.1 Architecture & Storage
- **Zero-Latency Client Persistence**: Stored in `localStorage` under key `compare_products_v1`.
- **Capacity Limit**: Maximum 4 products concurrently.
- Handled through `CompareContext.tsx` providing `addToCompare`, `removeFromCompare`, `isInCompare`, `clearCompare`, and `compareList`.

### 3.2 Storefront Comparison Entry Points
- **Product Card (`ProductCard.tsx`)**:
  - Added a balance/compare icon button next to the Wishlist heart.
  - One-click toggle adds or removes product from compare list.
  - Provides active state feedback and toast notifications (`Added to compare (X/4)`, `Compare list full (max 4)`).
- **Product Detail Page (`ProductInfoPanel.tsx`)**:
  - Added a full compare pill button beside the Wishlist action.

### 3.3 Fixed Floating Compare Bar (`CompareBar.tsx`)
- Appears smoothly docked at the bottom of the viewport whenever `compareList.length > 0`.
- Displays thumbnail previews of selected products with remove badges.
- Shows total count indicator (`X of 4 products selected`).
- Quick actions: "Compare Now →" linking to `/compare?ids=...` and "Clear All".
- Hidden cleanly on mobile viewports to preserve screen real estate.

### 3.4 Dedicated Compare Page (`/compare`)
- Reads product IDs from URL query params `?ids=id1,id2,id3` or synchronizes with `CompareContext`.
- **Side-by-Side Comparison Grid**:
  - Image, Title, Price, Star Rating, Brand, Category, Stock Status, Tags, and Description.
  - **Dynamic Difference Highlighting**: Evaluates lowest price (highlighted in soft purple/green) and best customer review ratings.
  - Individual "Add to Cart" button for each product column.
  - Individual "Remove" button per column.
  - "Add Another Product" modal with live catalog search to quickly add up to the 4-item maximum.
  - 1-click "Share Comparison" button that copies the shareable URL with preloaded parameters to the user's clipboard.

---

## 4. API Endpoints Reference

### Admin Endpoints (Protected)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/admin/bundles` | List all bundles with optional search, status filter, and sorting |
| `POST` | `/api/admin/bundles` | Create a new bundle with items and automatic discount calculations |
| `GET` | `/api/admin/bundles/[id]` | Retrieve single bundle details and its items |
| `PUT` | `/api/admin/bundles/[id]` | Update bundle properties, pricing, items, or status |
| `DELETE` | `/api/admin/bundles/[id]` | Delete bundle and cascade delete associated items |
| `POST` | `/api/admin/bundles/[id]/duplicate` | Clone bundle with its items into a new Draft bundle |
| `PUT` | `/api/admin/bundles/reorder` | Update sort order across an array of bundles |
| `GET` | `/api/admin/bundles/stats` | Retrieve summary stats (total, active, featured, average discount) |

### Public Storefront Endpoints
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/bundles` | Fetch active bundles with optional featured filter |
| `GET` | `/api/bundles/[slug]` | Fetch complete bundle details and products by slug |
| `GET` | `/api/products/compare?ids=id1,id2` | Fetch rich comparison payload for specified product IDs |

---

## 5. Verification & Test Suite Results

### 5.1 Automated Test Execution (`scripts/test-stage21.ts`)
The comprehensive test suite verified:
- Pre-seeded bundles in D1 database (`bundle-endurance-trio`, `bundle-elite-marathon-duo`).
- Correct calculation of original price ($358 and $345), savings ($90 and $70), and discount percentages (25.14% and 20.29%).
- Admin statistics aggregation (total, active, featured, average discount).
- Dynamic creation of custom bundles with item resolution and math validation.
- Updating bundle prices and recalculating savings.
- Bundle duplication mechanics with `(Copy)` suffix and draft status.
- Product page cross-sell detection query.
- Reorder operations and cascade deletion.
- Proportional cart price allocation ensuring line items sum exactly to bundle price.

**Results**: **35 / 35 Passed (100%)**

### 5.2 Regression Test Execution (`scripts/test-stage20.ts`)
- Cloudflare IP-based visitor detection: **6 / 6 Passed**
- Tax rate detection hierarchy & rules: **9 / 9 Passed**
- Inclusive vs Exclusive tax math: **5 / 5 Passed**
- Pre-configured tax presets: **7 / 7 Passed**
- Shipping zones resolution & rates: **11 / 11 Passed**
- Order schema validation: **3 / 3 Passed**

**Results**: **45 / 45 Passed (100%)**

---

## 6. Summary Checklist
- [x] Database migration `0013_stage21_bundles_compare.sql` applied to remote Cloudflare D1.
- [x] Admin Bundle Management UI (`/admin/bundles`) fully interactive with live product search, math preview, CRUD, duplicate, and toggle.
- [x] Storefront Bundle listing (`/bundles`) and rich detail page (`/bundles/[slug]`).
- [x] Cart bundle integration with proportional discounts and line-item badges.
- [x] Homepage featured bundles section and product page cross-sell widget.
- [x] Compare context (`compare_products_v1`, max 4) with button on cards and detail page.
- [x] Fixed bottom floating compare bar with thumbnails.
- [x] Side-by-side comparison page (`/compare`) with difference highlighting and share links.
- [x] Zero Green Chronicles Purple palette applied consistently across all UI elements.
- [x] Zero TypeScript errors (`tsc --noEmit` clean).
