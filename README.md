# Apex Store — High-Performance Edge E-Commerce Platform

A production-grade, globally distributed modern e-commerce platform built on **Next.js 16 (App Router)** and deployed on the edge via **Cloudflare Workers**, **Cloudflare D1 Database**, and **Cloudflare R2 Object Storage**.

- **Live Storefront (Test Environment)**: [https://ecommerce-store-perf-test.zia291930.workers.dev](https://ecommerce-store-perf-test.zia291930.workers.dev)  
- **Admin Control Panel**: [https://ecommerce-store-perf-test.zia291930.workers.dev/admin/login](https://ecommerce-store-perf-test.zia291930.workers.dev/admin/login)
- **Architecture Documentation**: [`docs/architecture.md`](docs/architecture.md)
- **Performance Budget & Core Web Vitals**: [`docs/performance-budget.md`](docs/performance-budget.md)

---

## 🚀 Key Features

### 1. Storefront & Customer Experience
- **Sub-1ms Optimistic UI Cart**: Add to Cart, quantity updates, and deletions execute in **0.096ms** directly in browser memory, with seamless background state synchronization.
- **Flicker-Free Floating Cart Drawer**: Compact 320px persistent slide-out panel utilizing CSS transitions (`translateX`) without unmounting or restarting animations on repeated item additions. Backdrop-free design allows uninterrupted store browsing.
- **Dynamic Homepage Sections**: Modular sections (Hero Showcase, Category Grid, Featured Products, Promo Banners, Brand Story, Testimonials, Newsletter) fully configured from the database.
- **Multi-Facet Search & Filtering**: Sub-300ms instant catalog filtering by keywords, categories, brands, tags, and price range sliders.
- **Multi-Variant Product Detail**: Real-time attribute selection (Color, Size, Material), live stock check indicators, and responsive image galleries.
- **Resilient Checkout Flow**: Cash on Delivery (COD) order placement with server-side price integrity enforcement, automatic stock decrements, and instant order confirmations.

### 2. Administrative Control Panel (`/admin`)
- **Dashboard & Business Analytics**: Real-time revenue, order volume, customer counts, and low-stock alerts.
- **Catalog & Variant Manager**: Complete CRUD operations for products, SKU matrix generation for variants, pricing rules, and inventory tracking.
- **Category Hierarchy Builder**: Nested category management with automatic URL-safe slug generation and R2 banner uploads.
- **Homepage & Appearance Customizer**: Live visual section ordering, visibility toggling, custom HTML blocks, and dynamic theme token controls (colors, typography, container radii, and spacing).
- **Security & Admin Credentials Manager**: Secure administrative email and password updates in Cloudflare D1 with bcrypt password verification (10 rounds) and rate-limited brute-force protection.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19 Server Components) |
| **Edge Compute** | [Cloudflare Workers](https://workers.cloudflare.com/) via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) |
| **Database** | [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless distributed SQLite database) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) with automated migrations and type-safe schemas |
| **Object Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible bucket `ecommerce-perf-assets`) |
| **Styling** | [TailwindCSS 4](https://tailwindcss.com/) with Vanilla CSS Design Tokens |
| **Data Validation** | [Zod](https://zod.dev/) |
| **Authentication** | HttpOnly secure session cookies with bcrypt hashing (10 rounds) and IP rate limiting |
| **CI/CD** | Automated GitHub Actions deployment pipeline (`.github/workflows/deploy.yml`) |

---

## 📂 Project Structure

```text
├── app/                        # Next.js App Router (Storefront & Admin)
│   ├── (storefront)            # /, /product/[slug], /category/[slug], /search, /cart, /checkout
│   ├── admin/                  # Protected administrative portal
│   │   ├── (dashboard)/        # Metrics, products, categories, orders, homepage, appearance, settings
│   │   └── login/              # Secure rate-limited login form
│   ├── api/                    # REST APIs
│   │   ├── admin/              # Admin CRUD endpoints (products, categories, orders, update-email, update-password)
│   │   ├── cart/               # Cart synchronization endpoints
│   │   ├── orders/             # Server-validated checkout and order fulfillment
│   │   ├── products/           # Live search and product discovery
│   │   ├── media/              # Cloudflare R2 image streaming and uploads
│   │   └── health/             # D1 database connection health check
│   ├── sitemap.ts              # Dynamic SEO XML sitemap
│   ├── robots.ts               # Dynamic robots.txt
│   └── layout.tsx              # Root storefront HTML layout with SEO meta and design tokens
├── components/                 # React UI Components
│   ├── admin/                  # Admin managers (AdminAccountManager, SettingsManager, HomepageManager)
│   ├── CartDrawer.tsx          # Smooth floating slide-out shopping cart
│   ├── CartDrawerContainer.tsx # Persistent client island avoiding remount flickers
│   ├── CartContext.tsx         # Synchronous optimistic cart state provider (< 1ms dispatch)
│   ├── ProductCard.tsx         # Accessible, performance-optimized product card
│   └── Header.tsx              # Storefront header with live search and dynamic navigation
├── docs/                       # Architecture and Performance Specifications
│   ├── architecture.md         # End-to-end architecture diagrams, data flows, and caching strategies
│   └── performance-budget.md   # Core Web Vitals targets, Lighthouse audits, and bundle limits
├── lib/                        # Domain Services & Utilities
│   ├── auth.ts                 # Admin authentication, rate limiting, and session tokens
│   ├── cart.ts                 # Cart domain models and session resolver
│   ├── categories.ts           # Category trees and hierarchical queries
│   ├── db.ts                   # D1 database client and connection health checks
│   ├── db/schema.ts            # Drizzle SQLite schemas (products, categories, orders, users, sessions)
│   ├── orders.ts               # Server-side order calculation, pricing verification, and stock decrements
│   └── utils.ts                # Image URL normalizers and formatting helpers
├── wrangler.jsonc              # Cloudflare Workers configuration & D1/R2 bindings
└── .github/workflows/          # GitHub Actions deployment pipelines
```

---

## ⚙️ Environment Variables

Create a `.env.local` file for local development:

```env
# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Authentication Secret
ADMIN_JWT_SECRET="your-secure-random-secret-key-here"

# Node Environment
NODE_ENV="development"
```

In the Cloudflare Workers test environment, bindings are configured in `wrangler.jsonc`:
- **Worker Name**: `ecommerce-store-perf-test`
- **D1 Database Binding**: `DB` (`ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`)
- **R2 Storage Binding**: `ASSETS` (`ecommerce-perf-assets`)

---

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify TypeScript Compilation & Linting
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

Visit:
- Storefront: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`

---

## 🚢 Deployment (Cloudflare Workers)

Deployment is automated via **GitHub Actions** (`.github/workflows/deploy.yml`) on every push to the `main` branch of `Abdullah6551199/ecommerce-store-performance-test`:

```bash
git add .
git commit -m "feat: description of change"
git push origin main
```

The pipeline:
1. Provisions Node.js 22.
2. Installs production dependencies.
3. Builds the OpenNext Cloudflare Worker bundle (`npm run build:worker`).
4. Deploys directly to Cloudflare Workers with Wrangler using Cloudflare credentials.

---

## 🧪 Automated Testing & Verification

Automated test suites verify regressions, security boundaries, and Core Web Vitals:

```bash
# 1. Full Functional Regression & Security Test (53 test assertions)
node scripts/test-stage11-regression.js

# 2. Storefront Cleanliness & Infrastructure Audit (0 tech term violations)
node scripts/verify-final-cleanliness.js

# 3. Optimistic UI & Cart Flow Timing (< 1ms dispatch)
node scripts/verify-optimistic-flow.js

# 4. Lighthouse Performance Audit across all routes
node scripts/run-stage10-audits.js
```

---

## 🔐 Default Admin Credentials

- **Default Email**: `admin@example.com`
- **Default Password**: `admin123`
- *Credentials can be updated at any time in the Admin Settings panel (`/admin/settings`).*

---

## 📄 License
MIT License. All rights reserved.
