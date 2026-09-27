export type FieldType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'url'
  | 'number'
  | 'boolean'
  | 'select'
  | 'repeater'
  | 'color'
  | 'size'
  | 'spacing'
  | 'gradient'
  | 'shadow'
  | 'background'
  | 'border'
  | 'typography'
  | 'hover'
  | 'animation'
  | 'responsive'
  | 'customcss'
  | 'position'
  | 'zindex';

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface RepeaterFieldConfig {
  key: string;
  type: 'text' | 'image' | 'url' | 'number' | 'richtext' | 'boolean' | 'select';
  label: string;
  default?: any;
  options?: FieldOption[];
}

export interface FieldConfig {
  key: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  default?: any;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  fields?: RepeaterFieldConfig[];
  itemFields?: RepeaterFieldConfig[];
  itemLabel?: string;
}

export interface SectionVariant {
  value: string;
  label: string;
}

export interface SectionPreset {
  name: string;
  settings: Record<string, any>;
}

export interface SectionSchema {
  type: string;
  label: string;
  category:
    | 'header'
    | 'hero'
    | 'product'
    | 'products'
    | 'collection'
    | 'collections'
    | 'social'
    | 'promotional'
    | 'content'
    | 'footer'
    | 'page';
  description?: string;
  variants?: SectionVariant[];
  presets?: SectionPreset[];
  content: FieldConfig[];
  defaults: Record<string, any>;
}

// Import all 25 section schemas
import { HERO_SCHEMA } from './schemas/hero';
import { ANNOUNCEMENT_SCHEMA } from './schemas/announcement';
import { HEADER_SCHEMA } from './schemas/header';
import { BANNER_SCHEMA } from './schemas/banner';
import { PRODUCT_GRID_SCHEMA } from './schemas/product-grid';
import { CATEGORIES_SCHEMA } from './schemas/categories';
import { TESTIMONIALS_SCHEMA } from './schemas/testimonials';
import { NEWSLETTER_SCHEMA } from './schemas/newsletter';
import { FAQ_SCHEMA } from './schemas/faq';
import { FOOTER_SCHEMA } from './schemas/footer';
import { IMAGE_TEXT_SCHEMA } from './schemas/image-text';
import { PRODUCT_CAROUSEL_SCHEMA } from './schemas/product-carousel';
import { PRODUCT_GALLERY_SCHEMA } from './schemas/product-gallery';
import { PRODUCT_INFO_SCHEMA } from './schemas/product-info';
import { PRODUCT_TABS_SCHEMA } from './schemas/product-tabs';
import { PRODUCT_REVIEWS_SCHEMA } from './schemas/product-reviews';
import { PRODUCT_RELATED_SCHEMA } from './schemas/product-related';
import { CATEGORY_HEADER_SCHEMA } from './schemas/category-header';
import { CATEGORY_FILTERS_SCHEMA } from './schemas/category-filters';
import { CATEGORY_GRID_SCHEMA } from './schemas/category-grid';
import { CART_PAGE_LAYOUT_SCHEMA } from './schemas/cart-page-layout';
import { CHECKOUT_PAGE_LAYOUT_SCHEMA } from './schemas/checkout-page-layout';
import { ACCOUNT_DASHBOARD_SCHEMA } from './schemas/account-dashboard';
import { PAGE_HEADER_SCHEMA } from './schemas/page-header';
import { PAGE_CONTENT_SCHEMA } from './schemas/page-content';
import { EXAMPLE_TESTIMONIAL_COMPACT_SCHEMA } from './schemas/_example-testimonial-compact';
import { VIDEO_HERO_SCHEMA } from './schemas/video-hero';
import { BLOG_POSTS_SCHEMA } from './schemas/blog-posts';
import { TEAM_MEMBERS_SCHEMA } from './schemas/team-members';
import { PRICING_TABLE_SCHEMA } from './schemas/pricing-table';
import { STATS_COUNTERS_SCHEMA } from './schemas/stats-counters';
import { IMAGE_GALLERY_SCHEMA } from './schemas/image-gallery';

// Re-export individual schemas
export {
  HERO_SCHEMA,
  ANNOUNCEMENT_SCHEMA,
  HEADER_SCHEMA,
  BANNER_SCHEMA,
  PRODUCT_GRID_SCHEMA,
  CATEGORIES_SCHEMA,
  TESTIMONIALS_SCHEMA,
  NEWSLETTER_SCHEMA,
  FAQ_SCHEMA,
  FOOTER_SCHEMA,
  IMAGE_TEXT_SCHEMA,
  PRODUCT_CAROUSEL_SCHEMA,
  PRODUCT_GALLERY_SCHEMA,
  PRODUCT_INFO_SCHEMA,
  PRODUCT_TABS_SCHEMA,
  PRODUCT_REVIEWS_SCHEMA,
  PRODUCT_RELATED_SCHEMA,
  CATEGORY_HEADER_SCHEMA,
  CATEGORY_FILTERS_SCHEMA,
  CATEGORY_GRID_SCHEMA,
  CART_PAGE_LAYOUT_SCHEMA,
  CHECKOUT_PAGE_LAYOUT_SCHEMA,
  ACCOUNT_DASHBOARD_SCHEMA,
  PAGE_HEADER_SCHEMA,
  PAGE_CONTENT_SCHEMA,
  EXAMPLE_TESTIMONIAL_COMPACT_SCHEMA,
  VIDEO_HERO_SCHEMA,
  BLOG_POSTS_SCHEMA,
  TEAM_MEMBERS_SCHEMA,
  PRICING_TABLE_SCHEMA,
  STATS_COUNTERS_SCHEMA,
  IMAGE_GALLERY_SCHEMA,
};

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero: HERO_SCHEMA,
  announcement: ANNOUNCEMENT_SCHEMA,
  header: HEADER_SCHEMA,
  banner: BANNER_SCHEMA,
  product_grid: PRODUCT_GRID_SCHEMA,
  categories: CATEGORIES_SCHEMA,
  testimonials: TESTIMONIALS_SCHEMA,
  newsletter: NEWSLETTER_SCHEMA,
  faq: FAQ_SCHEMA,
  footer: FOOTER_SCHEMA,
  image_text: IMAGE_TEXT_SCHEMA,
  product_carousel: PRODUCT_CAROUSEL_SCHEMA,
  product_gallery: PRODUCT_GALLERY_SCHEMA,
  product_info: PRODUCT_INFO_SCHEMA,
  product_tabs: PRODUCT_TABS_SCHEMA,
  product_reviews_section: PRODUCT_REVIEWS_SCHEMA,
  product_related: PRODUCT_RELATED_SCHEMA,
  category_header: CATEGORY_HEADER_SCHEMA,
  category_filters: CATEGORY_FILTERS_SCHEMA,
  category_grid: CATEGORY_GRID_SCHEMA,
  cart_page_layout: CART_PAGE_LAYOUT_SCHEMA,
  checkout_page_layout: CHECKOUT_PAGE_LAYOUT_SCHEMA,
  account_dashboard: ACCOUNT_DASHBOARD_SCHEMA,
  page_header: PAGE_HEADER_SCHEMA,
  page_content: PAGE_CONTENT_SCHEMA,
  example_testimonial_compact: EXAMPLE_TESTIMONIAL_COMPACT_SCHEMA,
  video_hero: VIDEO_HERO_SCHEMA,
  blog_posts: BLOG_POSTS_SCHEMA,
  team_members: TEAM_MEMBERS_SCHEMA,
  pricing_table: PRICING_TABLE_SCHEMA,
  stats_counters: STATS_COUNTERS_SCHEMA,
  image_gallery: IMAGE_GALLERY_SCHEMA,
};

export function getSectionSchema(type: string): SectionSchema | undefined {
  return SECTION_SCHEMAS[type];
}

export function registerSectionSchema(schema: SectionSchema): void {
  SECTION_SCHEMAS[schema.type] = schema;
}
