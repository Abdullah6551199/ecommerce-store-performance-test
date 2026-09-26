import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const HERO_SCHEMA: SectionSchema = {
  type: "hero",
  label: "Hero Banner",
  category: "hero",
  variants: [
    { value: "full_image", label: "Full Width Image" },
    { value: "split", label: "Split Editorial Layout" },
    { value: "text_only", label: "Minimalist Text Only" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Elevate Your Lifestyle with Modern Essentials",
      placeholder: "Enter hero heading...",
    },
    {
      key: "heading_size",
      type: "select",
      label: "Heading Size",
      default: "xl",
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
        { value: "xl", label: "Extra Large" },
        { value: "2xl", label: "2X Large" },
        { value: "3xl", label: "3X Large" },
      ],
    },
    {
      key: "subheading",
      type: "richtext",
      label: "Subheading",
      default:
        "Premium craftsmanship, minimalist design, and uncompromised quality engineered for everyday elegance.",
      placeholder: "Enter hero subheading...",
    },
    {
      key: "subheading_size",
      type: "select",
      label: "Subheading Size",
      default: "lg",
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
        { value: "xl", label: "Extra Large" },
      ],
    },
    {
      key: "cta_text",
      type: "text",
      label: "CTA Button Text",
      default: "Explore Collection",
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
      key: "button_size",
      type: "select",
      label: "Button Size",
      default: "lg",
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
        { value: "xl", label: "Extra Large" },
      ],
    },
    {
      key: "image_url",
      type: "image",
      label: "Background / Side Image",
      default:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
    },
    {
      key: "height",
      type: "text",
      label: "Section Min Height",
      default: "600px",
      placeholder: "600px or 100vh",
    },
    {
      key: "overlay_opacity",
      type: "number",
      label: "Image Overlay Opacity (0.0 - 1.0)",
      default: 0.45,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      key: "alignment",
      type: "select",
      label: "Content Alignment",
      default: "center",
      options: [
        { value: "left", label: "Left Aligned" },
        { value: "center", label: "Center Aligned" },
        { value: "right", label: "Right Aligned" },
      ],
    },
  ],
  defaults: {
    heading: "Elevate Your Lifestyle with Modern Essentials",
    subheading:
      "Premium craftsmanship, minimalist design, and uncompromised quality engineered for everyday elegance.",
    cta_text: "Explore Collection",
    cta_link: "/shop",
    image_url:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
    height: "600px",
    overlay_opacity: 0.45,
    alignment: "center",
    heading_size: "xl",
    subheading_size: "lg",
    button_size: "lg",
  },
  presets: getSectionPresets("hero"),
};
