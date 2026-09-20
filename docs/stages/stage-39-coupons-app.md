# Stage 39 — Coupons & Discounts Modular App Conversion

## 1. Overview & Objectives
Stage 39 marks the conversion of the final core feature—**Coupons & Discounts**—into a self-contained, modular installable app (`apps/coupons/`). With this conversion complete, 100% of the planned core features and add-ons in the Nasrify ecosystem operate as decoupled apps that can be installed, configured, uninstalled, and reinstalled without data loss.

- **App ID**: `coupons`
- **Name**: Coupons & Discounts
- **Version**: `1.0.0`
- **Category**: Marketing & Sales
- **Database Tables Preserved**: `coupons`, `coupon_usages` (in Cloudflare D1 `ecommerce-perf-db`)
- **Permissions**: `read:products`, `read:orders`, `read:customers`, `read:settings`
- **Extension Points**:
  - `storefront.cart.below`: Renders `CouponInput` inside shopping bag drawers and `/cart`
  - `storefront.checkout.below`: Renders `CouponInput` in `/checkout` order summary
  - `admin.dashboard.widget`: Renders `CouponsDashboardWidget` with active coupons, savings, and top coupon
  - `admin.product.form.below`: In-context coupon creation helper

---

## 2. Architecture & File Structure

```
apps/coupons/
├── manifest.json                  # Manifest with settingsSchema and extension points
├── icon.svg                       # Nasrify purple voucher vector icon
├── shared/
│   └── types.ts                   # CouponsAppSettings, CouponValidationResult, Stats, Enums
├── lib/
│   └── coupons.ts                 # Validation engine (8 types), React.cache(), 20s TTL, rate limiter
├── admin/
│   ├── CouponsManager.tsx         # Full CRUD admin panel with filters, search, and duplication
│   ├── CouponsDashboardWidget.tsx # Admin dashboard stats card
│   └── api/
│       ├── list/route.ts          # Filtered & sorted coupon query endpoint
│       ├── create/route.ts        # Zod-validated coupon creation
│       ├── update/route.ts        # Zod-validated coupon update & toggle
│       ├── delete/route.ts        # Coupon deletion with usage cleanup
│       └── stats/route.ts         # High-level aggregate KPIs
└── storefront/
    ├── CouponInput.tsx            # Full & compact coupon input with error handling & auto-apply
    ├── CouponBadge.tsx            # Eligible coupon badge for product cards
    └── api/
        ├── validate/route.ts      # Rate-limited coupon validation endpoint
        └── apply/route.ts         # Session-scoped coupon application endpoint
```

---

## 3. Supported Coupon Types (8 Engine Modes)

The validation engine in `apps/coupons/lib/coupons.ts` supports all 8 coupon strategies:
1. **`percentage`**: Flat percentage deduction across applicable cart lines.
2. **`fixed`**: Flat currency deduction off the order subtotal.
3. **`free_shipping`**: Sets shipping line item to `$0.00` upon qualification.
4. **`buy_x_get_y`**: Tiered BOGO promotions (Buy X quantity, Get Y quantity discounted/free).
5. **`category`**: Percentage discount restricted to matching category IDs.
6. **`product`**: Fixed or percentage discount restricted to specific product SKUs.
7. **`min_order`**: Tiered incentives requiring a minimum cart subtotal.
8. **`first_order`**: Exclusively validated against customer email address order history (`used_count === 0`).

---

## 4. Backwards Compatibility & Root Delegation (Step 7)

All legacy core imports and endpoints across `nasrify-admin` and `nasrify-store` were seamlessly preserved:
- `lib/coupons.ts` → Re-exports all functions and types from `@/apps/coupons/lib/coupons`
- `components/admin/CouponsManager.tsx` → Delegates to `@/apps/coupons/admin/CouponsManager`
- `components/CouponsSection.tsx` → Delegates to `@/apps/coupons/storefront/CouponInput`
- `app/api/coupons/validate/route.ts` → Delegates to `@/apps/coupons/storefront/api/validate/route`
- `app/api/coupons/apply/route.ts` → Delegates to `@/apps/coupons/storefront/api/apply/route`
- `app/api/admin/coupons/route.ts` → Delegates to `@/apps/coupons/admin/api/list` and `create`
- `app/api/admin/coupons/[id]/route.ts` → Delegates to `@/apps/coupons/admin/api/update` and `delete`
- `app/api/admin/coupons/stats/route.ts` → Delegates to `@/apps/coupons/admin/api/stats`

---

## 5. Checkout & Order Integration (Step 5 & 6)

- **Client Storage**: Applied promo codes persist in `localStorage` alongside cart items.
- **Server Confirmation**: When submitting an order (`POST /api/orders`), the backend re-validates the coupon directly against Cloudflare D1.
- **Non-blocking Policy**: If a coupon expires or fails validation at checkout time, the order proceeds with standard pricing and logs a warning, preventing cart abandonment.
- **Usage Auditing**: Valid orders insert an audit row into `coupon_usages` and atomically increment `coupons.used_count`.

---

## 6. Data Safety & Lifecycle (Step 8)

- **Uninstall**: Invoking `POST /api/admin/apps/uninstall` removes the app registration from `installed_apps` and stores the previous settings configuration in `app_install_logs`. **The `coupons` and `coupon_usages` D1 tables are NEVER dropped.**
- **Storefront Gate**: When uninstalled, `CouponInput` and `CouponBadge` detect `enabled: false` / `data === null` and render nothing (`null`).
- **Reinstall**: Reinstalling via `POST /api/admin/apps/install` immediately reactivates the app with all historical promo codes, redemptions, and statistics intact.

---

## 7. Edge Deployment & Live Verification

### Worker Versions Deployed
- **`nasrify-admin`**: `0e7f5150-6640-46f2-8151-8db37e9fe478` (Upload: 11436.32 KiB)
- **`nasrify-store`**: `6358286b-3469-417e-9d61-12dc74c78d52` (Upload: 10544.27 KiB)
- **`nasrify-apps`**: `aef36203-8c3d-445d-b63c-3c5beb12a23f` (Upload: 6537.00 KiB)

### Automated Test Matrix (`scripts/verify-stage-39.ts`)
- **Total Tests**: 20
- **Passed**: 20
- **Failed**: 0
- **Latency Audit**:
  - Cart Page: 2167ms (target <2500ms)
  - Checkout Page: 183ms (target <2500ms)
