import { SectionSchema } from "../section-schema";

export const CATEGORY_GRID_SCHEMA: SectionSchema = {
  type: "category_grid",
  label: "Collection Product Grid",
  category: "collection",
  variants: [
    { value: "standard", label: "Standard Catalog Grid" },
    { value: "compact", label: "Compact Product Cards" },
  ],
  content: [
    {
      key: "columns",
      type: "number",
      label: "Grid Columns (2 - 4)",
      default: 3,
      min: 2,
      max: 4,
    },
    {
      key: "per_page",
      type: "number",
      label: "Products Per Page",
      default: 9,
      min: 6,
      max: 24,
      step: 3,
    },
    {
      key: "show_pagination",
      type: "boolean",
      label: "Show Pagination Controls",
      default: true,
    },
  ],
  defaults: {
    columns: 3,
    per_page: 9,
    show_pagination: true,
  },
};
