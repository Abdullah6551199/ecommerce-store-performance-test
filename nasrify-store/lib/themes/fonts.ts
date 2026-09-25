/**
 * Font System Utilities (Storefront)
 * Handles font fallback chains, critical font preloading, and dynamic @font-face generation.
 */

export interface FontDefinition {
  family: string;
  slug: string;
  category: "sans" | "serif" | "display" | "handwriting" | "mono";
  weights: number[];
}

export const FONT_FALLBACKS: Record<string, string> = {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  display: 'Impact, "Arial Black", "Trebuchet MS", sans-serif',
  handwriting: '"Comic Sans MS", "Brush Script MT", cursive, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
};

// Known curated font families to categories mapping
export const FONT_CATEGORIES: Record<string, "sans" | "serif" | "display" | "handwriting" | "mono"> = {
  inter: "sans",
  poppins: "sans",
  roboto: "sans",
  "open-sans": "sans",
  lato: "sans",
  montserrat: "sans",
  raleway: "sans",
  "dm-sans": "sans",
  manrope: "sans",
  "plus-jakarta-sans": "sans",
  outfit: "sans",
  "space-grotesk": "sans",
  nunito: "sans",
  "playfair-display": "serif",
  merriweather: "serif",
  lora: "serif",
  "cormorant-garamond": "serif",
  "libre-baskerville": "serif",
  "bebas-neue": "display",
  anton: "display",
  caveat: "handwriting",
  pacifico: "handwriting",
  "jetbrains-mono": "mono",
};

/**
 * Normalizes any font name or slug into a clean slug
 * e.g. "Plus Jakarta Sans" -> "plus-jakarta-sans"
 */
export function normalizeFontSlug(nameOrSlug?: string): string {
  if (!nameOrSlug) return "inter";
  return nameOrSlug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Converts a slug into a display title font family name
 * e.g. "plus-jakarta-sans" -> "Plus Jakarta Sans"
 */
export function slugToFontFamily(slug: string): string {
  const overrides: Record<string, string> = {
    inter: "Inter",
    poppins: "Poppins",
    roboto: "Roboto",
    "open-sans": "Open Sans",
    lato: "Lato",
    montserrat: "Montserrat",
    raleway: "Raleway",
    "dm-sans": "DM Sans",
    manrope: "Manrope",
    "plus-jakarta-sans": "Plus Jakarta Sans",
    outfit: "Outfit",
    "space-grotesk": "Space Grotesk",
    nunito: "Nunito",
    "playfair-display": "Playfair Display",
    merriweather: "Merriweather",
    lora: "Lora",
    "cormorant-garamond": "Cormorant Garamond",
    "libre-baskerville": "Libre Baskerville",
    "bebas-neue": "Bebas Neue",
    anton: "Anton",
    caveat: "Caveat",
    pacifico: "Pacifico",
    "jetbrains-mono": "JetBrains Mono",
  };

  if (overrides[slug]) return overrides[slug];

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns full CSS font-family string including fallback stack
 */
export function getFontFamilyWithFallback(nameOrSlug: string): string {
  const slug = normalizeFontSlug(nameOrSlug);
  const family = slugToFontFamily(slug);
  const category = FONT_CATEGORIES[slug] || "sans";
  const fallback = FONT_FALLBACKS[category] || FONT_FALLBACKS.sans;

  return `"${family}", ${fallback}`;
}

/**
 * Extracts distinct font slugs configured in a Theme JSON
 */
export function getFontsInUse(themeJson?: any): string[] {
  const fonts = new Set<string>();
  const heading = themeJson?.settings?.fonts?.heading;
  const body = themeJson?.settings?.fonts?.body;

  fonts.add(normalizeFontSlug(heading || "inter"));
  fonts.add(normalizeFontSlug(body || "inter"));

  return Array.from(fonts);
}

/**
 * Generates @font-face CSS declarations for the active fonts
 */
export function getFontFaceCSS(fontSlugs: string[], baseUrl: string = ""): string {
  const rules: string[] = [];

  for (const slug of fontSlugs) {
    const family = slugToFontFamily(slug);
    const weights = [400, 700];

    for (const weight of weights) {
      const fileUrl = `${baseUrl}/api/fonts/${slug}/${weight}-normal-latin.woff2`;
      rules.push(`
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('${fileUrl}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`);
    }
  }

  return rules.join("\n");
}

/**
 * Generates <link rel="preload"> records for the primary 400 weights
 */
export function getFontPreloadLinks(fontSlugs: string[], baseUrl: string = "") {
  return fontSlugs.map((slug) => ({
    href: `${baseUrl}/api/fonts/${slug}/400-normal-latin.woff2`,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  }));
}
