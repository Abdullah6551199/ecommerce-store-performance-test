import { ComponentSchema } from '../component-schema';

export const ECOMMERCE_COMPONENT_SCHEMAS: ComponentSchema[] = [
  {
    type: 'add_to_cart_btn',
    label: 'Add to Cart Button',
    category: 'ecommerce',
    description: 'Direct Add-to-Cart action button with cart feedback',
    icon: '🛒',
    variants: [
      { value: 'primary', label: 'Primary Brand Fill' },
      { value: 'secondary', label: 'Subtle Dark' },
      { value: 'outline', label: 'Outline Border' },
    ],
    content: [
      { key: 'text', type: 'text', label: 'Button Text', default: 'Add to Cart' },
      { key: 'show_icon', type: 'boolean', label: 'Show Cart Icon', default: true },
    ],
    defaults: {
      text: 'Add to Cart',
      show_icon: true,
    },
  },
  {
    type: 'buy_now_btn',
    label: 'Buy Now Button',
    category: 'ecommerce',
    description: 'Instant checkout CTA skipping cart view',
    icon: '⚡',
    variants: [
      { value: 'primary', label: 'Accent Highlight' },
      { value: 'dark', label: 'Deep Black' },
    ],
    content: [
      { key: 'text', type: 'text', label: 'Button Text', default: 'Buy Now' },
    ],
    defaults: {
      text: 'Buy Now',
    },
  },
  {
    type: 'quantity_selector',
    label: 'Quantity Selector',
    category: 'ecommerce',
    description: 'Interactive plus/minus counter for order item counts',
    icon: '➕',
    content: [
      { key: 'min', type: 'number', label: 'Minimum Quantity', default: 1, min: 1 },
      { key: 'max', type: 'number', label: 'Maximum Quantity', default: 99, min: 1 },
      { key: 'step', type: 'number', label: 'Step Interval', default: 1, min: 1 },
    ],
    defaults: {
      min: 1,
      max: 99,
      step: 1,
    },
  },
  {
    type: 'variant_selector',
    label: 'Variant Option Selector',
    category: 'ecommerce',
    description: 'Size, color, and finish selector pills or dropdown',
    icon: '🎛️',
    variants: [
      { value: 'pills', label: 'Clickable Pill Buttons' },
      { value: 'dropdown', label: 'Compact Dropdown' },
      { value: 'swatches', label: 'Color Swatches' },
    ],
    content: [
      { key: 'label', type: 'text', label: 'Option Label', default: 'Select Size' },
      { key: 'options_list', type: 'text', label: 'Options (comma separated)', default: 'S, M, L, XL' },
    ],
    defaults: {
      label: 'Select Size',
      options_list: 'S, M, L, XL',
    },
  },
  {
    type: 'wishlist_button',
    label: 'Wishlist Heart Button',
    category: 'ecommerce',
    description: 'Save to wishlist toggle with animated heart icon',
    icon: '❤️',
    content: [
      { key: 'show_label', type: 'boolean', label: 'Show Text Label', default: false },
      { key: 'label_text', type: 'text', label: 'Button Label', default: 'Save to Wishlist' },
    ],
    defaults: {
      show_label: false,
      label_text: 'Save to Wishlist',
    },
  },
  {
    type: 'compare_button',
    label: 'Compare Product Button',
    category: 'ecommerce',
    description: 'Add product to side-by-side comparison modal',
    icon: '⚖️',
    content: [
      { key: 'text', type: 'text', label: 'Button Text', default: 'Compare' },
    ],
    defaults: {
      text: 'Compare',
    },
  },
  {
    type: 'product_price',
    label: 'Product Price Display',
    category: 'ecommerce',
    description: 'Dynamic price display with sale badge and strike-through',
    icon: '🏷️',
    content: [
      { key: 'price', type: 'number', label: 'Current Price', default: 129 },
      { key: 'compare_at_price', type: 'number', label: 'Original Price (strike-through)', default: 169 },
      { key: 'currency', type: 'text', label: 'Currency Symbol', default: '$' },
    ],
    defaults: {
      price: 129,
      compare_at_price: 169,
      currency: '$',
    },
  },
  {
    type: 'countdown_timer',
    label: 'Sale Countdown Timer',
    category: 'ecommerce',
    description: 'Urgency countdown ticker (Days, Hours, Minutes, Seconds)',
    icon: '⏳',
    content: [
      { key: 'target_date', type: 'text', label: 'End Date (YYYY-MM-DD)', default: '2026-12-31' },
      { key: 'headline', type: 'text', label: 'Sale Headline', default: 'Flash Sale Ends In:' },
      { key: 'expired_text', type: 'text', label: 'Expired Message', default: 'Sale Ended' },
    ],
    defaults: {
      target_date: '2026-12-31',
      headline: 'Flash Sale Ends In:',
      expired_text: 'Sale Ended',
    },
  },
  {
    type: 'rating_input',
    label: 'Customer Review Rating Input',
    category: 'ecommerce',
    description: 'Interactive 5-star rating submission picker',
    icon: '🌟',
    content: [
      { key: 'label', type: 'text', label: 'Rating Prompt', default: 'Your Rating' },
      { key: 'default_rating', type: 'number', label: 'Default Stars', default: 5, min: 1, max: 5 },
    ],
    defaults: {
      label: 'Your Rating',
      default_rating: 5,
    },
  },
  {
    type: 'share_buttons',
    label: 'Social Share Buttons',
    category: 'ecommerce',
    description: 'One-click share triggers (WhatsApp, Twitter/X, Copy Link)',
    icon: '📤',
    content: [
      { key: 'show_whatsapp', type: 'boolean', label: 'WhatsApp Share', default: true },
      { key: 'show_twitter', type: 'boolean', label: 'Twitter / X Share', default: true },
      { key: 'show_copy_link', type: 'boolean', label: 'Copy Link Button', default: true },
    ],
    defaults: {
      show_whatsapp: true,
      show_twitter: true,
      show_copy_link: true,
    },
  },
];
