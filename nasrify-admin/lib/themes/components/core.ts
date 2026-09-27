import type { ComponentSchema } from '../component-schema';

export const CORE_COMPONENT_SCHEMAS: ComponentSchema[] = [
  {
    type: 'heading',
    label: 'Heading',
    category: 'basic',
    description: 'Prominent headline text (H1 - H6)',
    icon: '🔤',
    variants: [
      { value: 'h1', label: 'Heading 1' },
      { value: 'h2', label: 'Heading 2' },
      { value: 'h3', label: 'Heading 3' },
      { value: 'h4', label: 'Heading 4' },
      { value: 'h5', label: 'Heading 5' },
      { value: 'h6', label: 'Heading 6' },
    ],
    content: [
      { key: 'text', type: 'richtext', label: 'Heading Text', default: 'Empower Your Lifestyle' },
      {
        key: 'tag',
        type: 'select',
        label: 'HTML Tag',
        default: 'h2',
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
          { label: 'H5', value: 'h5' },
          { label: 'H6', value: 'h6' },
        ],
      },
    ],
    defaults: {
      text: 'Empower Your Lifestyle',
      tag: 'h2',
    },
  },
  {
    type: 'subheading',
    label: 'Subheading',
    category: 'basic',
    description: 'Secondary supportive sub-headline',
    icon: '📝',
    content: [
      { key: 'text', type: 'richtext', label: 'Subheading Text', default: 'Engineered for modern performance and comfort' },
    ],
    defaults: {
      text: 'Engineered for modern performance and comfort',
    },
  },
  {
    type: 'paragraph',
    label: 'Text / Paragraph',
    category: 'basic',
    description: 'Body narrative and descriptive text block',
    icon: '📄',
    content: [
      { key: 'text', type: 'richtext', label: 'Paragraph Content', default: 'Detailed descriptions explaining product value and brand heritage.' },
    ],
    defaults: {
      text: 'Detailed descriptions explaining product value and brand heritage.',
    },
  },
  {
    type: 'button',
    label: 'Button / Call-to-Action',
    category: 'basic',
    description: 'Interactive call-to-action button or link',
    icon: '🔘',
    variants: [
      { value: 'primary', label: 'Solid Primary' },
      { value: 'secondary', label: 'Subtle Secondary' },
      { value: 'outline', label: 'Border Outline' },
      { value: 'pill', label: 'Rounded Pill' },
    ],
    content: [
      { key: 'text', type: 'text', label: 'Button Label', default: 'Shop Now' },
      { key: 'link', type: 'url', label: 'Destination URL', default: '/shop' },
      { key: 'open_new_tab', type: 'boolean', label: 'Open in New Tab', default: false },
    ],
    defaults: {
      text: 'Shop Now',
      link: '/shop',
      open_new_tab: false,
    },
  },
  {
    type: 'image',
    label: 'Image',
    category: 'media',
    description: 'Standalone responsive image with caption',
    icon: '🖼️',
    content: [
      { key: 'url', type: 'image', label: 'Image Source', default: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
      { key: 'alt', type: 'text', label: 'Alt Text', default: 'Showcase product image' },
      { key: 'caption', type: 'text', label: 'Caption', default: '' },
    ],
    defaults: {
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      alt: 'Showcase product image',
      caption: '',
    },
  },
  {
    type: 'icon',
    label: 'Icon',
    category: 'basic',
    description: 'SVG or emoji status icon',
    icon: '⭐',
    content: [
      { key: 'icon', type: 'text', label: 'Icon Symbol or Emoji', default: '✨' },
      { key: 'size', type: 'number', label: 'Size (px)', default: 24, min: 12, max: 96 },
    ],
    defaults: {
      icon: '✨',
      size: 24,
    },
  },
  {
    type: 'badge',
    label: 'Badge / Pill',
    category: 'basic',
    description: 'Highlight pill label (New, Sale, Limited)',
    icon: '🏷️',
    variants: [
      { value: 'sale', label: 'Sale Accent' },
      { value: 'new', label: 'New Arrival' },
      { value: 'outline', label: 'Outline Subtle' },
    ],
    content: [
      { key: 'text', type: 'text', label: 'Badge Text', default: 'NEW' },
    ],
    defaults: {
      text: 'NEW',
    },
  },
  {
    type: 'link',
    label: 'Text Link',
    category: 'basic',
    description: 'Inline text hyperlink with hover arrow',
    icon: '🔗',
    content: [
      { key: 'text', type: 'text', label: 'Link Text', default: 'Explore Collections' },
      { key: 'url', type: 'url', label: 'Link URL', default: '/shop' },
    ],
    defaults: {
      text: 'Explore Collections',
      url: '/shop',
    },
  },
  {
    type: 'product_card',
    label: 'Product Card',
    category: 'ecommerce',
    description: 'Modular storefront product card with image, title, price, and CTA',
    icon: '🛍️',
    variants: [
      { value: 'standard', label: 'Standard Card' },
      { value: 'compact', label: 'Compact Grid' },
      { value: 'minimal', label: 'Minimalist Focus' },
    ],
    content: [
      { key: 'show_price', type: 'boolean', label: 'Show Price', default: true },
      { key: 'show_rating', type: 'boolean', label: 'Show Star Rating', default: true },
      { key: 'show_add_to_cart', type: 'boolean', label: 'Show Add to Cart Button', default: true },
    ],
    defaults: {
      show_price: true,
      show_rating: true,
      show_add_to_cart: true,
    },
  },
  {
    type: 'category_card',
    label: 'Category Card',
    category: 'ecommerce',
    description: 'Collection preview card with thumbnail image and link',
    icon: '🗂️',
    content: [
      { key: 'title', type: 'text', label: 'Category Title', default: 'Apparel' },
      { key: 'image_url', type: 'image', label: 'Thumbnail Image', default: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop' },
      { key: 'link', type: 'url', label: 'Category URL', default: '/category/apparel' },
    ],
    defaults: {
      title: 'Apparel',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      link: '/category/apparel',
    },
  },
  {
    type: 'testimonial_card',
    label: 'Testimonial Card',
    category: 'basic',
    description: 'Social review card with customer quote and avatar',
    icon: '💬',
    content: [
      { key: 'text', type: 'richtext', label: 'Quote Text', default: 'Exceptional craftsmanship and seamless checkout experience.' },
      { key: 'author', type: 'text', label: 'Author Name', default: 'Jessica M.' },
      { key: 'role', type: 'text', label: 'Customer Role / Badge', default: 'Verified Buyer' },
      { key: 'avatar', type: 'image', label: 'Avatar Photo', default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
    ],
    defaults: {
      text: 'Exceptional craftsmanship and seamless checkout experience.',
      author: 'Jessica M.',
      role: 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    },
  },
  {
    type: 'faq_item',
    label: 'FAQ Item',
    category: 'basic',
    description: 'Single collapsible question and answer block',
    icon: '❓',
    content: [
      { key: 'question', type: 'richtext', label: 'Question', default: 'What is your delivery timeframe?' },
      { key: 'answer', type: 'richtext', label: 'Answer', default: 'Orders are dispatched within 24-48 business hours with tracked express courier.' },
    ],
    defaults: {
      question: 'What is your delivery timeframe?',
      answer: 'Orders are dispatched within 24-48 business hours with tracked express courier.',
    },
  },
  {
    type: 'price_tag',
    label: 'Price Tag',
    category: 'ecommerce',
    description: 'Formatted regular and discounted currency display',
    icon: '💲',
    content: [
      { key: 'price', type: 'number', label: 'Regular Price', default: 99 },
      { key: 'sale_price', type: 'number', label: 'Sale Price (optional)', default: 79 },
      { key: 'currency', type: 'text', label: 'Currency Symbol', default: '$' },
    ],
    defaults: {
      price: 99,
      sale_price: 79,
      currency: '$',
    },
  },
  {
    type: 'rating_stars',
    label: 'Rating Stars',
    category: 'ecommerce',
    description: '5-star customer review rating display',
    icon: '⭐',
    content: [
      { key: 'rating', type: 'number', label: 'Rating Score (1-5)', default: 5, min: 1, max: 5, step: 0.1 },
      { key: 'count', type: 'number', label: 'Review Count (optional)', default: 128 },
    ],
    defaults: {
      rating: 5,
      count: 128,
    },
  },
  {
    type: 'stock_indicator',
    label: 'Stock Indicator',
    category: 'ecommerce',
    description: 'Availability status badge (In Stock, Low Stock, Pre-Order)',
    icon: '📦',
    variants: [
      { value: 'in_stock', label: 'In Stock' },
      { value: 'low_stock', label: 'Low Stock Urgency' },
      { value: 'out_of_stock', label: 'Out of Stock' },
    ],
    content: [
      { key: 'status_text', type: 'text', label: 'Custom Status Text', default: 'In Stock - Ready to Ship' },
    ],
    defaults: {
      status_text: 'In Stock - Ready to Ship',
    },
  },
];
