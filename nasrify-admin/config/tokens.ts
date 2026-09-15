/**
 * Design Tokens for Stage 18.1 Purple Brand & Chronicles Redesign
 */

export const PURPLE_PALETTE = {
  50: "#EACFFC", // Very Light Lavender
  100: "#D59EFA", // Light Purple
  200: "#C06EF7", // Medium Light Purple
  300: "#AB3DF5", // Medium Purple
  400: "#960DF2", // PRIMARY BRAND COLOR
  500: "#780AC2", // Deep Purple
  600: "#5A0891", // Dark Purple
  700: "#3C0561", // Very Dark Purple
} as const;

export const LIGHT_THEME_TOKENS = {
  bgPrimary: "#FFFFFF",
  bgSecondary: "#EACFFC",
  surface: "#FFFFFF",
  surfaceHover: "#EACFFC",
  primary: "#960DF2",
  primaryHover: "#780AC2",
  secondary: "#AB3DF5",
  accent: "#C06EF7",
  textHeading: "#3C0561",
  textBody: "#5A0891",
  textMuted: "#780AC2",
  border: "#D59EFA",
  borderSubtle: "#EACFFC",
} as const;

export const DARK_THEME_TOKENS = {
  bgPrimary: "#3C0561",
  bgSecondary: "#5A0891",
  surface: "#5A0891",
  surfaceHover: "#780AC2",
  primary: "#960DF2",
  primaryHover: "#AB3DF5",
  secondary: "#AB3DF5",
  accent: "#C06EF7",
  textHeading: "#EACFFC",
  textBody: "#D59EFA",
  textMuted: "#C06EF7",
  border: "#780AC2",
  borderSubtle: "#5A0891",
} as const;

export const SPACING_SCALE = {
  containerMaxWidth: "1280px", // max-w-7xl
  sectionPaddingY: "5rem", // py-20
  sectionGap: "4rem", // space-y-16 / space-y-20
} as const;

export const BORDER_RADIUS_TOKENS = {
  card: "12px", // rounded-xl
  button: "8px", // rounded-lg
  pill: "9999px", // rounded-full
  section: "24px", // rounded-3xl
} as const;

export const SHADOW_TOKENS = {
  softPurple: "0 10px 25px -5px rgba(150, 13, 242, 0.12), 0 8px 10px -6px rgba(150, 13, 242, 0.08)",
  cardHover: "0 20px 30px -10px rgba(150, 13, 242, 0.20), 0 10px 15px -5px rgba(120, 10, 194, 0.15)",
  glowPurple: "0 0 35px -5px rgba(150, 13, 242, 0.35)",
} as const;

export const TRANSITION_TOKENS = {
  default: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  smooth: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  transformOnly: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const Z_INDEX_SCALE = {
  dropdown: 50,
  stickyHeader: 40,
  modalOverlay: 100,
  cartDrawer: 120,
  toast: 150,
} as const;
