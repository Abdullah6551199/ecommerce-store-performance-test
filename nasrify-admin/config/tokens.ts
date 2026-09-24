/**
 * Design Tokens for Nasrify Admin Professional Theme
 */

export const ADMIN_BRAND_PALETTE = {
  50: "#F4F4F5",
  100: "#DCFCE7",
  200: "#86EFAC",
  300: "#4ADE80",
  400: "#25D366", // PRIMARY BRAND GREEN
  500: "#22C55E",
  600: "#1EA855", // DARK HOVER GREEN
  700: "#18181B", // NEUTRAL ACCENT DARK
} as const;

// Backward-compatible alias
export const PURPLE_PALETTE = ADMIN_BRAND_PALETTE;

export const LIGHT_THEME_TOKENS = {
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F4F4F5",
  surface: "#FFFFFF",
  surfaceHover: "#F4F4F5",
  primary: "#25D366",
  primaryHover: "#1EA855",
  secondary: "#18181B",
  accent: "#25D366",
  textHeading: "#18181B",
  textBody: "#27272A",
  textMuted: "#71717A",
  border: "#E4E4E7",
  borderSubtle: "#F4F4F5",
} as const;

export const DARK_THEME_TOKENS = {
  bgPrimary: "#09090B",
  bgSecondary: "#18181B",
  surface: "#18181B",
  surfaceHover: "#27272A",
  primary: "#25D366",
  primaryHover: "#1EA855",
  secondary: "#E4E4E7",
  accent: "#25D366",
  textHeading: "#FAFAFA",
  textBody: "#E4E4E7",
  textMuted: "#A1A1AA",
  border: "#27272A",
  borderSubtle: "#18181B",
} as const;

export const SPACING_SCALE = {
  containerMaxWidth: "1280px",
  sectionPaddingY: "5rem",
  sectionGap: "4rem",
} as const;

export const BORDER_RADIUS_TOKENS = {
  card: "12px",
  button: "8px",
  pill: "9999px",
  section: "24px",
} as const;
