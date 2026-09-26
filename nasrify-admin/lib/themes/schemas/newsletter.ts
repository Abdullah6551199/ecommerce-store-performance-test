import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const NEWSLETTER_SCHEMA: SectionSchema = {
  type: "newsletter",
  label: "Newsletter Signup",
  category: "promotional",
  variants: [
    { value: "inline", label: "Inline Minimal" },
    { value: "boxed", label: "Boxed Card" },
    { value: "full_width", label: "Full Width" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Subscribe for updates",
      placeholder: "Newsletter headline",
    },
    {
      key: "subheading",
      type: "richtext",
      label: "Subheading",
      default:
        "Get exclusive early access to drops, member discounts, and design insights.",
      placeholder: "Incentive subtitle",
    },
    {
      key: "placeholder",
      type: "text",
      label: "Email Input Placeholder",
      default: "Enter your email address...",
    },
    {
      key: "button_text",
      type: "text",
      label: "Submit Button Text",
      default: "Subscribe",
    },
  ],
  defaults: {
    heading: "Subscribe for updates",
    subheading:
      "Get exclusive early access to drops, member discounts, and design insights.",
    placeholder: "Enter your email address...",
    button_text: "Subscribe",
  },
  presets: getSectionPresets("newsletter"),
};
