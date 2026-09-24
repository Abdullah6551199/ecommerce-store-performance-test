# Nasrify Themes Framework — 12 Section Components Catalog

The Themes Framework ships with 12 core section components located in `nasrify-store/components/themes/sections/`. Each section supports multiple visual variants and flexible configuration options.

---

## 1. AnnouncementBar (`announcement`)
Displays top notification or promotional banner with link and dismiss option.
- **Variants**: `solid`, `subtle`
- **Settings**:
  - `text`: string (e.g. "Free shipping on orders over $50")
  - `link`: string (optional URL)
  - `bg_color`: HEX color override
  - `text_color`: HEX color override
  - `dismissible`: boolean

## 2. Header (`header`)
Primary storefront navigation bar with logo, dynamic menu links, search, cart, and account buttons.
- **Variants**: `classic`, `centered`, `minimal`
- **Settings**:
  - `logo_text`: string (brand name)
  - `logo_url`: string (optional image logo)
  - `menu_items`: Array<{ label: string; url: string }>
  - `show_search`: boolean
  - `show_cart`: boolean
  - `show_account`: boolean
  - `sticky`: boolean

## 3. Hero (`hero`)
High-impact visual showcase with heading, subheading, CTA button, and background imagery.
- **Variants**: `full_image`, `split`, `minimal`
- **Settings**:
  - `heading`: string
  - `subheading`: string
  - `cta_text`: string
  - `cta_link`: string
  - `image_url`: string (Unsplash / CDN image)
  - `height`: string (e.g. "600px", "500px")
  - `overlay_opacity`: number (0.0 to 1.0)
  - `alignment`: 'left' | 'center' | 'right'

## 4. ProductGrid (`product_grid`)
Responsive grid displaying products with pricing, ratings, badges, and Add-to-Cart actions.
- **Variants**: `standard`, `compact`
- **Settings**:
  - `heading`: string (e.g. "Featured Products")
  - `subheading`: string
  - `columns`: number (2, 3, or 4)
  - `rows`: number
  - `show_price`: boolean
  - `show_rating`: boolean
  - `show_add_to_cart`: boolean

## 5. ProductCarousel (`product_carousel`)
Smooth, horizontal product slider with navigation arrows and dot indicators.
- **Variants**: `scroll`, `cards`
- **Settings**:
  - `heading`: string (e.g. "New Arrivals")
  - `autoplay`: boolean
  - `show_arrows`: boolean
  - `show_dots`: boolean

## 6. Categories (`categories`)
Visual grid of store product collections with imagery and quick shop links.
- **Variants**: `grid`, `pills`, `cards`
- **Settings**:
  - `heading`: string (e.g. "Shop by Category")
  - `columns`: number (3, 4, 6)
  - `image_style`: 'rounded' | 'circle' | 'square'

## 7. Testimonials (`testimonials`)
Social proof showcase with customer quotes, avatars, ratings, and roles.
- **Variants**: `cards`, `slider`, `minimal`
- **Settings**:
  - `heading`: string
  - `layout`: 'cards' | 'grid'
  - `items`: Array<{ text: string; author: string; role: string; avatar: string }>

## 8. Newsletter (`newsletter`)
Subscription capture section for discounts, marketing drops, and company news.
- **Variants**: `inline`, `boxed`
- **Settings**:
  - `heading`: string (e.g. "Subscribe for updates")
  - `subheading`: string
  - `placeholder`: string
  - `button_text`: string
  - `bg_color`: HEX color override

## 9. Banner (`banner`)
Full-width promotional banner for seasonal sales, announcements, or product highlights.
- **Variants**: `full_width`, `boxed`
- **Settings**:
  - `heading`: string (e.g. "Summer Sale — 30% Off")
  - `text`: string
  - `cta_text`: string
  - `cta_link`: string
  - `image_url`: string
  - `overlay`: number (0.0 to 1.0)
  - `height`: string

## 10. ImageText (`image_text`)
50/50 editorial split with media on one side and brand storytelling or feature highlights on the other.
- **Variants**: `image_left`, `image_right`
- **Settings**:
  - `heading`: string
  - `text`: string
  - `cta_text`: string
  - `cta_link`: string
  - `image_url`: string

## 11. FAQ (`faq`)
Accessible accordion component for frequently asked questions.
- **Variants**: `accordion`, `grid`
- **Settings**:
  - `heading`: string
  - `items`: Array<{ question: string; answer: string }>

## 12. Footer (`footer`)
Multi-column footer layout with navigation links, copyright notice, and social media handles.
- **Variants**: `standard`, `minimal`
- **Settings**:
  - `logo_text`: string
  - `columns`: Array<{ title: string; links: Array<{ label: string; url: string }> }>
  - `social_links`: Array<{ platform: string; url: string }>
  - `copyright`: string
  - `newsletter_signup`: boolean
