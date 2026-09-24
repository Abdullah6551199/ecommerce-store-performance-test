import { ThemeConfig } from "./types";

/**
 * Generate CSS variables style string from active theme settings
 */
export function generateThemeVarsCss(theme: ThemeConfig): string {
  const { colors, fonts, layout } = theme.settings;
  return `
    :root {
      --theme-primary: ${colors.primary || "#18181B"};
      --theme-secondary: ${colors.secondary || "#52525B"};
      --theme-accent: ${colors.accent || "#2563EB"};
      --theme-background: ${colors.background || "#FFFFFF"};
      --theme-surface: ${colors.surface || "#F4F4F5"};
      --theme-text: ${colors.text || "#18181B"};
      --theme-text-muted: ${colors.text_muted || "#71717A"};
      --theme-border: ${colors.border || "#E4E4E7"};
      --theme-font-heading: '${fonts.heading || "Inter"}', sans-serif;
      --theme-font-body: '${fonts.body || "Inter"}', sans-serif;
      --theme-radius: ${layout.border_radius || "8px"};
      --theme-spacing: ${layout.section_spacing || "64px"};
      --theme-container-width: ${layout.container_width || "1280px"};
    }
  `.replace(/\s+/g, " ").trim();
}
