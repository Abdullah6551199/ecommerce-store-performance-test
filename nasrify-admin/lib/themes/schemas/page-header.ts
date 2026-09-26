import { SectionSchema } from '../section-schema';

export const PAGE_HEADER_SCHEMA: SectionSchema = {
  type: 'page_header',
  label: 'Page Header',
  category: 'page',
  description: 'Standard page header with title, subtitle, breadcrumbs, and background options.',
  variants: [
    { value: 'centered', label: 'Centered Minimal' },
    { value: 'left_aligned', label: 'Left Aligned' },
    { value: 'banner', label: 'Hero Banner Image' },
  ],
  presets: [
    {
      name: 'Default Clean',
      settings: {
        variant: 'centered',
        title: 'Page Title',
        subtitle: 'Learn more about our story and mission',
        show_breadcrumbs: true,
      },
    },
  ],
  content: [
    { key: 'title', type: 'text', label: 'Page Title', default: 'Page Title' },
    { key: 'subtitle', type: 'richtext', label: 'Page Subtitle', default: 'Learn more about our story and mission' },
    { key: 'show_breadcrumbs', type: 'boolean', label: 'Show Breadcrumb Navigation', default: true },
    { key: 'background_image', type: 'image', label: 'Header Background Image', default: '' },
    {
      key: 'text_align',
      type: 'select',
      label: 'Text Alignment',
      default: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
  defaults: {
    variant: 'centered',
    title: 'Page Title',
    subtitle: 'Learn more about our story and mission',
    show_breadcrumbs: true,
    background_image: '',
    text_align: 'center',
  },
};
