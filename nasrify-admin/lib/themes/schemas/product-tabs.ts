import { SectionSchema } from "../section-schema";

export const PRODUCT_TABS_SCHEMA: SectionSchema = {
  type: "product_tabs",
  label: "Product Info Tabs",
  category: "product",
  variants: [
    { value: "standard", label: "Horizontal Tab Bar" },
    { value: "accordion", label: "Vertical Accordion" },
  ],
  content: [
    {
      key: "default_tab",
      type: "select",
      label: "Default Active Tab",
      default: "description",
      options: [
        { value: "description", label: "Description" },
        { value: "specifications", label: "Specifications" },
        { value: "shipping", label: "Shipping & Returns" },
      ],
    },
  ],
  defaults: {
    default_tab: "description",
  },
};
