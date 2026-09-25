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
   - If no section is selected: loads Global Theme Settings (`GlobalSettings.tsx`):
     - **Typography / FontPicker (`FontPicker.tsx`)**: Visual font selector for Heading and Body fonts with category tabs (Sans, Serif, Display, Handwriting, Mono), live preview samples, and R2-backed font loading.
     - **Colors**: Primary, secondary, background, and surface color palettes.
     - **Store Identity**: Logo upload, favicon, and brand spacing.

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
| `Ctrl + D` / `Cmd + D` | Duplicate currently selected section |
| `Ctrl + C` / `Cmd + C` | Copy currently selected section to clipboard |
| `Ctrl + V` / `Cmd + V` | Paste copied section into theme |
| `Delete` / `Backspace` | Delete selected section (with confirmation modal) |
| `Arrow Up` / `Arrow Down` | Navigate and select sections in order |
| `Esc` | Deselect active section / Close open modals |

---

## Stage 42.5b Upgrades (Shopify Parity + Beyond)

### 1. Inline Editing
- **Double-click text in preview**: Double-clicking any heading, subheading, paragraph, banner text, or CTA button immediately enables inline editing directly in the storefront preview frame with visual focus outlines.
- **Save / Cancel**: Press `Enter` to confirm changes and dispatch `INLINE_EDIT` postMessage to the editor shell. Press `Esc` to cancel.
- **Safety**: Automatically disabled on touch / mobile devices (`ontouchstart` + screen width <= 768px) to protect mobile interactions.

### 2. Text Size Controls
- Dedicated size dropdowns (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`) for headings, subheadings, and CTA buttons.
- Standard Tailwind-compatible typography scaling applied dynamically on the storefront.

### 3. Duplicate Section
- Dedicated duplicate button on each section row in the sidebar.
- Clones section directly below the original with a new ID and duplicate name suffix, preserving all settings.

### 4. Delete with Confirmation
- Prevents accidental loss of complex sections via an interactive confirmation modal: *"Delete '[Section Name]'? This cannot be undone."*

### 5. Image Crop & 9-Grid Position Modal
- Built-in visual image modal supporting:
  - **Aspect ratios**: Free, 1:1, 16:9, 4:3, 3:2.
  - **9-point position grid**: Top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right.
  - **Zoom slider**: 100% to 200%.
  - **Fit modes**: `cover`, `contain`, `fill`.
- Stored as `crop_data` JSON and rendered natively using CSS `object-fit` and `object-position`.

### 6. Rich Text Editor
- Custom lightweight rich text editor with interactive toolbar:
  - Bold (`Ctrl+B`), Italic (`Ctrl+I`), Underline (`Ctrl+U`)
  - Link modal (URL insertion)
  - Bullet and numbered lists
  - Clear formatting
- Zero heavy dependencies; HTML output strictly sanitized against XSS attacks before storage and rendering.

### 7. Section Presets (1-Click Apply)
- One-click style presets for major sections:
  - **Hero**: *Centered Bold*, *Split Layout*, *Minimal Text*, *Fullscreen Cinematic*.
  - **Product Grid**: *Feature 4 Columns*, *Compact 3 Columns*, *Detailed 2 Columns*.
  - **Banner**: *Sale Alert*, *New Arrival*, *Side-by-Side Split*.
  - **Announcement Bar**: *Solid Brand*, *Vibrant Gradient*, *Subtle Bordered*.

### 8. Section Library with Wireframe Thumbnails
- Visual section picker with SVG wireframe thumbnails (200x120px) showing layout architecture for each section.
- Categorized tabs: *All*, *Content*, *Products*, *Marketing*, *Commerce*.
- Search filter for rapid section discovery.

### 9. Copy / Paste Section
- Copy button on section row stores section JSON into clipboard state and session storage.
- Dedicated paste action allows duplicating sections across pages or within the same page.

### 10. Per-Device Visibility
- Section visibility dropdown controls visibility per breakpoint:
  - Desktop (`min-width: 1025px`)
  - Tablet (`768px - 1024px`)
  - Mobile (`max-width: 767px`)
- Rendered via SSR responsive CSS classes (`hide-desktop`, `hide-tablet`, `hide-mobile`) with zero client-side layout shift.

---

## Section Settings Reference (Basic Mode)

- **Announcement Bar**: Text, link, background color, text color, dismissible toggle, presets.
- **Header Navigation**: Logo image upload, brand text fallback, navigation links repeater, sticky toggle.
- **Hero Banner**: Heading, heading size, rich text subheading, subheading size, CTA button text, button size & link, background image upload with crop modal, height, text alignment, style presets.
- **Product Grid**: Heading, heading size, subheading, columns (2/3/4), rows, multi-product picker (up to 16), price/rating/cart toggles, style presets.
- **Product Carousel**: Heading, multi-product picker (up to 12), autoplay, arrows, dots toggles.
- **Categories Showcase**: Heading, multi-category picker, column count, variant.
- **Customer Testimonials**: Heading, testimonial items repeater (quote, author, role, avatar upload).
- **Newsletter Signup**: Heading, subheading, input placeholder, button label, background color.
- **Promotional Banner**: Heading, heading size, rich text subtext, CTA button, button size & link, background image with crop modal, height, full-width / boxed variant, style presets.
- **Image with Text**: Heading, narrative copy, image upload with crop modal, left/right alignment, CTA button & link.
- **FAQ Accordion**: Heading, questions & answers repeater (up to 20 items), layout variant.
- **Store Footer**: Brand text, column links repeater (up to 4 columns), social links repeater, copyright notice, newsletter toggle.

---

## Performance & Guardrails
- **Editor State**: Managed 100% in memory with 30-snapshot history stack.
- **Auto-Save**: Debounced 2s to minimize D1 write load.
- **Preview Frame**: Communicates exclusively over `postMessage`; zero database queries, zero edge cache writes.
- **Storefront CPU**: Maintained under `<10ms` budget on all edge requests.

