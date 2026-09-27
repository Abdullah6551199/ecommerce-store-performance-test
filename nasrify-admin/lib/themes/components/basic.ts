import type { ComponentSchema } from '../component-schema';

export const BASIC_COMPONENT_SCHEMAS: ComponentSchema[] = [
  {
    type: 'divider',
    label: 'Divider Line',
    category: 'basic',
    description: 'Stylized line separator dividing section content',
    icon: '➖',
    variants: [
      { value: 'solid', label: 'Solid Line' },
      { value: 'dashed', label: 'Dashed' },
      { value: 'dotted', label: 'Dotted' },
      { value: 'double', label: 'Double' },
      { value: 'gradient', label: 'Gradient Glow' },
    ],
    content: [
      { key: 'width', type: 'text', label: 'Width (e.g. 100%, 80px)', default: '100%' },
      { key: 'height', type: 'number', label: 'Thickness (px)', default: 1, min: 1, max: 12 },
      {
        key: 'alignment',
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
    defaults: {
      width: '100%',
      height: 1,
      alignment: 'center',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'basic',
    description: 'Empty vertical space buffer with responsive heights',
    icon: '↕️',
    content: [
      { key: 'height_desktop', type: 'number', label: 'Desktop Height (px)', default: 32, min: 4, max: 240 },
      { key: 'height_mobile', type: 'number', label: 'Mobile Height (px)', default: 20, min: 4, max: 160 },
    ],
    defaults: {
      height_desktop: 32,
      height_mobile: 20,
    },
  },
  {
    type: 'icon_box',
    label: 'Icon Box',
    category: 'basic',
    description: 'Feature box pairing icon with headline and descriptive text',
    icon: '📦',
    variants: [
      { value: 'stacked', label: 'Stacked Center' },
      { value: 'horizontal', label: 'Horizontal Left' },
      { value: 'card', label: 'Contained Card' },
    ],
    content: [
      { key: 'icon', type: 'text', label: 'Icon Symbol or Emoji', default: '🚀' },
      { key: 'title', type: 'richtext', label: 'Title', default: 'Express Global Delivery' },
      { key: 'description', type: 'richtext', label: 'Description', default: 'Orders dispatched in 24 hours with worldwide express couriers.' },
      { key: 'link', type: 'url', label: 'Optional Box Link', default: '' },
    ],
    defaults: {
      icon: '🚀',
      title: 'Express Global Delivery',
      description: 'Orders dispatched in 24 hours with worldwide express couriers.',
      link: '',
    },
  },
  {
    type: 'image_box',
    label: 'Image Box',
    category: 'basic',
    description: 'Visual showcase box with thumbnail, title, body, and button',
    icon: '🎴',
    content: [
      { key: 'image_url', type: 'image', label: 'Image URL', default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop' },
      { key: 'title', type: 'richtext', label: 'Card Title', default: 'Precision Engineering' },
      { key: 'description', type: 'richtext', label: 'Description', default: 'Crafted with premium aerospace materials for unrivaled endurance.' },
      { key: 'button_text', type: 'text', label: 'Button Text', default: 'Discover More' },
      { key: 'button_link', type: 'url', label: 'Button Link', default: '/shop' },
    ],
    defaults: {
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
      title: 'Precision Engineering',
      description: 'Crafted with premium aerospace materials for unrivaled endurance.',
      button_text: 'Discover More',
      button_link: '/shop',
    },
  },
  {
    type: 'alert_box',
    label: 'Alert Box',
    category: 'basic',
    description: 'Callout notification banner (Info, Warning, Success, Promo)',
    icon: '🔔',
    variants: [
      { value: 'info', label: 'Informational Blue' },
      { value: 'success', label: 'Success Emerald' },
      { value: 'warning', label: 'Warning Amber' },
      { value: 'error', label: 'Urgent Rose' },
    ],
    content: [
      { key: 'title', type: 'text', label: 'Alert Headline', default: 'Limited Time Offer' },
      { key: 'message', type: 'richtext', label: 'Message Details', default: 'Enjoy free worldwide express shipping on orders over $150.' },
      { key: 'dismissible', type: 'boolean', label: 'Allow User Dismiss', default: true },
    ],
    defaults: {
      title: 'Limited Time Offer',
      message: 'Enjoy free worldwide express shipping on orders over $150.',
      dismissible: true,
    },
  },
  {
    type: 'progress_bar',
    label: 'Progress Bar',
    category: 'basic',
    description: 'Percentage progress meter (shipping tiers, campaign goals)',
    icon: '📊',
    variants: [
      { value: 'standard', label: 'Standard Flat' },
      { value: 'striped', label: 'Striped Animation' },
      { value: 'gradient', label: 'Gradient Fill' },
    ],
    content: [
      { key: 'label', type: 'text', label: 'Progress Label', default: 'Shipping Tier Qualified' },
      { key: 'percentage', type: 'number', label: 'Percentage (0 - 100)', default: 75, min: 0, max: 100 },
      { key: 'show_number', type: 'boolean', label: 'Show Percentage Text', default: true },
    ],
    defaults: {
      label: 'Shipping Tier Qualified',
      percentage: 75,
      show_number: true,
    },
  },
  {
    type: 'counter',
    label: 'Milestone Counter',
    category: 'basic',
    description: 'Dynamic animated number counter triggered on scroll',
    icon: '🔢',
    content: [
      { key: 'number', type: 'number', label: 'Target Number', default: 50000 },
      { key: 'prefix', type: 'text', label: 'Prefix (e.g. + or $)', default: '+' },
      { key: 'suffix', type: 'text', label: 'Suffix (e.g. k or %)', default: '' },
      { key: 'title', type: 'text', label: 'Counter Label', default: 'Satisfied Customers' },
    ],
    defaults: {
      number: 50000,
      prefix: '+',
      suffix: '',
      title: 'Satisfied Customers',
    },
  },
  {
    type: 'tabs',
    label: 'Interactive Tabs',
    category: 'basic',
    description: 'Multi-tabbed interactive content container',
    icon: '📑',
    content: [
      {
        key: 'items',
        type: 'repeater',
        label: 'Tab Pages',
        default: [
          { title: 'Overview', content: 'Comprehensive overview of features and specifications.' },
          { title: 'Materials', content: 'Crafted from sustainable recycled aerospace alloys.' },
          { title: 'Warranty', content: 'Backed by our comprehensive 2-year no-hassle guarantee.' },
        ],
        fields: [
          { key: 'title', type: 'text', label: 'Tab Title', default: 'Tab Title' },
          { key: 'content', type: 'richtext', label: 'Tab Content', default: 'Tab content description.' },
        ],
      },
    ],
    defaults: {
      items: [
        { title: 'Overview', content: 'Comprehensive overview of features and specifications.' },
        { title: 'Materials', content: 'Crafted from sustainable recycled aerospace alloys.' },
        { title: 'Warranty', content: 'Backed by our comprehensive 2-year no-hassle guarantee.' },
      ],
    },
  },
  {
    type: 'accordion',
    label: 'Accordion',
    category: 'basic',
    description: 'Collapsible accordion drawers for FAQs and specs',
    icon: '🪗',
    content: [
      {
        key: 'items',
        type: 'repeater',
        label: 'Accordion Panels',
        default: [
          { title: 'How does contactless delivery work?', content: 'Your courier leaves your package safely at your door with photo confirmation.' },
          { title: 'What is your exchange policy?', content: 'Complimentary exchanges within 30 days of receiving your package.' },
        ],
        fields: [
          { key: 'title', type: 'text', label: 'Panel Header', default: 'Question' },
          { key: 'content', type: 'richtext', label: 'Drawer Details', default: 'Detailed answer.' },
        ],
      },
    ],
    defaults: {
      items: [
        { title: 'How does contactless delivery work?', content: 'Your courier leaves your package safely at your door with photo confirmation.' },
        { title: 'What is your exchange policy?', content: 'Complimentary exchanges within 30 days of receiving your package.' },
      ],
    },
  },
  {
    type: 'icon_list',
    label: 'Icon List',
    category: 'basic',
    description: 'Bulleted checklist with custom status icons and links',
    icon: '📋',
    content: [
      {
        key: 'items',
        type: 'repeater',
        label: 'List Items',
        default: [
          { icon: '✓', text: '100% Certified Organic Materials' },
          { icon: '✓', text: 'Zero Carbon Footprint Shipping' },
          { icon: '✓', text: '30-Day Money Back Guarantee' },
        ],
        fields: [
          { key: 'icon', type: 'text', label: 'Icon / Check', default: '✓' },
          { key: 'text', type: 'text', label: 'List Item Text', default: 'Value proposition' },
          { key: 'link', type: 'url', label: 'Optional Link', default: '' },
        ],
      },
    ],
    defaults: {
      items: [
        { icon: '✓', text: '100% Certified Organic Materials' },
        { icon: '✓', text: 'Zero Carbon Footprint Shipping' },
        { icon: '✓', text: '30-Day Money Back Guarantee' },
      ],
    },
  },
  {
    type: 'social_icons',
    label: 'Social Follow Icons',
    category: 'basic',
    description: 'Row of branded social networking profile icons',
    icon: '🌐',
    content: [
      {
        key: 'items',
        type: 'repeater',
        label: 'Social Accounts',
        default: [
          { platform: 'Twitter', icon: '𝕏', url: 'https://twitter.com' },
          { platform: 'Instagram', icon: '📷', url: 'https://instagram.com' },
          { platform: 'YouTube', icon: '▶', url: 'https://youtube.com' },
        ],
        fields: [
          { key: 'platform', type: 'text', label: 'Platform Name', default: 'Twitter' },
          { key: 'icon', type: 'text', label: 'Icon / Symbol', default: '𝕏' },
          { key: 'url', type: 'url', label: 'Profile Link', default: 'https://' },
        ],
      },
    ],
    defaults: {
      items: [
        { platform: 'Twitter', icon: '𝕏', url: 'https://twitter.com' },
        { platform: 'Instagram', icon: '📷', url: 'https://instagram.com' },
        { platform: 'YouTube', icon: '▶', url: 'https://youtube.com' },
      ],
    },
  },
  {
    type: 'custom_html',
    label: 'Custom HTML / Shortcode',
    category: 'basic',
    description: 'Sandboxed raw HTML or embed block for custom widgets',
    icon: '💻',
    content: [
      { key: 'code', type: 'text', label: 'Raw HTML / Embed Code', default: '<div class="p-4 bg-slate-900 text-emerald-400 rounded-lg text-center font-mono">Custom Widget Active</div>' },
    ],
    defaults: {
      code: '<div class="p-4 bg-slate-900 text-emerald-400 rounded-lg text-center font-mono">Custom Widget Active</div>',
    },
  },
];
