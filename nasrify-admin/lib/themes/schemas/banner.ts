import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const BANNER_SCHEMA: SectionSchema = {
  type: "banner",
  label: "Promotional Banner",
  category: "promotional",
  variants: [
    { value: "full_width", label: "Full Width" },
    { value: "boxed", label: "Boxed Container" },
    { value: "side_by_side", label: "Side-by-Side Split" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Summer Sale — 30% Off",
      placeholder: "Promo headline",
    },
    {
      key: "text",
      type: "richtext",
      label: "Description Text",
      default:
        "Discover selected premium items at limited-time promotional pricing. Use code SUMMER30 at checkout.",
      placeholder: "Promo terms or description",
    },
    {
      key: "cta_text",
      type: "text",
      label: "CTA Button Text",
      default: "Claim Discount",
      placeholder: "Button label",
    },
    {
      key: "cta_link",
      type: "url",
      label: "CTA Button Link",
      default: "/shop",
      placeholder: "/shop",
    },
    {
      key: "image_url",
      type: "image",
      label: "Banner Image",
      default:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
    },
    {
      key: "overlay",
      type: "number",
      label: "Overlay Opacity (0.0 - 1.0)",
      default: 0.5,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      key: "height",
      type: "text",
      label: "Banner Height",
      default: "400px",
      placeholder: "400px",
    },
  ],
  defaults: {
    heading: "Summer Sale — 30% Off",
    text: "Discover selected premium items at limited-time promotional pricing. Use code SUMMER30 at checkout.",
    cta_text: "Claim Discount",
    cta_link: "/shop",
    image_url:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
    overlay: 0.5,
    height: "400px",
  },
  presets: getSectionPresets("banner"),
};
