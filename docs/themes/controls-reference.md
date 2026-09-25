# Visual Theme Editor — Controls Reference (Stage 46)

This document provides a comprehensive reference for the 15 core controls available in the Visual Theme Editor. Every section in the store (25+ sections) has access to all of these controls across Content, Style, and Advanced tabs.

---

## 1. SizeControl (`SizeControl.tsx`)
- **Capabilities**: Precision dimension and scale adjustment.
- **Controls**:
  - Horizontal range slider
  - Numeric input with instant keyboard entry
  - `▲` and `▼` increment/decrement buttons
  - Unit dropdown: `px`, `rem`, `em`, `%`, `vw`, `vh`
  - Reset to default value button
- **Use cases**: Font sizes, line heights, letter spacing, element widths, max-widths, offsets.

---

## 2. SpacingControl (`SpacingControl.tsx`)
- **Capabilities**: Elementor-style 4-direction spacing manager.
- **Controls**:
  - 4 inputs: Top, Right, Bottom, Left
  - Link toggle (`🔗`): When enabled, changing one side applies uniformly to all 4 sides; when unlinked, each side is adjusted independently
  - Unit selection: `px`, `rem`, `em`, `%`
  - Reset to 0 button
- **Use cases**: Section paddings, margins, container gutters.

---

## 3. ColorControl (`ColorControl.tsx`)
- **Capabilities**: High-precision color selection with alpha transparency.
- **Controls**:
  - Native browser HTML5 color picker
  - Hex code manual input (`#HEX`)
  - Alpha / Opacity slider (0% to 100%) converting automatically to `rgba(...)`
  - Theme preset color swatches
  - Browser Eyedropper API integration (where supported)
- **Use cases**: Text colors, solid background colors, overlay tints, accent highlights.

---

## 4. GradientControl (`GradientControl.tsx`)
- **Capabilities**: Unlimited color stops with 3 gradient types.
- **Controls**:
  - Gradient types: `Linear`, `Radial`, `Conic`
  - Angle slider (`0°` to `360°`) for linear gradients
  - Color stop list: Each stop features color picker, position percentage slider (0-100%), and remove button (`✕`)
  - **"+ Add Color Stop" button**: Dynamically adds 3rd, 4th, 5th up to 20 color stops
  - Live gradient preview bar
  - 10 one-click built-in designer presets (Emerald Sunrise, Neon Cyan, Sunset Fire, Royal Purple, etc.)
- **Use cases**: Section backgrounds, gradient borders, CTA button backgrounds.

---

## 5. ShadowControl (`ShadowControl.tsx`)
- **Capabilities**: Multi-layer stacked box shadows with limitless depth.
- **Controls**:
  - Multi-layer shadow list
  - **"+ Add Shadow Layer" button**: Stacks multiple independent shadow layers
  - Each layer controls:
    - Offset X (-100px to 100px)
    - Offset Y (-100px to 100px)
    - Blur radius (0 to 100px)
    - Spread radius (-50px to 50px)
    - Shadow color with alpha transparency
    - Inset vs Outset toggle
    - Layer removal
  - Interactive live preview box
  - Shadow animations: Pulse (infinite) or Glow (alternate)
- **Use cases**: Neumorphic cards, glowing buttons, floating hero banners, complex dual inset/outset depths.

---

## 6. BorderControl (`BorderControl.tsx`)
- **Capabilities**: Advanced border styles, multi-side widths, gradient borders, and animated borders.
- **Controls**:
  - Border style: `none`, `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `gradient`
  - Per-side width (Top, Right, Bottom, Left) with link toggle
  - Border color picker or inline `GradientControl` for gradient borders
  - Corner radius per corner (Top-Left, Top-Right, Bottom-Right, Bottom-Left) with link toggle and quick presets (0, 4, 8, 12, 16, Full Pill)
  - Animated borders: Pulse, Glow, Marching Ants, Rotating Gradient
  - Live preview box
- **Use cases**: Card borders, hero framing, rounded buttons, glowing promotional banners.

---

## 7. TypographyControl (`TypographyControl.tsx`)
- **Capabilities**: Full typography control system integrating the zero-latency R2 font library.
- **Controls**:
  - Font family selector linked to curated R2 fonts (Inter, Poppins, Roboto, Playfair Display, Outfit, etc.)
  - Font weight selector (100 Thin to 900 Black)
  - Font size with `SizeControl`
  - Line height with `SizeControl`
  - Letter spacing with `SizeControl`
  - Text alignment: Left, Center, Right, Justify
  - Text transformation: None, UPPERCASE, lowercase, Capitalize
  - Text decoration: None, Underline, Line-through
  - Font style: Normal, Italic, Oblique
  - Integrated `ColorControl`
  - Live text preview box
- **Use cases**: Headings, body copy, pricing text, subheadings, badges.

---

## 8. HoverControl (`HoverControl.tsx`)
- **Capabilities**: Dynamic CSS `:hover` state transition engine.
- **Controls**:
  - Enable hover state toggle
  - Transform Scale (0.5x to 2.0x)
  - Transform Rotate (-180° to +180°)
  - Transform Translate X and Translate Y (Lift effect)
  - Hover opacity (0% to 100%)
  - Hover background color override
  - Hover text color override
  - Hover border color override
  - Hover elevation presets: Small, Medium, Large Lift, 2XL Elevation, Green Glow, Blue Glow, Amber Glow
  - Transition duration slider (50ms to 1500ms)
  - Transition easing curve: Ease Out, Ease, Ease In, Ease In-Out, Linear
  - Interactive live hover testing card
- **Use cases**: Product cards, CTA buttons, feature boxes, testimonial badges.

---

## 9. AnimationControl (`AnimationControl.tsx`)
- **Capabilities**: 20 cinematic CSS keyframe animations for page entrance and viewport scroll reveal.
- **Entrance Animations**:
  - Presets: `fadeIn`, `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`, `zoomIn`, `zoomOut`, `bounceIn`, `flipInX`, `flipInY`, `rotateIn`, `pulse`, `swing`, `wobble`, `jello`, `heartBeat`, `flash`, `rubberBand`, `backInUp`, `lightSpeedInRight`
  - Duration slider (100ms to 3000ms)
  - Delay slider (0ms to 2000ms)
  - Easing curves: `ease-out`, `ease-in-out`, `ease`, `linear`
- **Scroll Reveal**:
  - Viewport trigger offset percentage (0% to 50%)
  - Repeat every time in view toggle
- **Replay button**: Instant live preview test without reloading
- **Use cases**: Hero section reveal, product grid staggering, newsletter callouts.

---

## 10. ResponsiveControl (`ResponsiveControl.tsx`)
- **Capabilities**: Device breakpoint overrides for Desktop, Tablet, and Mobile.
- **Controls**:
  - Breakpoint selector:
    - 🖥️ Desktop (`>= 1025px`)
    - 📱 Tablet (`768px - 1024px`)
    - 📱 Mobile (`<= 767px`)
  - Active override indicator (blue dot highlights customized device values)
  - "Copy from Desktop" one-click action
  - "Reset Override" action
- **Use cases**: Responsive padding, mobile font size scaling, column stacking.

---

## 11. RichTextControl (`RichTextControl.tsx`)
- **Capabilities**: WYSIWYG rich text editor with multi-color text spans and per-word animations.
- **Controls**:
  - Bold, Italic, Underline, Strikethrough
  - **Color Span / Per-Word / Per-Letter Color**: Select any text range or word, open the palette, and apply individual colors (`<span style="color: #HEX">word</span>`)
  - **Per-Word Animations**: Select any word to apply animations:
    - Bounce (`anim-bounceIn`)
    - Pulse (`anim-pulse`)
    - Neon Glow (`anim-glow`)
    - Rainbow Color Cycle (`anim-rainbow`)
  - Link insertion dialog
  - Clear formatting
  - HTML source mode toggle
  - Built-in XSS sanitization (strips `<script>`, `<iframe>`, `on*` event handlers)
- **Use cases**: Hero headings with emphasized colored words, animated CTA texts, styled announcements.

---

## 12. ZIndexControl (`ZIndexControl.tsx`)
- **Capabilities**: Stacking context and layer depth manager.
- **Controls**:
  - `Auto` mode vs integer index
  - Incremental `+` and `-` buttons
  - Quick presets: Auto, 0, 10, 20, 50, 999
- **Use cases**: Sticky headers, floating announcement bars, dropdown overlays.

---

## 13. CustomCSSControl (`CustomCSSControl.tsx`)
- **Capabilities**: Monospace scoped CSS editor with `selector` scoping keyword.
- **Controls**:
  - Monospace code textarea
  - `selector` keyword automatically compiled to `.section-{id}`
  - One-click snippet injection:
    - Glassmorphism
    - Neon Glow
    - Diagonal Skew (`clip-path`)
    - Hover Lift
  - Auto-sanitization (strips `@import`, malicious `url()`, and expression attacks)
- **Use cases**: Custom CSS clip-paths, specialized backdrop filters, unique micro-interactions.

---

## 14. PositionControl (`PositionControl.tsx`)
- **Capabilities**: CSS positioning and offsets.
- **Controls**:
  - Position types: `static`, `relative`, `absolute`, `fixed`, `sticky`
  - 4-direction offset inputs (Top, Right, Bottom, Left) using `SizeControl`
  - Integrated `ZIndexControl`
- **Use cases**: Sticky headers, floating banners, badge positioning.

---

## 15. BackgroundControl (`BackgroundControl.tsx`)
- **Capabilities**: Complete background styling system.
- **Controls**:
  - Background modes: `None`, `Color`, `Gradient`, `Image`, `Video`
  - Solid color via `ColorControl`
  - Unlimited gradient via `GradientControl`
  - Image background: URL input, Fit (`cover`, `contain`, `fill`, `auto`), Position (9-grid positions), Repeat (`no-repeat`, `repeat`, `repeat-x`, `repeat-y`), Attachment (`scroll`, `fixed`, `parallax`)
  - Video background: MP4/WebM URL, Loop, Muted, Autoplay
  - Background overlay: Color picker, opacity slider (0-100%), blend modes (`normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`)
- **Use cases**: Hero media backgrounds, video banners, subtle textured sections.
