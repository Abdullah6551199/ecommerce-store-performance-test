export interface ThemeConfig {
  schema_version: string; // "1.0"
  name: string;
  version: string;
  description?: string;

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
      container_width: string; // "1280px"
      section_spacing: string; // "64px"
      border_radius: string; // "8px"
    };
  };

  sections: ThemeSection[];
}

export interface ThemeSection {
  id: string; // unique within theme
  type: string; // section type
  variant?: string; // section variant
  enabled: boolean;
  settings: Record<string, any>;
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
  | 'footer';

export interface StoreData {
  products?: any[];
  categories?: any[];
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
