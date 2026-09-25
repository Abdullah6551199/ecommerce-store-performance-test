/**
 * CSS Generation Engine for Stage 42.6: Advanced Theme Editor
 * Compiles section._advanced settings into scoped CSS rules, media queries, and keyframes.
 */

import { SectionAdvancedData, SpacingValue, BreakpointConfig } from '../shared/types';
import { ANIMATION_PRESETS, getAllAnimationKeyframesCSS } from './animation-presets';
import { DEFAULT_BREAKPOINTS } from './responsive';

/**
 * Sanitize custom CSS by removing dangerous rules like @import or unverified external urls
 */
export function sanitizeCustomCSS(css: string): string {
  if (!css) return '';
  return css
    .replace(/@import\s+[^;]+;/gi, '/* @import blocked */')
    .replace(/url\(\s*['"]?(?:https?:|\/\/)[^'"]+['"]?\s*\)/gi, '/* external url blocked */')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

function formatSpacing(spacing?: any): string {
  if (!spacing) return '';
  if (typeof spacing === 'string') return spacing;
  const unit = spacing.unit || '';
  const top = spacing.top ? `${spacing.top}${spacing.top.toString().endsWith('px') || spacing.top.toString().endsWith('rem') || spacing.top.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  const right = spacing.right ? `${spacing.right}${spacing.right.toString().endsWith('px') || spacing.right.toString().endsWith('rem') || spacing.right.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  const bottom = spacing.bottom ? `${spacing.bottom}${spacing.bottom.toString().endsWith('px') || spacing.bottom.toString().endsWith('rem') || spacing.bottom.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  const left = spacing.left ? `${spacing.left}${spacing.left.toString().endsWith('px') || spacing.left.toString().endsWith('rem') || spacing.left.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  return `${top} ${right} ${bottom} ${left}`;
}

function formatBorderRadius(radius?: any): string {
  if (!radius) return '';
  if (typeof radius === 'string') return radius;
  const unit = radius.unit || '';
  const tl = radius.top ? `${radius.top}${radius.top.toString().endsWith('px') || radius.top.toString().endsWith('rem') || radius.top.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  const tr = radius.right ? `${radius.right}${radius.right.toString().endsWith('px') || radius.right.toString().endsWith('rem') || radius.right.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  const br = radius.bottom ? `${radius.bottom}${radius.bottom.toString().endsWith('px') || radius.bottom.toString().endsWith('rem') || radius.bottom.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  const bl = radius.left ? `${radius.left}${radius.left.toString().endsWith('px') || radius.left.toString().endsWith('rem') || radius.left.toString().endsWith('%') ? '' : unit || 'px'}` : '0';
  return `${tl} ${tr} ${br} ${bl}`;
}

/**
 * Generate CSS block for a single section
 */
export function generateSectionCSS(
  sectionId: string,
  advancedData?: SectionAdvancedData,
  breakpoints: BreakpointConfig[] = DEFAULT_BREAKPOINTS
): {
  desktopCSS: string;
  tabletCSS: string;
  mobileCSS: string;
  customCSS: string;
  usedAnimations: string[];
} {
  if (!advancedData) {
    return { desktopCSS: '', tabletCSS: '', mobileCSS: '', customCSS: '', usedAnimations: [] };
  }

  const style = advancedData.style || (advancedData as any);
  const advanced = advancedData.advanced || (advancedData as any);
  const selector = `.section-${sectionId}`;
  const desktopDecls: string[] = [];
  const tabletDecls: string[] = [];
  const mobileDecls: string[] = [];
  const usedAnimations: string[] = [];

  // 1. Typography
  if (style?.typography) {
    const t = style.typography;
    if (t.fontFamily) desktopDecls.push(`font-family: ${t.fontFamily}, sans-serif;`);
    if (t.fontWeight) desktopDecls.push(`font-weight: ${t.fontWeight};`);
    if (t.lineHeight) desktopDecls.push(`line-height: ${t.lineHeight};`);
    if (t.letterSpacing) desktopDecls.push(`letter-spacing: ${t.letterSpacing};`);
    if (t.textTransform && t.textTransform !== 'none') desktopDecls.push(`text-transform: ${t.textTransform};`);
    if (t.textDecoration && t.textDecoration !== 'none') desktopDecls.push(`text-decoration: ${t.textDecoration};`);
    if (t.fontStyle && t.fontStyle !== 'normal') desktopDecls.push(`font-style: ${t.fontStyle};`);
    if (t.color) desktopDecls.push(`color: ${t.color};`);

    if (typeof t.fontSize === 'string') {
      desktopDecls.push(`font-size: ${t.fontSize};`);
    } else if (t.fontSize?.desktop) {
      desktopDecls.push(`font-size: ${t.fontSize.desktop};`);
    }
    if (t.fontSize?.tablet) tabletDecls.push(`font-size: ${t.fontSize.tablet};`);
    if (t.fontSize?.mobile) mobileDecls.push(`font-size: ${t.fontSize.mobile};`);
  }

  // 2. Background
  if (style?.background) {
    const b = style.background;
    if (b.type === 'classic' && b.color) {
      desktopDecls.push(`background-color: ${b.color};`);
    } else if (b.type === 'gradient' && b.gradient) {
      const g = b.gradient;
      if (g.type === 'radial') {
        desktopDecls.push(`background: radial-gradient(circle, ${g.color1}, ${g.color2});`);
      } else {
        desktopDecls.push(`background: linear-gradient(${g.angle || 90}deg, ${g.color1}, ${g.color2});`);
      }
    } else if (b.type === 'image' && b.image?.url) {
      const img = b.image;
      desktopDecls.push(`background-image: url('${img.url}');`);
      if (img.position) desktopDecls.push(`background-position: ${img.position};`);
      if (img.size) desktopDecls.push(`background-size: ${img.size};`);
      if (img.repeat) desktopDecls.push(`background-repeat: ${img.repeat};`);
      if (img.attachment) desktopDecls.push(`background-attachment: ${img.attachment};`);
    }
  }

  // 3. Border
  if (style?.border) {
    const b = style.border;
    if (b.type && b.type !== 'none') {
      desktopDecls.push(`border-style: ${b.type};`);
      if (b.color) desktopDecls.push(`border-color: ${b.color};`);
      if (b.width) {
        desktopDecls.push(`border-width: ${formatSpacing(b.width)};`);
      }
    }
    if (b.radius) {
      desktopDecls.push(`border-radius: ${formatBorderRadius(b.radius)};`);
    }
  }

  // 4. Box Shadow
  if (style?.boxShadow) {
    const bs = style.boxShadow;
    const x = bs.x ?? (bs as any).horizontal ?? 0;
    const y = bs.y ?? (bs as any).vertical ?? 4;
    const blur = bs.blur ?? 12;
    const spread = bs.spread ?? 0;
    const color = bs.color || 'rgba(0, 0, 0, 0.1)';
    const inset = bs.inset || (bs as any).position === 'inset' ? 'inset ' : '';
    desktopDecls.push(`box-shadow: ${inset}${x} ${y} ${blur} ${spread} ${color};`);
  }

  // 5. Effects
  if (style?.effects) {
    const eff = style.effects;
    if (eff.opacity !== undefined && eff.opacity < 100) {
      desktopDecls.push(`opacity: ${eff.opacity / 100};`);
    }
    const filters: string[] = [];
    if (eff.blur) filters.push(`blur(${eff.blur}px)`);
    if (eff.brightness !== undefined && eff.brightness !== 100) filters.push(`brightness(${eff.brightness}%)`);
    if (eff.contrast !== undefined && eff.contrast !== 100) filters.push(`contrast(${eff.contrast}%)`);
    if (eff.saturate !== undefined && eff.saturate !== 100) filters.push(`saturate(${eff.saturate}%)`);
    if (eff.hueRotate) filters.push(`hue-rotate(${eff.hueRotate}deg)`);
    if (filters.length > 0) desktopDecls.push(`filter: ${filters.join(' ')};`);

    if (eff.blendMode && eff.blendMode !== 'normal') {
      desktopDecls.push(`mix-blend-mode: ${eff.blendMode};`);
    }

    if (eff.transform) {
      const tr = eff.transform;
      const transforms: string[] = [];
      if (tr.rotate) transforms.push(`rotate(${tr.rotate}deg)`);
      if (tr.scale !== undefined && tr.scale !== 1) transforms.push(`scale(${tr.scale})`);
      if (tr.skewX) transforms.push(`skewX(${tr.skewX}deg)`);
      if (tr.skewY) transforms.push(`skewY(${tr.skewY}deg)`);
      if (tr.translateX || tr.translateY) transforms.push(`translate(${tr.translateX || 0}px, ${tr.translateY || 0}px)`);
      if (transforms.length > 0) desktopDecls.push(`transform: ${transforms.join(' ')};`);
    }
  }

  // 6. Layout
  if (advanced?.layout) {
    const l = advanced.layout;
    if (l.margin?.desktop) desktopDecls.push(`margin: ${formatSpacing(l.margin.desktop)};`);
    if (l.margin?.tablet) tabletDecls.push(`margin: ${formatSpacing(l.margin.tablet)};`);
    if (l.margin?.mobile) mobileDecls.push(`margin: ${formatSpacing(l.margin.mobile)};`);

    if (l.padding?.desktop) desktopDecls.push(`padding: ${formatSpacing(l.padding.desktop)};`);
    if (l.padding?.tablet) tabletDecls.push(`padding: ${formatSpacing(l.padding.tablet)};`);
    if (l.padding?.mobile) mobileDecls.push(`padding: ${formatSpacing(l.padding.mobile)};`);

    if (l.width === 'full') desktopDecls.push(`width: 100%;`);
    else if (l.width === 'custom') {
      if (l.customWidth?.desktop) desktopDecls.push(`width: ${l.customWidth.desktop};`);
      if (l.customWidth?.tablet) tabletDecls.push(`width: ${l.customWidth.tablet};`);
      if (l.customWidth?.mobile) mobileDecls.push(`width: ${l.customWidth.mobile};`);
    }

    if (l.maxWidth) desktopDecls.push(`max-width: ${l.maxWidth};`);
    if (l.minHeight) desktopDecls.push(`min-height: ${l.minHeight};`);
    if (l.overflow && l.overflow !== 'visible') desktopDecls.push(`overflow: ${l.overflow};`);
    if (l.position && l.position !== 'default') desktopDecls.push(`position: ${l.position};`);
    if (l.zIndex !== undefined) desktopDecls.push(`z-index: ${l.zIndex};`);
  }

  // 7. Motion Effects
  if (advanced?.motion) {
    const m = advanced.motion;
    const entrance = m.entranceAnimation || (m as any).entrance?.animation;
    if (entrance && ANIMATION_PRESETS[entrance]) {
      const anim = ANIMATION_PRESETS[entrance];
      const dur = m.animationDuration || (m as any).entrance?.duration || anim.duration;
      const delay = m.animationDelay || (m as any).entrance?.delay || 0;
      const easing = m.animationEasing || (m as any).entrance?.easing || anim.easing;
      desktopDecls.push(`animation: ate-${entrance} ${dur}ms ${easing} ${delay}ms both;`);
      usedAnimations.push(entrance);
    }
  }

  // 8. Responsive Device Visibility
  if (advanced?.responsive) {
    const r = advanced.responsive;
    if (r.hideOnDesktop) {
      desktopDecls.push(`display: none !important;`);
    }
    if (r.hideOnTablet) {
      tabletDecls.push(`display: none !important;`);
    }
    if (r.hideOnMobile) {
      mobileDecls.push(`display: none !important;`);
    }
  }

  // 9. Custom CSS
  let compiledCustomCSS = '';
  if (advanced?.customCss) {
    const sanitized = sanitizeCustomCSS(advanced.customCss);
    // Replace 'selector' with the section's class name
    compiledCustomCSS = sanitized.replace(/\bselector\b/g, selector);
  }

  const desktopCSS = desktopDecls.length > 0 ? `${selector} {\n  ${desktopDecls.join('\n  ')}\n}` : '';
  const tabletCSS = tabletDecls.length > 0 ? `${selector} {\n  ${tabletDecls.join('\n  ')}\n}` : '';
  const mobileCSS = mobileDecls.length > 0 ? `${selector} {\n  ${mobileDecls.join('\n  ')}\n}` : '';

  return {
    desktopCSS,
    tabletCSS,
    mobileCSS,
    customCSS: compiledCustomCSS,
    usedAnimations,
  };
}

/**
 * Compile all advanced styles across all sections into a single production stylesheet
 */
export function generateAdvancedCSS(
  themeConfig: { sections?: Record<string, { settings?: { _advanced?: SectionAdvancedData } }> },
  breakpoints: BreakpointConfig[] = DEFAULT_BREAKPOINTS
): string {
  if (!themeConfig || !themeConfig.sections) return '';

  const desktopRules: string[] = [];
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];
  const customRules: string[] = [];
  const activeAnimations = new Set<string>();

  for (const [sectionId, section] of Object.entries(themeConfig.sections)) {
    const advanced = section?.settings?._advanced;
    if (!advanced) continue;

    const res = generateSectionCSS(sectionId, advanced, breakpoints);
    if (res.desktopCSS) desktopRules.push(res.desktopCSS);
    if (res.tabletCSS) tabletRules.push(res.tabletCSS);
    if (res.mobileCSS) mobileRules.push(res.mobileCSS);
    if (res.customCSS) customRules.push(res.customCSS);

    res.usedAnimations.forEach((a) => activeAnimations.add(a));
  }

  if (desktopRules.length === 0 && tabletRules.length === 0 && mobileRules.length === 0 && customRules.length === 0) {
    return '';
  }

  // Keyframes for active animations
  const keyframeBlocks: string[] = [];
  for (const animId of activeAnimations) {
    if (ANIMATION_PRESETS[animId]) {
      keyframeBlocks.push(ANIMATION_PRESETS[animId].keyframes);
    }
  }

  const tabletWidth = breakpoints.find((b) => b.name === 'tablet')?.width || 1024;
  const mobileWidth = breakpoints.find((b) => b.name === 'mobile')?.width || 767;

  let fullCSS = '';
  if (keyframeBlocks.length > 0) {
    fullCSS += keyframeBlocks.join('\n') + '\n\n';
  }

  if (desktopRules.length > 0) {
    fullCSS += desktopRules.join('\n\n') + '\n\n';
  }

  if (tabletRules.length > 0) {
    fullCSS += `@media (max-width: ${tabletWidth}px) {\n${tabletRules.join('\n\n')}\n}\n\n`;
  }

  if (mobileRules.length > 0) {
    fullCSS += `@media (max-width: ${mobileWidth}px) {\n${mobileRules.join('\n\n')}\n}\n\n`;
  }

  if (customRules.length > 0) {
    fullCSS += `/* Custom Section CSS */\n${customRules.join('\n\n')}\n`;
  }

  return fullCSS.trim();
}
