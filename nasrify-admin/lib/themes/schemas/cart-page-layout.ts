import { SectionSchema } from "../section-schema";

export const CART_PAGE_LAYOUT_SCHEMA: SectionSchema = {
  type: "cart_page_layout",
  label: "Cart Page Layout",
  category: "page",
  content: [
    {
      key: "show_coupon",
      type: "boolean",
      label: "Show Coupon / Promo Code Input",
      default: true,
    },
    {
      key: "show_estimated_shipping",
      type: "boolean",
      label: "Show Estimated Shipping & Tax",
      default: true,
    },
    {
      key: "show_recommendations",
      type: "boolean",
      label: "Show Cross-sell Product Recommendations",
      default: true,
    },
  ],
  defaults: {
    show_coupon: true,
    show_estimated_shipping: true,
    show_recommendations: true,
  },
};
