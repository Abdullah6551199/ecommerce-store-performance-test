import { SectionSchema } from '../section-schema';

export const IMAGE_GALLERY_SCHEMA: SectionSchema = {
  type: 'image_gallery',
  label: 'Curated Image Gallery',
  category: 'content',
  description: 'Visual masonry or responsive grid display for lifestyle lookbooks and studio shots.',
  variants: [
    { value: 'grid_3col', label: 'Uniform 3-Column Grid' },
    { value: 'masonry', label: 'Editorial Masonry' },
    { value: 'carousel_fullscreen', label: 'Fullscreen Carousel Slider' },
  ],
  presets: [
    {
      name: 'Default Modern Grid',
      settings: {
        variant: 'grid_3col',
        heading: 'Visual Lookbook — Autumn / Winter',
        columns: 3,
        lightbox_enabled: true,
        images: [
          { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', caption: 'Studio Masterpiece' },
          { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80', caption: 'Winter Collection Atelier' },
          { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80', caption: 'Minimalist Silhouette' },
          { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', caption: 'Runway Highlights' },
          { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', caption: 'Organic Fibers' },
          { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80', caption: 'Golden Hour Editorial' },
        ],
      },
    },
  ],
  content: [
    { key: 'heading', type: 'richtext', label: 'Section Heading', default: 'Visual Lookbook' },
    { key: 'columns', type: 'number', label: 'Grid Columns', default: 3, min: 2, max: 4 },
    { key: 'lightbox_enabled', type: 'boolean', label: 'Enable Fullscreen Lightbox', default: true },
    {
      key: 'images',
      type: 'repeater',
      label: 'Gallery Images (up to 12)',
      itemLabel: 'Image',
      default: [],
      fields: [
        { key: 'url', type: 'image', label: 'Image URL', default: '' },
        { key: 'caption', type: 'text', label: 'Optional Caption', default: 'Lookbook photo' },
      ],
    },
  ],
  defaults: {
    variant: 'grid_3col',
    heading: 'Visual Lookbook',
    columns: 3,
    lightbox_enabled: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80', caption: 'Studio Masterpiece' },
      { url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80', caption: 'Winter Collection Atelier' },
      { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80', caption: 'Minimalist Silhouette' },
      { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', caption: 'Runway Highlights' },
      { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', caption: 'Organic Fibers' },
      { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80', caption: 'Golden Hour Editorial' },
    ],
  },
};
