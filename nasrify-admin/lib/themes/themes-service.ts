import { getDb, themes, activeTheme, themeAuditLog, type ThemeRecord } from "../db";
import { eq, desc } from "drizzle-orm";
import { invalidateStorefront } from "../storefront-invalidation";

export interface ThemeListItem extends ThemeRecord {
  isActive: boolean;
}

export async function listThemes(filter?: "all" | "builtin" | "custom"): Promise<{
  themes: ThemeListItem[];
  activeThemeId: string | null;
}> {
  const db = getDb();
  if (!db) {
    return { themes: [], activeThemeId: null };
  }

  // Fetch active theme row
  const activeRows = await db
    .select({
      themeId: activeTheme.themeId,
    })
    .from(activeTheme)
    .where(eq(activeTheme.id, "default"))
    .limit(1);

  const activeThemeId = activeRows.length > 0 ? activeRows[0].themeId : null;

  // Fetch all themes
  const allThemes = await db
    .select()
    .from(themes)
    .orderBy(desc(themes.isBuiltIn), desc(themes.createdAt));

  let filtered = allThemes;
  if (filter === "builtin") {
    filtered = allThemes.filter((t) => t.isBuiltIn === 1);
  } else if (filter === "custom") {
    filtered = allThemes.filter((t) => t.isBuiltIn === 0);
  }

  const result: ThemeListItem[] = filtered.map((t) => ({
    ...t,
    isActive: t.id === activeThemeId,
  }));

  return { themes: result, activeThemeId };
}

export async function getThemeById(id: string) {
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(themes)
    .where(eq(themes.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  const theme = rows[0];

  // Check active status
  const activeRows = await db
    .select({ themeId: activeTheme.themeId })
    .from(activeTheme)
    .where(eq(activeTheme.id, "default"))
    .limit(1);

  const isActive = activeRows.length > 0 && activeRows[0].themeId === theme.id;

  // Fetch audit log
  const auditLogs = await db
    .select()
    .from(themeAuditLog)
    .where(eq(themeAuditLog.themeId, theme.id))
    .orderBy(desc(themeAuditLog.createdAt))
    .limit(20);

  return {
    ...theme,
    isActive,
    auditLogs,
  };
}

export async function activateTheme(themeId: string, performedBy: string = "admin") {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  const themeRows = await db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .limit(1);

  if (themeRows.length === 0) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  const theme = themeRows[0];
  const now = Date.now();

  // Upsert active_theme table with full JSON snapshot
  await db
    .insert(activeTheme)
    .values({
      id: "default",
      themeId: theme.id,
      themeJson: theme.themeJson,
      activatedAt: now,
      activatedBy: performedBy,
    })
    .onConflictDoUpdate({
      target: activeTheme.id,
      set: {
        themeId: theme.id,
        themeJson: theme.themeJson,
        activatedAt: now,
        activatedBy: performedBy,
      },
    });

  // Record audit log
  await db.insert(themeAuditLog).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    themeId: theme.id,
    action: "activated",
    performedBy,
    createdAt: now,
  });

  // Cross-worker storefront cache invalidation (HTML + APIs)
  try {
    await invalidateStorefront({ target: "all", path: "/" });
  } catch (err) {
    console.warn("[Themes Service] Storefront invalidation warning:", err);
  }

  return {
    success: true,
    themeId: theme.id,
    themeName: theme.name,
    activatedAt: now,
  };
}

export async function duplicateTheme(themeId: string, performedBy: string = "admin") {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  const themeRows = await db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .limit(1);

  if (themeRows.length === 0) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  const source = themeRows[0];
  const now = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const newId = `theme-${now.toString(36)}-${randomSuffix}`;
  const newSlug = `${source.slug}-copy-${randomSuffix}`;
  const newName = `${source.name} (Copy)`;

  // Update name inside JSON config
  let newThemeJson = source.themeJson;
  try {
    const parsed = JSON.parse(source.themeJson);
    parsed.name = newName;
    newThemeJson = JSON.stringify(parsed);
  } catch {}

  await db.insert(themes).values({
    id: newId,
    slug: newSlug,
    name: newName,
    version: "1.0.0",
    description: source.description || "",
    author: performedBy || "Admin",
    authorUrl: source.authorUrl,
    previewUrl: source.previewUrl,
    screenshotUrls: source.screenshotUrls,
    category: source.category,
    themeJson: newThemeJson,
    isBuiltIn: 0, // Custom duplicated theme
    status: "published",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(themeAuditLog).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    themeId: newId,
    action: "created",
    performedBy,
    createdAt: now,
  });

  return {
    id: newId,
    slug: newSlug,
    name: newName,
  };
}

export async function deleteTheme(themeId: string, performedBy: string = "admin") {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  const themeRows = await db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .limit(1);

  if (themeRows.length === 0) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  const theme = themeRows[0];

  if (theme.isBuiltIn === 1) {
    throw new Error("Built-in themes cannot be deleted.");
  }

  // Check if currently active
  const activeRows = await db
    .select({ themeId: activeTheme.themeId })
    .from(activeTheme)
    .where(eq(activeTheme.id, "default"))
    .limit(1);

  if (activeRows.length > 0 && activeRows[0].themeId === theme.id) {
    throw new Error("Cannot delete the currently active theme. Activate another theme first.");
  }

  await db.delete(themes).where(eq(themes.id, theme.id));

  await db.insert(themeAuditLog).values({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    themeId: theme.id,
    action: "deleted",
    performedBy,
    createdAt: Date.now(),
  });

  return { success: true, deletedId: theme.id };
}
