# Storefront Themes Page Wiring Guide

This document specifies how all storefront routes in **Nasrify** are wired into the **Themes Framework**, including default sections, store data bindings, and architectural best practices.

---

## 1. Page Wiring Architecture

Every storefront page in `nasrify-store/app/` follows one of two patterns:

### Pattern A: Full Theme Sections (`renderPageTheme`)
Pages composed of dynamic, reorderable sections configured in `theme.json` (`page_defaults`):
- Product Page (`/product/[slug]`)
- Category Page (`/category/[slug]`)
- Shop Page (`/shop`)
- Cart Page (`/cart`)
- Checkout Page (`/checkout`)
- Account Dashboard (`/account`)
- CMS & Static Pages (`/about`, `/contact`, `/privacy-policy`, `/terms`, `/pages/[slug]`)

```tsx
import { renderPageTheme } from "@/lib/themes/engine";
import { getActiveTheme } from "@/lib/themes/loader";

export default async function AnyStorefrontPage({ params, searchParams }) {
  const theme = await getActiveTheme();
  const storeData = await fetchPageData(params);

  return (
    <div className="theme-page theme-page-type min-h-screen">
      {renderPageTheme(theme, "pageType", storeData)}
    </div>
  );
}
```

### Pattern B: CSS Variables & Building Blocks
Specialized interactive pages that maintain their custom app layouts while adopting global theme tokens:
- Order Success (`/order-success/[orderId]`)
- Order Tracking (`/track-order`)
- Product Comparison (`/compare`)
- Wishlist (`/wishlist`)
- Product Bundles (`/bundles`, `/bundles/[slug]`)
- Customer Auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`)
- Customer Account Subpages (`/account/orders`, `/account/addresses`, `/account/profile`, etc.)

These pages consume:
- Colors: `var(--theme-primary)`, `var(--theme-accent)`, `var(--theme-surface)`, `var(--theme-text)`, `var(--theme-border)`
- Reusable Building Blocks: `Button`, `Badge`, `ProductCard`, `PriceTag`, `RatingStars`

---

## 2. Page Defaults Mapping Matrix

| Page Route | Page Type Key | Default Sections | Data Injected in `storeData` |
| :--- | :--- | :--- | :--- |
| `/product/[slug]` | `product` | `product_gallery`<br/>`product_info`<br/>`product_tabs`<br/>`product_reviews_section`<br/>`product_related` | `product`<br/>`images`<br/>`variants`<br/>`rating_summary`<br/>`reviews`<br/>`related_products` |
| `/category/[slug]` | `category` | `category_header`<br/>`category_filters`<br/>`category_grid` | `category`<br/>`products`<br/>`filters`<br/>`breadcrumbs` |
| `/shop` | `shop` | `page_header`<br/>`category_filters`<br/>`category_grid` | `title: "Shop"`<br/>`products`<br/>`filters` |
| `/cart` | `cart` | `cart_page_layout` | Client-side cart hook (`useCart`) + coupon extensions |
| `/checkout` | `checkout` | `checkout_page_layout` | Client-side checkout flow (shipping, taxes, COD) |
| `/account` | `account` | `account_dashboard` | Customer session, order stats, recent orders |
| `/about`, `/contact`, `/terms`, `/privacy-policy`, `/pages/[slug]` | `page` | `page_header`<br/>`page_content` | `page: { title, content, slug }` |

---

## 3. Section Details & Capabilities

### `product_info`
- Dynamic variant selection (size, color, material)
- Live price updates with compare-at strikethrough and discount percentage badge
- Quantity picker with real-time stock limits
- Core buttons:
  - **Add to Cart** (with loading state and cart drawer trigger)
  - **Buy Now** (direct skip-to-checkout flow)
  - **Wishlist Heart** (integrated with Wishlist app context)
  - **Compare Button** (integrated with Compare app context)
  - **WhatsApp Order Button** (fires `StorefrontProductBelow` extension point)

### `cart_page_layout`
- Live line item editing (increase, decrease, remove)
- Free shipping progress threshold indicator
- Dynamic coupon code validation via Coupons app extension (`CouponsSection`)
- Order subtotal, estimated shipping, tax, and total
- Primary Checkout button + secondary WhatsApp Cart Order button

### `checkout_page_layout`
- Customer contact info and guest checkout
- Address selector with saved customer addresses
- Dynamic real-time shipping rate calculation (`/api/shipping/calculate`)
- Dynamic tax rate calculation (`/api/tax/calculate`)
- Cash on Delivery (COD) payment processing with order placement
- Order review summary and WhatsApp direct order option

### `category_grid` / `shop`
- Responsive product cards powered by the `ProductCard` building block
- Real-time sort dropdown (price ascending/descending, newest, top-rated)
- Pagination controls with total item counter
- Filter sidebar integration (price range, in-stock only)

---

## 4. How to Add a New Page to the Theme System

To wire a new storefront page into the Themes Framework:

1. **Add Section Default Configuration**:
   In `nasrify-store/lib/themes/default-theme.ts` (and `nasrify-admin/lib/themes/default-theme.ts`):
   ```ts
   page_defaults: {
     ...
     my_new_page: [
       { id: "p-hdr", type: "page_header", enabled: true, settings: { show_breadcrumb: true } },
       { id: "p-grid", type: "category_grid", enabled: true, settings: { columns: 4 } }
     ]
   }
   ```

2. **Create the Page Component**:
   In `nasrify-store/app/my-page/page.tsx`:
   ```tsx
   import { getActiveTheme } from "@/lib/themes/loader";
   import { renderPageTheme } from "@/lib/themes/engine";

   export default async function MyPage() {
     const theme = await getActiveTheme();
     const storeData = await fetchMyData();

     return (
       <div className="theme-page theme-page-my-page min-h-screen">
         {renderPageTheme(theme, "my_new_page", storeData)}
       </div>
     );
   }
   ```

3. **Verify Error Boundaries**:
   `renderPageTheme` wraps each section inside `SectionErrorBoundary`, ensuring that any runtime error within a single section gracefully falls back without taking down the entire page.
