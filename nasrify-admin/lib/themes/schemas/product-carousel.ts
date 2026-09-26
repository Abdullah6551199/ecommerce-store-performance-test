import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const PRODUCT_CAROUSEL_SCHEMA: SectionSchema = {
  type: "product_carousel",
  label: "Product Carousel",
  category: "product",
  variants: [
    { value: "scroll", label: "Smooth Scroll Track" },
    { value: "snap", label: "Snap Pagination" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "New Arrivals",
      placeholder: "Carousel title",
    },
    {
      key: "show_arrows",
      type: "boolean",
      label: "Show Navigation Arrows",
      default: true,
    },
    {
      key: "autoplay",
      type: "boolean",
      label: "Autoplay Rotation",
      default: false,
    },
  ],
  defaults: {
    heading: "New Arrivals",
    show_arrows: true,
    autoplay: false,
  },
  presets: getSectionPresets("product_carousel"),
};
