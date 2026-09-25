# Visual Theme Editor (Elementor+ Level, Shopify Layout)

## Overview
The **Visual Theme Editor** (`/admin/theme-editor`) is Nasrify's unified, state-of-the-art visual customization suite. Following **Stage 46**, all advanced Elementor-grade styling, motion, and layout capabilities have been merged directly into the Visual Theme Editor, while retaining its clean, intuitive Shopify-style 3-pane layout.

---

## Editor Architecture & Layout
The editor renders in a dedicated full-screen workspace:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Top Bar: [← Admin] [Store Name] [Device: D|T|M] [Undo][Redo]           │
│          [Save Draft] [New Tab Preview] [Publish Live ▼]               │
├──────────────┬──────────────────────────────────────────┬──────────────┤
│              │                                          │              │
│ LEFT         │ CENTER                                   │ RIGHT        │
│ SECTIONS     │ Live Preview (iframe)                    │ SETTINGS     │
│              │                                          │ [Content]    │
│ ▸ Annc. Bar  │ ┌──────────────────────────────────────┐ │ [Style]      │
│ ▸ Header     │ │                                      │ │ [Advanced]   │
│ ▸ Hero       │ │ Storefront Live Render               │ │              │
│ ▸ Products   │ │                                      │ │ Accordions:  │
│ ▸ Categories │ │                                      │ │ 🔤 Typography│
│ ▸ Banner     │ │                                      │ │ 🎨 Background│
│ ▸ Footer     │ │                                      │ │ 🔲 Border    │
│              │ └──────────────────────────────────────┘ │ 🌓 Shadows   │
│ [+ Add Sec]  │                                          │ ⚡ Hover      │
└──────────────┴──────────────────────────────────────────┴──────────────┘
```

1. **Top Bar**:
   - Navigation back to `/admin`
   - Store name & status indicator
   - Device switcher: Desktop (100%), Tablet (768px), Mobile (375px)
   - Undo (`Ctrl+Z`) and Redo (`Ctrl+Shift+Z`) with 30-step history stack
   - Draft status indicator (`Draft saved`, `Saving draft...`, `Unsaved changes`)
   - Manual `Save Draft` (`Ctrl+S`)
   - New tab preview launcher (`?preview=1`)
   - Publish to live dropdown with discard draft option

2. **Left Sidebar — Page Sections (`SectionsList.tsx`)**:
   - Draggable sections tree powered by `@dnd-kit/core` & `@dnd-kit/sortable`
   - Real-time drag-and-drop reordering
   - Section visibility toggle (enable / disable without deleting)
   - Section deletion with undo snapshot
   - `+ Add Section` modal offering all 25+ framework sections

3. **Center — Live Preview Frame (`PreviewFrame.tsx`)**:
   - Zero-database overhead: communicates with storefront via `postMessage` (`UPDATE_THEME`)
   - Storefront `ThemePreviewWrapper.tsx` updates dynamic CSS variables, scoped CSS (`#theme-advanced-css`), and section tree in real time without refreshing or writing to D1
   - Device mode toggles viewport width smoothly
   - Inline double-click text editing on any heading, paragraph, or button

4. **Right Sidebar — Settings Panel (`SettingsPanel.tsx`)**:
   - **Content Tab**: Section-specific fields (e.g. Hero headings, CTA buttons, layout variants, image upload with cropping).
   - **Style Tab**:
     - 🔤 **Typography**: Font family (curated R2 fonts), weight (100-900), size, line height, letter spacing, transform, decoration, align, color.
     - 🎨 **Background**: Solid color, Unlimited gradient (linear/radial/conic, unlimited color stops), image with crop/fit/parallax, video background (mp4/webm), background overlay with blend modes.
     - 🔲 **Border & Corner Radius**: 8 border styles (including gradient border), per-side widths with link toggle, per-corner radius with link toggle, animated borders (pulse, glow, marching ants).
     - 🌓 **Multi-Layer Shadows**: Stacked unlimited shadow layers (inset + outset simultaneously), X/Y offsets, blur, spread, alpha color, animated shadows (pulse, glow).
     - ⚡ **Hover Effects**: Scale (0.5x-2x), rotate (-180° to 180°), lift (translate X/Y), opacity, hover colors, elevation shadow presets, transition curves and duration.
   - **Advanced Tab**:
     - 📐 **Spacing & Layout**: Elementor-style 4-side Padding & Margin with link toggle, Position mode (static, relative, absolute, fixed, sticky) and 4-direction offsets.
     - 📍 **Z-Index Layering**: Numerical index with auto-increment and quick presets.
     - 🎬 **Motion & Animations**: 20 entrance animation presets, scroll reveal with viewport trigger offset percentage, replay preview button.
     - 📱 **Responsive Visibility**: Per-device visibility toggles (Hide on Desktop, Hide on Tablet, Hide on Mobile).
     - 💻 **Custom CSS**: Scoped CSS editor supporting `selector` keyword, built-in snippets (Glassmorphism, Neon Glow, Skew, Hover Lift), and auto-sanitization.

---

## 60+ Feature Matrix

### Core & Framework
1. Clean 3-pane Shopify-style layout
2. Instant postMessage zero-reload live preview
3. 30-step undo/redo stack
4. Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Shift+Z)
5. Auto-save draft debounce (2s)
6. Publish to live with atomic D1 transaction
7. Discard draft rollback
8. Multi-device preview (Desktop, Tablet, Mobile)
9. Drag-and-drop section reordering
10. Section visibility toggle
11. Duplicate section
12. 1-click section style presets
13. Global theme settings (Colors, Fonts, Layout)
14. Section library (25+ section types supported)

### Typography & Rich Text
15. R2 Curated WebFont System (zero-latency Google Fonts alternative)
16. Font weight fine control (100 to 900)
17. Font size with multi-unit support (`px`, `rem`, `em`, `%`, `vw`, `vh`)
18. Line height and letter spacing sliders
19. Text transform (UPPERCASE, lowercase, Capitalize)
20. Text decoration (Underline, Line-through)
21. Text alignment (Left, Center, Right, Justify)
22. Multi-color text spans (`<span style="color:#HEX">`)
23. Per-word color styling
24. Per-letter color styling
25. Per-word animations (`anim-bounceIn`, `anim-pulse`, `anim-glow`, `anim-rainbow`)
26. Inline double-click text editing
27. Rich text link dialog
28. Strict XSS sanitization on rich text and custom CSS

### Backgrounds & Overlays
29. Solid color with hex and opacity alpha slider
30. Unlimited gradient color stops (add 3rd, 4th, 5th, up to 20 stops)
31. Linear gradient with 0-360° angle slider
32. Radial gradient
33. Conic gradient
34. 10 designer gradient presets
35. Background image upload with canvas cropping
36. Image fit (cover, contain, fill, auto)
37. Image position (9-grid anchor positions)
38. Image attachment (scroll, fixed, parallax)
39. Background video (MP4/WebM with loop, muted, autoplay)
40. Background overlay with color and opacity
41. Background overlay blend modes (normal, multiply, screen, overlay, darken, lighten)

### Borders & Shadows
42. 8 border styles (solid, dashed, dotted, double, groove, ridge, none, gradient)
43. Per-side border widths with link toggle
44. Gradient border with dynamic stops
45. Per-corner radius with link toggle
46. Corner radius quick presets (0, 4, 8, 12, 16, pill)
47. Animated borders (pulse, glow, marching ants)
48. Multi-layer box shadows (unlimited stacked layers)
49. Simultaneous inset and outset shadows
50. Shadow animations (infinite pulse, alternating glow)

### Motion, Hover & Advanced
51. 20 entrance animations (fadeIn, slideInUp, zoomIn, bounceIn, flipInX, rotateIn, pulse, etc.)
52. Scroll reveal triggered by viewport intersection
53. Viewport offset percentage trigger (0-50%)
54. Animation repeat toggle
55. Interactive replay animation button
56. Hover transform scale (0.5x to 2.0x)
57. Hover rotate (-180° to +180°)
58. Hover lift (translate X and Y)
59. Hover opacity and color changes (bg, text, border)
60. Hover shadow elevation presets
61. Transition duration (0-2000ms) and easing curves
62. Responsive device visibility (hide on desktop, tablet, mobile)
63. Monospace Custom CSS editor with `selector` scoping
64. Sub-10ms edge CPU performance with 60s micro-cache
