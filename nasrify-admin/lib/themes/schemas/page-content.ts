import { SectionSchema } from '../section-schema';

export const PAGE_CONTENT_SCHEMA: SectionSchema = {
  type: 'page_content',
  label: 'Page Content',
  category: 'page',
  description: 'Rich-text content block with container width options for blog posts, legal pages, and about pages.',
  variants: [
    { value: 'prose', label: 'Prose Article' },
    { value: 'full_width', label: 'Full Width' },
    { value: 'card', label: 'Contained Card' },
  ],
  presets: [
    {
      name: 'Default Prose',
      settings: {
        variant: 'prose',
        max_width: '800px',
        content: '<p>Welcome to our store. Write your detailed content, policies, or story here.</p>',
      },
    },
  ],
  content: [
    { key: 'content', type: 'richtext', label: 'Page Body Content', default: '<p>Welcome to our store. Write your detailed content, policies, or story here.</p>' },
    {
      key: 'max_width',
      type: 'select',
      label: 'Content Container Width',
      default: '800px',
      options: [
        { label: 'Narrow (640px)', value: '640px' },
        { label: 'Medium Prose (800px)', value: '800px' },
        { label: 'Standard (1024px)', value: '1024px' },
        { label: 'Wide (1280px)', value: '1280px' },
      ],
    },
    { key: 'enable_table_of_contents', type: 'boolean', label: 'Generate Table of Contents', default: false },
  ],
  defaults: {
    variant: 'prose',
    max_width: '800px',
    enable_table_of_contents: false,
    content: '<p>Welcome to our store. Write your detailed content, policies, or story here.</p>',
  },
};
