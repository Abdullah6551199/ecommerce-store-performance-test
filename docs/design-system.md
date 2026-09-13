# Chronicles Purple Design System

## Overview
The Chronicles Purple Design System establishes a unified, high-performance visual language for the storefront. Built on an 8-shade purple brand palette, modern typography, glassmorphism, responsive micro-interactions, and accessible light/dark modes, this design system powers all customer-facing surfaces and admin managers.

---

## 1. Color System

### 1.1 Brand Purple Palette
The brand color hierarchy consists of 8 precisely tuned purple hues:

| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| `--purple-50` | `#EACFFC` | Very Light Lavender | Section backgrounds, pill tags, subtle borders |
| `--purple-100` | `#D59EFA` | Light Purple | Secondary badges, borders, gradients |
| `--purple-200` | `#C06EF7` | Medium Light Purple | Hover borders, accent glows |
| `--purple-300` | `#AB3DF5` | Medium Purple | Secondary buttons, interactive accents |
| `--purple-400` | `#960DF2` | **PRIMARY BRAND COLOR** | Primary buttons, active highlights, key CTAs |
| `--purple-500` | `#780AC2` | Deep Purple | Button hover states, active navigation |
| `--purple-600` | `#5A0891` | Dark Purple | Secondary headings, dark mode surfaces |
| `--purple-700` | `#3C0561` | Very Dark Purple | Primary headings, dark mode base background |

### 1.2 Light Mode (Storefront Default)
- **Background Primary**: `#FFFFFF` (Pure White)
- **Background Secondary**: `#EACFFC` (Very Light Lavender for alternate sections)
- **Surface**: `#FFFFFF` (Cards, dropdowns, modal windows)
- **Surface Hover**: `#EACFFC` (Interactive card and row highlight)
- **Primary Brand**: `#960DF2` (Vibrant Purple)
- **Primary Hover**: `#780AC2` (Deep Purple)
- **Secondary**: `#AB3DF5`
- **Accent**: `#C06EF7`
- **Text Heading**: `#3C0561` (Very Dark Purple for high contrast readability)
- **Text Body**: `#5A0891` (Dark Purple)
- **Text Muted**: `#780AC2` (Subtle captions and meta text)
- **Border**: `#D59EFA`
- **Border Subtle**: `#EACFFC`

### 1.3 Dark Mode (Toggle)
- **Background Primary**: `#3C0561` (Very Dark Purple base)
- **Background Secondary**: `#5A0891` (Dark Purple section containers)
- **Surface**: `#5A0891` (Dark purple cards)
- **Surface Hover**: `#780AC2`
- **Primary Brand**: `#960DF2`
- **Primary Hover**: `#AB3DF5`
- **Secondary**: `#AB3DF5`
- **Accent**: `#C06EF7`
- **Text Heading**: `#EACFFC` (Lavender for high contrast against dark purple)
- **Text Body**: `#D59EFA`
- **Text Muted**: `#C06EF7`
- **Border**: `#780AC2`
- **Border Subtle**: `#5A0891`

### 1.4 CSS Custom Properties (`app/globals.css`)
```css
:root {
  --purple-50: #EACFFC;
  --purple-100: #D59EFA;
  --purple-200: #C06EF7;
  --purple-300: #AB3DF5;
  --purple-400: #960DF2;
  --purple-500: #780AC2;
  --purple-600: #5A0891;
  --purple-700: #3C0561;

  --bg-primary: #FFFFFF;
  --bg-secondary: #EACFFC;
  --surface: #FFFFFF;
  --surface-hover: #EACFFC;
  --primary: #960DF2;
  --primary-hover: #780AC2;
  --secondary: #AB3DF5;
  --accent: #C06EF7;
  --text-heading: #3C0561;
  --text-body: #5A0891;
  --text-muted: #780AC2;
  --border: #D59EFA;
  --border-subtle: #EACFFC;
}

:root.dark, html.dark {
  --bg-primary: #3C0561;
  --bg-secondary: #5A0891;
  --surface: #5A0891;
  --surface-hover: #780AC2;
  --primary: #960DF2;
  --primary-hover: #AB3DF5;
  --secondary: #AB3DF5;
  --accent: #C06EF7;
  --text-heading: #EACFFC;
  --text-body: #D59EFA;
  --text-muted: #C06EF7;
  --border: #780AC2;
  --border-subtle: #5A0891;
}
```

---

## 2. Typography & Letter Spacing

- **Font Family**: Modern Inter sans-serif font stack.
- **Headings**:
  - Weights: `font-bold` (700) to `font-black` (900).
  - Letter Spacing: Tight (`tracking-tight`, `-0.02em`).
  - Colors: Light Mode: `#3C0561` / Dark Mode: `#EACFFC`.
- **Body**:
  - Weights: `font-normal` (400) to `font-medium` (500).
  - Letter Spacing: Standard (`tracking-normal`).
  - Line Height: Generous (`leading-relaxed`, 1.6 - 1.7) for optimal scanning.

---

## 3. Spacing, Radius & Shadows

### 3.1 Layout Scale
- **Max Width**: `max-w-7xl` (1280px) centered with responsive horizontal padding (`px-4 sm:px-6 lg:px-8`).

### 3.2 Border Radius Tokens
| Element | Radius Class | Pixel Equivalent |
| :--- | :--- | :--- |
| **Buttons** | `rounded-lg` | `8px` |
| **Product Cards** | `rounded-xl` | `12px` |
| **Large Sections / Modals** | `rounded-3xl` | `24px` |
| **Pills & Badges** | `rounded-full` | `9999px` |

### 3.3 Shadow Tokens
- Soft, purple-tinted ambient lighting:
  - `shadow-sm`: `0 1px 2px 0 rgba(60, 5, 97, 0.05)`
  - `shadow-md`: `0 4px 6px -1px rgba(60, 5, 97, 0.08), 0 2px 4px -2px rgba(60, 5, 97, 0.05)`
  - `shadow-xl`: `0 20px 25px -5px rgba(60, 5, 97, 0.12), 0 8px 10px -6px rgba(60, 5, 97, 0.08)`
  - `shadow-purple`: `0 10px 25px -5px rgba(150, 13, 242, 0.35)` (used on key CTAs and hero elements)

---

## 4. Design Tokens (`config/tokens.ts`)
Reusable tokens exported as typed constants for programmatic CSS-in-JS and inline component styling:
- `tokens.colors.purple`: Complete 8-shade values.
- `tokens.colors.light` & `tokens.colors.dark`: Semantic color pairings.
- `tokens.radius`: `btn: '8px'`, `card: '12px'`, `pill: '9999px'`, `section: '24px'`.
- `tokens.transitions`: `fast: '150ms ease'`, `base: '200ms cubic-bezier(0.4, 0, 0.2, 1)'`, `smooth: '300ms ease-out'`.
- `tokens.zIndex`: standard layer ordering (`header: 40`, `dropdown: 50`, `drawer: 60`, `modal: 70`, `toast: 80`).

---

## 5. Components Specification

### 5.1 Buttons
- **Primary**: Solid purple (`bg-[#960DF2] hover:bg-[#780AC2]`), white text, `rounded-lg`, `px-6 py-3`, active scale `0.98`.
- **Secondary**: Outlined purple (`border border-purple-400 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30`).
- **Ghost**: No border, purple text (`text-purple-600 hover:bg-purple-50/60`).
- **Disabled**: `opacity-50 pointer-events-none`.

### 5.2 Product Cards (`ProductCard.tsx`)
- Pure white background (`dark:bg-purple-900/40`), `1px solid var(--border-subtle)`, `rounded-xl`.
- Aspect ratio: `1:1` square media container with hover zoom (`group-hover:scale-105`).
- Top-left: Purple discount badge (`bg-purple-600 text-white rounded-full px-2.5 py-0.5 text-xs font-bold`).
- Top-right: Wishlist heart icon button with soft glass background.
- Bottom: Slide-up "Quick Add" purple CTA on desktop hover, accessible tap button on mobile.
- Ratings: 5-star gold score + review count badge.
- Pricing: Purple current price (`text-[#960DF2] font-black`), struck-through original price in muted tone.

### 5.3 Badges & Pills
- Pill shape (`rounded-full`), small uppercase text (`text-xs tracking-wider font-bold`).
- Palette: Light purple background (`--purple-50`), dark purple text (`--purple-600`).

### 5.4 Forms & Inputs
- Inputs: White background (`dark:bg-purple-950/60`), purple border on focus (`focus:border-purple-500 focus:ring-1 focus:ring-purple-500`), `rounded-lg`.
- Labels: Small, dark purple text (`text-xs font-semibold`).
- Error messages: Crisp red text (`text-xs text-red-600`) with alert icons.

---

## 6. Homepage Chronicles Layout Architecture

The homepage is organized into a sequence of responsive sections:
1. **Top Announcement Bar**: Purple background (`--purple-400`), white text, auto-rotating 4s cycle (Shipping, 30-Day Returns, App Discount, Phone number).
2. **Main Header**: Sticky glass navigation with purple brand icon, Home, Shop, Categories, Women, Men, Accessories, Blog, Contact, multi-column Mega Menus, and right-side search, wishlist, cart count, account, and dark mode toggle.
3. **Sub-Navigation Bar**: Light purple background (`--purple-50`) category chips + prominent "Chat Now" CTA.
4. **Hero Carousel**: Multi-slide carousel with 5s auto-rotation, arrow controls, dots, high-res lifestyle imagery with LCP prioritization.
5. **Category Cards Row**: 5-column responsive layout with scale + purple shadow hover effect.
6. **Trending Products Section**: Interactive tabs (Best Seller, New Arrivals, Top Rated) with 5-column responsive grid and slide-up Quick Add.
7. **Trust Bar**: 4-column reassurance strip (Free Worldwide Shipping, 30-Day Returns, Secure Payment, 24/7 Support) on `--purple-50`.
8. **New Arrivals Showcase**: Gradient promo block with discount badge, CTA, and lifestyle media.
9. **Brand Logos Row**: Grayscale partner brand marquee strip.
10. **Newsletter Section**: Gradient purple banner with email subscription and privacy reassurance.
11. **Footer**: Rich 5-column layout (Brand, Shop, Company, Support, Legal) + bottom bar with credit card and digital wallet payment icons.

---

## 7. Cart, Shop & Category Page Patterns (Stage 18.2)

### 7.1 Cart Drawer & Coupons
- **Zero-Green Rule**: All green/emerald accents (`#18C729`, `text-emerald-*`) replaced with the Chronicles purple tokens.
- **Free Shipping Bar**: Purple gradient from `#C06EF7` (`--purple-200`) to `#960DF2` (`--purple-400`) over a `--purple-50` background.
- **"Apply Best Coupon" Button**: Prominent gradient (`from-purple-600 via-purple-500 to-purple-400 text-white font-extrabold`).
- **Applied Coupon Badges**: Soft purple tint (`bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700`).

### 7.2 Cart Page (`/cart`)
- **Two-Column Layout**: Left-hand 8-column products table + Right-hand 4-column sticky order summary card.
- **Products Table**: Columns for Remove, Product (1:1 square media, name, SKU, variant pills), Unit Price, Quantity Stepper, and Line Subtotal in bold purple.
- **Order Summary**: Clear breakdown of subtotal, coupon discounts, shipping threshold indicators, sales tax estimate, and grand total.
- **Integration**: Reusable `TrustBar` and `CouponsSection` components embedded directly into the page flow.
- **Empty State**: Friendly illustration card with primary purple CTA to browse the catalog.

### 7.3 Shop Page (`/shop`)
- **Hero Banner**: Purple gradient header (`from-purple-700 via-purple-800 to-[#3C0561]`) with high-contrast typography and catalog badge.
- **Filter Controls**: Multi-facet sidebar with Categories, Brands, Price Range slider/inputs, In-Stock filter, and Tags pills.
- **View Toggle**: Quick switch between responsive Grid view and horizontal List view.
- **Active Filter Chips**: Dismissable filter chips with active purple indicators.
- **Pagination**: High-contrast purple active page controls (`bg-purple-600 text-white font-bold`).

### 7.4 Category Page (`/category/[slug]`)
- **Category Hero**: Dynamic background with ambient glow and optional category banner image overlay.
- **Breadcrumb Navigation**: Home > Categories > [Category Name] in purple tones.
- **Subcategory Cards**: Clean cards with hover scale and purple border transitions.
- **Category SEO Card**: Structured footer card highlighting category background copy and search metadata.

