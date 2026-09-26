import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const ANNOUNCEMENT_SCHEMA: SectionSchema = {
  type: "announcement_bar",
  label: "Announcement Bar",
  category: "header",
  variants: [
    { value: "solid", label: "Solid Background" },
    { value: "gradient", label: "Dynamic Gradient" },
    { value: "minimal", label: "Minimal Bordered" },
  ],
  content: [
    {
      key: "text",
      type: "richtext",
      label: "Announcement Text",
      default: "Free shipping on orders over $50",
      placeholder: "Free shipping, sales banner...",
    },
    {
      key: "link",
      type: "url",
      label: "Link URL (Optional)",
      placeholder: "/shop",
    },
    {
      key: "bg_color",
      type: "color",
      label: "Background Color",
      default: "#18181B",
    },
    {
      key: "text_color",
      type: "color",
      label: "Text Color",
      default: "#FFFFFF",
    },
    {
      key: "dismissible",
      type: "boolean",
      label: "Show Close / Dismiss Button",
      default: true,
    },
  ],
  defaults: {
    text: "Free shipping on orders over $50",
    link: "",
    bg_color: "#18181B",
    text_color: "#FFFFFF",
    dismissible: true,
  },
  presets: getSectionPresets("announcement_bar"),
};
