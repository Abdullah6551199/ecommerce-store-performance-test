import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const TESTIMONIALS_SCHEMA: SectionSchema = {
  type: "testimonials",
  label: "Customer Testimonials",
  category: "social",
  variants: [
    { value: "cards", label: "Three Column Cards" },
    { value: "quote", label: "Single Featured Quote" },
    { value: "grid", label: "Multi Grid Layout" },
    { value: "avatar_large", label: "Large Avatar + Prominent Quote" },
    { value: "marquee", label: "Auto-Scrolling Infinite Marquee" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "What Our Customers Say",
      placeholder: "Social proof heading",
    },
    {
      key: "items",
      type: "repeater",
      label: "Testimonial Reviews",
      default: [
        {
          text: "The build quality and attention to detail exceeded my expectations. Outstanding shopping experience from start to finish!",
          author: "Sarah Jenkins",
          role: "Verified Buyer",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        },
        {
          text: "Super fast delivery and the products feel extraordinarily premium. Easily the best online store I've encountered.",
          author: "Michael Vance",
          role: "Verified Buyer",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        },
        {
          text: "Minimalist aesthetics paired with exceptional durability. Nasrify sets the bar for modern e-commerce.",
          author: "Elena Rostova",
          role: "Design Director",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
        },
      ],
      fields: [
        {
          key: "text",
          type: "richtext",
          label: "Review Quote",
          default: "Outstanding quality and craftsmanship.",
        },
        {
          key: "author",
          type: "text",
          label: "Author Name",
          default: "Satisfied Customer",
        },
        {
          key: "role",
          type: "text",
          label: "Author Role / Badge",
          default: "Verified Buyer",
        },
        {
          key: "avatar",
          type: "image",
          label: "Author Photo",
        },
      ],
    },
  ],
  defaults: {
    heading: "What Our Customers Say",
    items: [
      {
        text: "The build quality and attention to detail exceeded my expectations. Outstanding shopping experience from start to finish!",
        author: "Sarah Jenkins",
        role: "Verified Buyer",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      },
    ],
  },
  presets: getSectionPresets("testimonials"),
};
