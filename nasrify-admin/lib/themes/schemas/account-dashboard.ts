import { SectionSchema } from '../section-schema';

export const ACCOUNT_DASHBOARD_SCHEMA: SectionSchema = {
  type: 'account_dashboard',
  label: 'Account Dashboard',
  category: 'page',
  description: 'Customer account dashboard layout displaying orders, addresses, and profile details.',
  variants: [
    { value: 'tabs', label: 'Tabbed Layout' },
    { value: 'sidebar', label: 'Sidebar Navigation' },
    { value: 'cards', label: 'Grid Cards' },
  ],
  presets: [
    {
      name: 'Default Sidebar',
      settings: {
        variant: 'sidebar',
        welcome_title: 'My Account',
        show_recent_orders: true,
        orders_limit: 5,
        enable_profile_edit: true,
        enable_address_manager: true,
      },
    },
  ],
  content: [
    { key: 'welcome_title', type: 'text', label: 'Dashboard Welcome Title', default: 'My Account' },
    { key: 'show_recent_orders', type: 'boolean', label: 'Show Recent Orders Card', default: true },
    { key: 'orders_limit', type: 'number', label: 'Number of Orders to Display', default: 5, min: 1, max: 20 },
    { key: 'enable_profile_edit', type: 'boolean', label: 'Enable Profile Editing', default: true },
    { key: 'enable_address_manager', type: 'boolean', label: 'Enable Address Management', default: true },
    { key: 'support_message', type: 'richtext', label: 'Support / Help Desk Message', default: 'Need help with an order? Contact our support team 24/7.' },
  ],
  defaults: {
    variant: 'sidebar',
    welcome_title: 'My Account',
    show_recent_orders: true,
    orders_limit: 5,
    enable_profile_edit: true,
    enable_address_manager: true,
    support_message: 'Need help with an order? Contact our support team 24/7.',
  },
};
