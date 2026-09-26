import { SectionSchema } from "../section-schema";
import { getSectionPresets } from "../section-presets";

export const FAQ_SCHEMA: SectionSchema = {
  type: "faq",
  label: "FAQ Accordion",
  category: "content",
  variants: [
    { value: "accordion", label: "Single Column Accordion" },
    { value: "two_column", label: "Two Column Grid" },
  ],
  content: [
    {
      key: "heading",
      type: "richtext",
      label: "Heading",
      default: "Frequently Asked Questions",
      placeholder: "FAQ section title",
    },
    {
      key: "items",
      type: "repeater",
      label: "Questions & Answers",
      default: [
        {
          question: "How long does shipping take?",
          answer:
            "Orders typically process within 24-48 hours. Standard domestic delivery takes 3-5 business days.",
        },
        {
          question: "What is your return and exchange policy?",
          answer:
            "We offer a 30-day hassle-free return window for unworn items in original packaging with tags attached.",
        },
      ],
      fields: [
        {
          key: "question",
          type: "richtext",
          label: "Question",
          default: "New Question?",
        },
        {
          key: "answer",
          type: "richtext",
          label: "Answer",
          default: "Answer details here.",
        },
      ],
    },
  ],
  defaults: {
    heading: "Frequently Asked Questions",
    items: [
      {
        question: "How long does shipping take?",
        answer:
          "Orders typically process within 24-48 hours. Standard domestic delivery takes 3-5 business days.",
      },
    ],
  },
  presets: getSectionPresets("faq"),
};
