import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const HEADER_SCHEMA: SectionSchema = {
  type: "header",
  label: "Header Navigation",
  category: "header",
  variants: [
    { value: "classic", label: "Classic Left Logo" },
    { value: "centered", label: "Centered Logo" },
    { value: "minimal", label: "Minimalist Bar" },
  ],
  content: [
    {
      key: "logo_text",
      type: "richtext",
      label: "Brand Logo Text",
      default: "Nasrify",
      placeholder: "Your brand name",
    },
    {
      key: "logo_url",
      type: "image",
      label: "Brand Logo Image (Overrides text if set)",
    },
    {
      key: "sticky",
      type: "boolean",
      label: "Sticky Header on Scroll",
      default: true,
    },
    {
      key: "show_search",
      type: "boolean",
      label: "Show Search Icon",
      default: true,
    },
    {
      key: "show_cart",
      type: "boolean",
      label: "Show Shopping Cart Icon",
      default: true,
    },
    {
      key: "show_account",
      type: "boolean",
      label: "Show User Account Icon",
      default: true,
    },
  ],
  defaults: {
    logo_text: "Nasrify",
    logo_url: "",
    sticky: true,
    show_search: true,
    show_cart: true,
    show_account: true,
  },
  presets: getSectionPresets("header"),
};
