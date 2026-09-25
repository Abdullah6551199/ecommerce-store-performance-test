export interface ThemeConfig {
  id?: string;
  schema_version: string; // "1.0"
  name: string;
  version: string;
  description?: string;
  category?: string;
  is_built_in?: number | boolean;

  settings: {
    colors: {
      primary: string;
      primary_dark?: string;
      primary_light?: string;
      secondary?: string;
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
      container_width: string; // "1280px"
      section_spacing: string; // "64px"
      border_radius: string; // "8px"
      button_radius?: string; // "8px"
    };
    logo?: {
      type?: "text" | "image";
      text?: string;
      color?: string;
      gradient?: string;
    };
    logo_url?: string;
    logo_text?: string;
  };

  sections: ThemeSection[];
  page_defaults?: Record<string, ThemeSection[]>;
}

export interface ThemeSection {
  id: string; // unique within theme
  type: string; // section type
  variant?: string; // section variant
  enabled: boolean;
  settings: Record<string, any>;
  visibility?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
}

export type SectionType =
  | 'announcement'
  | 'header'
  | 'hero'
  | 'product_grid'
  | 'product_carousel'
  | 'categories'
  | 'testimonials'
  | 'newsletter'
  | 'banner'
  | 'image_text'
  | 'faq'
  | 'footer'
  | 'product_gallery'
  | 'product_info'
  | 'product_tabs'
  | 'product_reviews_section'
  | 'product_related'
  | 'category_header'
  | 'category_filters'
  | 'category_grid'
  | 'cart_page_layout'
  | 'checkout_page_layout'
  | 'account_dashboard'
  | 'page_header'
  | 'page_content';

export interface StoreData {
  products?: any[];
  categories?: any[];
  product?: any;
  category?: any;
  cart?: any;
  checkout?: any;
  account?: any;
  page?: any;
  settings?: Record<string, any>;
  [key: string]: any;
}

export interface SectionProps<T = Record<string, any>> {
  id: string;
  variant?: string;
  settings: T;
  themeSettings: ThemeConfig['settings'];
  storeData?: StoreData;
}
