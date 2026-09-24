# Nasrify Themes Framework — Section Components Catalog (25 Sections)

The Themes Framework ships with 25 core section components located in `nasrify-store/components/themes/sections/` and a suite of shared UI building blocks in `nasrify-store/components/themes/blocks/`. Each section supports multiple visual variants and flexible configuration options.

---

## Shared Building Blocks (`components/themes/blocks/`)

1. **`ProductCard`**
   - **Props**: `{ product, showPrice, showRating, showAddToCart, variant, className }`
   - **Variants**: `standard`, `compact`, `minimal`, `hover_details`
   - Integrated with cart context (`useCart`), status badges, and dynamic theme tokens.

2. **`PriceTag`**
   - **Props**: `{ price, salePrice, currency, size, className }`
   - Formats regular and discounted pricing with strikethrough styling and primary brand accents.

3. **`RatingStars`**
   - **Props**: `{ rating, count, showNumber, size, className }`
   - Renders 5-star SVGs with half-star rating fill, numeric score, and review count badge.

4. **`Button`**
   - **Props**: `{ variant, size, isLoading, fullWidth, ...buttonAttributes }`
   - **Variants**: `primary`, `secondary`, `outline`, `ghost`
   - Respects `--theme-button-radius` and `--theme-primary` hover transitions.

5. **`Badge`**
   - **Props**: `{ text, variant, size, className }`
   - **Variants**: `sale`, `new`, `primary`, `outline`, `secondary`

---

## Core Storefront Sections (12)

### 1. AnnouncementBar (`announcement` / `announcement_bar`)
Displays top notification or promotional banner with link and dismiss option.
- **Variants**: `solid`, `subtle`
- **Settings**: `text`, `link`, `bg_color`, `text_color`, `dismissible`

### 2. Header Navigation (`header`)
Primary storefront navigation bar with logo, dynamic menu links, search, cart, and account buttons.
- **Variants**: `classic`, `centered`, `minimal`
- **Settings**: `logo_text`, `logo_url`, `menu_items`, `show_search`, `show_cart`, `show_account`, `sticky`

### 3. Hero (`hero`)
High-impact visual showcase with heading, subheading, CTA button, and background imagery.
- **Variants**: `full_image`, `split`, `minimal`
- **Settings**: `heading`, `subheading`, `cta_text`, `cta_link`, `image_url`, `height`, `overlay_opacity`, `alignment`

### 4. ProductGrid (`product_grid`)
Responsive grid displaying products with pricing, ratings, badges, and Add-to-Cart actions.
- **Variants**: `standard`, `compact`
- **Settings**: `heading`, `subheading`, `columns`, `rows`, `show_price`, `show_rating`, `show_add_to_cart`

### 5. ProductCarousel (`product_carousel`)
Smooth, horizontal product slider with navigation arrows and dot indicators.
- **Variants**: `scroll`, `cards`
- **Settings**: `heading`, `autoplay`, `show_arrows`, `show_dots`

### 6. Categories (`categories`)
Visual grid of store product collections with imagery and quick shop links.
- **Variants**: `grid`, `pills`, `cards`
- **Settings**: `heading`, `columns`, `image_style`

### 7. Testimonials (`testimonials`)
Social proof showcase with customer quotes, avatars, ratings, and roles.
- **Variants**: `cards`, `slider`, `minimal`
- **Settings**: `heading`, `layout`, `items`

### 8. Newsletter (`newsletter`)
Subscription capture section for discounts, marketing drops, and company news.
- **Variants**: `inline`, `boxed`
- **Settings**: `heading`, `subheading`, `placeholder`, `button_text`, `bg_color`

### 9. Banner (`banner`)
Full-width promotional banner for seasonal sales, announcements, or product highlights.
- **Variants**: `full_width`, `boxed`
- **Settings**: `heading`, `text`, `cta_text`, `cta_link`, `image_url`, `overlay`, `height`

### 10. ImageText (`image_text`)
Split editorial section with image and text column for storytelling and feature highlights.
- **Variants**: `image_left`, `image_right`
- **Settings**: `heading`, `text`, `cta_text`, `cta_link`, `image_url`

### 11. FAQ (`faq`)
Interactive accordion section answering common buyer inquiries.
- **Variants**: `accordion`, `grid`
- **Settings**: `heading`, `items`

### 12. Footer (`footer`)
Comprehensive storefront footer with multi-column links, newsletter, social handles, and copyright.
- **Variants**: `standard`, `minimal`
- **Settings**: `logo_text`, `columns`, `social_links`, `copyright`, `newsletter_signup`

---

## Page-Specific Sections (13 New)

### 13. ProductGallery (`product_gallery`)
Interactive multi-angle image gallery with thumbnail navigation and zoom functionality.
- **Variants**: `classic`, `modern`, `minimal`
- **Settings**:
  - `layout`: `grid` | `carousel` | `stack`
  - `thumbnails_position`: `left` | `bottom`
  - `zoom`: `on` | `off`

### 14. ProductInfo (`product_info`)
Comprehensive product details card with title, pricing, sku, brand, variant selector, and Add-to-Cart.
- **Variants**: `standard`, `compact`, `wide`
- **Settings**:
  - `show_sku`: boolean
  - `show_brand`: boolean
  - `show_rating`: boolean
  - `show_compare`: boolean
  - `show_wishlist`: boolean
  - `button_text`: string
  - `button_style`: `primary` | `outline`

### 15. ProductTabs (`product_tabs`)
Tabbed or accordion container for descriptions, technical specifications, and delivery guidelines.
- **Variants**: `standard`, `accordion`
- **Settings**:
  - `tabs`: Array<{ id: string; label: string; content?: string }>
  - `default_tab`: string

### 16. ProductReviewsSection (`product_reviews_section`)
Shopper reviews breakdown, verified review cards, and interactive review submission drawer.
- **Settings**:
  - `heading`: string
  - `reviews_app_id`: string (default "auto")
  - `show_summary`: boolean
  - `show_form`: boolean

### 17. ProductRelated (`product_related`)
Cross-sell product recommendation block displaying related or complementary items.
- **Variants**: `grid`, `carousel`
- **Settings**:
  - `heading`: string
  - `max_products`: number
  - `columns`: number

### 18. CategoryHeader (`category_header`)
Collection page title banner with optional background imagery and breadcrumb path.
- **Variants**: `simple`, `banner`, `centered`
- **Settings**:
  - `show_breadcrumb`: boolean
  - `show_description`: boolean
  - `layout`: `simple` | `banner` | `centered`

### 19. CategoryFilters (`category_filters`)
Refinement sidebar or horizontal bar for collections, price threshold slider, and availability.
- **Variants**: `sidebar`, `horizontal`, `drawer`
- **Settings**:
  - `position`: `sidebar` | `top`
  - `sticky`: boolean
  - `show_price`: boolean
  - `show_categories`: boolean
  - `show_attributes`: boolean

### 20. CategoryGrid (`category_grid`)
Paginated product catalog grid supporting responsive multi-column layouts and card variants.
- **Settings**:
  - `columns`: number (2, 3, or 4)
  - `per_page`: number
  - `show_pagination`: boolean
  - `card_variant`: `standard` | `compact` | `minimal`

### 21. CartPageLayout (`cart_page_layout`)
Full cart page template with editable item quantities, coupon application, and financial summary.
- **Variants**: `standard`, `compact`
- **Settings**:
  - `show_coupon`: boolean
  - `show_estimated_shipping`: boolean
  - `layout`: `standard` | `compact`

### 22. CheckoutPageLayout (`checkout_page_layout`)
Seamless checkout flow supporting contact/shipping forms, delivery notes, and payment options.
- **Variants**: `single_page`, `multistep`
- **Settings**:
  - `show_order_notes`: boolean
  - `layout`: `single_page` | `multistep`

### 23. AccountDashboard (`account_dashboard`)
Customer portal with order history, address management, and profile credentials.
- **Variants**: `sidebar`, `tabs`, `cards`
- **Settings**:
  - `show_orders`: boolean
  - `show_addresses`: boolean
  - `show_profile`: boolean
  - `layout`: `sidebar` | `tabs` | `cards`

### 24. PageHeader (`page_header`)
Header banner and breadcrumbs for standard content and CMS pages.
- **Variants**: `simple`, `banner`
- **Settings**:
  - `show_breadcrumb`: boolean
  - `alignment`: `left` | `center`

### 25. PageContent (`page_content`)
Rich HTML/Markdown CMS article container styled with typography tokens.
- **Settings**:
  - `max_width`: string (e.g. `max-w-4xl`)
  - `padding_y`: string (e.g. `py-8`)
