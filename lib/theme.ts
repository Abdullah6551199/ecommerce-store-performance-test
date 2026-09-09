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
    primary: "#18C729",
    secondary: "#12a822",
    accent: "#FEF500",
    background: "#080e0a",
    text: "#f4f7f5",
    mutedText: "#9ca3af",
    border: "rgba(255, 255, 255, 0.15)",
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
    borderRadius: "12px",
    cardRadius: "24px",
    buttonRadius: "12px",
    shadows: "medium",
    spacing: "normal",
  },
  other: {
    storeLogo: "",
    favicon: "",
    announcementBarText: "⚡ FLASH LAUNCH: Global Edge Commerce Powered by Cloudflare D1 & R2",
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
    id: "apex-default",
    name: "Apex Neon (Default)",
    description: "Signature high-velocity athletic branding with vibrant green and speed yellow accents.",
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

/**
 * Fetch theme settings from Cloudflare D1 or fallback memory
 */
export async function getThemeSettings(): Promise<ThemeSettings> {
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
        return merged;
      }
    } catch (err) {
      console.warn("[getThemeSettings] D1 read error, using fallback:", err);
    }
  }

  return memoryThemeSettings;
}

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
    soft: "0 4px 20px -2px rgba(0, 0, 0, 0.25)",
    medium: "0 10px 30px -4px rgba(0, 0, 0, 0.45)",
    intense: "0 20px 40px -6px rgba(0, 0, 0, 0.65), 0 0 25px 0px rgba(24, 199, 41, 0.15)",
  };

  return `
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};
  --color-muted: ${theme.colors.mutedText};
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
  --theme-shadow: ${shadowMap[theme.design.shadows] || shadowMap.medium};
}

body {
  background-color: var(--color-background) !important;
  color: var(--color-text) !important;
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

button {
  font-family: var(--font-button);
}

.bg-brand-gradient {
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent) 100%) !important;
}

.bg-brand-ambient {
  background: 
    radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--color-primary) 25%, transparent), transparent),
    radial-gradient(ellipse 80% 50% at 50% 120%, color-mix(in srgb, var(--color-accent) 20%, transparent), transparent),
    var(--color-background) !important;
}
  `.trim();
}
