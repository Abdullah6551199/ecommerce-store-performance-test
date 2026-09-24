import { ThemeConfig } from "./types";
import { getFontFamilyWithFallback } from "./fonts";

/**
 * Generate CSS variables style string from active theme settings
 */
export function generateThemeVarsCss(theme: ThemeConfig): string {
  if (!theme || !theme.settings) {
    return "";
  }
  const { colors = {} as any, fonts = {} as any, layout = {} as any } = theme.settings;
  const primary = colors.primary || "#25D366";
  const primaryDark = colors.primary_dark || "#1EA855";
  const primaryLight = colors.primary_light || "#DCFCE7";
  const accent = colors.accent || "#18181B";
  const background = colors.background || "#FFFFFF";
  const surface = colors.surface || "#F4F4F5";
  const text = colors.text || "#18181B";
  const textMuted = colors.text_muted || "#71717A";
  const border = colors.border || "#E4E4E7";
  const radius = layout.border_radius || "8px";
  const buttonRadius = layout.button_radius || radius || "8px";
  const spacing = layout.section_spacing || "64px";
  const containerWidth = layout.container_width || "1280px";
  const fontHeading = getFontFamilyWithFallback(fonts.heading || "Inter");
  const fontBody = getFontFamilyWithFallback(fonts.body || "Inter");

  return `
    :root {
      --theme-primary: ${primary};
      --theme-primary-dark: ${primaryDark};
      --theme-primary-light: ${primaryLight};
      --theme-secondary: ${colors.secondary || "#52525B"};
      --theme-accent: ${accent};
      --theme-background: ${background};
      --theme-surface: ${surface};
      --theme-text: ${text};
      --theme-text-muted: ${textMuted};
      --theme-border: ${border};
      --theme-radius: ${radius};
      --theme-button-radius: ${buttonRadius};
      --theme-spacing: ${spacing};
      --theme-container-width: ${containerWidth};
      --theme-font-heading: ${fontHeading};
      --theme-font-body: ${fontBody};
    }
  `.replace(/\s+/g, " ").trim();
}
