import { SectionSchema } from "../section-schema";

export const PRODUCT_RELATED_SCHEMA: SectionSchema = {
  type: "product_related",
  label: "Related Recommendations",
  category: "product",
  variants: [
    { value: "grid", label: "Static Product Grid" },
    { value: "carousel", label: "Horizontal Carousel" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Related Products",
    },
    {
      key: "max_products",
      type: "number",
      label: "Max Number of Items (2 - 12)",
      default: 4,
      min: 2,
      max: 12,
    },
    {
      key: "columns",
      type: "number",
      label: "Grid Columns (2 - 4)",
      default: 4,
      min: 2,
      max: 4,
    },
  ],
  defaults: {
    heading: "Related Products",
    max_products: 4,
    columns: 4,
  },
};
