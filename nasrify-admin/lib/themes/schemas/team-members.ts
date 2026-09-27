import { SectionSchema } from '../section-schema';

export const TEAM_MEMBERS_SCHEMA: SectionSchema = {
  type: 'team_members',
  label: 'Team Members',
  category: 'content',
  description: 'Showcase company founders, designers, and team leadership with portraits and bios.',
  variants: [
    { value: 'grid', label: 'Classic Member Cards' },
    { value: 'carousel', label: 'Swipeable Carousel' },
    { value: 'horizontal', label: 'Horizontal Split Rows' },
  ],
  presets: [
    {
      name: 'Default Leadership Grid',
      settings: {
        variant: 'grid',
        heading: 'Meet the Artisans & Creators',
        subheading: 'Passionate craftspeople devoted to precision and aesthetic mastery.',
        columns: 3,
        members: [
          {
            name: 'Alexander Vance',
            role: 'Founder & Creative Director',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
            bio: 'Over 12 years directing luxury apparel and sustainable material architecture.',
            social_links: 'https://twitter.com',
          },
          {
            name: 'Elena Rostova',
            role: 'Head of Industrial Design',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
            bio: 'Award-winning minimalist product designer focusing on ergonomic tactile form.',
            social_links: 'https://instagram.com',
          },
          {
            name: 'Marcus Chen',
            role: 'Chief Technology Officer',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
            bio: 'Pioneering edge computing, ultra-fast interfaces, and distributed headless platforms.',
            social_links: 'https://github.com',
          },
        ],
      },
    },
  ],
  content: [
    { key: 'heading', type: 'richtext', label: 'Section Heading', default: 'Meet the Artisans & Creators' },
    { key: 'subheading', type: 'richtext', label: 'Subheading', default: 'Passionate craftspeople devoted to precision and aesthetic mastery.' },
    { key: 'columns', type: 'number', label: 'Columns in Grid', default: 3, min: 2, max: 4 },
    {
      key: 'members',
      type: 'repeater',
      label: 'Team Members List',
      itemLabel: 'Member',
      default: [
        {
          name: 'Alexander Vance',
          role: 'Founder & Creative Director',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          bio: 'Over 12 years directing luxury apparel and sustainable material architecture.',
          social_links: 'https://twitter.com',
        },
        {
          name: 'Elena Rostova',
          role: 'Head of Industrial Design',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
          bio: 'Award-winning minimalist product designer focusing on ergonomic tactile form.',
          social_links: 'https://instagram.com',
        },
      ],
      fields: [
        { key: 'name', type: 'text', label: 'Full Name', default: 'Team Member' },
        { key: 'role', type: 'text', label: 'Title / Role', default: 'Designer' },
        { key: 'image', type: 'image', label: 'Avatar Photo URL', default: '' },
        { key: 'bio', type: 'richtext', label: 'Short Biography', default: 'Crafting thoughtful experiences.' },
        { key: 'social_links', type: 'url', label: 'Social Profile URL', default: '' },
      ],
    },
  ],
  defaults: {
    variant: 'grid',
    heading: 'Meet the Artisans & Creators',
    subheading: 'Passionate craftspeople devoted to precision and aesthetic mastery.',
    columns: 3,
    members: [
      {
        name: 'Alexander Vance',
        role: 'Founder & Creative Director',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        bio: 'Over 12 years directing luxury apparel and sustainable material architecture.',
        social_links: 'https://twitter.com',
      },
      {
        name: 'Elena Rostova',
        role: 'Head of Industrial Design',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        bio: 'Award-winning minimalist product designer focusing on ergonomic tactile form.',
        social_links: 'https://instagram.com',
      },
      {
        name: 'Marcus Chen',
        role: 'Chief Technology Officer',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        bio: 'Pioneering edge computing, ultra-fast interfaces, and distributed headless platforms.',
        social_links: 'https://github.com',
      },
    ],
  },
};
