import { SectionSchema } from "../section-schema";

export const CATEGORY_HEADER_SCHEMA: SectionSchema = {
  type: "category_header",
  label: "Collection Page Header",
  category: "collection",
  variants: [
    { value: "simple", label: "Simple Heading" },
    { value: "banner", label: "Hero Banner Style" },
    { value: "centered", label: "Centered Minimal" },
  ],
  content: [
    {
      key: "show_breadcrumb",
      type: "boolean",
      label: "Show Navigation Breadcrumb",
      default: true,
    },
    {
      key: "show_description",
      type: "boolean",
      label: "Show Category Description",
      default: true,
    },
    {
      key: "layout",
      type: "select",
      label: "Header Layout Style",
      default: "simple",
      options: [
        { value: "simple", label: "Simple Clean" },
        { value: "banner", label: "Hero Banner" },
        { value: "centered", label: "Centered" },
      ],
    },
  ],
  defaults: {
    show_breadcrumb: true,
    show_description: true,
    layout: "simple",
  },
};
