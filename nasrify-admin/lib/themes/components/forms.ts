import type { ComponentSchema } from '../component-schema';

export const FORM_COMPONENT_SCHEMAS: ComponentSchema[] = [
  {
    type: 'form_field',
    label: 'Form Input Field',
    category: 'form',
    description: 'Text, email, phone, or number form input element',
    icon: '📝',
    variants: [
      { value: 'standard', label: 'Bordered Box' },
      { value: 'underlined', label: 'Minimal Underline' },
    ],
    content: [
      { key: 'label', type: 'text', label: 'Field Label', default: 'Email Address' },
      { key: 'placeholder', type: 'text', label: 'Placeholder Text', default: 'name@example.com' },
      {
        key: 'input_type',
        type: 'select',
        label: 'Field Type',
        default: 'text',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'tel' },
          { label: 'Number', value: 'number' },
        ],
      },
      { key: 'required', type: 'boolean', label: 'Required Field', default: true },
    ],
    defaults: {
      label: 'Email Address',
      placeholder: 'name@example.com',
      input_type: 'text',
      required: true,
    },
  },
  {
    type: 'textarea_field',
    label: 'Textarea Field',
    category: 'form',
    description: 'Multi-line text message or instructions input',
    icon: '📄',
    content: [
      { key: 'label', type: 'text', label: 'Textarea Label', default: 'Order Notes / Inquiries' },
      { key: 'placeholder', type: 'text', label: 'Placeholder Text', default: 'Type your message here...' },
      { key: 'rows', type: 'number', label: 'Visible Rows', default: 4, min: 2, max: 12 },
      { key: 'required', type: 'boolean', label: 'Required Field', default: false },
    ],
    defaults: {
      label: 'Order Notes / Inquiries',
      placeholder: 'Type your message here...',
      rows: 4,
      required: false,
    },
  },
  {
    type: 'checkbox_radio',
    label: 'Checkbox / Radio Option',
    category: 'form',
    description: 'Toggleable agreement checkbox or radio selection',
    icon: '☑️',
    variants: [
      { value: 'checkbox', label: 'Square Checkbox' },
      { value: 'radio', label: 'Circular Radio' },
    ],
    content: [
      { key: 'label', type: 'text', label: 'Option Label', default: 'I agree to the Terms and Conditions' },
      { key: 'name', type: 'text', label: 'Input Group Name', default: 'terms' },
      { key: 'checked_default', type: 'boolean', label: 'Checked by Default', default: false },
    ],
    defaults: {
      label: 'I agree to the Terms and Conditions',
      name: 'terms',
      checked_default: false,
    },
  },
  {
    type: 'select_dropdown',
    label: 'Select Dropdown',
    category: 'form',
    description: 'Single-select dropdown with custom options',
    icon: '🔽',
    content: [
      { key: 'label', type: 'text', label: 'Dropdown Label', default: 'Preferred Courier' },
      {
        key: 'options',
        type: 'repeater',
        label: 'Select Options',
        default: [
          { label: 'DHL Express (1-2 Days)', value: 'dhl' },
          { label: 'FedEx Priority (2-3 Days)', value: 'fedex' },
          { label: 'Standard Delivery (3-5 Days)', value: 'standard' },
        ],
        fields: [
          { key: 'label', type: 'text', label: 'Option Label', default: 'Option Name' },
          { key: 'value', type: 'text', label: 'Option Value', default: 'val' },
        ],
      },
    ],
    defaults: {
      label: 'Preferred Courier',
      options: [
        { label: 'DHL Express (1-2 Days)', value: 'dhl' },
        { label: 'FedEx Priority (2-3 Days)', value: 'fedex' },
        { label: 'Standard Delivery (3-5 Days)', value: 'standard' },
      ],
    },
  },
  {
    type: 'submit_button',
    label: 'Form Submit Button',
    category: 'form',
    description: 'Primary submission button for forms and newsletters',
    icon: '🚀',
    variants: [
      { value: 'primary', label: 'Primary Brand Fill' },
      { value: 'dark', label: 'Sleek Dark' },
    ],
    content: [
      { key: 'text', type: 'text', label: 'Button Text', default: 'Send Message' },
      { key: 'full_width', type: 'boolean', label: 'Full Width Button', default: false },
    ],
    defaults: {
      text: 'Send Message',
      full_width: false,
    },
  },
];
