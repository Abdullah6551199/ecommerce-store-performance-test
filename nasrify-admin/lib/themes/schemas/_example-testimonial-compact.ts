import { SectionSchema } from '../section-schema';

export const EXAMPLE_TESTIMONIAL_COMPACT_SCHEMA: SectionSchema = {
  type: 'example_testimonial_compact',
  label: 'Compact Testimonials (Demo)',
  category: 'social',
  description: 'Demo compact testimonial section created in under 5 minutes to verify BaseSection schema-driven architecture.',
  variants: [
    { value: 'grid', label: 'Grid Cards' },
    { value: 'slider', label: 'Single Slide Carousel' },
  ],
  presets: [
    {
      name: 'Minimal Light',
      settings: {
        variant: 'grid',
        heading: 'What Clients Say',
        subheading: 'Real reviews from verified buyers',
        author_name: 'Sarah Connor',
        quote: 'Outstanding product quality and customer service!',
        rating: 5,
      },
    },
  ],
  content: [
    { key: 'heading', type: 'richtext', label: 'Section Heading', default: 'What Clients Say' },
    { key: 'subheading', type: 'text', label: 'Subheading', default: 'Real reviews from verified buyers' },
    { key: 'quote', type: 'richtext', label: 'Featured Review Quote', default: 'Outstanding product quality and customer service!' },
    { key: 'author_name', type: 'text', label: 'Customer Name', default: 'Sarah Connor' },
    { key: 'rating', type: 'number', label: 'Star Rating (1-5)', default: 5, min: 1, max: 5 },
  ],
  defaults: {
    variant: 'grid',
    heading: 'What Clients Say',
    subheading: 'Real reviews from verified buyers',
    quote: 'Outstanding product quality and customer service!',
    author_name: 'Sarah Connor',
    rating: 5,
  },
};
