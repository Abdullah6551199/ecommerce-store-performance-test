/**
 * Section Presets Library (Stage 42.5b)
 * 3-5 pre-configured style presets for each major section type.
 */

export interface SectionPreset {
  id: string;
  name: string;
  description: string;
  settings: Record<string, any>;
  variant?: string;
}

export const SECTION_PRESETS: Record<string, SectionPreset[]> = {
  hero: [
    {
      id: "centered_bold",
      name: "Centered Bold",
      description: "Center aligned with high impact typography and semi-dark overlay",
      variant: "full_image",
      settings: {
        alignment: "center",
        heading_size: "xl",
        subheading_size: "lg",
        button_size: "lg",
        height: "600px",
        overlay_opacity: 0.45,
      },
    },
    {
      id: "split_layout",
      name: "Split Layout",
      description: "Two-column editorial split with text left and photography right",
      variant: "split",
      settings: {
        alignment: "left",
        heading_size: "xl",
        subheading_size: "md",
        button_size: "md",
      },
    },
    {
      id: "minimal_text",
      name: "Minimal Text",
      description: "Ultra clean typography-focused layout without heavy background image",
      variant: "text_only",
      settings: {
        alignment: "center",
        heading_size: "2xl",
        subheading_size: "lg",
        button_size: "md",
      },
    },
    {
      id: "fullscreen_cinematic",
      name: "Fullscreen Cinematic",
      description: "Dramatic 100vh viewport height with immersive dark overlay",
      variant: "full_image",
      settings: {
        alignment: "center",
        heading_size: "3xl",
        subheading_size: "xl",
        button_size: "xl",
        height: "850px",
        overlay_opacity: 0.6,
      },
    },
  ],

  product_grid: [
    {
      id: "feature_4",
      name: "Feature 4 Columns",
      description: "Standard e-commerce catalog showcase in a balanced 4-column grid",
      settings: {
        columns: 4,
        limit: 8,
        show_rating: true,
        show_view_all: true,
      },
    },
    {
      id: "compact_3",
      name: "Compact 3 Columns",
      description: "Larger cards ideal for curated, premium, or handcrafted collections",
      settings: {
        columns: 3,
        limit: 6,
        show_rating: false,
        show_view_all: false,
      },
    },
    {
      id: "detailed_showcase",
      name: "Detailed 2 Columns",
      description: "Spacious layout with high visual prominence for each product",
      settings: {
        columns: 2,
        limit: 4,
        show_rating: true,
        show_view_all: true,
      },
    },
  ],

  banner: [
    {
      id: "sale_alert",
      name: "Sale Alert",
      description: "High urgency promotional banner with focused discount CTA",
      variant: "boxed",
      settings: {
        overlay: 0.55,
        height: "380px",
      },
    },
    {
      id: "new_arrival",
      name: "New Arrival",
      description: "Full width modern editorial banner with light overlay",
      variant: "full_width",
      settings: {
        overlay: 0.35,
        height: "450px",
      },
    },
    {
      id: "split_banner",
      name: "Side-by-Side Split",
      description: "Split card layout matching store brand colors",
      variant: "side_by_side",
      settings: {},
    },
  ],

  announcement: [
    {
      id: "solid_minimal",
      name: "Solid Brand",
      description: "Classic solid background with clean white typography",
      variant: "solid",
      settings: {
        dismissible: true,
      },
    },
    {
      id: "vibrant_gradient",
      name: "Vibrant Gradient",
      description: "Eye-catching multi-hue gradient bar for major events",
      variant: "gradient",
      settings: {
        dismissible: true,
      },
    },
    {
      id: "subtle_bordered",
      name: "Subtle Bordered",
      description: "Understated surface bar with bottom border",
      variant: "minimal",
      settings: {
        dismissible: false,
      },
    },
  ],
};

export function getSectionPresets(type: string): SectionPreset[] {
  return SECTION_PRESETS[type] || [];
}
