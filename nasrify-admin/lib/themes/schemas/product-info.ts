import { SectionSchema } from "../section-schema";

export const PRODUCT_INFO_SCHEMA: SectionSchema = {
  type: "product_info",
  label: "Product Info & Actions",
  category: "product",
  variants: [
    { value: "standard", label: "Standard Layout" },
    { value: "compact", label: "Compact Layout" },
  ],
  content: [
    {
      key: "button_text",
      type: "text",
      label: "Add to Cart Button Text",
      default: "Add to Cart",
    },
    {
      key: "show_brand",
      type: "boolean",
      label: "Show Brand Name",
      default: true,
    },
    {
      key: "show_sku",
      type: "boolean",
      label: "Show Product SKU",
      default: true,
    },
    {
      key: "show_rating",
      type: "boolean",
      label: "Show Star Rating & Count",
      default: true,
    },
    {
      key: "show_wishlist",
      type: "boolean",
      label: "Show Add to Wishlist Button",
      default: true,
    },
    {
      key: "show_compare",
      type: "boolean",
      label: "Show Compare Button",
      default: true,
    },
  ],
  defaults: {
    button_text: "Add to Cart",
    show_brand: true,
    show_sku: true,
    show_rating: true,
    show_wishlist: true,
    show_compare: true,
  },
};
