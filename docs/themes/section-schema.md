# BaseSection Architecture & Section Schema System

The **BaseSection Architecture** provides a declarative, schema-driven foundation for all 25 theme sections in Nasrify.

Instead of writing 60+ individual controls, accordion panels, and change handlers for every section, each section defines a single lightweight schema file. `BaseSectionSettings` automatically renders the complete editor interface.

---

## 1. Key Principles

1. **Schema-Driven**: A section defines its fields, options, and defaults in `lib/themes/schemas/{section-type}.ts`.
2. **Auto-Inherited Controls**: Every section automatically gains:
   - **Preset Bar**: 1-click styling presets.
   - **Variant Selector**: Seamless dropdown switching between layout variants.
   - **Content Tab**: Automatically mapped input controls for each content field.
   - **Style Tab**: Complete design controls (Typography, Background, Border, Shadow, Effects, Hover).
   - **Advanced Tab**: Layout/Spacing, Motion/Animation, Responsive device visibility, Custom CSS, and Positioning.
3. **10-Minute Section Turnaround**: Adding a new section requires only writing the content schema and creating the rendering component.

---

## 2. Directory Structure

```
nasrify-admin/
├── lib/themes/
│   ├── section-schema.ts               # Core schema interfaces & registry
│   └── schemas/                        # Individual section schemas
│       ├── hero.ts
│       ├── announcement.ts
│       ├── header.ts
│       ├── product-grid.ts
│       ├── _example-testimonial-compact.ts # Demonstration schema
│       └── ... (25 schemas)
└── components/theme-editor/
    ├── base/
    │   ├── BaseSectionSettings.tsx     # Auto-renders Content / Style / Advanced tabs
    │   ├── SchemaFieldRenderer.tsx     # Maps FieldConfig type -> UI control
    │   ├── useSectionSettings.ts       # Merges defaults & manages updates
    │   └── index.ts
    └── sections/                       # Section settings wrappers
        ├── HeroSettings.tsx            # <BaseSectionSettings schema={HERO_SCHEMA} {...props} />
        └── ...
```

---

## 3. How to Add a New Section in 10 Minutes

### Step 1: Create the Schema File (5 mins)
Create `nasrify-admin/lib/themes/schemas/my-new-section.ts`:

```typescript
import { SectionSchema } from '../section-schema';

export const MY_NEW_SECTION_SCHEMA: SectionSchema = {
  type: 'my_new_section',
  label: 'My New Section',
  category: 'content',
  description: 'Custom narrative section with badge and callout.',
  variants: [
    { value: 'standard', label: 'Standard Contained' },
    { value: 'split', label: 'Split Layout' },
  ],
  presets: [
    {
      name: 'Default Clean',
      settings: {
        variant: 'standard',
        title: 'Fresh Arrivals',
        show_badge: true,
      },
    },
  ],
  content: [
    { key: 'title', type: 'richtext', label: 'Section Title', default: 'Fresh Arrivals' },
    { key: 'show_badge', type: 'boolean', label: 'Display Promo Badge', default: true },
    { key: 'badge_text', type: 'text', label: 'Badge Label', default: 'New Release' },
  ],
  defaults: {
    variant: 'standard',
    title: 'Fresh Arrivals',
    show_badge: true,
    badge_text: 'New Release',
  },
};
```

### Step 2: Register in `section-schema.ts` (1 min)
Add the schema to `SECTION_SCHEMAS`:

```typescript
import { MY_NEW_SECTION_SCHEMA } from './schemas/my-new-section';

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  // ... existing schemas
  my_new_section: MY_NEW_SECTION_SCHEMA,
};
```

### Step 3: Add to Section Picker (1 min)
In `nasrify-admin/components/theme-editor/SectionPicker.tsx`:

```typescript
{
  type: 'my_new_section',
  name: 'My New Section',
  category: 'Content',
  description: 'Custom narrative section with badge and callout.',
  icon: '✨',
},
```

### Step 4: Create Storefront Renderer (3 mins)
In `nasrify-store/components/themes/sections/MyNewSection.tsx`, render the component using standard props and `renderRich(settings.title)`:

```tsx
import React from 'react';
import { renderRich } from '@/lib/themes/render-rich';

export function MyNewSection({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {settings.show_badge && (
        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-500 rounded-full">
          {settings.badge_text}
        </span>
      )}
      <h2
        className="text-2xl font-bold mt-2"
        dangerouslySetInnerHTML={renderRich(settings.title)}
      />
    </section>
  );
}
```

The editor immediately provides full Content, Style, and Advanced tabs with 60+ inherited controls automatically.

---

## 4. Supported Field Types in `FieldConfig`

| Field Type | Renders | Use Case |
|---|---|---|
| `text` | Standard text `<input>` | Titles, button labels, URLs |
| `richtext` | `RichTextField` with bold/italic/color/gradient | Headings, subheadings, quotes |
| `image` | `ImageUploadField` with crop & media picker | Hero banners, backgrounds, thumbnails |
| `number` | Numeric `<input>` with min/max/step | Limits, column counts, ratings |
| `boolean` | Checkbox toggle | Visibility toggles, feature switches |
| `select` | Dropdown `<select>` | Layout alignments, styles, sizes |
| `repeater` | Item list with Add/Remove/Sort | FAQs, Testimonials, Menu links |
| `color` | `ColorControl` | Custom brand accents |
| `size` | `SizeControl` with unit selection | Heights, font sizes |
| `spacing` | `SpacingControl` | Margins and paddings |
| `gradient` | `GradientControl` | Linear/radial background gradients |
| `shadow` | `ShadowControl` | Multi-layer drop shadows |
