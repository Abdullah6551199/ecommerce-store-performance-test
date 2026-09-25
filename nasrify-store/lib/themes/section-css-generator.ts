/**
 * Stage 46: High-Performance Scoped Section CSS Generator for Storefront (<10ms CPU target)
 * Compiles section._advanced configurations into scoped CSS rules, media queries, and keyframes.
 */

export interface GradientColorStop {
  color: string;
  position: number;
}

export interface GradientConfig {
  type: "linear" | "radial" | "conic";
  angle?: number;
  stops: GradientColorStop[];
}

export interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface BorderConfig {
  style: "none" | "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "gradient";
  width: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    linked: boolean;
    unit: "px" | "rem" | "em";
  };
  color: string;
  gradient?: GradientConfig;
  radius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
    linked: boolean;
    unit: "px" | "%" | "rem";
  };
  animation?: "none" | "pulse" | "glow" | "march" | "rotate-gradient";
  animationDuration?: number;
}

export interface TypographyConfig {
  fontFamily?: string;
  fontWeight?: string | number;
  fontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline" | "line-through";
  fontStyle?: "normal" | "italic" | "oblique";
  textAlign?: "left" | "center" | "right" | "justify";
  color?: string;
}

export interface HoverConfig {
  enabled: boolean;
  scale?: number;
  rotate?: number;
  translateX?: number;
  translateY?: number;
  opacity?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  shadowPreset?: string;
  duration?: number;
  easing?: string;
}

export interface PositionConfig {
  type: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number | "auto";
}

export interface BackgroundConfig {
  type: "none" | "color" | "gradient" | "image" | "video";
  color?: string;
  gradient?: GradientConfig;
  image?: {
    url: string;
    fit: "cover" | "contain" | "fill" | "auto";
    position: string;
    repeat: string;
    attachment: "scroll" | "fixed";
    parallax: boolean;
  };
  video?: {
    url: string;
    loop: boolean;
    muted: boolean;
    autoplay: boolean;
  };
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
    blendMode: string;
  };
}

export interface SectionAdvancedStyle {
  typography?: TypographyConfig;
  background?: BackgroundConfig;
  border?: BorderConfig;
  shadows?: ShadowLayer[];
  shadowAnimation?: "none" | "pulse" | "glow" | "fade";
  hover?: HoverConfig;
  position?: PositionConfig;
  padding?: { top?: number; right?: number; bottom?: number; left?: number; unit?: string };
  margin?: { top?: number; right?: number; bottom?: number; left?: number; unit?: string };
  opacity?: number;
}

export interface SectionAdvancedConfig {
  style?: SectionAdvancedStyle;
  animation?: {
    entrance?: {
      preset: string;
      duration: number;
      delay: number;
      easing: string;
    };
    scrollTrigger?: {
      enabled: boolean;
      preset: string;
      offsetPercent: number;
      repeat: boolean;
    };
  };
  responsive?: {
    hideOnDesktop?: boolean;
    hideOnTablet?: boolean;
    hideOnMobile?: boolean;
  };
  customCss?: string;
  [key: string]: any;
}

export const KEYFRAME_CSS = `
@keyframes anim-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes anim-slideInUp { from { transform: translate3d(0, 40px, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInDown { from { transform: translate3d(0, -40px, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInLeft { from { transform: translate3d(-40px, 0, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-slideInRight { from { transform: translate3d(40px, 0, 0); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-zoomIn { from { opacity: 0; transform: scale3d(0.7, 0.7, 0.7); } 50% { opacity: 1; } to { transform: scale3d(1, 1, 1); } }
@keyframes anim-zoomOut { from { opacity: 1; } 50% { opacity: 0.8; transform: scale3d(0.8, 0.8, 0.8); } to { opacity: 1; transform: scale3d(1, 1, 1); } }
@keyframes anim-bounceIn { 0%, 20%, 40%, 60%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); } 0% { opacity: 0; transform: scale3d(0.3, 0.3, 0.3); } 20% { transform: scale3d(1.1, 1.1, 1.1); } 40% { transform: scale3d(0.9, 0.9, 0.9); } 60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); } 80% { transform: scale3d(0.97, 0.97, 0.97); } 100% { opacity: 1; transform: scale3d(1, 1, 1); } }
@keyframes anim-flipInX { from { transform: perspective(400px) rotate3d(1, 0, 0, 90deg); opacity: 0; } 40% { transform: perspective(400px) rotate3d(1, 0, 0, -20deg); } 60% { transform: perspective(400px) rotate3d(1, 0, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(1, 0, 0, -5deg); } to { transform: perspective(400px); } }
@keyframes anim-flipInY { from { transform: perspective(400px) rotate3d(0, 1, 0, 90deg); opacity: 0; } 40% { transform: perspective(400px) rotate3d(0, 1, 0, -20deg); } 60% { transform: perspective(400px) rotate3d(0, 1, 0, 10deg); opacity: 1; } 80% { transform: perspective(400px) rotate3d(0, 1, 0, -5deg); } to { transform: perspective(400px); } }
@keyframes anim-rotateIn { from { transform: rotate3d(0, 0, 1, -200deg); opacity: 0; } to { transform: translate3d(0, 0, 0); opacity: 1; } }
@keyframes anim-pulse { 0% { transform: scale3d(1, 1, 1); } 50% { transform: scale3d(1.05, 1.05, 1.05); } 100% { transform: scale3d(1, 1, 1); } }
@keyframes anim-swing { 20% { transform: rotate3d(0, 0, 1, 15deg); } 40% { transform: rotate3d(0, 0, 1, -10deg); } 60% { transform: rotate3d(0, 0, 1, 5deg); } 80% { transform: rotate3d(0, 0, 1, -5deg); } 100% { transform: rotate3d(0, 0, 1, 0deg); } }
@keyframes anim-wobble { 0% { transform: translate3d(0, 0, 0); } 15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); } 30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); } 45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); } 60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); } 75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); } 100% { transform: translate3d(0, 0, 0); } }
@keyframes anim-jello { 0%, 11.1%, 100% { transform: translate3d(0, 0, 0); } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } }
@keyframes anim-heartBeat { 0% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }
@keyframes anim-flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }
@keyframes anim-rubberBand { 0% { transform: scale3d(1, 1, 1); } 30% { transform: scale3d(1.25, 0.75, 1); } 40% { transform: scale3d(0.75, 1.25, 1); } 50% { transform: scale3d(1.15, 0.85, 1); } 65% { transform: scale3d(0.95, 1.05, 1); } 75% { transform: scale3d(1.05, 0.95, 1); } 100% { transform: scale3d(1, 1, 1); } }
@keyframes anim-backInUp { 0% { transform: translateY(800px) scale(0.7); opacity: 0.7; } 80% { transform: translateY(0px) scale(0.7); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
@keyframes anim-lightSpeedInRight { from { transform: translate3d(100%, 0, 0) skewX(-30deg); opacity: 0; } 60% { transform: skewX(20deg); opacity: 1; } 80% { transform: skewX(-5deg); } to { transform: translate3d(0, 0, 0); } }
`;

export function sanitizeCustomCSS(css: string): string {
  if (!css) return "";
  return css
    .replace(/@import\s+[^;]+;/gi, "/* @import blocked */")
    .replace(/url\(\s*['"]?(?:javascript|vbscript|data:text\/html):/gi, "url('blocked:")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

function compileGradientCSS(gradient: GradientConfig): string {
  const stops = (gradient.stops || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  if (gradient.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  } else if (gradient.type === "conic") {
    return `conic-gradient(from ${gradient.angle || 0}deg, ${stops})`;
  }
  return `linear-gradient(${gradient.angle || 90}deg, ${stops})`;
}

function compileShadowLayersCSS(shadows: ShadowLayer[]): string {
  if (!shadows || shadows.length === 0) return "";
  return shadows
    .map((s) => {
      const inset = s.inset ? "inset " : "";
      return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
    })
    .join(", ");
}

export function generateSectionCSS(sectionId: string, advanced?: SectionAdvancedConfig): {
  desktopCSS: string;
  tabletCSS: string;
  mobileCSS: string;
  hoverCSS: string;
  customCSS: string;
  keyframesCSS: string;
} {
  if (!advanced) {
    return {
      desktopCSS: "",
      tabletCSS: "",
      mobileCSS: "",
      hoverCSS: "",
      customCSS: "",
      keyframesCSS: "",
    };
  }

  const selector = `.section-${sectionId}`;
  const style = advanced.style || {};
  const motion = advanced.animation;
  const responsive = advanced.responsive;

  const desktopDecls: string[] = [];
  const tabletDecls: string[] = [];
  const mobileDecls: string[] = [];
  const hoverDecls: string[] = [];
  let keyframesCSS = "";

  // 1. Typography
  if (style.typography) {
    const t = style.typography;
    if (t.fontFamily) desktopDecls.push(`font-family: "${t.fontFamily}", sans-serif;`);
    if (t.fontWeight) desktopDecls.push(`font-weight: ${t.fontWeight};`);
    if (t.fontSize) desktopDecls.push(`font-size: ${t.fontSize};`);
    if (t.lineHeight) desktopDecls.push(`line-height: ${t.lineHeight};`);
    if (t.letterSpacing) desktopDecls.push(`letter-spacing: ${t.letterSpacing};`);
    if (t.wordSpacing) desktopDecls.push(`word-spacing: ${t.wordSpacing};`);
    if (t.textTransform && t.textTransform !== "none") desktopDecls.push(`text-transform: ${t.textTransform};`);
    if (t.textDecoration && t.textDecoration !== "none") desktopDecls.push(`text-decoration: ${t.textDecoration};`);
    if (t.fontStyle && t.fontStyle !== "normal") desktopDecls.push(`font-style: ${t.fontStyle};`);
    if (t.textAlign) desktopDecls.push(`text-align: ${t.textAlign};`);
    if (t.color) desktopDecls.push(`color: ${t.color};`);
  }

  // 2. Background
  if (style.background) {
    const bg = style.background;
    if (bg.type === "color" && bg.color) {
      desktopDecls.push(`background-color: ${bg.color};`);
    } else if (bg.type === "gradient" && bg.gradient && bg.gradient.stops?.length) {
      desktopDecls.push(`background: ${compileGradientCSS(bg.gradient)};`);
    } else if (bg.type === "image" && bg.image?.url) {
      desktopDecls.push(`background-image: url('${bg.image.url}');`);
      desktopDecls.push(`background-size: ${bg.image.fit || "cover"};`);
      desktopDecls.push(`background-position: ${bg.image.position || "center"};`);
      desktopDecls.push(`background-repeat: ${bg.image.repeat || "no-repeat"};`);
      desktopDecls.push(`background-attachment: ${bg.image.attachment || "scroll"};`);
    }
  }

  // 3. Border & Radius
  if (style.border && style.border.style !== "none") {
    const b = style.border;
    const u = b.width.unit || "px";
    desktopDecls.push(`border-top-width: ${b.width.top}${u};`);
    desktopDecls.push(`border-right-width: ${b.width.right}${u};`);
    desktopDecls.push(`border-bottom-width: ${b.width.bottom}${u};`);
    desktopDecls.push(`border-left-width: ${b.width.left}${u};`);

    if (b.style === "gradient" && b.gradient) {
      desktopDecls.push(`border-style: solid;`);
      desktopDecls.push(`border-image: ${compileGradientCSS(b.gradient)} 1;`);
    } else {
      desktopDecls.push(`border-style: ${b.style};`);
      desktopDecls.push(`border-color: ${b.color};`);
    }

    const ru = b.radius.unit || "px";
    desktopDecls.push(
      `border-radius: ${b.radius.topLeft}${ru} ${b.radius.topRight}${ru} ${b.radius.bottomRight}${ru} ${b.radius.bottomLeft}${ru};`
    );

    if (b.animation && b.animation !== "none") {
      const dur = b.animationDuration || 2000;
      if (b.animation === "pulse") {
        desktopDecls.push(`animation: borderPulse ${dur}ms ease-in-out infinite;`);
        keyframesCSS += `@keyframes borderPulse { 0%, 100% { border-color: ${b.color}; } 50% { border-color: rgba(34, 197, 94, 0.9); } }\n`;
      } else if (b.animation === "glow") {
        desktopDecls.push(`animation: borderGlow ${dur}ms ease-in-out infinite alternate;`);
        keyframesCSS += `@keyframes borderGlow { from { box-shadow: 0 0 5px ${b.color}; } to { box-shadow: 0 0 20px ${b.color}, 0 0 35px ${b.color}; } }\n`;
      }
    }
  }

  // 4. Multi-layer Box Shadow & Animated Shadows
  if (style.shadows && style.shadows.length > 0) {
    const shadowCSS = compileShadowLayersCSS(style.shadows);
    if (shadowCSS) {
      desktopDecls.push(`box-shadow: ${shadowCSS};`);
    }

    if (style.shadowAnimation && style.shadowAnimation !== "none") {
      if (style.shadowAnimation === "pulse") {
        desktopDecls.push(`animation: shadowPulse 2.5s ease-in-out infinite;`);
        keyframesCSS += `@keyframes shadowPulse { 0%, 100% { box-shadow: ${shadowCSS}; } 50% { box-shadow: 0 0 25px rgba(34, 197, 94, 0.6), ${shadowCSS}; } }\n`;
      } else if (style.shadowAnimation === "glow") {
        desktopDecls.push(`animation: shadowGlow 2s ease-in-out infinite alternate;`);
        keyframesCSS += `@keyframes shadowGlow { from { box-shadow: ${shadowCSS}; } to { box-shadow: 0 0 35px rgba(59, 130, 246, 0.7), ${shadowCSS}; } }\n`;
      }
    }
  }

  // 5. Spacing
  if (style.padding) {
    const p = style.padding;
    const u = p.unit || "px";
    if (p.top !== undefined) desktopDecls.push(`padding-top: ${p.top}${u};`);
    if (p.right !== undefined) desktopDecls.push(`padding-right: ${p.right}${u};`);
    if (p.bottom !== undefined) desktopDecls.push(`padding-bottom: ${p.bottom}${u};`);
    if (p.left !== undefined) desktopDecls.push(`padding-left: ${p.left}${u};`);
  }
  if (style.margin) {
    const m = style.margin;
    const u = m.unit || "px";
    if (m.top !== undefined) desktopDecls.push(`margin-top: ${m.top}${u};`);
    if (m.right !== undefined) desktopDecls.push(`margin-right: ${m.right}${u};`);
    if (m.bottom !== undefined) desktopDecls.push(`margin-bottom: ${m.bottom}${u};`);
    if (m.left !== undefined) desktopDecls.push(`margin-left: ${m.left}${u};`);
  }

  // 6. Position & Z-Index
  if (style.position) {
    const pos = style.position;
    if (pos.type && pos.type !== "static") {
      desktopDecls.push(`position: ${pos.type};`);
      if (pos.top) desktopDecls.push(`top: ${pos.top};`);
      if (pos.right) desktopDecls.push(`right: ${pos.right};`);
      if (pos.bottom) desktopDecls.push(`bottom: ${pos.bottom};`);
      if (pos.left) desktopDecls.push(`left: ${pos.left};`);
    }
    if (pos.zIndex !== undefined && pos.zIndex !== "auto") {
      desktopDecls.push(`z-index: ${pos.zIndex};`);
    }
  }

  // 7. Motion
  if (motion?.entrance && motion.entrance.preset !== "none") {
    const e = motion.entrance;
    desktopDecls.push(
      `animation: anim-${e.preset} ${e.duration}ms ${e.easing} ${e.delay}ms both;`
    );
  }

  // 8. Hover State Effects
  if (style.hover && style.hover.enabled) {
    const h = style.hover;
    desktopDecls.push(
      `transition: all ${h.duration || 300}ms ${h.easing || "ease-out"};`
    );

    const transforms: string[] = [];
    if (h.scale && h.scale !== 1) transforms.push(`scale(${h.scale})`);
    if (h.rotate) transforms.push(`rotate(${h.rotate}deg)`);
    if (h.translateX || h.translateY)
      transforms.push(`translate(${h.translateX || 0}px, ${h.translateY || 0}px)`);

    if (transforms.length > 0) hoverDecls.push(`transform: ${transforms.join(" ")};`);
    if (h.opacity !== undefined && h.opacity !== 1) hoverDecls.push(`opacity: ${h.opacity};`);
    if (h.backgroundColor) hoverDecls.push(`background-color: ${h.backgroundColor} !important;`);
    if (h.textColor) hoverDecls.push(`color: ${h.textColor} !important;`);
    if (h.borderColor) hoverDecls.push(`border-color: ${h.borderColor} !important;`);
    if (h.shadowPreset && h.shadowPreset !== "none") {
      const presets: Record<string, string> = {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.6)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.6)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.6)",
      };
      if (presets[h.shadowPreset]) {
        hoverDecls.push(`box-shadow: ${presets[h.shadowPreset]} !important;`);
      }
    }
  }

  // 9. Responsive Visibility Overrides
  if (responsive) {
    if (responsive.hideOnDesktop) desktopDecls.push(`display: none !important;`);
    if (responsive.hideOnTablet) tabletDecls.push(`display: none !important;`);
    if (responsive.hideOnMobile) mobileDecls.push(`display: none !important;`);
  }

  // 10. Custom CSS Scoping
  let customCSS = "";
  if (advanced.customCss) {
    const sanitized = sanitizeCustomCSS(advanced.customCss);
    customCSS = sanitized.replace(/\bselector\b/g, selector);
  }

  const desktopCSS = desktopDecls.length > 0 ? `${selector} {\n  ${desktopDecls.join("\n  ")}\n}` : "";
  const tabletCSS = tabletDecls.length > 0 ? `${selector} {\n  ${tabletDecls.join("\n  ")}\n}` : "";
  const mobileCSS = mobileDecls.length > 0 ? `${selector} {\n  ${mobileDecls.join("\n  ")}\n}` : "";
  const hoverCSS = hoverDecls.length > 0 ? `${selector}:hover {\n  ${hoverDecls.join("\n  ")}\n}` : "";

  return {
    desktopCSS,
    tabletCSS,
    mobileCSS,
    hoverCSS,
    customCSS,
    keyframesCSS,
  };
}

/**
 * 60s Micro-Cache for Theme Advanced CSS
 */
const compiledCache = new Map<string, { css: string; expiry: number }>();

export function clearCSSCache(): void {
  compiledCache.clear();
}

/**
 * Compile all section styles in a theme into a single scoped stylesheet with media queries
 */
export function generateAdvancedCSS(themeConfig: {
  sections?: Record<string, { settings?: { _advanced?: SectionAdvancedConfig } }> | any[];
}): string {
  if (!themeConfig || !themeConfig.sections) return "";

  const sectionsList = Array.isArray(themeConfig.sections)
    ? themeConfig.sections
    : Object.entries(themeConfig.sections).map(([id, s]) => ({ id, settings: s.settings }));

  const hasAnyAdvanced = sectionsList.some((s) => Boolean(s.settings?._advanced));
  if (!hasAnyAdvanced) return "";

  const fingerprint = sectionsList
    .filter((s) => Boolean(s.settings?._advanced))
    .map((s) => `${s.id}:${JSON.stringify(s.settings?._advanced)}`)
    .join("::");

  const cached = compiledCache.get(fingerprint);
  const now = Date.now();
  if (cached && cached.expiry > now) {
    return cached.css;
  }

  const desktopBlocks: string[] = [];
  const tabletBlocks: string[] = [];
  const mobileBlocks: string[] = [];
  const hoverBlocks: string[] = [];
  const customBlocks: string[] = [];
  const keyframesBlocks: string[] = [KEYFRAME_CSS];

  keyframesBlocks.push(`
    .anim-glow { text-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e; }
    .anim-rainbow {
      background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444);
      background-size: 200% auto;
      color: transparent !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      animation: rainbowShift 3s linear infinite;
    }
    @keyframes rainbowShift { to { background-position: 200% center; } }
  `);

  sectionsList.forEach((section) => {
    if (!section.settings?._advanced) return;
    const res = generateSectionCSS(section.id, section.settings._advanced);
    if (res.desktopCSS) desktopBlocks.push(res.desktopCSS);
    if (res.tabletCSS) tabletBlocks.push(res.tabletCSS);
    if (res.mobileCSS) mobileBlocks.push(res.mobileCSS);
    if (res.hoverCSS) hoverBlocks.push(res.hoverCSS);
    if (res.customCSS) customBlocks.push(res.customCSS);
    if (res.keyframesCSS) keyframesBlocks.push(res.keyframesCSS);
  });

  const parts: string[] = [];

  if (keyframesBlocks.length > 0) {
    parts.push(keyframesBlocks.join("\n"));
  }
  if (desktopBlocks.length > 0) {
    parts.push(desktopBlocks.join("\n\n"));
  }
  if (hoverBlocks.length > 0) {
    parts.push(hoverBlocks.join("\n\n"));
  }
  if (tabletBlocks.length > 0) {
    parts.push(`@media (max-width: 1024px) {\n${tabletBlocks.join("\n\n")}\n}`);
  }
  if (mobileBlocks.length > 0) {
    parts.push(`@media (max-width: 767px) {\n${mobileBlocks.join("\n\n")}\n}`);
  }
  if (customBlocks.length > 0) {
    parts.push(customBlocks.join("\n\n"));
  }

  const finalCSS = parts.join("\n\n");
  compiledCache.set(fingerprint, { css: finalCSS, expiry: now + 60 * 1000 });
  return finalCSS;
}
