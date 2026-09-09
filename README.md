# Apex Edge E-Commerce Platform

A production-grade, globally distributed modern e-commerce platform built on **Next.js 16 (App Router)** and deployed on the edge via **Cloudflare Workers**, **Cloudflare D1 Database**, and **Cloudflare R2 Object Storage**.

Live Production Storefront: [https://ecommerce-store-v2.zia291930.workers.dev](https://ecommerce-store-v2.zia291930.workers.dev)  
Admin Control Panel: [https://ecommerce-store-v2.zia291930.workers.dev/admin/login](https://ecommerce-store-v2.zia291930.workers.dev/admin/login)

---

## 🚀 Key Features

### 1. Dynamic Homepage Manager & Appearance Customizer
- **Visual Section Builder**: Admin control over all storefront sections (Hero Showcase, Categories Grid, Featured Products, Promo Banners, Brand Story, Testimonials, Newsletter, Custom HTML) with dynamic visibility toggles, rich content editing, and ordering.
- **Dynamic Appearance Engine**: Real-time theme customization allowing admins to tweak primary, secondary, accent, background, and text colors, typography, container widths, border radii, shadows, and spacing. Theme styles are injected dynamically into CSS custom variables.

### 2. Comprehensive Catalog & Multi-Variant Engine
- **Product Hierarchy & Attributes**: Support for complex product variants across custom attributes (Color, Size, Material, Style).
- **Automated SKU & Matrix Generator**: Generates cartesian product variant matrices with individual price overrides, stock levels, weights, dimensions, and image assignments.
- **Hierarchical Categories**: Multi-level category trees with automatic URL-safe slug generation, parent-child circular reference prevention, and direct R2 image uploads.

### 3. Multi-Facet Search & Dynamic SEO Architecture
- **Instant Search with Dynamic Facets**: 300ms debounced search with live faceted filtering by category, brand, multi-tag intersection, price range slider/inputs, and inventory status.
- **Schema.org Structured Data (JSON-LD)**: Rich snippet structured data for `Product`, `CollectionPage`, and `BreadcrumbList`.
- **Dynamic SEO Assets**: Auto-generated `/sitemap.xml` and `/robots.txt` reflecting live products, active categories, and canonical storefront routes.
- **Social Graph Optimization**: OpenGraph and Twitter card (`summary_large_image`) meta tags on all pages.

### 4. Authoritative Cart & Checkout System
- **Resilient Cart Session Resolution**: Seamless guest-to-order workflow supporting multi-source session identification (cookies, body payload, and request headers).
- **Server-Side Price Integrity**: Complete server recalculation of item totals, discounts, shipping fees, and taxes from the database, strictly ignoring untrusted client pricing.
- **Atomic Inventory Decrement**: Validates real-time product/variant stock before order creation and atomically decrements inventory to eliminate overselling.
- **Cash on Delivery (COD) Checkout**: Streamlined checkout with immediate order confirmation and persistent order history.

### 5. Production Security & Edge Performance
- **Edge Route Protection**: Edge middleware safeguards all `/api/admin/*` routes with immediate `401 Unauthorized` responses and redirects `/admin/*` pages to `/admin/login`.
- **Brute-Force Lockout**: Rate-limiting system tracks failed login attempts and locks the account for 5 minutes after 3 consecutive failures.
- **Strict Input Validation**: End-to-end Zod schemas guarding all cart mutations, checkout orders, admin catalogs, media uploads, and authentication routes.
- **Asset Storage with Cloudflare R2**: Direct media uploads with client image normalization (`normalizeImageUrl`) supporting relative paths and CDN assets.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Components) |
| **Edge Deployment** | [Cloudflare Workers](https://workers.cloudflare.com/) via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) |
| **Database** | [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless distributed SQLite) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) with automated schema migrations |
| **Object Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible bucket `ecommerce-store-assets`) |
| **Styling** | [TailwindCSS 4](https://tailwindcss.com/) & Vanilla CSS Design Tokens |
| **Validation** | [Zod](https://zod.dev/) |
| **Authentication** | Custom edge session management with bcrypt password hashing |
| **CI/CD** | GitHub Actions (`.github/workflows/deploy.yml`) with automated Worker builds |

---

## 📂 Project Structure

```
├── app/                        # Next.js App Router
│   ├── (public storefront)     # /, /product/[slug], /category/[slug], /cart, /checkout
│   ├── admin/                  # Protected admin panel pages
│   │   ├── dashboard/          # Analytics & quick metrics
│   │   ├── products/           # Product and variant management
│   │   ├── categories/         # Category hierarchy and banner upload
│   │   ├── orders/             # Order tracking and status changes
│   │   ├── homepage/           # Dynamic section manager
│   │   ├── appearance/         # Store styling and theme customizer
│   │   └── settings/           # Global store settings
│   ├── api/                    # REST API routes
│   │   ├── admin/              # Protected admin endpoints
│   │   ├── cart/               # Cart add, update, remove
│   │   ├── orders/             # Checkout & order fulfillment
│   │   ├── products/           # Advanced search & discovery
│   │   ├── media/              # Direct R2 streaming & uploads
│   │   └── health/             # System health & D1 table verification
│   ├── sitemap.ts              # Dynamic sitemap.xml route
│   ├── robots.ts               # Dynamic robots.txt route
│   └── layout.tsx              # Root HTML layout with SEO meta
├── components/                 # Reusable React components
│   ├── admin/                  # Admin UI widgets, modals, managers
│   ├── homepage/               # Dynamic homepage section renderers
│   ├── search/                 # Faceted search client interface
│   ├── CartContext.tsx         # Global shopping cart state provider
│   └── ProductCard.tsx         # Universal product grid item card
├── lib/                        # Business logic & server services
│   ├── auth.ts                 # Admin auth & rate limiting
│   ├── cart.ts                 # Cart operations & session resolution
│   ├── categories.ts           # Category domain & hierarchy trees
│   ├── db/                     # Drizzle schema & table definitions
│   ├── db.ts                   # D1 database connection & health checks
│   ├── homepage.ts             # Homepage sections domain
│   ├── orders.ts               # Order generation & stock decrement
│   ├── products.ts             # Catalog queries & multi-facet search
│   ├── seo.ts                  # Schema.org JSON-LD & canonical utilities
│   ├── theme.ts                # Appearance engine & CSS variables
│   └── utils.ts                # Image URL normalization & helpers
├── drizzle/                    # D1 SQL migration files
├── scripts/                    # Verification test suites & smoke tests
└── wrangler.jsonc              # Cloudflare Workers configuration
```

---

## ⚙️ Environment Variables & Configuration

Create a `.env.local` file for local development:

```env
# Application Host
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Authentication Secret
ADMIN_JWT_SECRET="your-secure-random-secret-key-here"

# Node Environment
NODE_ENV="development"
```

In production on Cloudflare Workers, environment variables and bindings are configured in `wrangler.jsonc` and GitHub Actions secrets:

```jsonc
{
  "name": "ecommerce-store-v2",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-02-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ecommerce-db",
      "database_id": "0d2002fe-19a9-4674-884c-354da2dc1bc1"
    }
  ],
  "r2_buckets": [
    {
      "binding": "ASSETS",
      "bucket_name": "ecommerce-store-assets"
    }
  ]
}
```

---

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run TypeScript Type Check & Linter
```bash
npm run cf-typegen
npx tsc --noEmit
npm run lint
```

### 3. Apply Local D1 Database Migrations
```bash
npm run db:migrate:local
npm run db:seed:local
```

### 4. Start Next.js Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin portal.

---

## 🚢 Deployment (Cloudflare Workers)

Deployment is completely automated through **GitHub Actions**. Pushing to the `main` branch triggers `.github/workflows/deploy.yml`:

```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```

The workflow performs:
1. Node.js 22 environment initialization.
2. Production dependency installation.
3. OpenNext Cloudflare Worker compilation (`opennextjs-cloudflare build`).
4. Automatic deployment to Cloudflare Workers via Wrangler.

### Manual Worker Bundle Compilation Test
To test the worker bundle locally without deploying:
```bash
npm run build:worker
```

---

## 🧪 Automated Testing & Verification

The repository contains automated test suites covering all major subsystems:

```bash
# Final Quality Smoke Test (Storefront, SEO, Security, Checkout, Theme)
npx tsx scripts/test-stage15-smoke.ts

# Production & Category Image Upload Validation
npx tsx scripts/test-stage14-production.ts

# Security, Input Validation & Cart Session Regression
npx tsx scripts/test-stage13-security-cart.ts

# Search Engine & Dynamic SEO Regression
npx tsx scripts/test-stage12-search-seo.ts
```

---

## 🔐 Default Admin Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`
- *Note: Passwords can be changed securely in the Admin Settings panel (`/admin/settings`).*

---

## 📄 License
MIT License. All rights reserved.
