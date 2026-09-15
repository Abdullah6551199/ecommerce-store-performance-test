import { cache } from "react";
import { getDb, settings } from "./db";
import { eq } from "drizzle-orm";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  mutedText: string;
  border: string;
  success: string;
  error: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  buttonFont: string;
}

export interface ThemeDesign {
  containerWidth: string; // e.g. "1280px"
  borderRadius: string; // e.g. "12px"
  cardRadius: string; // e.g. "24px"
  buttonRadius: string; // e.g. "12px"
  shadows: "none" | "soft" | "medium" | "intense";
  spacing: "compact" | "normal" | "spacious";
}

export interface ThemeOther {
  storeLogo: string;
  favicon: string;
  announcementBarText: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  typography: ThemeTypography;
  design: ThemeDesign;
  other: ThemeOther;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  colors: {
    primary: "#960DF2",
    secondary: "#AB3DF5",
    accent: "#C06EF7",
    background: "#FFFFFF",
    text: "#3C0561",
    mutedText: "#780AC2",
    border: "#D59EFA",
    success: "#10b981",
    error: "#ef4444",
  },
  typography: {
    headingFont: "Inter, system-ui, sans-serif",
    bodyFont: "Inter, system-ui, sans-serif",
    buttonFont: "Inter, system-ui, sans-serif",
  },
  design: {
    containerWidth: "1280px",
    borderRadius: "8px",
    cardRadius: "12px",
    buttonRadius: "8px",
    shadows: "soft",
    spacing: "normal",
  },
  other: {
    storeLogo: "",
    favicon: "",
    announcementBarText: "Free Shipping on Orders Over $50",
  },
};

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  settings: ThemeSettings;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "chronicles-purple",
    name: "Chronicles Purple (Default)",
    description: "Signature modern luxury purple aesthetic with vibrant violet accents and elegant lavender surfaces.",
    settings: DEFAULT_THEME_SETTINGS,
  },
  {
    id: "midnight-stealth",
    name: "Midnight Stealth",
    description: "Deep luxury slate with radiant cyan and emerald accents for elite technical precision.",
    settings: {
      colors: {
        primary: "#06b6d4",
        secondary: "#0891b2",
        accent: "#10b981",
        background: "#070b12",
        text: "#f8fafc",
        mutedText: "#94a3b8",
        border: "rgba(255, 255, 255, 0.12)",
        success: "#10b981",
        error: "#f43f5e",
      },
      typography: {
        headingFont: "Plus Jakarta Sans, sans-serif",
        bodyFont: "Inter, sans-serif",
        buttonFont: "Plus Jakarta Sans, sans-serif",
      },
      design: {
        containerWidth: "1280px",
        borderRadius: "10px",
        cardRadius: "20px",
        buttonRadius: "10px",
        shadows: "intense",
        spacing: "normal",
      },
      other: {
        storeLogo: "",
        favicon: "",
        announcementBarText: "⚡ APEX MIDNIGHT COLLECTION: Carbon-Fiber Series Live Now",
      },
    },
  },
  {
    id: "cyber-lime",
    name: "Cyber Lime",
    description: "Aggressive neon lime meets laser blue for futuristic sports fashion.",
    settings: {
      colors: {
        primary: "#84cc16",
        secondary: "#65a30d",
        accent: "#38bdf8",
        background: "#080e07",
        text: "#f7fee7",
        mutedText: "#a1a1aa",
        border: "rgba(255, 255, 255, 0.14)",
        success: "#22c55e",
        error: "#ef4444",
      },
      typography: {
        headingFont: "Outfit, sans-serif",
        bodyFont: "Inter, sans-serif",
        buttonFont: "Outfit, sans-serif",
      },
      design: {
        containerWidth: "1320px",
        borderRadius: "14px",
        cardRadius: "28px",
        buttonRadius: "14px",
        shadows: "medium",
        spacing: "spacious",
      },
      other: {
        storeLogo: "",
        favicon: "",
        announcementBarText: "⚡ CYBER VELOCITY RELEASE • 20% OFF FIRST APEX ORDER",
      },
    },
  },
  {
    id: "electric-sunset",
    name: "Sunset Ignite",
    description: "High-voltage fiery amber, sunset orange, and gold energy return.",
    settings: {
      colors: {
        primary: "#f97316",
        secondary: "#ea580c",
        accent: "#facc15",
        background: "#120905",
        text: "#fff7ed",
        mutedText: "#a8a29e",
        border: "rgba(255, 255, 255, 0.15)",
        success: "#10b981",
        error: "#dc2626",
      },
      typography: {
        headingFont: "Outfit, sans-serif",
        bodyFont: "Roboto, sans-serif",
        buttonFont: "Outfit, sans-serif",
      },
      design: {
        containerWidth: "1280px",
        borderRadius: "16px",
        cardRadius: "24px",
        buttonRadius: "16px",
        shadows: "intense",
        spacing: "normal",
      },
      other: {
        storeLogo: "",
        favicon: "",
        announcementBarText: "🔥 SUNSET EDITION DROP: Limited Run Carbon Road Racing Shoes",
      },
    },
  },
];

const THEME_SETTINGS_KEY = "theme_settings";

// In-memory fallback
let memoryThemeSettings: ThemeSettings = { ...DEFAULT_THEME_SETTINGS };
let lastThemeFetchTime = 0;
const THEME_CACHE_TTL_MS = 60000;

/**
 * Fetch theme settings from Cloudflare D1 or fallback memory
 * Deduplicated via React.cache
 */
export const getThemeSettings = cache(async (): Promise<ThemeSettings> => {
  if (lastThemeFetchTime > 0 && Date.now() - lastThemeFetchTime < THEME_CACHE_TTL_MS) {
    return memoryThemeSettings;
  }

  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, THEME_SETTINGS_KEY))
        .limit(1);

      if (rows && rows.length > 0 && rows[0].value) {
        const parsed =
          typeof rows[0].value === "string"
            ? JSON.parse(rows[0].value)
            : rows[0].value;

        const merged: ThemeSettings = {
          colors: {
            ...DEFAULT_THEME_SETTINGS.colors,
            ...(parsed.colors || {}),
          },
          typography: {
            ...DEFAULT_THEME_SETTINGS.typography,
            ...(parsed.typography || {}),
          },
          design: {
            ...DEFAULT_THEME_SETTINGS.design,
            ...(parsed.design || {}),
          },
          other: {
            ...DEFAULT_THEME_SETTINGS.other,
            ...(parsed.other || {}),
          },
        };
        memoryThemeSettings = merged;
        lastThemeFetchTime = Date.now();
        return merged;
      }
    } catch (err) {
      console.warn("[getThemeSettings] D1 read error, using fallback:", err);
    }
  }

  return memoryThemeSettings;
});

export interface DeepPartialThemeSettings {
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  design?: Partial<ThemeDesign>;
  other?: Partial<ThemeOther>;
}

/**
 * Update theme settings in Cloudflare D1
 */
export async function updateThemeSettings(
  updates: DeepPartialThemeSettings
): Promise<ThemeSettings> {
  const current = await getThemeSettings();
  const updated: ThemeSettings = {
    colors: {
      ...current.colors,
      ...(updates.colors || {}),
    },
    typography: {
      ...current.typography,
      ...(updates.typography || {}),
    },
    design: {
      ...current.design,
      ...(updates.design || {}),
    },
    other: {
      ...current.other,
      ...(updates.other || {}),
    },
  };

  memoryThemeSettings = updated;
  lastThemeFetchTime = 0;

  const db = getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, THEME_SETTINGS_KEY))
        .limit(1);

      const now = new Date().toISOString();
      if (existing && existing.length > 0) {
        await db
          .update(settings)
          .set({
            value: updated,
            updatedAt: now,
          })
          .where(eq(settings.key, THEME_SETTINGS_KEY));
      } else {
        await db.insert(settings).values({
          id: `theme-setting-${Date.now()}`,
          key: THEME_SETTINGS_KEY,
          value: updated,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.error("[updateThemeSettings] D1 update error:", err);
      throw new Error("Failed to persist theme settings to D1 database.");
    }
  }

  return updated;
}

/**
 * Generate CSS variables block from ThemeSettings
 */
export function generateThemeCss(theme: ThemeSettings): string {
  const shadowMap = {
    none: "none",
    soft: "0 10px 25px -5px rgba(150, 13, 242, 0.12), 0 8px 10px -6px rgba(150, 13, 242, 0.08)",
    medium: "0 15px 30px -5px rgba(150, 13, 242, 0.18), 0 10px 15px -5px rgba(120, 10, 194, 0.12)",
    intense: "0 20px 40px -6px rgba(150, 13, 242, 0.25), 0 0 25px 0px rgba(150, 13, 242, 0.15)",
  };

  return `
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-border: ${theme.colors.border};
  --color-success: ${theme.colors.success};
  --color-error: ${theme.colors.error};

  --font-heading: ${theme.typography.headingFont};
  --font-body: ${theme.typography.bodyFont};
  --font-button: ${theme.typography.buttonFont};

  --container-max-width: ${theme.design.containerWidth};
  --radius-base: ${theme.design.borderRadius};
  --radius-card: ${theme.design.cardRadius};
  --radius-btn: ${theme.design.buttonRadius};
  --theme-shadow: ${shadowMap[theme.design.shadows] || shadowMap.soft};
}

body {
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

button {
  font-family: var(--font-button);
}
  `.trim();
}
