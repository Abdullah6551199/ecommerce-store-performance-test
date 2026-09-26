import { SectionSchema } from "../section-schema";

export const PRODUCT_REVIEWS_SCHEMA: SectionSchema = {
  type: "product_reviews_section",
  label: "Product Reviews List",
  category: "product",
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Customer Reviews",
    },
    {
      key: "show_summary",
      type: "boolean",
      label: "Show Aggregate Rating Summary",
      default: true,
    },
    {
      key: "show_form",
      type: "boolean",
      label: "Show Write Review Form Button",
      default: true,
    },
  ],
  defaults: {
    heading: "Customer Reviews",
    show_summary: true,
    show_form: true,
  },
};
