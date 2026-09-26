import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const PRODUCT_GRID_SCHEMA: SectionSchema = {
  type: "product_grid",
  label: "Product Grid",
  category: "product",
  variants: [
    { value: "standard", label: "Standard Grid" },
    { value: "compact", label: "Compact Cards" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Featured Products",
      placeholder: "Catalog title",
    },
    {
      key: "subheading",
      type: "richtext",
      label: "Subheading",
      default: "Hand-picked favorites crafted for perfection",
      placeholder: "Catalog subtitle",
    },
    {
      key: "columns",
      type: "number",
      label: "Grid Columns (2 - 5)",
      default: 4,
      min: 2,
      max: 5,
    },
    {
      key: "rows",
      type: "number",
      label: "Number of Rows (1 - 6)",
      default: 2,
      min: 1,
      max: 6,
    },
    {
      key: "show_price",
      type: "boolean",
      label: "Show Product Prices",
      default: true,
    },
    {
      key: "show_rating",
      type: "boolean",
      label: "Show Review Rating Stars",
      default: true,
    },
    {
      key: "show_add_to_cart",
      type: "boolean",
      label: "Show Add to Cart Button",
      default: true,
    },
  ],
  defaults: {
    heading: "Featured Products",
    subheading: "Hand-picked favorites crafted for perfection",
    columns: 4,
    rows: 2,
    show_price: true,
    show_rating: true,
    show_add_to_cart: true,
  },
  presets: getSectionPresets("product_grid"),
};
