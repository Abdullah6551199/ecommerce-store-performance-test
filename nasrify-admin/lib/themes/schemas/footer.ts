import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const FOOTER_SCHEMA: SectionSchema = {
  type: "footer",
  label: "Store Footer",
  category: "footer",
  variants: [
    { value: "standard", label: "Multi-Column Standard" },
    { value: "expanded", label: "Expanded with Value Props" },
    { value: "minimal", label: "Minimalist Copyright Only" },
  ],
  content: [
    {
      key: "logo_text",
      type: "richtext",
      label: "Footer Brand Text",
      default: "Nasrify Store",
    },
    {
      key: "copyright",
      type: "richtext",
      label: "Copyright Text",
      default: "© 2026 Nasrify Inc. All rights reserved.",
    },
    {
      key: "newsletter_signup",
      type: "boolean",
      label: "Show Newsletter Box",
      default: true,
    },
  ],
  defaults: {
    logo_text: "Nasrify Store",
    copyright: "© 2026 Nasrify Inc. All rights reserved.",
    newsletter_signup: true,
  },
  presets: getSectionPresets("footer"),
};
