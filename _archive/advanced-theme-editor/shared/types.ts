/**
 * Types for Stage 42.6: Advanced Theme Editor (Elementor-like Visual Theme Customization)
 */

export type BreakpointDevice = 'desktop' | 'tablet' | 'mobile';

export interface BreakpointConfig {
  name: string;
  width: number;
}

export interface ResponsiveValue<T> {
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

export interface SpacingValue {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  linked?: boolean;
  unit?: 'px' | 'rem' | 'em' | '%';
}

export interface TypographySettings {
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: ResponsiveValue<string>;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  color?: string;
}

export interface GradientSettings {
  type: 'linear' | 'radial';
  color1: string;
  color2: string;
  angle: number; // 0 to 360
}

export interface ImageBackgroundSettings {
  url: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size?: 'cover' | 'contain' | 'auto';
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  attachment?: 'scroll' | 'fixed';
}

export interface BackgroundSettings {
  type: 'classic' | 'gradient' | 'image' | 'none';
  color?: string;
  gradient?: GradientSettings;
  image?: ImageBackgroundSettings;
  overlayColor?: string;
  overlayOpacity?: number; // 0 to 1
}

export interface BorderSettings {
  type: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  width?: SpacingValue;
  color?: string;
  radius?: SpacingValue;
}

export interface BoxShadowSettings {
  color?: string;
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  inset?: boolean;
}

export interface EffectsSettings {
  opacity?: number; // 0 to 100
  blur?: number; // px
  brightness?: number; // %
  contrast?: number; // %
  saturate?: number; // %
  hueRotate?: number; // deg
  blendMode?: string;
  transform?: {
    rotate?: number;
    scale?: number;
    skewX?: number;
    skewY?: number;
    translateX?: number;
    translateY?: number;
  };
}

export interface LayoutSettings {
  margin?: ResponsiveValue<SpacingValue>;
  padding?: ResponsiveValue<SpacingValue>;
  width?: 'auto' | 'full' | 'custom';
  customWidth?: ResponsiveValue<string>;
  maxWidth?: string;
  minHeight?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  position?: 'default' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: number;
  cssId?: string;
  cssClasses?: string;
}

export interface MotionEffectsSettings {
  entranceAnimation?: string;
  animationDuration?: number; // ms
  animationDelay?: number; // ms
  animationEasing?: string;
  scrollingEffects?: {
    verticalScroll?: boolean;
    horizontalScroll?: boolean;
    transparency?: boolean;
    blur?: boolean;
    rotate?: boolean;
    scale?: boolean;
    speed?: number;
  };
  mouseEffects?: {
    trackCursor?: boolean;
    tilt?: boolean;
    scaleOnHover?: boolean;
  };
}

export interface ResponsiveSettings {
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

export interface SectionAdvancedData {
  style?: {
    typography?: TypographySettings;
    background?: BackgroundSettings;
    border?: BorderSettings;
    boxShadow?: BoxShadowSettings;
    effects?: EffectsSettings;
  };
  advanced?: {
    layout?: LayoutSettings;
    motion?: MotionEffectsSettings;
    responsive?: ResponsiveSettings;
    customCss?: string;
  };
}

export interface AdvancedEditorAppSettings {
  enabled: boolean;
  enableCustomCSS: boolean;
  enableAnimations: boolean;
  enableResponsive: boolean;
  enableBreakpoints: boolean;
  breakpoints: BreakpointConfig[];
  updatedAt?: number;
}

export interface StylePreset {
  id: string;
  name: string;
  type: 'typography' | 'button' | 'shadow' | 'animation' | 'spacing';
  presetJson: string;
  isGlobal?: boolean;
  createdAt?: number;
}

export const DEFAULT_ADVANCED_SETTINGS: AdvancedEditorAppSettings = {
  enabled: true,
  enableCustomCSS: true,
  enableAnimations: true,
  enableResponsive: true,
  enableBreakpoints: true,
  breakpoints: [
    { name: 'tablet', width: 1024 },
    { name: 'mobile', width: 767 },
  ],
};
