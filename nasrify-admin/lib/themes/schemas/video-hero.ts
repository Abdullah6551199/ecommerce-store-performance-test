import { SectionSchema } from '../section-schema';

export const VIDEO_HERO_SCHEMA: SectionSchema = {
  type: 'video_hero',
  label: 'Video Hero',
  category: 'content',
  description: 'High-impact full-width video background banner with text overlay and CTA.',
  variants: [
    { value: 'fullscreen', label: 'Fullscreen Video' },
    { value: 'split_with_text', label: 'Split 50/50 Video & Text' },
    { value: 'centered_minimal', label: 'Centered Minimalist' },
  ],
  presets: [
    {
      name: 'Default Cinematic',
      settings: {
        variant: 'fullscreen',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        heading: 'Experience the Next Generation of Commerce',
        subheading: 'Engineered for breathtaking speed, modern aesthetics, and fluid elegance.',
        cta_text: 'Explore Catalog',
        cta_link: '/shop',
        overlay_opacity: 0.45,
        autoplay: true,
        muted: true,
        loop: true,
      },
    },
  ],
  content: [
    { key: 'video_url', type: 'url', label: 'MP4 / WebM Video URL', default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { key: 'heading', type: 'richtext', label: 'Hero Headline', default: 'Experience the Next Generation of Commerce' },
    { key: 'subheading', type: 'richtext', label: 'Subheading', default: 'Engineered for breathtaking speed, modern aesthetics, and fluid elegance.' },
    { key: 'cta_text', type: 'text', label: 'CTA Button Text', default: 'Explore Catalog' },
    { key: 'cta_link', type: 'url', label: 'CTA Button Link', default: '/shop' },
    { key: 'overlay_opacity', type: 'number', label: 'Dark Overlay Opacity (0 to 1)', default: 0.45, min: 0, max: 1, step: 0.05 },
    { key: 'autoplay', type: 'boolean', label: 'Autoplay Video', default: true },
    { key: 'muted', type: 'boolean', label: 'Mute Audio', default: true },
    { key: 'loop', type: 'boolean', label: 'Loop Playback', default: true },
  ],
  defaults: {
    variant: 'fullscreen',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    heading: 'Experience the Next Generation of Commerce',
    subheading: 'Engineered for breathtaking speed, modern aesthetics, and fluid elegance.',
    cta_text: 'Explore Catalog',
    cta_link: '/shop',
    overlay_opacity: 0.45,
    autoplay: true,
    muted: true,
    loop: true,
  },
};
