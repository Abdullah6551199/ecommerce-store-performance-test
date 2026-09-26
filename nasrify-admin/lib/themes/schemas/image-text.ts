import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const IMAGE_TEXT_SCHEMA: SectionSchema = {
  type: "image_text",
  label: "Image with Text",
  category: "content",
  variants: [
    { value: "left_image", label: "Image on Left" },
    { value: "right_image", label: "Image on Right" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Engineered for Supreme Performance",
      placeholder: "Feature headline",
    },
    {
      key: "text",
      type: "richtext",
      label: "Description Text",
      default:
        "Every thread, stitch, and contour is calculated to provide unmatched movement, breathability, and aesthetic impact.",
      placeholder: "Story or feature description",
    },
    {
      key: "image_url",
      type: "image",
      label: "Feature Image",
      default:
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
    },
    {
      key: "image_position",
      type: "select",
      label: "Image Alignment",
      default: "left",
      options: [
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
      ],
    },
    {
      key: "cta_text",
      type: "text",
      label: "Button Text",
      default: "Learn More",
    },
    {
      key: "cta_link",
      type: "url",
      label: "Button Link",
      default: "/about",
    },
  ],
  defaults: {
    heading: "Engineered for Supreme Performance",
    text: "Every thread, stitch, and contour is calculated to provide unmatched movement, breathability, and aesthetic impact.",
    image_url:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
    image_position: "left",
    cta_text: "Learn More",
    cta_link: "/about",
  },
  presets: getSectionPresets("image_text"),
};
