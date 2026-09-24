import {
  getDb,
  themes,
  activeTheme,
  themeAuditLog,
  themeDrafts,
  themeEditorHistory,
} from "../db";
import { eq, desc } from "drizzle-orm";
import { invalidateStorefront } from "../storefront-invalidation";
import { DEFAULT_THEME } from "./default-theme";

// 20s in-memory micro-cache for draft reads
let cachedDraft: { data: any; timestamp: number } | null = null;
const DRAFT_CACHE_TTL_MS = 20 * 1000;

export function invalidateDraftMicroCache() {
  cachedDraft = null;
}

/**
 * Returns the current active draft if exists; otherwise falls back to active_theme
 */
export async function getThemeDraft() {
  if (cachedDraft && Date.now() - cachedDraft.timestamp < DRAFT_CACHE_TTL_MS) {
    return cachedDraft.data;
  }

  const db = getDb();
  if (!db) {
    return {
      isDraft: false,
      themeId: "theme-default",
      themeJson: DEFAULT_THEME,
      updatedAt: null,
    };
  }

  // 1. Check for active draft
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
        themeJson: parsed,
        theme: parsed,
        theme_json: parsed,
        updatedBy: draftRows[0].updatedBy,
        updatedAt: draftRows[0].updatedAt,
      };
      cachedDraft = { data: result, timestamp: Date.now() };
      return result;
    } catch {}
  }

  // 2. Fall back to active theme
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

  if (activeRows.length > 0 && activeRows[0].themeJson) {
    try {
      const parsed = JSON.parse(activeRows[0].themeJson);
      const result = {
        isDraft: false,
        themeId: activeRows[0].themeId,
        themeJson: parsed,
        theme: parsed,
        theme_json: parsed,
        updatedBy: activeRows[0].activatedBy,
        updatedAt: activeRows[0].activatedAt,
      };
      cachedDraft = { data: result, timestamp: Date.now() };
      return result;
    } catch {}
  }

  const defaultResult = {
    isDraft: false,
    themeId: "theme-default",
    themeJson: DEFAULT_THEME,
    theme: DEFAULT_THEME,
    theme_json: DEFAULT_THEME,
    updatedAt: null,
  };
  cachedDraft = { data: defaultResult, timestamp: Date.now() };
  return defaultResult;
}

/**
 * Saves or updates current draft
 */
export async function saveThemeDraft(
  themeId: string,
  themeConfig: Record<string, any>,
  updatedBy: string = "admin"
) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  const jsonStr = JSON.stringify(themeConfig);
  const now = Date.now();

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

  // Log in editor history
  await db.insert(themeEditorHistory).values({
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    themeId,
    action: "save_draft",
    snapshotJson: jsonStr,
    performedBy: updatedBy,
    createdAt: now,
  });

  invalidateDraftMicroCache();

  return {
    success: true,
    savedAt: now,
  };
}

/**
 * Publishes draft or given theme JSON directly to active_theme and themes table
 */
export async function publishThemeDraft(
  themeConfig: Record<string, any>,
  publishedBy: string = "admin"
) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  const jsonStr = JSON.stringify(themeConfig);
  const now = Date.now();

  // Find themeId from active_theme or fallback
  const activeRows = await db
    .select({ themeId: activeTheme.themeId })
    .from(activeTheme)
    .where(eq(activeTheme.id, "default"))
    .limit(1);

  const themeId = activeRows.length > 0 ? activeRows[0].themeId : "theme-default";

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

  // 3. Clear draft
  await db.delete(themeDrafts).where(eq(themeDrafts.id, "active-draft"));

  // 4. Log in audit log and editor history
  await db.insert(themeAuditLog).values({
    id: `audit-${now}-${Math.random().toString(36).substring(2, 6)}`,
    themeId,
    action: "published_editor",
    performedBy: publishedBy,
    createdAt: now,
  });

  await db.insert(themeEditorHistory).values({
    id: `hist-${now}-${Math.random().toString(36).substring(2, 6)}`,
    themeId,
    action: "publish",
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
    version: versionHash,
  };
}

/**
 * Discards current active draft
 */
export async function discardThemeDraft() {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  await db.delete(themeDrafts).where(eq(themeDrafts.id, "active-draft"));
  invalidateDraftMicroCache();

  return getThemeDraft();
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
