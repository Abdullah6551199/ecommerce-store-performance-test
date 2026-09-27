# Component Schema Guide (Adding New Components)

This guide documents the architecture for building new Elementor-style components in the Nasrify Theme Engine.

---

## 1. Component Schema Architecture

Each micro-component declares its configuration fields, default values, and visual controls using the `ComponentSchema` interface:

```typescript
// nasrify-admin/lib/themes/component-schema.ts
export interface ComponentSchema {
  type: string;                     // Unique identifier (e.g. 'countdown_timer')
  label: string;                    // Display name (e.g. 'Countdown Timer')
  category: ComponentCategory;      // 'basic' | 'ecommerce' | 'form' | 'media' | 'content'
  description?: string;             // Subtitle in ComponentPicker
  icon?: string;                    // Emoji or SVG icon symbol
  variants?: ComponentVariant[];    // Predefined visual layouts
  presets?: ComponentPreset[];      // 1-click styling presets
  content: FieldConfig[];           // Content tab form inputs
  defaults: Record<string, any>;    // Default field values
  defaultStyle?: Record<string, any>;
  defaultAdvanced?: Record<string, any>;
}
```

---

## 2. Step-by-Step: Adding a New Component

### Step 1: Create the Schema Definition
Create your schema in `nasrify-admin/lib/themes/components/<category>.ts` or a new schema file:

```typescript
import { ComponentSchema } from '../component-schema';

export const MY_COMPONENT_SCHEMA: ComponentSchema = {
  type: 'badge_callout',
  label: 'Badge Callout',
  category: 'basic',
  icon: '🏷️',
  description: 'Eye-catching pill badge with icon and animated shine effect.',
  content: [
    {
      key: 'text',
      type: 'text',
      label: 'Badge Text',
      default: 'Limited Offer',
    },
    {
      key: 'icon',
      type: 'text',
      label: 'Icon / Emoji',
      default: '⚡',
    },
    {
      key: 'variant',
      type: 'select',
      label: 'Style Variant',
      options: [
        { label: 'Solid Glow', value: 'glow' },
        { label: 'Clean Outline', value: 'outline' },
      ],
      default: 'glow',
    },
  ],
  defaults: {
    text: 'Limited Offer',
    icon: '⚡',
    variant: 'glow',
  },
};
```

### Step 2: Register in `COMPONENT_SCHEMAS`
Add the new schema to `nasrify-admin/lib/themes/components/index.ts`:

```typescript
export const ALL_COMPONENT_SCHEMAS: ComponentSchema[] = [
  // ...
  MY_COMPONENT_SCHEMA,
];
```

### Step 3: Implement Storefront Renderer
Create the React component in `nasrify-store/components/themes/components/BadgeCallout.tsx`:

```tsx
import React from 'react';
import { EditableComponent } from '../EditableComponent';

export interface BadgeCalloutProps {
  id: string;
  sectionId?: string;
  settings?: {
    text?: string;
    icon?: string;
    variant?: string;
  };
}

export function BadgeCallout({ id, sectionId, settings = {} }: BadgeCalloutProps) {
  const text = settings.text || 'Limited Offer';
  const icon = settings.icon || '⚡';

  return (
    <EditableComponent
      id={id}
      type="badge_callout"
      sectionId={sectionId}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
    >
      <span>{icon}</span>
      <span>{text}</span>
    </EditableComponent>
  );
}

export default BadgeCallout;
```

### Step 4: Register in `COMPONENT_MAP`
In `nasrify-store/components/themes/components/index.ts`:
```typescript
import { BadgeCallout } from './BadgeCallout';

export const COMPONENT_MAP = {
  // ...
  badge_callout: BadgeCallout,
};
```

---

## 3. How Styling & Controls Auto-Apply

1. **Auto-Inherited Controls**: By using `BaseComponent` and `BaseComponentSettings`, your component automatically gets:
   - **Content Tab**: Form generated dynamically from `schema.content`
   - **Style Tab**: Typography, Background (Gradient/Color/Image), Border, Box Shadow, Hover State
   - **Advanced Tab**: Margin/Padding, CSS ID/Classes, Z-Index, Position, Responsive Hide, Entry Motion, Custom CSS
2. **CSS Generation**:
   - The CSS generator automatically loops through `section.settings._components[componentId]`.
   - Generates scoped CSS for `.section-{id} .component-{id}`.
   - Caches compiled CSS for 60 seconds with instant cache invalidation on edits.
3. **Hover & Visual Editing**:
   - `EditableComponent` stamps `data-component-id` and `data-component-type`.
   - `ThemePreviewOverlay` draws a real-time hover outline with pencil button and name badge.
   - Clicking pencil sends `EDIT_COMPONENT` to the editor panel.
