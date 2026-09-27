/**
 * Stage 46: High-Performance Scoped Section CSS Generator (Elementor+ level)
 * Compiles section._advanced configurations into scoped CSS rules, media queries, and keyframes.
 * Meets <10ms CPU target with 60s in-memory cache.
 */

import { GradientConfig } from "@/components/theme-editor/controls/GradientControl";
import { ShadowLayer } from "@/components/theme-editor/controls/ShadowControl";
import { BorderConfig } from "@/components/theme-editor/controls/BorderControl";
import { TypographyConfig } from "@/components/theme-editor/controls/TypographyControl";
import { HoverConfig } from "@/components/theme-editor/controls/HoverControl";
import { AnimationConfig, KEYFRAME_CSS } from "@/components/theme-editor/controls/AnimationControl";
import { PositionConfig } from "@/components/theme-editor/controls/PositionControl";
import { BackgroundConfig } from "@/components/theme-editor/controls/BackgroundControl";

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
  animation?: AnimationConfig;
  responsive?: {
    hideOnDesktop?: boolean;
    hideOnTablet?: boolean;
    hideOnMobile?: boolean;
  };
  customCss?: string;
  [key: string]: any;
}

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

export function generateSectionCSS(
  sectionId: string,
  advanced?: SectionAdvancedConfig,
  customSelector?: string
): {
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

  const selector = customSelector || `.section-${sectionId}`;
  const imp = customSelector ? " !important" : "";
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
    if (t.fontFamily) desktopDecls.push(`font-family: "${t.fontFamily}", sans-serif${imp};`);
    if (t.fontWeight) desktopDecls.push(`font-weight: ${t.fontWeight}${imp};`);
    if (t.fontSize) desktopDecls.push(`font-size: ${t.fontSize}${imp};`);
    if (t.lineHeight) desktopDecls.push(`line-height: ${t.lineHeight}${imp};`);
    if (t.letterSpacing) desktopDecls.push(`letter-spacing: ${t.letterSpacing}${imp};`);
    if (t.wordSpacing) desktopDecls.push(`word-spacing: ${t.wordSpacing}${imp};`);
    if (t.textTransform && t.textTransform !== "none") desktopDecls.push(`text-transform: ${t.textTransform}${imp};`);
    if (t.textDecoration && t.textDecoration !== "none") desktopDecls.push(`text-decoration: ${t.textDecoration}${imp};`);
    if (t.fontStyle && t.fontStyle !== "normal") desktopDecls.push(`font-style: ${t.fontStyle}${imp};`);
    if (t.textAlign) desktopDecls.push(`text-align: ${t.textAlign}${imp};`);
    if (t.color) desktopDecls.push(`color: ${t.color}${imp};`);
  }

  // 2. Background
  if (style.background) {
    const bg = style.background;
    if (bg.type === "color" && bg.color) {
      desktopDecls.push(`background-color: ${bg.color}${imp};`);
    } else if (bg.type === "gradient" && bg.gradient && bg.gradient.stops?.length) {
      desktopDecls.push(`background: ${compileGradientCSS(bg.gradient)}${imp};`);
    } else if (bg.type === "image" && bg.image?.url) {
      desktopDecls.push(`background-image: url('${bg.image.url}')${imp};`);
      desktopDecls.push(`background-size: ${bg.image.fit || "cover"}${imp};`);
      desktopDecls.push(`background-position: ${bg.image.position || "center"}${imp};`);
      desktopDecls.push(`background-repeat: ${bg.image.repeat || "no-repeat"}${imp};`);
      desktopDecls.push(`background-attachment: ${bg.image.attachment || "scroll"}${imp};`);
    }
  }

  // 3. Border & Radius
  if (style.border && style.border.style !== "none") {
    const b = style.border;
    const u = b.width?.unit || "px";
    if (b.width) {
      desktopDecls.push(`border-top-width: ${b.width.top ?? 1}${u}${imp};`);
      desktopDecls.push(`border-right-width: ${b.width.right ?? 1}${u}${imp};`);
      desktopDecls.push(`border-bottom-width: ${b.width.bottom ?? 1}${u}${imp};`);
      desktopDecls.push(`border-left-width: ${b.width.left ?? 1}${u}${imp};`);
    }

    if (b.style === "gradient" && b.gradient) {
      desktopDecls.push(`border-style: solid${imp};`);
      desktopDecls.push(`border-image: ${compileGradientCSS(b.gradient)} 1${imp};`);
    } else {
      desktopDecls.push(`border-style: ${b.style}${imp};`);
      desktopDecls.push(`border-color: ${b.color}${imp};`);
    }

    if (b.radius) {
      const ru = b.radius.unit || "px";
      desktopDecls.push(
        `border-radius: ${b.radius.topLeft ?? 0}${ru} ${b.radius.topRight ?? 0}${ru} ${b.radius.bottomRight ?? 0}${ru} ${b.radius.bottomLeft ?? 0}${ru}${imp};`
      );
    }

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

  // 5. Spacing (Padding & Margin)
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

  // 7. Motion / Entrance Animations
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

  let desktopCSS = desktopDecls.length > 0 ? `${selector} {\n  ${desktopDecls.join("\n  ")}\n}` : "";

  // Deep inheritance overrides for section child elements
  const extraRules: string[] = [];
  if (style.typography?.color) {
    extraRules.push(
      `${selector} h1, ${selector} h2, ${selector} h3, ${selector} h4, ${selector} p, ${selector} [data-editable], ${selector} span:not([style*="color"]) {\n  color: ${style.typography.color} !important;\n}`
    );
  }
  if (style.typography?.fontFamily) {
    extraRules.push(
      `${selector} h1, ${selector} h2, ${selector} h3, ${selector} h4, ${selector} p, ${selector} span, ${selector} [data-editable] {\n  font-family: "${style.typography.fontFamily}", sans-serif !important;\n}`
    );
  }
  if (style.background && (style.background.type === "color" || style.background.type === "gradient")) {
    extraRules.push(
      `${selector} > section, ${selector} > header, ${selector} > footer, ${selector} > aside {\n  background-color: transparent !important;\n}`
    );
  }
  if (style.shadows && style.shadows.length > 0) {
    const shadowCSS = compileShadowLayersCSS(style.shadows);
    if (shadowCSS) {
      extraRules.push(
        `${selector} .group {\n  box-shadow: ${shadowCSS};\n}`
      );
    }
  }

  if (extraRules.length > 0) {
    desktopCSS = desktopCSS ? `${desktopCSS}\n\n${extraRules.join("\n\n")}` : extraRules.join("\n\n");
  }

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

  const hasAnyAdvanced = sectionsList.some(
    (s) =>
      Boolean(s.settings?._advanced) ||
      Boolean(s.settings?._components && Object.keys(s.settings._components).length > 0)
  );
  if (!hasAnyAdvanced) return "";

  const fingerprint = sectionsList
    .map(
      (s) =>
        `${s.id}:${JSON.stringify(s.settings?._advanced || {})}:${JSON.stringify(
          s.settings?._components || {}
        )}`
    )
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

  // Add rich text word-animation styles
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
    // 1. Section-level CSS
    if (section.settings?._advanced) {
      const res = generateSectionCSS(section.id, section.settings._advanced);
      if (res.desktopCSS) desktopBlocks.push(res.desktopCSS);
      if (res.tabletCSS) tabletBlocks.push(res.tabletCSS);
      if (res.mobileCSS) mobileBlocks.push(res.mobileCSS);
      if (res.hoverCSS) hoverBlocks.push(res.hoverCSS);
      if (res.customCSS) customBlocks.push(res.customCSS);
      if (res.keyframesCSS) keyframesBlocks.push(res.keyframesCSS);
    }

    // 2. Component-level CSS (_components)
    const components = section.settings?._components;
    if (components && typeof components === "object") {
      Object.entries(components).forEach(([compKey, compVal]: [string, any]) => {
        if (!compVal || typeof compVal !== "object") return;
        const compAdvanced: SectionAdvancedConfig = {
          ...(compVal._advanced || compVal.advanced || {}),
          style: {
            ...(compVal._style || compVal.style || {}),
            ...((compVal._advanced || compVal.advanced || {}).style || {}),
          },
        };

        const compSelector = `.section-${section.id} .component-${compKey}, .section-${section.id} [data-component-id="${compKey}"], .section-${section.id} [data-editable="${compKey}"]`;
        const compRes = generateSectionCSS(section.id, compAdvanced, compSelector);

        if (compRes.desktopCSS) desktopBlocks.push(compRes.desktopCSS);
        if (compRes.tabletCSS) tabletBlocks.push(compRes.tabletCSS);
        if (compRes.mobileCSS) mobileBlocks.push(compRes.mobileCSS);
        if (compRes.hoverCSS) hoverBlocks.push(compRes.hoverCSS);
        if (compRes.customCSS) customBlocks.push(compRes.customCSS);
        if (compRes.keyframesCSS) keyframesBlocks.push(compRes.keyframesCSS);
      });
    }
  });

  const parts: string[] = [];

  // 1. Keyframes
  if (keyframesBlocks.length > 0) {
    parts.push(keyframesBlocks.join("\n"));
  }

  // 2. Desktop & Base Rules
  if (desktopBlocks.length > 0) {
    parts.push(desktopBlocks.join("\n\n"));
  }

  // 3. Hover Rules
  if (hoverBlocks.length > 0) {
    parts.push(hoverBlocks.join("\n\n"));
  }

  // 4. Tablet Breakpoint
  if (tabletBlocks.length > 0) {
    parts.push(`@media (max-width: 1024px) {\n${tabletBlocks.join("\n\n")}\n}`);
  }

  // 5. Mobile Breakpoint
  if (mobileBlocks.length > 0) {
    parts.push(`@media (max-width: 767px) {\n${mobileBlocks.join("\n\n")}\n}`);
  }

  // 6. Custom CSS Rules
  if (customBlocks.length > 0) {
    parts.push(customBlocks.join("\n\n"));
  }

  const finalCSS = parts.join("\n\n");
  compiledCache.set(fingerprint, { css: finalCSS, expiry: now + 60 * 1000 });
  return finalCSS;
}
