# Stage 18.5: Custom Pages Builder + Account Pages Redesign

## Overview
Stage 18.5 delivers a high-capability **Custom Pages Builder** for store administrators alongside a complete visual and functional redesign of all **Customer Account Pages** using the Stage 18 Chronicles Purple Design System.

---

## 1. Scope & Execution Parameters
- **Target Environment**: `ecommerce-store-perf-test` (Cloudflare Worker)
- **Repository**: `Abdullah6551199/ecommerce-store-performance-test`
- **D1 Database**: `ecommerce-perf-db`
- **Zero Green Policy**: Full replacement of all legacy green (`emerald-`, `green-`, `#080e0a`) elements with the unified purple color system.

---

## 2. Part A: Custom Pages Builder

### 2.1 Admin Pages Management (`/admin/pages`)
The Pages CMS manager separates pages into two distinct tiers:
1. **CORE PAGES (Protected, Cannot Be Deleted)**:
   - Covers 8 core routes: Home (`/`), About Us (`/about`), Contact Us (`/contact`), Privacy Policy (`/privacy-policy`), Terms & Conditions (`/terms`), Returns Policy (`/returns`), Shipping Info (`/shipping`), and FAQ (`/faq`).
   - Actions: `[Reset to Default Template]`, `[View]`, `[Edit]`.
   - Cannot be deleted by administrators (delete button hidden, backend route blocks deletion with a 400 status).
   - If unpublished, core pages remain in the database but hide from navigation menus.
2. **CUSTOM PAGES (Full CRUD)**:
   - Store owners can create brand stories, size guides, sustainability pledges, or campaign landing pages.
   - Actions: `[View]`, `[Edit]`, and `[Delete]` with modal confirmation.
   - Toggles for `Show in Header` and `Show in Footer`.

### 2.2 Create / Edit Page Modal
Comprehensive page authoring modal featuring:
- **Metadata Fields**: Page Title, Auto-generated URL slug (locked for core pages), layout template selection.
- **Templates**: Blank, Standard Content, About Us Style, Contact Style, FAQ Style, Custom HTML.
- **Rich Text Formatting Toolbar**: Headings (H1–H4), paragraph, bold, italic, underline, bullet lists, numbered lists, blockquotes, horizontal dividers, links, buttons with customizable URLs, video embeds (YouTube/Vimeo), and markdown/HTML tables.
- **Image Upload Integration**: Direct R2 image upload via file selector or manual image URL entry.
- **Pre-built Section Library**:
  - Hero Section (vibrant purple gradient with CTA)
  - Text + Image (2-column responsive layout)
  - 3-Column Feature Cards
  - Team Grid
  - Testimonial Quote Card
  - Stats Row (4 metrics)
  - CTA Banner
  - FAQ Accordion (HTML5 details/summary)
  - Custom HTML container
- **SEO & Social Graph Controls**: Meta title character counter, meta description, and Open Graph image URL.
- **Visibility Controls**: Published / Draft toggle, Show in Header checkbox, Show in Footer checkbox, and Access Level (Public vs. Logged-in only).

### 2.3 Storefront Dynamic Page Renderer (`/pages/[slug]`)
- Rendered via `app/pages/[slug]/page.tsx` using Big White Card container with purple dark mode (`#1E0230`).
- Generates dynamic SEO metadata, Open Graph tags, and canonical URLs.
- Returns 404 for nonexistent or unpublished pages.

### 2.4 Navigation APIs & Component Integration
- `GET /api/pages/navigation`: Returns `{ headerPages, footerPages }`.
- `POST /api/admin/pages/[id]/reset`: Restores core pages to default factory templates.
- Storefront `Header.tsx` and `Footer.tsx` dynamically consume active navigation pages.

---

## 3. Part B: Account Pages Redesign

All customer account surfaces now utilize the Purple color system (`#960DF2`, `#AB3DF5`, `#3C0561`, `#EACFFC`), high-contrast typography, and responsive micro-interactions.

### 3.1 Account Shell & Layout (`/account`)
- Breadcrumbs navigation: `Home / My Account / [Active Section]`.
- Sticky desktop sidebar with purple gradient avatar, active purple indicator pills (`bg-[#960DF2] text-white shadow-md shadow-purple-600/25`), and unread notification badges.
- Responsive mobile menu drawer with quick sign-out.

### 3.2 Dashboard (`/account`)
- Welcome Banner: "Welcome back, [Name]!" with purple gradient backdrop and quick actions ("Browse Store", "View Cart", "View All Orders").
- 4 Quick Stat Cards: Total Orders, Total Spent, Wishlist Count, and Reviews Count.
- Recent Orders summary (last 3) with purple status badges.
- Latest Notifications summary (last 3).

### 3.3 Orders List (`/account/orders`)
- Paginated order cards (10 per page).
- Copyable Order ID button with clipboard feedback toast.
- Status badges: Delivered (`#960DF2`), Shipped (Indigo), Processing (Amber), Confirmed (Purple), Cancelled (Rose).
- Action buttons: "View Details" and "Reorder".
- Empty state: "No orders yet. Start shopping!" prompt.

### 3.4 Order Detail (`/account/orders/[id]`)
- Status timeline with continuous background track, completed checkmark nodes, and active pulsating node.
- Itemized product card list with thumbnail images, variant names, and line totals.
- Financial breakdown with purple discount token.
- Shipping address and payment method card.
- "Download Invoice" print trigger and "Reorder All Items" button.

### 3.5 Wishlist (`/account/wishlist`)
- Responsive product card grid with instant "Remove" action.
- Purple "Move to Cart" button that synchronizes with `CartContext` and triggers the Cart Drawer.
- Empty state with direct "Discover Products" button.

### 3.6 Reviews (`/account/reviews`)
- Customer review cards with star ratings, product thumbnail, review text, and admin replies.
- Purple review status badges: `approved`, `pending`, and `rejected`.
- Edit and delete review modal (restricted to pending submissions).

### 3.7 Saved Addresses (`/account/addresses`)
- Card grid with prominent purple "Default" address badge.
- "+ Add New Address" primary purple action button.
- Add/Edit modal with purple-focused inputs, validation, and default toggle.

### 3.8 Profile Settings (`/account/profile`)
- Personal Information form with purple input borders and save confirmation alerts.
- Change Password card with character length validation.
- Danger zone: Delete Customer Account modal with password verification.

### 3.9 Notification Center (`/account/notifications`)
- Filter pills: All, Unread, Read.
- Notification cards with purple category icons (replacing legacy green icons).
- "Mark as Read", "Delete", and "Mark All as Read" actions.

---

## 4. Verification & Green Sweep
- **Green Sweep**: Zero occurrences of legacy green (`emerald-`, `green-`, `#080e0a`, `#0c140f`) remain across `/account` or `/pages` surfaces.
- **Build Verification**: `npm run build` executed successfully with 0 errors across all 49 routes.
- **Version Tag**: Tagged as `v2.0`.
