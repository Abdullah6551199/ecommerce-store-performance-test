import { SectionSchema } from '../section-schema';

export const STATS_COUNTERS_SCHEMA: SectionSchema = {
  type: 'stats_counters',
  label: 'Stats & Milestone Counters',
  category: 'promotional',
  description: 'Animated milestone counters showcasing store impact, community size, or sustainability metrics.',
  variants: [
    { value: 'dark', label: 'Dark Midnight High Contrast' },
    { value: 'light', label: 'Light Clean Minimal' },
    { value: 'gradient', label: 'Vibrant Accent Gradient' },
  ],
  presets: [
    {
      name: 'Default Midnight Stats',
      settings: {
        variant: 'dark',
        heading: 'Proven Excellence by the Numbers',
        columns: 4,
        background_type: 'dark',
        stats: [
          { value: '150', suffix: 'K+', label: 'Verified Global Orders', icon: '📦' },
          { value: '99', suffix: '.4%', label: 'Positive Shopper Rating', icon: '⭐' },
          { value: '24', suffix: '/7', label: 'Dedicated Concierge Support', icon: '💬' },
          { value: '45', suffix: '+', label: 'Global Cities Served', icon: '🌍' },
        ],
      },
    },
  ],
  content: [
    { key: 'heading', type: 'richtext', label: 'Section Heading', default: 'Proven Excellence by the Numbers' },
    { key: 'columns', type: 'number', label: 'Columns in Row', default: 4, min: 2, max: 4 },
    {
      key: 'background_type',
      type: 'select',
      label: 'Background Theme',
      default: 'dark',
      options: [
        { label: 'Dark Slate', value: 'dark' },
        { label: 'Light Clean', value: 'light' },
        { label: 'Theme Gradient', value: 'gradient' },
      ],
    },
    {
      key: 'stats',
      type: 'repeater',
      label: 'Statistics List',
      itemLabel: 'Metric',
      default: [],
      fields: [
        { key: 'value', type: 'text', label: 'Number Value', default: '100' },
        { key: 'suffix', type: 'text', label: 'Suffix (e.g. + or %)', default: '+' },
        { key: 'label', type: 'text', label: 'Metric Description', default: 'Happy Clients' },
        { key: 'icon', type: 'text', label: 'Emoji / Icon Symbol', default: '✨' },
      ],
    },
  ],
  defaults: {
    variant: 'dark',
    heading: 'Proven Excellence by the Numbers',
    columns: 4,
    background_type: 'dark',
    stats: [
      { value: '150', suffix: 'K+', label: 'Verified Global Orders', icon: '📦' },
      { value: '99', suffix: '.4%', label: 'Positive Shopper Rating', icon: '⭐' },
      { value: '24', suffix: '/7', label: 'Dedicated Concierge Support', icon: '💬' },
      { value: '45', suffix: '+', label: 'Global Cities Served', icon: '🌍' },
    ],
  },
};
