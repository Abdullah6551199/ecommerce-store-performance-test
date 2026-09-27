# Components Catalog (Elementor-Style Micro-Components)

The Nasrify Theme Engine features a comprehensive component-level editing system (Stage 47). Every component inside a section functions as an autonomous micro-section equipped with independent styling, advanced layout settings, responsive breakpoints, animations, and hover controls.

---

## 1. Core Migrated Components (15)

These components exist natively inside section layouts and can be independently inspected and customized with full style and advanced controls:

| Component Type | Label | Category | Description | Key Controls |
| :--- | :--- | :--- | :--- | :--- |
| `heading` | Heading (h1-h6) | Content | Structural headline element | Text, Tag (h1-h6), Size, Alignment, Typography |
| `subheading` | Subheading | Content | Supporting narrative text | Text, Size, Color, Spacing |
| `paragraph` | Paragraph / Rich Text | Content | Multi-line body text with HTML formatting | Rich text editor, Color, Typography |
| `button` | Button / CTA | Content | Interactive call-to-action button | Text, Link, Style (Solid/Outline/Ghost), Icon, Hover |
| `image` | Image Element | Content | Responsive raster or vector image | URL, Alt text, Object Fit, Aspect Ratio, Crop, Border Radius |
| `icon` | Icon | Content | Graphical symbol or badge icon | Icon Name/SVG, Size, Color, Rotation |
| `badge` | Status Badge | Content | Pill badge indicating status or promo tag | Text, Variant (Success/Warning/Info/Sale), Color |
| `link` | Text Link | Content | Inline or standalone hyperlink | Text, URL, Underline, Target (_blank/_self) |
| `product_card` | Product Card | E-commerce | Compact item showcase with image, price, title | Product ID, Badge, Shadow, Border, Quick View |
| `category_card`| Category Card | E-commerce | Visual card linking to a collection | Category ID, Overlay Opacity, Height |
| `testimonial_card`| Testimonial Card| Content | Customer quote, author name, avatar, rating | Quote text, Author, Rating, Avatar URL |
| `faq_item` | FAQ Item | Content | Single collapsible question and answer block | Question, Answer, Default Open |
| `price_tag` | Price Tag | E-commerce | Dynamic currency display with sale strikethrough | Regular Price, Sale Price, Currency Symbol |
| `rating_stars` | Rating Stars | Content | 5-star visual rating display | Rating Score (0-5), Count, Star Color |
| `stock_indicator` | Stock Indicator | E-commerce | Urgency inventory badge (In Stock / Low Stock) | Stock Count, Threshold, Pulse Animation |

---

## 2. Basic Components (12)

| Component Type | Label | Default Values | Purpose & Features |
| :--- | :--- | :--- | :--- |
| `divider` | Divider | Style: solid, Height: 1px, Width: 100% | Section separator line supporting solid, dashed, dotted, or gradient styles. |
| `spacer` | Spacer | Height: 32px | Responsive vertical blank space with independent desktop/tablet/mobile height controls. |
| `icon_box` | Icon Box | Icon: ⚡, Heading, Description | Feature highlight box pairing an icon, title, and descriptive text. |
| `image_box` | Image Box | Image URL, Heading, Description | Visual showcase pairing an image header with copy. |
| `alert_box` | Alert Box | Type: info, Dismissible: true | Notification callout banner (info, success, warning, danger). |
| `progress_bar` | Progress Bar | Value: 75%, Height: 8px | Animated milestone bar with optional percentage badge and striped fill. |
| `counter` | Counter | Target: 1000, Suffix: "+", Duration: 2s | Animated numeric metric that counts up upon entering the viewport. |
| `tabs` | Tabs | 3 tabs (Overview, Specs, Reviews) | Dynamic switching container displaying content panels on tab click. |
| `accordion` | Accordion | 3 items, Multiple expand support | Collapsible vertical accordion for detailed specifications or FAQs. |
| `icon_list` | Icon List | 3 items with checkmarks | Bulleted list using custom icons or emojis for checkmarks. |
| `social_icons` | Social Icons | Facebook, Twitter, Instagram, TikTok | Brand social profile links with customizable color and icon size. |
| `custom_html` | Custom HTML | Sandboxed code embed | Advanced raw HTML, SVG, or embed container with XSS sanitization. |

---

## 3. E-commerce Components (10)

| Component Type | Label | Default Values | Purpose & Features |
| :--- | :--- | :--- | :--- |
| `add_to_cart_btn` | Add to Cart Button | Label: "Add to Cart", Icon: 🛒 | Instant shopping cart addition button with variant linking and stock validation. |
| `buy_now_btn` | Buy Now Button | Label: "Buy Now", Color: Accent | Direct-to-checkout 1-click purchasing button for accelerated conversion. |
| `quantity_selector` | Quantity Selector | Min: 1, Max: 99, Step: 1 | Interactive increment/decrement numeric counter input. |
| `variant_selector` | Variant Selector | Size, Color pill/dropdown | SKU option chooser supporting color swatches and button pills. |
| `wishlist_button` | Wishlist Button | Heart icon | Toggle button saving item to customer wishlist in local storage and database. |
| `compare_button` | Compare Button | Compare icon | Adds item to cross-product comparison drawer. |
| `product_price` | Product Price Display | Current + Old price | Formatted pricing with dynamic discount percentage badge. |
| `countdown_timer` | Countdown Timer | End time, Format: D:H:M:S | Urgency ticker counting down to flash sale or promo deal conclusion. |
| `rating_input` | Rating Input | 5 interactive stars | Review submission component allowing shoppers to leave star scores. |
| `share_buttons` | Social Share | WhatsApp, Twitter, Facebook, Copy | Share sheet buttons for viral promotion of product or section page. |

---

## 4. Form Components (5)

| Component Type | Label | Fields & Capabilities |
| :--- | :--- | :--- |
| `form_field` | Form Field | Input types: text, email, phone, number with placeholder and required validation. |
| `textarea_field` | Textarea Field | Multi-line text input with row count controls and character limit counter. |
| `checkbox_radio` | Checkbox / Radio | Single or multi-choice selectable option with custom accent styling. |
| `select_dropdown` | Select / Dropdown | Native or custom option dropdown with configurable choices. |
| `submit_button` | Submit Button | Form submission trigger with loading state and success feedback. |

---

## 5. Media Components (5)

| Component Type | Label | Media Source & Rendering |
| :--- | :--- | :--- |
| `video_player` | Video Player | Supports YouTube, Vimeo embed URLs, or MP4 direct video files with autoplay and loop controls. |
| `audio_player` | Audio Player | Web audio player supporting MP3/AAC streams with custom playback controls. |
| `gallery_grid` | Image Gallery | Responsive multi-column photo grid with lightbox zoom and gap controls. |
| `slideshow` | Slideshow Carousel | Auto-playing image banner with slide dots, next/prev arrows, and transition timings. |
| `lightbox_image` | Lightbox Image | Single photo that opens into a full-screen zoomed modal overlay on click. |

---

## 6. Architecture & Scoped CSS

Every component renders inside the section with a scoped class:
```css
.section-{sectionId} .component-{componentId} {
  /* Dynamic typography, background, border, shadow, hover */
}
```
All components are fully validated using Zod, sanitized against XSS, and cache-accelerated via Cloudflare Workers.
