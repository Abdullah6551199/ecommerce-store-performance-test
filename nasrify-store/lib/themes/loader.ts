import { cache } from "react";
import { getDb, activeTheme, type ActiveThemeRecord } from "../db";
import { eq } from "drizzle-orm";
import { ThemeConfig } from "./types";
import { DEFAULT_THEME } from "./default-theme";

const THEME_CACHE_TTL_MS = 60 * 1000; // 60 seconds micro-cache
const MAX_THEME_JSON_SIZE_BYTES = 500 * 1024; // 500KB limit
const MAX_SECTIONS_PER_THEME = 30; // 30 sections hard limit

interface CacheEntry {
  theme: ThemeConfig;
  timestamp: number;
}

let cachedActiveTheme: CacheEntry | null = null;

export function invalidateActiveThemeCache(): void {
  cachedActiveTheme = null;
}

/**
 * Validate and sanitize theme JSON
 */
export function validateThemeConfig(raw: unknown): ThemeConfig | null {
  try {
    let config: ThemeConfig;
    if (typeof raw === "string") {
      if (raw.length > MAX_THEME_JSON_SIZE_BYTES) {
        console.warn(`[Themes Engine] Warning: Theme JSON size (${raw.length} bytes) exceeds 500KB cap.`);
      }
      config = JSON.parse(raw);
    } else if (typeof raw === "object" && raw !== null) {
      config = raw as ThemeConfig;
    } else {
      return null;
    }

    if (!config.settings || !config.sections || !Array.isArray(config.sections)) {
      console.error("[Themes Engine] Invalid theme structure: missing settings or sections");
      return null;
    }

    // Enforce default fallback settings
    config.settings.colors = {
      primary: config.settings.colors?.primary || "#18181B",
      secondary: config.settings.colors?.secondary || "#52525B",
      accent: config.settings.colors?.accent || "#2563EB",
      background: config.settings.colors?.background || "#FFFFFF",
      surface: config.settings.colors?.surface || "#F4F4F5",
      text: config.settings.colors?.text || "#18181B",
      text_muted: config.settings.colors?.text_muted || "#71717A",
      border: config.settings.colors?.border || "#E4E4E7",
    };

    config.settings.fonts = {
      heading: config.settings.fonts?.heading || "Inter",
      body: config.settings.fonts?.body || "Inter",
    };

    config.settings.layout = {
      container_width: config.settings.layout?.container_width || "1280px",
      section_spacing: config.settings.layout?.section_spacing || "64px",
      border_radius: config.settings.layout?.border_radius || "8px",
    };

    // Hard limit: max 30 sections
    if (config.sections.length > MAX_SECTIONS_PER_THEME) {
      console.warn(
        `[Themes Engine] Theme exceeds max ${MAX_SECTIONS_PER_THEME} sections (${config.sections.length}). Capping to ${MAX_SECTIONS_PER_THEME}.`
      );
      config.sections = config.sections.slice(0, MAX_SECTIONS_PER_THEME);
    }

    return config;
  } catch (err) {
    console.error("[Themes Engine] Failed to parse theme JSON:", err);
    return null;
  }
}

/**
 * Get active theme from D1 active_theme table with 60s in-memory cache & React.cache()
 */
export const getActiveTheme = cache(async (customDb?: any): Promise<ThemeConfig> => {
  if (cachedActiveTheme && Date.now() - cachedActiveTheme.timestamp < THEME_CACHE_TTL_MS) {
    return cachedActiveTheme.theme;
  }

  const db = customDb || getDb();
  if (!db) {
    return DEFAULT_THEME;
  }

  try {
    const rows = await db
      .select({
        id: activeTheme.id,
        themeId: activeTheme.themeId,
        themeJson: activeTheme.themeJson,
      })
      .from(activeTheme)
      .where(eq(activeTheme.id, "default"))
      .limit(1);

    if (rows.length > 0 && rows[0].themeJson) {
      const validated = validateThemeConfig(rows[0].themeJson);
      if (validated) {
        cachedActiveTheme = { theme: validated, timestamp: Date.now() };
        return validated;
      }
    }
  } catch (err) {
    console.error("[Themes Engine] Error querying active_theme:", err);
  }

  // Fallback to built-in default theme
  cachedActiveTheme = { theme: DEFAULT_THEME, timestamp: Date.now() };
  return DEFAULT_THEME;
});

/**
 * Get a theme by its slug from the D1 themes table (for preview purposes, zero cache)
 */
export async function getThemeBySlug(slug: string, customDb?: any): Promise<ThemeConfig | null> {
  const db = customDb || getDb();
  if (!db || !slug) return null;

  try {
    const { themes } = await import("../db");
    const { or } = await import("drizzle-orm");
    const rows = await db
      .select({
        id: themes.id,
        slug: themes.slug,
        themeJson: themes.themeJson,
      })
      .from(themes)
      .where(or(eq(themes.slug, slug), eq(themes.id, slug)))
      .limit(1);

    if (rows.length > 0 && rows[0].themeJson) {
      return validateThemeConfig(rows[0].themeJson);
    }
  } catch (err) {
    console.error(`[Themes Engine] Failed to fetch theme by slug "${slug}":`, err);
  }

  return null;
}

