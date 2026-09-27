import { SectionSchema } from '../section-schema';

export const BLOG_POSTS_SCHEMA: SectionSchema = {
  type: 'blog_posts',
  label: 'Editorial Blog Posts',
  category: 'content',
  description: 'Editorial article grid or carousel presenting published stories, guides, and brand updates.',
  variants: [
    { value: 'grid_3col', label: '3-Column Grid' },
    { value: 'carousel', label: 'Swipeable Carousel' },
    { value: 'featured_plus_list', label: 'Featured 1 + Side List' },
  ],
  presets: [
    {
      name: 'Default Clean Grid',
      settings: {
        variant: 'grid_3col',
        heading: 'Latest From the Journal',
        subheading: 'Stories, lifestyle guides, and behind the scenes with our creators.',
        show_date: true,
        show_author: true,
        show_excerpt: true,
        columns: 3,
      },
    },
  ],
  content: [
    { key: 'heading', type: 'richtext', label: 'Section Heading', default: 'Latest From the Journal' },
    { key: 'subheading', type: 'richtext', label: 'Subheading', default: 'Stories, lifestyle guides, and behind the scenes with our creators.' },
    { key: 'show_date', type: 'boolean', label: 'Show Publication Date', default: true },
    { key: 'show_author', type: 'boolean', label: 'Show Author Name', default: true },
    { key: 'show_excerpt', type: 'boolean', label: 'Show Post Excerpt Preview', default: true },
    { key: 'columns', type: 'number', label: 'Number of Columns', default: 3, min: 1, max: 4 },
  ],
  defaults: {
    variant: 'grid_3col',
    heading: 'Latest From the Journal',
    subheading: 'Stories, lifestyle guides, and behind the scenes with our creators.',
    show_date: true,
    show_author: true,
    show_excerpt: true,
    columns: 3,
  },
};
