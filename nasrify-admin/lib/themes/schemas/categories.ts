import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const CATEGORIES_SCHEMA: SectionSchema = {
  type: "categories",
  label: "Categories Showcase",
  category: "collection",
  variants: [
    { value: "grid", label: "Clean Card Grid" },
    { value: "masonry", label: "Editorial Masonry" },
    { value: "list", label: "Minimalist List" },
    { value: "circle", label: "Circular Badges" },
    { value: "circle_icons", label: "Round Category Thumbnails" },
    { value: "featured_one", label: "1 Featured + 4 Small Grid" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Shop by Category",
      placeholder: "Categories heading",
    },
    {
      key: "columns",
      type: "number",
      label: "Grid Columns (2 - 6)",
      default: 4,
      min: 2,
      max: 6,
    },
    {
      key: "image_style",
      type: "select",
      label: "Category Image Shape",
      default: "rounded",
      options: [
        { value: "rounded", label: "Rounded Rectangle" },
        { value: "circle", label: "Circular" },
        { value: "square", label: "Sharp Square" },
      ],
    },
  ],
  defaults: {
    heading: "Shop by Category",
    columns: 4,
    image_style: "rounded",
  },
  presets: getSectionPresets("categories"),
};
