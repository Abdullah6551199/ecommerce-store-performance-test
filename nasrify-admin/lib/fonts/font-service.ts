import { getDb, fonts, fontSettings, type FontRecord } from "../db";
import { eq, like, and, desc, sql } from "drizzle-orm";

let cachedFontList: { data: any[]; timestamp: number; key: string } | null = null;
const FONT_CACHE_TTL_MS = 20 * 1000;

export function invalidateFontCache() {
  cachedFontList = null;
}

export interface ListFontsOptions {
  curatedOnly?: boolean;
  category?: string;
  search?: string;
  limit?: number;
}

export async function listFonts(options: ListFontsOptions = {}) {
  const { curatedOnly, category, search, limit = 100 } = options;
  const cacheKey = `${curatedOnly ? "1" : "0"}_${category || "all"}_${search || ""}_${limit}`;

  if (
    cachedFontList &&
    cachedFontList.key === cacheKey &&
    Date.now() - cachedFontList.timestamp < FONT_CACHE_TTL_MS
  ) {
    return cachedFontList.data;
  }

  const db = getDb();
  if (!db) return [];

  const conditions = [eq(fonts.isActive, 1)];

  if (curatedOnly) {
    conditions.push(eq(fonts.isCurated, 1));
  }

  if (category && category !== "all") {
    conditions.push(eq(fonts.category, category));
  }

  if (search && search.trim().length > 0) {
    conditions.push(like(fonts.family, `%${search.trim()}%`));
  }

  const rows = await db
    .select({
      id: fonts.id,
      slug: fonts.slug,
      family: fonts.family,
      category: fonts.category,
      variants: fonts.variants,
      styles: fonts.styles,
      subsets: fonts.subsets,
      license: fonts.license,
      source: fonts.source,
      isCurated: fonts.isCurated,
      isActive: fonts.isActive,
      previewUrl: fonts.previewUrl,
      fileUrls: fonts.fileUrls,
      totalSizeKb: fonts.totalSizeKb,
      createdAt: fonts.createdAt,
      updatedAt: fonts.updatedAt,
    })
    .from(fonts)
    .where(and(...conditions))
    .orderBy(desc(fonts.isCurated), fonts.family)
    .limit(limit);

  const formatted = rows.map((r) => {
    let parsedVariants: number[] = [400, 700];
    let parsedStyles: string[] = ["normal"];
    let parsedSubsets: string[] = ["latin"];
    let parsedFiles: Record<string, string> = {};

    try {
      parsedVariants = JSON.parse(r.variants);
    } catch {}
    try {
      parsedStyles = JSON.parse(r.styles);
    } catch {}
    try {
      parsedSubsets = JSON.parse(r.subsets);
    } catch {}
    try {
      parsedFiles = JSON.parse(r.fileUrls);
    } catch {}

    return {
      ...r,
      is_curated: r.isCurated === 1,
      is_active: r.isActive === 1,
      variants: parsedVariants,
      styles: parsedStyles,
      subsets: parsedSubsets,
      file_urls: parsedFiles,
    };
  });

  cachedFontList = { data: formatted, timestamp: Date.now(), key: cacheKey };
  return formatted;
}

export async function getFontById(id: string) {
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select({
      id: fonts.id,
      slug: fonts.slug,
      family: fonts.family,
      category: fonts.category,
      variants: fonts.variants,
      styles: fonts.styles,
      subsets: fonts.subsets,
      license: fonts.license,
      source: fonts.source,
      isCurated: fonts.isCurated,
      isActive: fonts.isActive,
      previewUrl: fonts.previewUrl,
      fileUrls: fonts.fileUrls,
      totalSizeKb: fonts.totalSizeKb,
      createdAt: fonts.createdAt,
      updatedAt: fonts.updatedAt,
    })
    .from(fonts)
    .where(eq(fonts.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  const r = rows[0];

  return {
    ...r,
    is_curated: r.isCurated === 1,
    is_active: r.isActive === 1,
    variants: JSON.parse(r.variants || "[]"),
    styles: JSON.parse(r.styles || "[]"),
    subsets: JSON.parse(r.subsets || "[]"),
    file_urls: JSON.parse(r.fileUrls || "{}"),
  };
}

export async function toggleCurateFont(fontId: string, isCurated: boolean) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  await db
    .update(fonts)
    .set({
      isCurated: isCurated ? 1 : 0,
      updatedAt: Date.now(),
    })
    .where(eq(fonts.id, fontId));

  invalidateFontCache();
  return { success: true, fontId, isCurated };
}

export async function deleteFont(fontId: string) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  await db.delete(fonts).where(eq(fonts.id, fontId));
  invalidateFontCache();
  return { success: true, fontId };
}
