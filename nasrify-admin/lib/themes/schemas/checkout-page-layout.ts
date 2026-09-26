import { SectionSchema } from '../section-schema';

export const CHECKOUT_PAGE_LAYOUT_SCHEMA: SectionSchema = {
  type: 'checkout_page_layout',
  label: 'Checkout Page Layout',
  category: 'page',
  description: 'Multi-step checkout layout with order summary and shipping details.',
  variants: [
    { value: 'one_step', label: 'One Step Checkout' },
    { value: 'multi_step', label: 'Multi-Step Accordion' },
    { value: 'two_column', label: 'Two Column Split' },
  ],
  presets: [
    {
      name: 'Default Clean',
      settings: {
        variant: 'two_column',
        show_coupon_box: true,
        enable_order_notes: true,
        summary_sticky: true,
      },
    },
  ],
  content: [
    { key: 'summary_title', type: 'text', label: 'Order Summary Title', default: 'Order Summary' },
    { key: 'show_coupon_box', type: 'boolean', label: 'Show Coupon / Promo Input', default: true },
    { key: 'enable_order_notes', type: 'boolean', label: 'Enable Delivery Notes', default: true },
    { key: 'summary_sticky', type: 'boolean', label: 'Sticky Order Summary Sidebar', default: true },
    { key: 'terms_text', type: 'richtext', label: 'Terms & Agreement Notice', default: 'By placing your order, you agree to our Terms of Service and Privacy Policy.' },
    { key: 'badge_guarantee_text', type: 'text', label: 'Guarantee Badge Text', default: '30-Day Money Back Guarantee & Secure Checkout' },
  ],
  defaults: {
    variant: 'two_column',
    summary_title: 'Order Summary',
    show_coupon_box: true,
    enable_order_notes: true,
    summary_sticky: true,
    terms_text: 'By placing your order, you agree to our Terms of Service and Privacy Policy.',
    badge_guarantee_text: '30-Day Money Back Guarantee & Secure Checkout',
  },
};
