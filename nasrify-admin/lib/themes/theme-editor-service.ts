import {
  getDb,
  themes,
  activeTheme,
  themeAuditLog,
  themeDrafts,
  themePageDrafts,
  themeEditorHistory,
} from "../db";
import { eq, and, desc } from "drizzle-orm";
import { invalidateStorefront } from "../storefront-invalidation";
import { DEFAULT_THEME } from "./default-theme";

// 20s in-memory micro-cache for draft reads keyed by pageType
const cachedDrafts = new Map<string, { data: any; timestamp: number }>();
const DRAFT_CACHE_TTL_MS = 20 * 1000;

export function invalidateDraftMicroCache() {
  cachedDrafts.clear();
}

/**
 * Normalizes page type key and extracts defaults
 */
function resolvePageDefaults(theme: any, pageType: string) {
  const defaults = theme?.page_defaults || DEFAULT_THEME.page_defaults || {};
  if (defaults[pageType]) return defaults[pageType];

  // Dynamic CMS page fallback
  if (pageType.startsWith("page_") || pageType.startsWith("cms_")) {
    return defaults.page || defaults.custom_page || DEFAULT_THEME.page_defaults?.page || [];
  }

  return defaults[pageType] || DEFAULT_THEME.page_defaults?.[pageType] || [];
}

/**
 * Returns current active draft for a given page type (default: homepage)
 */
export async function getThemeDraft(pageType: string = "homepage") {
  const cacheKey = `draft_${pageType}`;
  const cached = cachedDrafts.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DRAFT_CACHE_TTL_MS) {
    return cached.data;
  }

  const db = getDb();
  if (!db) {
    const fallbackSections = pageType === "homepage" ? DEFAULT_THEME.sections : resolvePageDefaults(DEFAULT_THEME, pageType);
    return {
      isDraft: false,
      themeId: "theme-default",
      pageType,
      themeJson: { ...DEFAULT_THEME, sections: fallbackSections },
      theme: { ...DEFAULT_THEME, sections: fallbackSections },
      updatedAt: null,
    };
  }

  // Determine active themeId
  const activeRows = await db
    .select({
      themeId: activeTheme.themeId,
      themeJson: activeTheme.themeJson,
      activatedAt: activeTheme.activatedAt,
      activatedBy: activeTheme.activatedBy,
    })
    .from(activeTheme)
    .where(eq(activeTheme.id, "default"))
    .limit(1);

  const activeThemeId = activeRows.length > 0 ? activeRows[0].themeId : "theme-default";
  let activeThemeParsed = DEFAULT_THEME;
  if (activeRows.length > 0 && activeRows[0].themeJson) {
    try {
      activeThemeParsed = JSON.parse(activeRows[0].themeJson);
    } catch {}
  }

  // 1. Check theme_page_drafts table for specific pageType
  const pageDraftCompositeId = `${activeThemeId}::${pageType}`;
  const pageDraftRows = await db
    .select({
      id: themePageDrafts.id,
      themeId: themePageDrafts.themeId,
      pageType: themePageDrafts.pageType,
      draftJson: themePageDrafts.draftJson,
      updatedBy: themePageDrafts.updatedBy,
      updatedAt: themePageDrafts.updatedAt,
    })
    .from(themePageDrafts)
    .where(eq(themePageDrafts.id, pageDraftCompositeId))
    .limit(1);

  if (pageDraftRows.length > 0 && pageDraftRows[0].draftJson) {
    try {
      const parsed = JSON.parse(pageDraftRows[0].draftJson);
      const result = {
        isDraft: true,
        themeId: pageDraftRows[0].themeId,
        pageType,
        themeJson: parsed,
        theme: parsed,
        theme_json: parsed,
        updatedBy: pageDraftRows[0].updatedBy,
        updatedAt: pageDraftRows[0].updatedAt,
      };
      cachedDrafts.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {}
  }

  // 2. Backward compatibility for homepage: check theme_drafts "active-draft"
  if (pageType === "homepage") {
    const draftRows = await db
      .select({
        id: themeDrafts.id,
        themeId: themeDrafts.themeId,
        draftJson: themeDrafts.draftJson,
        updatedBy: themeDrafts.updatedBy,
        updatedAt: themeDrafts.updatedAt,
      })
      .from(themeDrafts)
      .where(eq(themeDrafts.id, "active-draft"))
      .limit(1);

    if (draftRows.length > 0 && draftRows[0].draftJson) {
      try {
        const parsed = JSON.parse(draftRows[0].draftJson);
        const result = {
          isDraft: true,
          themeId: draftRows[0].themeId,
          pageType: "homepage",
          themeJson: parsed,
          theme: parsed,
          theme_json: parsed,
          updatedBy: draftRows[0].updatedBy,
          updatedAt: draftRows[0].updatedAt,
        };
        cachedDrafts.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } catch {}
    }
  }

  // 3. Fall back to active theme
  const pageSections =
    pageType === "homepage"
      ? activeThemeParsed.sections || DEFAULT_THEME.sections
      : resolvePageDefaults(activeThemeParsed, pageType);

  const effectiveThemeForPage = {
    ...activeThemeParsed,
    sections: pageSections,
  };

  const activeResult = {
    isDraft: false,
    themeId: activeThemeId,
    pageType,
    themeJson: effectiveThemeForPage,
    theme: effectiveThemeForPage,
    theme_json: effectiveThemeForPage,
    updatedBy: activeRows[0]?.activatedBy || "system",
    updatedAt: activeRows[0]?.activatedAt || null,
  };
  cachedDrafts.set(cacheKey, { data: activeResult, timestamp: Date.now() });
  return activeResult;
}

/**
 * Saves or updates current draft for a specific page type
 */
export async function saveThemeDraft(
  themeId: string,
  themeConfig: Record<string, any>,
  updatedBy: string = "admin",
  pageType: string = "homepage"
) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  const jsonStr = JSON.stringify(themeConfig);
  const now = Date.now();
  const pageDraftCompositeId = `${themeId}::${pageType}`;

  // 1. Save to theme_page_drafts
  await db
    .insert(themePageDrafts)
    .values({
      id: pageDraftCompositeId,
      themeId,
      pageType,
      draftJson: jsonStr,
      updatedBy,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: themePageDrafts.id,
      set: {
        themeId,
        pageType,
        draftJson: jsonStr,
        updatedBy,
        updatedAt: now,
      },
    });

  // 2. If homepage, also save to theme_drafts for backward compatibility
  if (pageType === "homepage") {
    await db
      .insert(themeDrafts)
      .values({
        id: "active-draft",
        themeId,
        draftJson: jsonStr,
        updatedBy,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: themeDrafts.id,
        set: {
          themeId,
          draftJson: jsonStr,
          updatedBy,
          updatedAt: now,
        },
      });
  }

  // Log in editor history
  await db.insert(themeEditorHistory).values({
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    themeId,
    action: `save_draft:${pageType}`,
    snapshotJson: jsonStr,
    performedBy: updatedBy,
    createdAt: now,
  });

  invalidateDraftMicroCache();

  return {
    success: true,
    pageType,
    savedAt: now,
  };
}

/**
 * Publishes draft for a specific page type or entire theme
 */
export async function publishThemeDraft(
  themeConfig: Record<string, any>,
  publishedBy: string = "admin",
  pageType: string = "homepage"
) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  const now = Date.now();

  // Find current active theme
  const activeRows = await db
    .select({ themeId: activeTheme.themeId, themeJson: activeTheme.themeJson })
    .from(activeTheme)
    .where(eq(activeTheme.id, "default"))
    .limit(1);

  const themeId = activeRows.length > 0 ? activeRows[0].themeId : "theme-default";
  let activeThemeData: any = DEFAULT_THEME;
  if (activeRows.length > 0 && activeRows[0].themeJson) {
    try {
      activeThemeData = JSON.parse(activeRows[0].themeJson);
    } catch {}
  }

  let finalThemeToSave: any;

  if (pageType === "homepage") {
    finalThemeToSave = {
      ...activeThemeData,
      ...themeConfig,
      sections: themeConfig.sections || activeThemeData.sections,
      settings: themeConfig.settings || activeThemeData.settings,
    };
  } else {
    const updatedPageDefaults = {
      ...(activeThemeData.page_defaults || DEFAULT_THEME.page_defaults || {}),
      [pageType]: themeConfig.sections,
    };
    finalThemeToSave = {
      ...activeThemeData,
      settings: themeConfig.settings || activeThemeData.settings,
      page_defaults: updatedPageDefaults,
    };
  }

  const jsonStr = JSON.stringify(finalThemeToSave);

  // 1. Update active_theme
  await db
    .insert(activeTheme)
    .values({
      id: "default",
      themeId,
      themeJson: jsonStr,
      activatedAt: now,
      activatedBy: publishedBy,
    })
    .onConflictDoUpdate({
      target: activeTheme.id,
      set: {
        themeId,
        themeJson: jsonStr,
        activatedAt: now,
        activatedBy: publishedBy,
      },
    });

  // 2. Update themes table row
  await db
    .update(themes)
    .set({
      themeJson: jsonStr,
      updatedAt: now,
    })
    .where(eq(themes.id, themeId));

  // 3. Clear drafts
  const pageDraftCompositeId = `${themeId}::${pageType}`;
  await db.delete(themePageDrafts).where(eq(themePageDrafts.id, pageDraftCompositeId));

  if (pageType === "homepage") {
    await db.delete(themeDrafts).where(eq(themeDrafts.id, "active-draft"));
  }

  // 4. Log in audit log and editor history
  await db.insert(themeAuditLog).values({
    id: `audit-${now}-${Math.random().toString(36).substring(2, 6)}`,
    themeId,
    action: `published_editor:${pageType}`,
    performedBy: publishedBy,
    createdAt: now,
  });

  await db.insert(themeEditorHistory).values({
    id: `hist-${now}-${Math.random().toString(36).substring(2, 6)}`,
    themeId,
    action: `publish:${pageType}`,
    snapshotJson: jsonStr,
    performedBy: publishedBy,
    createdAt: now,
  });

  invalidateDraftMicroCache();

  // 5. Invalidate storefront cache
  try {
    await invalidateStorefront({ target: "all", path: "/" });
  } catch (err) {
    console.warn("[Theme Editor] Storefront invalidation warning:", err);
  }

  const versionHash = `v-${now.toString(36)}`;

  return {
    success: true,
    publishedAt: now,
    themeId,
    pageType,
    version: versionHash,
  };
}

/**
 * Discards current draft for a specific page type
 */
export async function discardThemeDraft(pageType: string = "homepage") {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  // Determine active themeId
  const activeRows = await db
    .select({ themeId: activeTheme.themeId })
    .from(activeTheme)
    .where(eq(activeTheme.id, "default"))
    .limit(1);

  const themeId = activeRows.length > 0 ? activeRows[0].themeId : "theme-default";
  const pageDraftCompositeId = `${themeId}::${pageType}`;

  await db.delete(themePageDrafts).where(eq(themePageDrafts.id, pageDraftCompositeId));

  if (pageType === "homepage") {
    await db.delete(themeDrafts).where(eq(themeDrafts.id, "active-draft"));
  }

  invalidateDraftMicroCache();

  return getThemeDraft(pageType);
}

/**
 * Retrieves recent editor history
 */
export async function getEditorHistory(limitCount: number = 20) {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: themeEditorHistory.id,
      themeId: themeEditorHistory.themeId,
      action: themeEditorHistory.action,
      performedBy: themeEditorHistory.performedBy,
      createdAt: themeEditorHistory.createdAt,
    })
    .from(themeEditorHistory)
    .orderBy(desc(themeEditorHistory.createdAt))
    .limit(Math.min(limitCount, 50));

  return rows;
}
