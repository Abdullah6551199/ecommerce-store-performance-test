import { SectionSchema } from "../section-schema";

export const CATEGORY_FILTERS_SCHEMA: SectionSchema = {
  type: "category_filters",
  label: "Collection Filter Sidebar",
  category: "collection",
  variants: [
    { value: "sidebar", label: "Left Sidebar" },
    { value: "top_bar", label: "Horizontal Filter Bar" },
  ],
  content: [
    {
      key: "show_price_filter",
      type: "boolean",
      label: "Enable Price Range Slider",
      default: true,
    },
    {
      key: "show_brand_filter",
      type: "boolean",
      label: "Enable Brand Filter",
      default: true,
    },
    {
      key: "show_availability_filter",
      type: "boolean",
      label: "Enable In-Stock / Availability Filter",
      default: true,
    },
  ],
  defaults: {
    show_price_filter: true,
    show_brand_filter: true,
    show_availability_filter: true,
  },
};
