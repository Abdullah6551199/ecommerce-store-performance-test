# Basic Visual Theme Editor (Shopify-like)

## Overview
The **Basic Visual Theme Editor** (`/admin/theme-editor`) is Nasrify's core built-in theme customizer. It provides store owners with an intuitive, drag-and-drop, no-code visual experience to customize their storefront theme layout, typography, colors, and content in real-time.

---

## Editor Architecture & Layout
The editor renders in a dedicated full-screen workspace bypassing standard admin chrome:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Top Bar: [← Admin] [Store Name] [Device: D|T|M] [Undo][Redo]           │
│          [Save Draft] [New Tab Preview] [Publish Live ▼]               │
├──────────────┬──────────────────────────────────────────┬──────────────┤
│              │                                          │              │
│ LEFT         │ CENTER                                   │ RIGHT        │
│ SECTIONS     │ Live Preview (iframe)                    │ SETTINGS     │
│              │                                          │              │
│ ▸ Annc. Bar  │ ┌──────────────────────────────────────┐ │ Selected:    │
│ ▸ Header     │ │                                      │ │ Hero Banner  │
│ ▸ Hero       │ │ Storefront Live Render               │ │              │
│ ▸ Products   │ │                                      │ │ Heading:     │
│ ▸ Categories │ │                                      │ │ [__________] │
│ ▸ Banner     │ │                                      │ │ Image:       │
│ ▸ Footer     │ │                                      │ │ [Upload]     │
│              │ └──────────────────────────────────────┘ │ CTA Text:    │
│ [+ Add Sec]  │                                          │ [__________] │
└──────────────┴──────────────────────────────────────────┴──────────────┘
```

1. **Top Bar**:
   - Navigation back to `/admin`
   - Store name & status indicator
   - Device switcher: Desktop (100%), Tablet (768px), Mobile (375px)
   - Undo (`Ctrl+Z`) and Redo (`Ctrl+Shift+Z`)
   - Draft status indicator (`Draft saved`, `Saving draft...`, `Unsaved changes`)
   - Manual `Save Draft` (`Ctrl+S`)
   - New tab preview launcher (`?preview=1`)
   - Publish to live dropdown with discard draft option

2. **Left Sidebar — Page Sections (`SectionsList.tsx`)**:
   - Vertical draggable list powered by `@dnd-kit/core` & `@dnd-kit/sortable`
   - Real-time drag-and-drop reordering
   - Section visibility toggle (enable / disable without deleting)
   - Section deletion with undo snapshot
   - `+ Add Section` modal (`SectionPicker.tsx`) offering all 12 framework sections

3. **Center — Live Preview Frame (`PreviewFrame.tsx`)**:
   - Zero-database overhead: communicates with storefront via `postMessage` (`UPDATE_THEME`)
   - Storefront `ThemePreviewWrapper.tsx` updates dynamic CSS variables (`#nasrify-theme-vars`) and section tree in real time without refreshing or writing to D1
   - Device mode toggles viewport width smoothly

4. **Right Sidebar — Settings Panel (`SettingsPanel.tsx`)**:
   - If a section is selected: loads section-specific preset controls (`SectionSettings.tsx`)
   - If no section is selected: loads Global Theme Settings (Colors, Fonts, Spacing, Store Logo)

---

## Draft vs. Publish Workflow

| Feature | Draft State | Published State |
| :--- | :--- | :--- |
| **Storage** | `theme_drafts` D1 table (`id = 'active-draft'`) | `active_theme` D1 table (`id = 'default'`) & `themes` row |
| **Live Storefront Impact** | Zero impact on regular customers | Immediate public update |
| **Auto-save** | Debounced 2s after any change | Requires confirmation dialog |
| **Edge Cache** | 20s in-memory micro-cache on admin reads | Instant storefront cache purge via cross-worker call |
| **Discarding** | Can be reverted to live active theme anytime | Permanent commit logged to `theme_audit_log` |

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Z` / `Cmd + Z` | Undo last change |
| `Ctrl + Shift + Z` / `Cmd + Shift + Z` | Redo undone change |
| `Ctrl + S` / `Cmd + S` | Save draft immediately |
| `Esc` | Deselect active section / Close open modals |

---

## Section Settings Reference (Basic Mode)

- **Announcement Bar**: Text, link, background color, text color, dismissible toggle.
- **Header Navigation**: Logo image upload, brand text fallback, navigation links repeater, sticky toggle.
- **Hero Banner**: Heading, subheading, CTA button text & link, background image upload, height, text alignment.
- **Product Grid**: Heading, subheading, columns (2/3/4), rows, multi-product picker (up to 16), price/rating/cart toggles.
- **Product Carousel**: Heading, multi-product picker (up to 12), autoplay, arrows, dots toggles.
- **Categories Showcase**: Heading, multi-category picker, column count, variant.
- **Customer Testimonials**: Heading, testimonial items repeater (quote, author, role, avatar upload).
- **Newsletter Signup**: Heading, subheading, input placeholder, button label, background color.
- **Promotional Banner**: Heading, subtext, CTA button & link, background image, height, full-width / boxed variant.
- **Image with Text**: Heading, narrative copy, image upload, left/right alignment, CTA button & link.
- **FAQ Accordion**: Heading, questions & answers repeater (up to 20 items), layout variant.
- **Store Footer**: Brand text, column links repeater (up to 4 columns), social links repeater, copyright notice, newsletter toggle.

---

## Performance & Guardrails
- **Editor State**: Managed 100% in memory with 30-snapshot history stack.
- **Auto-Save**: Debounced 2s to minimize D1 write load.
- **Preview Frame**: Communicates exclusively over `postMessage`; zero database queries, zero edge cache writes.
- **Storefront CPU**: Maintained under `<10ms` budget on all edge requests.
