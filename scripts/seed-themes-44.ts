import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Base page defaults copied from standard architecture
const basePageDefaults = {
  product: [
    {
      id: "pd-product-gallery",
      type: "product_gallery",
      variant: "classic",
      enabled: true,
      settings: { layout: "carousel", thumbnails_position: "bottom", zoom: "on" },
    },
    {
      id: "pd-product-info",
      type: "product_info",
      variant: "standard",
      enabled: true,
      settings: {
        show_sku: true,
        show_brand: true,
        show_rating: true,
        show_compare: true,
        show_wishlist: true,
        button_text: "Add to Cart",
        button_style: "primary",
      },
    },
    {
      id: "pd-product-tabs",
      type: "product_tabs",
      variant: "standard",
      enabled: true,
      settings: { default_tab: "description" },
    },
    {
      id: "pd-product-reviews",
      type: "product_reviews_section",
      variant: "standard",
      enabled: true,
      settings: { heading: "Customer Reviews", reviews_app_id: "auto", show_summary: true, show_form: true },
    },
    {
      id: "pd-product-related",
      type: "product_related",
      variant: "grid",
      enabled: true,
      settings: { heading: "You May Also Like", max_products: 4, columns: 4 },
    },
  ],
  category: [
    {
      id: "pd-category-header",
      type: "category_header",
      variant: "simple",
      enabled: true,
      settings: { show_breadcrumb: true, show_description: true, layout: "simple" },
    },
    {
      id: "pd-category-filters",
      type: "category_filters",
      variant: "sidebar",
      enabled: true,
      settings: { position: "sidebar", sticky: true, show_price: true, show_categories: true, show_attributes: true },
    },
    {
      id: "pd-category-grid",
      type: "category_grid",
      variant: "standard",
      enabled: true,
      settings: { columns: 3, per_page: 9, show_pagination: true, card_variant: "standard" },
    },
  ],
  cart: [
    {
      id: "pd-cart-layout",
      type: "cart_page_layout",
      variant: "standard",
      enabled: true,
      settings: { show_coupon: true, show_estimated_shipping: true, layout: "standard" },
    },
  ],
  checkout: [
    {
      id: "pd-checkout-layout",
      type: "checkout_page_layout",
      variant: "single_page",
      enabled: true,
      settings: { show_order_notes: true, layout: "single_page" },
    },
  ],
  account: [
    {
      id: "pd-account-dashboard",
      type: "account_dashboard",
      variant: "sidebar",
      enabled: true,
      settings: { show_orders: true, show_addresses: true, show_profile: true, layout: "sidebar" },
    },
  ],
  page: [
    {
      id: "pd-page-header",
      type: "page_header",
      variant: "simple",
      enabled: true,
      settings: { show_breadcrumb: true, alignment: "center" },
    },
    {
      id: "pd-page-content",
      type: "page_content",
      variant: "standard",
      enabled: true,
      settings: { max_width: "max-w-4xl", padding_y: "py-8" },
    },
  ],
  shop: [
    {
      id: "pd-shop-header",
      type: "page_header",
      variant: "simple",
      enabled: true,
      settings: { show_breadcrumb: true, alignment: "left" },
    },
    {
      id: "pd-shop-filters",
      type: "category_filters",
      variant: "horizontal",
      enabled: true,
      settings: { position: "top", show_price: true, show_categories: true, show_attributes: true },
    },
    {
      id: "pd-shop-grid",
      type: "category_grid",
      variant: "standard",
      enabled: true,
      settings: { columns: 4, per_page: 12, show_pagination: true, card_variant: "standard" },
    },
  ],
};

interface ThemeDefinition {
  slug: string;
  name: string;
  version: string;
  description: string;
  category: string;
  pricing: string;
  author: string;
  settings: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      text_muted: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: {
      container_width: string;
      section_spacing: string;
      border_radius: string;
      button_radius: string;
    };
    logo: {
      type: string;
      text: string;
      color: string;
    };
  };
  sections: Array<{
    id: string;
    type: string;
    variant: string;
    enabled: boolean;
    settings?: Record<string, any>;
  }>;
}

const THEMES: ThemeDefinition[] = [
  // 1. MINIMAL
  {
    slug: "minimal",
    name: "Apex Minimal",
    version: "1.0.0",
    description: "Ultra-clean monochromatic design with sharp geometry, refined whitespace, and pure focus.",
    category: "minimal",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#18181B",
        secondary: "#52525B",
        accent: "#000000",
        background: "#FFFFFF",
        surface: "#F4F4F5",
        text: "#18181B",
        text_muted: "#71717A",
        border: "#E4E4E7",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
      layout: {
        container_width: "1240px",
        section_spacing: "48px",
        border_radius: "2px",
        button_radius: "2px",
      },
      logo: {
        type: "text",
        text: "MINIMAL",
        color: "#18181B",
      },
    },
    sections: [
      {
        id: "min-announcement",
        type: "announcement",
        variant: "minimal",
        enabled: true,
        settings: {
          text: "Complimentary worldwide shipping on orders over $75",
          link: "/shop",
          dismissible: true,
        },
      },
      {
        id: "min-header",
        type: "header",
        variant: "classic",
        enabled: true,
        settings: {
          logo_text: "MINIMAL",
          sticky: true,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "min-hero",
        type: "hero",
        variant: "split",
        enabled: true,
        settings: {
          heading: "Simplicity in Every Detail",
          subheading: "Essential objects designed with precision, intentionality, and quiet elegance.",
          cta_text: "Shop Collection",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "min-products",
        type: "product_grid",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Curated Essentials",
          subheading: "Refined everyday staples made to last",
          columns: 3,
          rows: 2,
          show_price: true,
          show_rating: true,
          show_add_to_cart: true,
        },
      },
      {
        id: "min-image-text",
        type: "image_text",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Crafted With Restraint",
          text: "Every seam, edge, and contour serves a deliberate purpose. Free of superficial clutter, our collection lets quality speak.",
          cta_text: "Our Philosophy",
          cta_link: "/about",
          image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "min-footer",
        type: "footer",
        variant: "minimal",
        enabled: true,
        settings: {
          logo_text: "MINIMAL",
          copyright: "© 2026 Minimal Storefront. All rights reserved.",
        },
      },
    ],
  },

  // 2. BOLD
  {
    slug: "bold",
    name: "Apex Bold",
    version: "1.0.0",
    description: "High-contrast dark mode with neon amber accents, punchy typography, and statement hero banners.",
    category: "bold",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#F59E0B",
        secondary: "#D97706",
        accent: "#FBBF24",
        background: "#09090B",
        surface: "#18181B",
        text: "#FAFAFA",
        text_muted: "#A1A1AA",
        border: "#27272A",
      },
      fonts: {
        heading: "Space Grotesk",
        body: "Inter",
      },
      layout: {
        container_width: "1320px",
        section_spacing: "80px",
        border_radius: "0px",
        button_radius: "0px",
      },
      logo: {
        type: "text",
        text: "BOLD.",
        color: "#F59E0B",
      },
    },
    sections: [
      {
        id: "bold-header",
        type: "header",
        variant: "minimal",
        enabled: true,
        settings: {
          logo_text: "BOLD.",
          sticky: true,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "bold-hero",
        type: "hero",
        variant: "fullscreen",
        enabled: true,
        settings: {
          heading: "UNCOMPROMISING SPEED & IMPACT",
          subheading: "Engineered for those who make bold moves. Next-generation apparel and gear.",
          cta_text: "EXPLORE NOW",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=1600&auto=format&fit=crop",
          height: "650px",
          overlay_opacity: 0.65,
        },
      },
      {
        id: "bold-carousel",
        type: "product_carousel",
        variant: "scroll",
        enabled: true,
        settings: {
          heading: "HEAVY HITTERS",
          show_arrows: true,
        },
      },
      {
        id: "bold-banner",
        type: "banner",
        variant: "full_width",
        enabled: true,
        settings: {
          heading: "NO COMPROMISES. NO LIMITS.",
          text: "Limited release drops available exclusively online while supplies last.",
          cta_text: "GRAB YOURS",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1600&auto=format&fit=crop",
        },
      },
      {
        id: "bold-testimonials",
        type: "testimonials",
        variant: "cards",
        enabled: true,
        settings: {
          heading: "WHAT THE CREW SAYS",
        },
      },
      {
        id: "bold-newsletter",
        type: "newsletter",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "JOIN THE REBELLION",
          subheading: "First dibs on private drops and exclusive offers.",
          button_text: "SUBSCRIBE",
        },
      },
      {
        id: "bold-footer",
        type: "footer",
        variant: "expanded",
        enabled: true,
        settings: {
          logo_text: "BOLD.",
          copyright: "© 2026 BOLD Retail Inc.",
        },
      },
    ],
  },

  // 3. LUXURY
  {
    slug: "luxury",
    name: "Maison Luxury",
    version: "1.0.0",
    description: "Refined editorial aesthetic with gold accents, warm cream tones, and bespoke masonry collections.",
    category: "luxury",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#D4A574",
        secondary: "#A27B5C",
        accent: "#E2C799",
        background: "#FDFCFB",
        surface: "#F7F5F0",
        text: "#1C1917",
        text_muted: "#78716C",
        border: "#E7E5E4",
      },
      fonts: {
        heading: "Playfair Display",
        body: "Lato",
      },
      layout: {
        container_width: "1280px",
        section_spacing: "96px",
        border_radius: "2px",
        button_radius: "2px",
      },
      logo: {
        type: "text",
        text: "MAISON & CO.",
        color: "#D4A574",
      },
    },
    sections: [
      {
        id: "lux-announcement",
        type: "announcement",
        variant: "solid",
        enabled: true,
        settings: {
          text: "Complimentary White Glove Delivery on Fine Goods",
          bg_color: "#D4A574",
          text_color: "#1C1917",
          link: "/shop",
          dismissible: false,
        },
      },
      {
        id: "lux-header",
        type: "header",
        variant: "centered",
        enabled: true,
        settings: {
          logo_text: "MAISON & CO.",
          sticky: false,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "lux-hero",
        type: "hero",
        variant: "split",
        enabled: true,
        settings: {
          heading: "Timeless Elegance, Enduring Craft",
          subheading: "An exquisite curation of heritage craftsmanship, rare materials, and timeless aesthetic.",
          cta_text: "Discover Collection",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "lux-categories",
        type: "categories",
        variant: "masonry",
        enabled: true,
        settings: {
          heading: "Private Collections",
        },
      },
      {
        id: "lux-products",
        type: "product_grid",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Curated Masterpieces",
          subheading: "Pieces designed to transcend fleeting seasonal trends",
          columns: 2,
          rows: 2,
          show_price: true,
          show_rating: true,
          show_add_to_cart: true,
        },
      },
      {
        id: "lux-image-text",
        type: "image_text",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Centuries of Heritage",
          text: "Every piece tells a storied lineage of artisanal mastery, hand-selected stones, and bespoke silhouettes.",
          cta_text: "Our Heritage",
          cta_link: "/about",
          image_url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "lux-testimonials",
        type: "testimonials",
        variant: "quote",
        enabled: true,
        settings: {
          heading: "Patron Acclaim",
        },
      },
      {
        id: "lux-footer",
        type: "footer",
        variant: "standard",
        enabled: true,
        settings: {
          logo_text: "MAISON & CO.",
          copyright: "© 2026 Maison Luxury Group. All rights reserved.",
        },
      },
    ],
  },

  // 4. FASHION
  {
    slug: "fashion",
    name: "Atelier Fashion",
    version: "1.0.0",
    description: "High-fashion lookbook style featuring full-bleed banners, circular categories, and blush pastel hues.",
    category: "fashion",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#E07A7A",
        secondary: "#F4A4A4",
        accent: "#BE5959",
        background: "#FFF7F7",
        surface: "#FDECEC",
        text: "#3F3F3F",
        text_muted: "#786F6F",
        border: "#F3DCDC",
      },
      fonts: {
        heading: "Cormorant Garamond",
        body: "Raleway",
      },
      layout: {
        container_width: "1320px",
        section_spacing: "64px",
        border_radius: "0px",
        button_radius: "0px",
      },
      logo: {
        type: "text",
        text: "ATELIER",
        color: "#E07A7A",
      },
    },
    sections: [
      {
        id: "fash-header",
        type: "header",
        variant: "centered",
        enabled: true,
        settings: {
          logo_text: "ATELIER",
          sticky: true,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "fash-hero",
        type: "hero",
        variant: "fullscreen",
        enabled: true,
        settings: {
          heading: "AUTUMN / WINTER LOOKBOOK",
          subheading: "Silhouettes tailored for self-expression, fluid textiles, and contemporary poise.",
          cta_text: "View Lookbook",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
          height: "680px",
          overlay_opacity: 0.35,
        },
      },
      {
        id: "fash-carousel",
        type: "product_carousel",
        variant: "scroll",
        enabled: true,
        settings: {
          heading: "Runway Highlights",
          show_arrows: true,
        },
      },
      {
        id: "fash-categories",
        type: "categories",
        variant: "circle",
        enabled: true,
        settings: {
          heading: "Shop by Mood",
          columns: 4,
          image_style: "circle",
        },
      },
      {
        id: "fash-banner",
        type: "banner",
        variant: "side_by_side",
        enabled: true,
        settings: {
          heading: "The Capsule Wardrobe",
          text: "Essential seasonal pieces designed to mix, match, and elevate everyday attire.",
          cta_text: "Shop Capsule",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "fash-products",
        type: "product_grid",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Trending Silhouettes",
          columns: 4,
          rows: 2,
          show_price: true,
          show_rating: true,
          show_add_to_cart: true,
        },
      },
      {
        id: "fash-newsletter",
        type: "newsletter",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "VIP Salon Access",
          subheading: "Receive early invitations to private showroom events and runway drops.",
        },
      },
      {
        id: "fash-footer",
        type: "footer",
        variant: "expanded",
        enabled: true,
        settings: {
          logo_text: "ATELIER",
          copyright: "© 2026 Atelier Fashion Studio.",
        },
      },
    ],
  },

  // 5. TECH
  {
    slug: "tech",
    name: "Nexus Tech",
    version: "1.0.0",
    description: "Futuristic dark slate palette, electric cyan highlights, sleek sticky header, and dense grid layouts.",
    category: "tech",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#0EA5E9",
        secondary: "#0284C7",
        accent: "#38BDF8",
        background: "#0F172A",
        surface: "#1E293B",
        text: "#F8FAFC",
        text_muted: "#94A3B8",
        border: "#334155",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
      layout: {
        container_width: "1320px",
        section_spacing: "64px",
        border_radius: "8px",
        button_radius: "8px",
      },
      logo: {
        type: "text",
        text: "NEXUS // TECH",
        color: "#0EA5E9",
      },
    },
    sections: [
      {
        id: "tech-announcement",
        type: "announcement",
        variant: "gradient",
        enabled: true,
        settings: {
          text: "Cyber Week: 25% Off Hardware Ecosystem with Code NEXUS25",
          link: "/shop",
          dismissible: true,
        },
      },
      {
        id: "tech-header",
        type: "header",
        variant: "classic",
        enabled: true,
        settings: {
          logo_text: "NEXUS // TECH",
          sticky: true,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "tech-hero",
        type: "hero",
        variant: "fullscreen",
        enabled: true,
        settings: {
          heading: "NEXT-GEN HARDWARE ARCHITECTURE",
          subheading: "High-performance compute, neural peripherals, and edge devices built for power creators.",
          cta_text: "Discover Hardware",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
          height: "640px",
          overlay_opacity: 0.6,
        },
      },
      {
        id: "tech-products",
        type: "product_grid",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Flagship Gear",
          columns: 4,
          rows: 2,
          show_price: true,
          show_rating: true,
          show_add_to_cart: true,
        },
      },
      {
        id: "tech-banner",
        type: "banner",
        variant: "boxed",
        enabled: true,
        settings: {
          heading: "Engineered for Overclockers",
          text: "Zero thermal throttling. Unprecedented throughput. Backed by a 5-year hardware guarantee.",
          cta_text: "Spec Sheet",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=1600&auto=format&fit=crop",
        },
      },
      {
        id: "tech-image-text",
        type: "image_text",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Precision CNC Aluminum & Graphene",
          text: "Every enclosure is milled from aerospace-grade 6061 alloy with integrated graphene heat dissipators.",
          cta_text: "Architecture Docs",
          cta_link: "/about",
          image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "tech-testimonials",
        type: "testimonials",
        variant: "grid",
        enabled: true,
        settings: {
          heading: "Verified Engineers",
        },
      },
      {
        id: "tech-newsletter",
        type: "newsletter",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "NEXUS FIRMWARE DISPATCH",
          subheading: "Receive developer updates, patch notes, and hardware launch schedules.",
        },
      },
      {
        id: "tech-footer",
        type: "footer",
        variant: "standard",
        enabled: true,
        settings: {
          logo_text: "NEXUS // TECH",
          copyright: "© 2026 Nexus Hardware Labs Inc.",
        },
      },
    ],
  },

  // 6. ORGANIC
  {
    slug: "organic",
    name: "Verdant Organic",
    version: "1.0.0",
    description: "Earthy botanical tones, forest greens, warm cream background, and warm serif headings.",
    category: "organic",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#166534",
        secondary: "#15803D",
        accent: "#D97706",
        background: "#FEFCE8",
        surface: "#FEF9C3",
        text: "#1C1917",
        text_muted: "#713F12",
        border: "#EAB308",
      },
      fonts: {
        heading: "Lora",
        body: "Open Sans",
      },
      layout: {
        container_width: "1280px",
        section_spacing: "80px",
        border_radius: "12px",
        button_radius: "12px",
      },
      logo: {
        type: "text",
        text: "VERDANT & EARTH",
        color: "#166534",
      },
    },
    sections: [
      {
        id: "org-announcement",
        type: "announcement",
        variant: "minimal",
        enabled: true,
        settings: {
          text: "100% Certified Organic • Carbon Negative Shipping",
          link: "/about",
          dismissible: true,
        },
      },
      {
        id: "org-header",
        type: "header",
        variant: "classic",
        enabled: true,
        settings: {
          logo_text: "VERDANT & EARTH",
          sticky: true,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "org-hero",
        type: "hero",
        variant: "split",
        enabled: true,
        settings: {
          heading: "Nurtured by Nature, Bottled for You",
          subheading: "Wildcrafted botanicals, regenerative farming, and clean formulations free of synthetic additives.",
          cta_text: "Shop Farm Fresh",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "org-image-text",
        type: "image_text",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "From Soil to Shelf",
          text: "We work directly with certified organic growers, ensuring fair wages, non-GMO seeds, and restorative agriculture.",
          cta_text: "Meet Our Growers",
          cta_link: "/about",
          image_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop",
        },
      },
      {
        id: "org-categories",
        type: "categories",
        variant: "grid",
        enabled: true,
        settings: {
          heading: "Pantry & Wellness",
          columns: 3,
        },
      },
      {
        id: "org-products",
        type: "product_grid",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Seasonal Harvest",
          columns: 3,
          rows: 2,
          show_price: true,
          show_rating: true,
          show_add_to_cart: true,
        },
      },
      {
        id: "org-testimonials",
        type: "testimonials",
        variant: "cards",
        enabled: true,
        settings: {
          heading: "From Our Community",
        },
      },
      {
        id: "org-newsletter",
        type: "newsletter",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Join the Regenerative Living Club",
          subheading: "Receive weekly farm recipes, wellness guides, and 15% off your first harvest box.",
        },
      },
      {
        id: "org-footer",
        type: "footer",
        variant: "standard",
        enabled: true,
        settings: {
          logo_text: "VERDANT & EARTH",
          copyright: "© 2026 Verdant Organics Co.",
        },
      },
    ],
  },

  // 7. SPORT
  {
    slug: "sport",
    name: "Velocity Sport",
    version: "1.0.0",
    description: "High-energy athletic theme with dynamic red accents, sharp geometry, and multi-column catalog feeds.",
    category: "sport",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#DC2626",
        secondary: "#B91C1C",
        accent: "#EF4444",
        background: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#0F172A",
        text_muted: "#64748B",
        border: "#E2E8F0",
      },
      fonts: {
        heading: "Poppins",
        body: "Inter",
      },
      layout: {
        container_width: "1320px",
        section_spacing: "48px",
        border_radius: "0px",
        button_radius: "0px",
      },
      logo: {
        type: "text",
        text: "VELOCITY SPORT",
        color: "#DC2626",
      },
    },
    sections: [
      {
        id: "sport-header",
        type: "header",
        variant: "centered",
        enabled: true,
        settings: {
          logo_text: "VELOCITY SPORT",
          sticky: true,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "sport-hero",
        type: "hero",
        variant: "fullscreen",
        enabled: true,
        settings: {
          heading: "FASTER. STRONGER. UNSTOPPABLE.",
          subheading: "High-performance compression wear, trail-tested footwear, and athlete-grade training gear.",
          cta_text: "GEAR UP",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop",
          height: "640px",
          overlay_opacity: 0.5,
        },
      },
      {
        id: "sport-banner",
        type: "banner",
        variant: "full_width",
        enabled: true,
        settings: {
          heading: "THE PRO ATHLETE SERIES",
          text: "Tested and worn by Olympic champions. Engineered for maximum thermal regulation.",
          cta_text: "SEE THE GEAR",
          cta_link: "/shop",
          image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
        },
      },
      {
        id: "sport-products",
        type: "product_grid",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Top Performance Picks",
          columns: 4,
          rows: 2,
          show_price: true,
          show_rating: true,
          show_add_to_cart: true,
        },
      },
      {
        id: "sport-categories",
        type: "categories",
        variant: "list",
        enabled: true,
        settings: {
          heading: "Disciplines & Sports",
        },
      },
      {
        id: "sport-carousel",
        type: "product_carousel",
        variant: "scroll",
        enabled: true,
        settings: {
          heading: "New Equipment Drops",
          show_arrows: true,
        },
      },
      {
        id: "sport-testimonials",
        type: "testimonials",
        variant: "grid",
        enabled: true,
        settings: {
          heading: "Athlete Testimonials",
        },
      },
      {
        id: "sport-footer",
        type: "footer",
        variant: "standard",
        enabled: true,
        settings: {
          logo_text: "VELOCITY SPORT",
          copyright: "© 2026 Velocity Sport Global.",
        },
      },
    ],
  },

  // 8. KIDS
  {
    slug: "kids",
    name: "Playful Kids",
    version: "1.0.0",
    description: "Joyful pastel theme with rounded shapes, bouncy typography, sunny colors, and whimsical layout.",
    category: "kids",
    pricing: "free",
    author: "Nasrify",
    settings: {
      colors: {
        primary: "#EC4899",
        secondary: "#3B82F6",
        accent: "#EAB308",
        background: "#FFFDF0",
        surface: "#FCE7F3",
        text: "#1E293B",
        text_muted: "#64748B",
        border: "#FED7AA",
      },
      fonts: {
        heading: "Nunito",
        body: "Poppins",
      },
      layout: {
        container_width: "1280px",
        section_spacing: "56px",
        border_radius: "16px",
        button_radius: "16px",
      },
      logo: {
        type: "text",
        text: "PLAYFUL & CO 🧸",
        color: "#EC4899",
      },
    },
    sections: [
      {
        id: "kids-announcement",
        type: "announcement",
        variant: "gradient",
        enabled: true,
        settings: {
          text: "🎈 Sunshine Festival: Free Toy with Every Order Over $40! 🌟",
          link: "/shop",
          dismissible: true,
        },
      },
      {
        id: "kids-header",
        type: "header",
        variant: "classic",
        enabled: true,
        settings: {
          logo_text: "PLAYFUL & CO 🧸",
          sticky: true,
          show_search: true,
          show_cart: true,
          show_account: true,
        },
      },
      {
        id: "kids-hero",
        type: "hero",
        variant: "text_only",
        enabled: true,
        settings: {
          heading: "Where Big Imaginations Come to Play! ✨",
          subheading: "Safe, non-toxic toys, cozy organic clothing, and cheerful books crafted for curious little minds.",
          cta_text: "Explore Fun Store",
          cta_link: "/shop",
        },
      },
      {
        id: "kids-categories",
        type: "categories",
        variant: "circle",
        enabled: true,
        settings: {
          heading: "Shop by Wonder World",
          columns: 3,
          image_style: "circle",
        },
      },
      {
        id: "kids-products",
        type: "product_grid",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Little Explorer Favorites",
          columns: 3,
          rows: 2,
          show_price: true,
          show_rating: true,
          show_add_to_cart: true,
        },
      },
      {
        id: "kids-banner",
        type: "banner",
        variant: "boxed",
        enabled: true,
        settings: {
          heading: "100% Kid-Safe & Eco-Friendly Toys",
          text: "Tested for safety, certified non-toxic, and made to withstand endless playtime adventures.",
          cta_text: "Learn Safety Standards",
          cta_link: "/about",
          image_url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1600&auto=format&fit=crop",
        },
      },
      {
        id: "kids-testimonials",
        type: "testimonials",
        variant: "cards",
        enabled: true,
        settings: {
          heading: "Loved by Kids & Parents",
        },
      },
      {
        id: "kids-newsletter",
        type: "newsletter",
        variant: "standard",
        enabled: true,
        settings: {
          heading: "Join the Little Explorers Club",
          subheading: "Fun printables, birthday surprises, and 10% off your next gift order.",
        },
      },
      {
        id: "kids-footer",
        type: "footer",
        variant: "standard",
        enabled: true,
        settings: {
          logo_text: "PLAYFUL & CO 🧸",
          copyright: "© 2026 Playful Kids World Inc.",
        },
      },
    ],
  },
];

function generateThemeSvg(theme: ThemeDefinition): string {
  const { colors, fonts, layout } = theme.settings;
  const radius = parseInt(layout.border_radius) || 4;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&amp;family=Space+Grotesk:wght@500;700&amp;family=Playfair+Display:ital,wght@0,600;1,400&amp;display=swap');
      .heading { font-family: '${fonts.heading}', sans-serif; font-weight: 800; }
      .body { font-family: '${fonts.body}', sans-serif; }
    </style>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.15" />
    </filter>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="800" fill="${colors.background}" />

  <!-- Top Announcement Bar -->
  <rect x="0" y="0" width="1200" height="42" fill="${colors.primary}" />
  <text x="600" y="26" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="600" class="body" letter-spacing="1">
    PREVIEWING ${theme.name.toUpperCase()} • ${theme.category.toUpperCase()} EDITION
  </text>

  <!-- Header Bar -->
  <rect x="0" y="42" width="1200" height="80" fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
  <circle cx="90" cy="82" r="16" fill="${colors.primary}" />
  <text x="120" y="88" fill="${colors.text}" font-size="22" class="heading">${theme.settings.logo.text}</text>

  <!-- Navigation items -->
  <text x="650" y="87" fill="${colors.text}" font-size="14" font-weight="500" class="body">Shop</text>
  <text x="730" y="87" fill="${colors.text}" font-size="14" font-weight="500" class="body">Collections</text>
  <text x="840" y="87" fill="${colors.text}" font-size="14" font-weight="500" class="body">Stories</text>
  <rect x="940" y="64" width="170" height="36" rx="${radius}" fill="${colors.primary}" />
  <text x="1025" y="86" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700" class="body">Explore Store</text>

  <!-- Hero Section Mockup -->
  <g transform="translate(60, 160)">
    <!-- Card Backing -->
    <rect width="1080" height="300" rx="${Math.max(radius, 8)}" fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" filter="url(#shadow)" />

    <!-- Category Pill -->
    <rect x="50" y="45" width="120" height="26" rx="${radius}" fill="${colors.accent}" opacity="0.15" />
    <text x="110" y="62" text-anchor="middle" fill="${colors.accent}" font-size="11" font-weight="700" class="body">
      ${theme.category.toUpperCase()}
    </text>

    <!-- Main Title -->
    <text x="50" y="115" fill="${colors.text}" font-size="36" class="heading" letter-spacing="-0.5">
      ${theme.name}
    </text>

    <!-- Subtitle description -->
    <text x="50" y="155" fill="${colors.text_muted}" font-size="16" class="body">
      ${theme.description}
    </text>

    <!-- Spec Badges -->
    <g transform="translate(50, 195)">
      <rect x="0" y="0" width="140" height="32" rx="${radius}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1" />
      <text x="70" y="21" text-anchor="middle" fill="${colors.text}" font-size="12" font-weight="600" class="body">Spacing: ${layout.section_spacing}</text>

      <rect x="150" y="0" width="130" height="32" rx="${radius}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1" />
      <text x="215" y="21" text-anchor="middle" fill="${colors.text}" font-size="12" font-weight="600" class="body">Radius: ${layout.border_radius}</text>

      <rect x="290" y="0" width="170" height="32" rx="${radius}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1" />
      <text x="375" y="21" text-anchor="middle" fill="${colors.text}" font-size="12" font-weight="600" class="body">Font: ${fonts.heading}</text>
    </g>

    <!-- CTA Button -->
    <rect x="50" y="240" width="180" height="42" rx="${radius}" fill="${colors.primary}" />
    <text x="140" y="266" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="700" class="body">Live Preview &rarr;</text>

    <!-- Color Palette Swatches inside Hero -->
    <g transform="translate(680, 50)">
      <text x="0" y="0" fill="${colors.text_muted}" font-size="12" font-weight="600" class="body">PALETTE TOKENS</text>
      
      <circle cx="20" cy="35" r="18" fill="${colors.primary}" stroke="#000000" stroke-opacity="0.1" />
      <text x="20" y="70" text-anchor="middle" fill="${colors.text_muted}" font-size="10" class="body">Primary</text>

      <circle cx="75" cy="35" r="18" fill="${colors.secondary}" stroke="#000000" stroke-opacity="0.1" />
      <text x="75" y="70" text-anchor="middle" fill="${colors.text_muted}" font-size="10" class="body">Secondary</text>

      <circle cx="130" cy="35" r="18" fill="${colors.accent}" stroke="#000000" stroke-opacity="0.1" />
      <text x="130" y="70" text-anchor="middle" fill="${colors.text_muted}" font-size="10" class="body">Accent</text>

      <circle cx="185" cy="35" r="18" fill="${colors.surface}" stroke="${colors.border}" stroke-width="2" />
      <text x="185" y="70" text-anchor="middle" fill="${colors.text_muted}" font-size="10" class="body">Surface</text>

      <circle cx="240" cy="35" r="18" fill="${colors.background}" stroke="${colors.border}" stroke-width="2" />
      <text x="240" y="70" text-anchor="middle" fill="${colors.text_muted}" font-size="10" class="body">Canvas</text>
    </g>
  </g>

  <!-- Showcase Products Mini-Grid -->
  <g transform="translate(60, 490)">
    <!-- Card 1 -->
    <rect x="0" y="0" width="340" height="260" rx="${Math.max(radius, 6)}" fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
    <rect x="20" y="20" width="300" height="130" rx="${radius}" fill="url(#primaryGrad)" opacity="0.85" />
    <circle cx="170" cy="85" r="28" fill="#FFFFFF" opacity="0.3" />
    <text x="20" y="180" fill="${colors.text}" font-size="16" font-weight="700" class="heading">Featured Product Alpha</text>
    <text x="20" y="205" fill="${colors.primary}" font-size="16" font-weight="800" class="body">$149.00</text>
    <rect x="20" y="220" width="300" height="28" rx="${radius}" fill="${colors.primary}" />
    <text x="170" y="238" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700" class="body">Add to Cart</text>

    <!-- Card 2 -->
    <rect x="370" y="0" width="340" height="260" rx="${Math.max(radius, 6)}" fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
    <rect x="390" y="20" width="300" height="130" rx="${radius}" fill="${colors.secondary}" opacity="0.85" />
    <circle cx="540" cy="85" r="28" fill="#FFFFFF" opacity="0.3" />
    <text x="390" y="180" fill="${colors.text}" font-size="16" font-weight="700" class="heading">Signature Edition Beta</text>
    <text x="390" y="205" fill="${colors.primary}" font-size="16" font-weight="800" class="body">$289.00</text>
    <rect x="390" y="220" width="300" height="28" rx="${radius}" fill="${colors.primary}" />
    <text x="540" y="238" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700" class="body">Add to Cart</text>

    <!-- Card 3 -->
    <rect x="740" y="0" width="340" height="260" rx="${Math.max(radius, 6)}" fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
    <rect x="760" y="20" width="300" height="130" rx="${radius}" fill="${colors.accent}" opacity="0.85" />
    <circle cx="910" cy="85" r="28" fill="#FFFFFF" opacity="0.3" />
    <text x="760" y="180" fill="${colors.text}" font-size="16" font-weight="700" class="heading">Limited Capsule Gamma</text>
    <text x="760" y="205" fill="${colors.primary}" font-size="16" font-weight="800" class="body">$89.00</text>
    <rect x="760" y="220" width="300" height="28" rx="${radius}" fill="${colors.primary}" />
    <text x="910" y="238" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700" class="body">Add to Cart</text>
  </g>
</svg>`;
}

async function main() {
  const rootDir = path.resolve(__dirname, "..");
  const themesDir = path.join(rootDir, "themes");
  const previewsDir = path.join(rootDir, "themes", "previews");

  if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir, { recursive: true });
  }
  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true });
  }

  console.log(`[Stage 44] Creating 8 Theme directories, manifests, theme.json, and SVG mockups...`);

  const now = Date.now();
  const sqlStatements: string[] = [];

  for (const theme of THEMES) {
    const themeDir = path.join(themesDir, theme.slug);
    if (!fs.existsSync(themeDir)) {
      fs.mkdirSync(themeDir, { recursive: true });
    }

    // 1. Write manifest.json
    const manifest = {
      slug: theme.slug,
      name: theme.name,
      version: theme.version,
      description: theme.description,
      author: theme.author,
      category: theme.category,
      pricing: theme.pricing,
    };
    fs.writeFileSync(
      path.join(themeDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8"
    );

    // 2. Generate SVG mockup
    const svgContent = generateThemeSvg(theme);
    const svgPath = path.join(previewsDir, `${theme.slug}.svg`);
    fs.writeFileSync(svgPath, svgContent, "utf-8");

    // Also copy preview SVG to public dir of nasrify-store & nasrify-themes for instant local fallback
    const storePublicPreviews = path.join(rootDir, "nasrify-store", "public", "themes", "previews");
    const themesPublicPreviews = path.join(rootDir, "nasrify-themes", "public", "themes", "previews");
    if (!fs.existsSync(storePublicPreviews)) fs.mkdirSync(storePublicPreviews, { recursive: true });
    if (!fs.existsSync(themesPublicPreviews)) fs.mkdirSync(themesPublicPreviews, { recursive: true });
    fs.writeFileSync(path.join(storePublicPreviews, `${theme.slug}.svg`), svgContent, "utf-8");
    fs.writeFileSync(path.join(themesPublicPreviews, `${theme.slug}.svg`), svgContent, "utf-8");

    // 3. Write theme.json (schema_version 1.0)
    const previewUrl = `https://nasrify-store.zia291930.workers.dev/api/media/themes/previews/${theme.slug}.svg`;
    const themeJsonObj = {
      schema_version: "1.0",
      slug: theme.slug,
      name: theme.name,
      version: theme.version,
      description: theme.description,
      category: theme.category,
      is_built_in: 0,
      settings: theme.settings,
      sections: theme.sections,
      page_defaults: basePageDefaults,
    };

    const themeJsonStr = JSON.stringify(themeJsonObj, null, 2);
    fs.writeFileSync(path.join(themeDir, "theme.json"), themeJsonStr, "utf-8");

    // 4. SQL statements for D1 themes and theme_marketplace_listings
    const escapedJson = themeJsonStr.replace(/'/g, "''");
    const escapedDesc = theme.description.replace(/'/g, "''");
    const escapedName = theme.name.replace(/'/g, "''");
    const themeId = `theme-${theme.slug}`;

    sqlStatements.push(`
INSERT INTO themes (
  id, slug, name, version, description, author, author_url,
  preview_url, screenshot_urls, category, theme_json, is_built_in,
  status, created_at, updated_at
) VALUES (
  '${themeId}',
  '${theme.slug}',
  '${escapedName}',
  '${theme.version}',
  '${escapedDesc}',
  'Nasrify',
  'https://nasrify.shop',
  '${previewUrl}',
  '["${previewUrl}"]',
  '${theme.category}',
  '${escapedJson}',
  0,
  'published',
  ${now},
  ${now}
) ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  preview_url = excluded.preview_url,
  category = excluded.category,
  theme_json = excluded.theme_json,
  status = 'published',
  updated_at = ${now};

INSERT INTO theme_marketplace_listings (
  id, theme_id, version, name, description, author, author_url,
  preview_url, screenshot_urls, category, pricing, price, status,
  config_json, created_at, updated_at
) VALUES (
  'listing-${theme.slug}',
  '${theme.slug}',
  '${theme.version}',
  '${escapedName}',
  '${escapedDesc}',
  'Nasrify',
  'https://nasrify.shop',
  '${previewUrl}',
  '["${previewUrl}"]',
  '${theme.category}',
  'free',
  0,
  'approved',
  '${escapedJson}',
  ${now},
  ${now}
) ON CONFLICT(id) DO UPDATE SET
  theme_id = excluded.theme_id,
  name = excluded.name,
  description = excluded.description,
  preview_url = excluded.preview_url,
  category = excluded.category,
  status = 'approved',
  config_json = excluded.config_json,
  updated_at = ${now};
`);
  }

  // 5. Upload SVGs to R2 bucket ecommerce-perf-assets
  console.log("\n[Stage 44] Uploading SVG mockups to R2 bucket 'ecommerce-perf-assets'...");
  for (const theme of THEMES) {
    const svgPath = path.join(previewsDir, `${theme.slug}.svg`);
    const r2Key = `themes/previews/${theme.slug}.svg`;
    try {
      console.log(`Uploading ${r2Key} to R2...`);
      execSync(
        `npx.cmd wrangler r2 object put ecommerce-perf-assets/${r2Key} --file="${svgPath}" --content-type="image/svg+xml" --remote`,
        { cwd: rootDir, stdio: "pipe" }
      );
      console.log(`✓ Uploaded ${r2Key}`);
    } catch (e: any) {
      console.warn(`Warning: R2 upload failed for ${r2Key} (${e.message}). Proceeding...`);
    }
  }

  // 6. Write and execute SQL file
  const seedSqlFile = path.join(rootDir, "scripts", "seed-themes-44.sql");
  fs.writeFileSync(seedSqlFile, sqlStatements.join("\n"), "utf-8");

  console.log("\n[Stage 44] Executing SQL seed on local D1...");
  try {
    execSync(`npx.cmd wrangler d1 execute ecommerce-perf-db --local --file="${seedSqlFile}"`, {
      cwd: rootDir,
      stdio: "inherit",
    });
    console.log("✓ Local D1 seeded successfully!");
  } catch (e: any) {
    console.warn("Notice: Local D1 seed finished with message:", e.message);
  }

  console.log("\n[Stage 44] Executing SQL seed on remote D1...");
  try {
    execSync(`npx.cmd wrangler d1 execute ecommerce-perf-db --remote --file="${seedSqlFile}"`, {
      cwd: rootDir,
      stdio: "inherit",
    });
    console.log("✓ Remote D1 seeded successfully!");
  } catch (e: any) {
    console.error("Remote D1 seed error:", e.message);
    throw e;
  }

  console.log("\n✓ [Stage 44] All 8 themes created, SVG mockups generated, and D1 seeded!");
}

main().catch((err) => {
  console.error("Fatal error in seed-themes-44:", err);
  process.exit(1);
});
