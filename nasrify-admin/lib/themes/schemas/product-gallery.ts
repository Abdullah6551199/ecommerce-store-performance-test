import { SectionSchema } from "../section-schema";

export const PRODUCT_GALLERY_SCHEMA: SectionSchema = {
  type: "product_gallery",
  label: "Product Image Gallery",
  category: "product",
  variants: [
    { value: "classic", label: "Classic Thumbnails" },
    { value: "grid", label: "Two-Column Grid" },
  ],
  content: [
    {
      key: "layout",
      type: "select",
      label: "Gallery Layout",
      default: "carousel",
      options: [
        { value: "carousel", label: "Carousel Slider" },
        { value: "grid", label: "Multi Grid" },
        { value: "stack", label: "Vertical Stack" },
      ],
    },
    {
      key: "thumbnails_position",
      type: "select",
      label: "Thumbnails Position",
      default: "bottom",
      options: [
        { value: "bottom", label: "Bottom" },
        { value: "left", label: "Left Vertical" },
      ],
    },
    {
      key: "zoom",
      type: "select",
      label: "Hover Zoom Lens",
      default: "off",
      options: [
        { value: "on", label: "Enabled" },
        { value: "off", label: "Disabled" },
      ],
    },
  ],
  defaults: {
    layout: "carousel",
    thumbnails_position: "bottom",
    zoom: "off",
  },
};
