# Apex Store System Architecture (Stage 12 Final)

This document provides the definitive architectural blueprint for the Apex Store high-performance e-commerce platform.

---

## 1. High-Level Architecture Diagram

```text
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  [ Modern Web Browser / Mobile Viewport ]                                         |
|    |-- Next.js React 19 Client Components (CartDrawer, Search, Product Gallery)   |
|    |-- Client-Side Cart Island (Synchronous localStorage + Optimistic UI < 1ms)   |
|    |-- Deferred Background Sync (/api/cart/sync via keepalive beacon)             |
+-----------------------------------------------------------------------------------+
                                         |
                                  HTTPS / HTTP/3
                                         |
+-----------------------------------------------------------------------------------+
|                         CLOUDFLARE EDGE WORKER RUNTIME                            |
|                                                                                   |
|  [ Cloudflare Workers Global Edge Network ] (OpenNext Next.js 15 Adapter)         |
|    |                                                                              |
|    |-- In-Memory Isolate TTL Cache (60s Cache for settings, categories, sections) |
|    |-- Static & Media Asset Routing (Immutable Cache-Control: max-age=31536000)   |
|    |-- Server-Side Session Verification & Role Authorization                      |
|    |-- Strict Server-Side Order Price & Stock Validation Engine                   |
+-----------------------------------------------------------------------------------+
                       /                                        \
                      /                                          \
            SQL / Drizzle ORM                            Object Store API
                    /                                              \
+------------------------------------+             +--------------------------------+
|         CLOUDFLARE D1              |             |         CLOUDFLARE R2          |
|      Serverless SQLite DB          |             |      S3-Compatible Storage     |
|                                    |             |                                |
|  - products, variants, attributes  |             |  - Product media & imagery     |
|  - categories & hierarchical tree  |             |  - Marketing banners           |
|  - orders & order_items            |             |  - Static brand assets         |
|  - users, sessions, login_attempts |             +--------------------------------+
|  - settings & homepage_sections    |
+------------------------------------+
```

---

## 2. End-to-End Data Flow

### A. Storefront Product Browsing
1. **Request Ingestion**:
   - The user requests a route (e.g., `/product/apex-velocity-runner-x1`).
   - Request reaches the nearest Cloudflare Worker edge location.
2. **Data Fetching & In-Memory Isolation**:
   - Worker checks isolate memory cache for layout metadata (store settings, categories).
   - If uncached or expired (> 60s), Worker executes optimized Drizzle ORM queries against Cloudflare D1:
     - Retrieves product record, associated variants, option types, and imagery.
3. **HTML Streaming & Asset Preloading**:
   - The server streams React Server Components (RSC) to the browser.
   - The document `<head>` hoists high-priority `<link rel="preload">` tags for critical fonts and the single above-the-fold hero/product image.
4. **Media Resolution**:
   - Static images are fetched directly from Cloudflare R2 (`/api/media/[key]`) or CDN edge, returning modern WebP/AVIF formats with immutable cache headers.

### B. Checkout & Transaction Processing
1. **Client Order Submission**:
   - Shopper enters shipping details and clicks "Place Order".
   - Client sends JSON payload containing customer details and cart line items (`productId`, `variantId`, `quantity`).
   - Notice: Client submitted prices are **ignored** by the server.
2. **Server-Side Price & Stock Integrity Verification**:
   - The Worker reads the actual current product/variant prices directly from Cloudflare D1.
   - Computes subtotal, taxes, and shipping rates server-side.
   - Validates live stock quantities in D1. If stock is insufficient, the transaction is rejected with an informative error.
3. **Atomic Persistence**:
   - Inserts order record into `orders`.
   - Inserts items into `order_items`.
   - Decrements stock in `products` / `product_variants`.
   - Returns order confirmation UUID to the client.
4. **Cart Clearing**:
   - Upon successful 200 response, client-side localStorage cart is cleared.

---

## 3. Caching Strategy

```text
+---------------------+-------------------------------+-------------------------------------------+
| Layer               | Cache-Control Directive       | Target Assets                             |
+---------------------+-------------------------------+-------------------------------------------+
| Browser / CDN Edge  | max-age=31536000, immutable   | Static JS/CSS chunks (/_next/static/*)    |
|                     |                               | Media uploads (/api/media/*)              |
+---------------------+-------------------------------+-------------------------------------------+
| Worker Isolate      | In-Memory Cache (TTL: 60s)    | Store settings, category tree, homepage   |
|                     | with LRU eviction             | section layouts                           |
+---------------------+-------------------------------+-------------------------------------------+
| Private / Dynamic   | private, no-cache, no-store   | /checkout, /cart, /admin/*, /api/orders/* |
+---------------------+-------------------------------+-------------------------------------------+
```

### Key Principles:
- **Zero Tech Terms in Client Payloads**: Client-facing payloads contain zero platform leaks or infrastructure headers.
- **Microsecond Isolate Hit**: Once warm, edge isolates serve global metadata from memory in < 1ms, slashing initial TTFB down to 500ms–730ms.
- **Dynamic Content Freshness**: Critical updates in admin settings or catalog items become globally visible across edge nodes within 60 seconds without manual cache purging.

---

## 4. Client-Side Cart Design & Flicker-Free Drawer

### Synchronous Optimistic Architecture
- **Instant Hydration**: The cart initializes synchronously from `localStorage` (`apex_cart_v1`) on client hydration. Cold-start delay is 0ms.
- **Optimistic State Dispatch**: Add to Cart, quantity adjustments, and item removals mutate React state in **0.096ms**. The user perceives instant feedback.
- **Non-Blocking Background Sync**: A silent beacon (`/api/cart/sync`) sends background updates using `fetch` with `keepalive: true` during idle browser moments for recovery and analytics without blocking navigation.

### Persistent Drawer Mounting (Flicker Fix)
```text
User clicks "Add to Cart"
           |
           v
Is drawer mounted?
  ├── NO  ──> Dynamically load CartDrawer chunk -> Mount into DOM -> set hasMountedOnce = true
  └── YES ──> Component is already mounted in DOM!
                 ├── If drawer was open  --> Drawer position remains static (translateX(0)). Item appears instantly!
                 └── If drawer was closed -> Smooth CSS transition (translateX(100%) -> translateX(0)).
```

- **No DOM Remounts**: By using `hasMountedOnce`, the drawer component stays in the DOM once loaded.
- **Pure CSS Transitions**: The sliding behavior uses CSS `transition-transform duration-300 ease-out`, completely avoiding animation restarts.
- **Zero Blocking**: Storefront behind the drawer remains fully interactive. No scroll locking or disruptive modal backdrops.

---

## 5. Admin Authentication & Security Flow

```text
+-----------------------------------------------------------------------------------+
|                             ADMIN AUTHENTICATION                                  |
+-----------------------------------------------------------------------------------+

1. LOGIN ATTEMPT:
   Admin submits credentials -> POST /api/admin/login { email, password }
   
   Rate Limiting Check:
   - Queries `login_attempts` table for failed logins within past 5 minutes.
   - >= 3 failed attempts: Enforces 5-minute lockout (HTTP 429 Too Many Requests).

2. CREDENTIAL VERIFICATION:
   - Queries `users` table for matching email in Cloudflare D1.
   - Compares plaintext password with stored bcrypt hash (`bcrypt.compare`).
   - If invalid: Records failed attempt in `login_attempts`, returns 401.
   - If valid: Clears failed attempts.

3. SESSION CREATION:
   - Generates cryptographically secure session token (`crypto.randomUUID()`).
   - Inserts session into `sessions` table in Cloudflare D1 (expires in 7 days).
   - Issues HTTP-only, Secure, SameSite=Lax cookie: `admin_session`.

4. CREDENTIAL UPDATES (Stage 12 Fix):
   - POST /api/admin/update-email:
     * Verifies `admin_session` cookie.
     * Verifies current password with bcrypt against D1 hash.
     * Checks email uniqueness in D1 `users` table.
     * Updates `users.email` in D1.
   - POST /api/admin/update-password:
     * Verifies `admin_session` cookie.
     * Verifies current password with bcrypt against D1 hash.
     * Validates new password length (minimum 8 characters).
     * Hashes new password with bcrypt (10 rounds).
     * Updates `users.password_hash` in D1.
