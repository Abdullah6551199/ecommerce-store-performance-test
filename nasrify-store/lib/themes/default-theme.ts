import { ThemeConfig } from "./types";

export const DEFAULT_THEME: ThemeConfig = {
  schema_version: "1.0",
  name: "Nasrify Default",
  version: "1.0.0",
  settings: {
    colors: {
      primary: "#18181B",
      secondary: "#52525B",
      accent: "#2563EB",
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
      container_width: "1280px",
      section_spacing: "64px",
      border_radius: "8px",
    },
  },
  sections: [
    {
      id: "sec-announcement",
      type: "announcement",
      variant: "solid",
      enabled: true,
      settings: {
        text: "Free shipping on orders over $50",
        link: "/shop",
        bg_color: "#18181B",
        text_color: "#FFFFFF",
        dismissible: true,
      },
    },
    {
      id: "sec-header",
      type: "header",
      variant: "classic",
      enabled: true,
      settings: {
        logo_text: "Nasrify Store",
        logo_url: "",
        menu_items: [
          { label: "Shop", url: "/shop" },
          { label: "Categories", url: "/#categories" },
          { label: "About", url: "/about" },
          { label: "Contact", url: "/contact" },
        ],
        show_search: true,
        show_cart: true,
        show_account: true,
        sticky: true,
      },
    },
    {
      id: "sec-hero",
      type: "hero",
      variant: "full_image",
      enabled: true,
      settings: {
        heading: "Elevate Your Lifestyle with Modern Essentials",
        subheading:
          "Premium craftsmanship, minimalist design, and uncompromised quality engineered for everyday elegance.",
        cta_text: "Explore Collection",
        cta_link: "/shop",
        image_url:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
        height: "600px",
        overlay_opacity: 0.45,
        alignment: "center",
      },
    },
    {
      id: "sec-product-grid",
      type: "product_grid",
      variant: "standard",
      enabled: true,
      settings: {
        heading: "Featured Products",
        subheading: "Hand-picked favorites crafted for perfection",
        columns: 4,
        rows: 2,
        show_price: true,
        show_rating: true,
        show_add_to_cart: true,
      },
    },
    {
      id: "sec-categories",
      type: "categories",
      variant: "grid",
      enabled: true,
      settings: {
        heading: "Shop by Category",
        columns: 4,
        image_style: "rounded",
      },
    },
    {
      id: "sec-banner",
      type: "banner",
      variant: "full_width",
      enabled: true,
      settings: {
        heading: "Summer Sale — 30% Off",
        text: "Discover selected premium items at limited-time promotional pricing. Use code SUMMER30 at checkout.",
        cta_text: "Claim Discount",
        cta_link: "/shop",
        image_url:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
        overlay: 0.5,
        height: "400px",
      },
    },
    {
      id: "sec-testimonials",
      type: "testimonials",
      variant: "cards",
      enabled: true,
      settings: {
        heading: "What Our Customers Say",
        layout: "cards",
        items: [
          {
            text: "The build quality and attention to detail exceeded my expectations. Outstanding shopping experience from start to finish!",
            author: "Sarah Jenkins",
            role: "Verified Buyer",
            avatar:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
          },
          {
            text: "Super fast delivery and the products feel extraordinarily premium. Easily the best online store I've encountered.",
            author: "Michael Vance",
            role: "Verified Buyer",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
          },
          {
            text: "Minimalist aesthetics paired with exceptional durability. Nasrify sets the bar for modern e-commerce.",
            author: "Elena Rostova",
            role: "Design Director",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
          },
        ],
      },
    },
    {
      id: "sec-product-carousel",
      type: "product_carousel",
      variant: "scroll",
      enabled: true,
      settings: {
        heading: "New Arrivals",
        autoplay: false,
        show_arrows: true,
        show_dots: true,
      },
    },
    {
      id: "sec-newsletter",
      type: "newsletter",
      variant: "inline",
      enabled: true,
      settings: {
        heading: "Subscribe for updates",
        subheading: "Get exclusive early access to drops, member discounts, and design insights.",
        placeholder: "Enter your email address...",
        button_text: "Subscribe",
        bg_color: "#F4F4F5",
      },
    },
    {
      id: "sec-footer",
      type: "footer",
      variant: "standard",
      enabled: true,
      settings: {
        logo_text: "Nasrify Store",
        columns: [
          {
            title: "Shop",
            links: [
              { label: "All Products", url: "/shop" },
              { label: "Featured", url: "/shop?filter=featured" },
              { label: "New Arrivals", url: "/shop?filter=new" },
              { label: "Sale", url: "/shop?filter=sale" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About Us", url: "/about" },
              { label: "Contact", url: "/contact" },
              { label: "FAQ", url: "/faq" },
            ],
          },
          {
            title: "Policies",
            links: [
              { label: "Privacy Policy", url: "/privacy-policy" },
              { label: "Terms of Service", url: "/terms" },
              { label: "Shipping & Returns", url: "/shipping" },
              { label: "Cookie Policy", url: "/cookie-policy" },
            ],
          },
          {
            title: "Customer Care",
            links: [
              { label: "My Account", url: "/account" },
              { label: "Track Order", url: "/track-order" },
              { label: "Wishlist", url: "/wishlist" },
            ],
          },
        ],
        social_links: [
          { platform: "twitter", url: "https://twitter.com" },
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "github", url: "https://github.com" },
        ],
        copyright: "© 2026 Nasrify Inc. All rights reserved.",
        newsletter_signup: true,
      },
    },
  ],
};
