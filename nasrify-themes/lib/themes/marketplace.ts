import { cache } from "react";
import { getDb, themeMarketplaceListings } from "@/lib/db";
import { eq, and, sql, desc, asc, or, like } from "drizzle-orm";
import type { ThemeMarketplaceListing, ThemeListingStatus } from "@/types/themes";

interface CacheRecord<T> {
  data: T;
  timestamp: number;
}

const THEMES_CACHE_TTL_MS = 20 * 1000; // 20s TTL per permanent rules
const memoryCache = new Map<string, CacheRecord<any>>();

export function invalidateThemesCache(): void {
  memoryCache.clear();
}

/**
 * Fetch approved theme marketplace listings with search, category filtering, and sorting.
 * Cached per isolate with 20s TTL and wrapped in React.cache().
 */
export const getApprovedThemeListings = cache(async (options?: {
  search?: string;
  category?: string;
  sort?: "newest" | "name" | "price_asc" | "price_desc";
  limit?: number;
  offset?: number;
}): Promise<ThemeMarketplaceListing[]> => {
  const search = options?.search?.trim().toLowerCase() || "";
  const category = options?.category?.trim() || "";
  const sort = options?.sort || "newest";
  const limit = Math.min(options?.limit ?? 50, 100);
  const offset = options?.offset ?? 0;

  const cacheKey = `themes:approved:${search}:${category}:${sort}:${limit}:${offset}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < THEMES_CACHE_TTL_MS) {
    return cached.data;
  }

  const db = getDb();
  if (!db) {
    return [];
  }

  try {
    const conditions = [eq(themeMarketplaceListings.status, "approved")];

    if (category && category !== "all") {
      conditions.push(eq(themeMarketplaceListings.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(sql`LOWER(${themeMarketplaceListings.name})`, `%${search}%`),
          like(sql`LOWER(${themeMarketplaceListings.description})`, `%${search}%`),
          like(sql`LOWER(${themeMarketplaceListings.themeId})`, `%${search}%`)
        )!
      );
    }

    let orderByClause = desc(themeMarketplaceListings.createdAt);
    if (sort === "name") {
      orderByClause = asc(themeMarketplaceListings.name);
    } else if (sort === "price_asc") {
      orderByClause = asc(themeMarketplaceListings.price);
    } else if (sort === "price_desc") {
      orderByClause = desc(themeMarketplaceListings.price);
    }

    const rows = await db
      .select({
        id: themeMarketplaceListings.id,
        themeId: themeMarketplaceListings.themeId,
        version: themeMarketplaceListings.version,
        name: themeMarketplaceListings.name,
        description: themeMarketplaceListings.description,
        author: themeMarketplaceListings.author,
        authorUrl: themeMarketplaceListings.authorUrl,
        previewUrl: themeMarketplaceListings.previewUrl,
        screenshotUrls: themeMarketplaceListings.screenshotUrls,
        category: themeMarketplaceListings.category,
        pricing: themeMarketplaceListings.pricing,
        price: themeMarketplaceListings.price,
        status: themeMarketplaceListings.status,
        submittedBy: themeMarketplaceListings.submittedBy,
        submittedAt: themeMarketplaceListings.submittedAt,
        approvedBy: themeMarketplaceListings.approvedBy,
        approvedAt: themeMarketplaceListings.approvedAt,
        rejectionReason: themeMarketplaceListings.rejectionReason,
        downloadUrl: themeMarketplaceListings.downloadUrl,
        configJson: themeMarketplaceListings.configJson,
        changelog: themeMarketplaceListings.changelog,
        createdAt: themeMarketplaceListings.createdAt,
        updatedAt: themeMarketplaceListings.updatedAt,
      })
      .from(themeMarketplaceListings)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const listings = rows as ThemeMarketplaceListing[];
    memoryCache.set(cacheKey, { data: listings, timestamp: Date.now() });
    return listings;
  } catch (_error) {
    return [];
  }
});

/**
 * Fetch a single approved theme listing by its theme ID.
 */
export const getThemeByThemeId = cache(async (themeId: string): Promise<ThemeMarketplaceListing | null> => {
  const db = getDb();
  if (!db || !themeId) return null;

  try {
    const rows = await db
      .select({
        id: themeMarketplaceListings.id,
        themeId: themeMarketplaceListings.themeId,
        version: themeMarketplaceListings.version,
        name: themeMarketplaceListings.name,
        description: themeMarketplaceListings.description,
        author: themeMarketplaceListings.author,
        authorUrl: themeMarketplaceListings.authorUrl,
        previewUrl: themeMarketplaceListings.previewUrl,
        screenshotUrls: themeMarketplaceListings.screenshotUrls,
        category: themeMarketplaceListings.category,
        pricing: themeMarketplaceListings.pricing,
        price: themeMarketplaceListings.price,
        status: themeMarketplaceListings.status,
        submittedBy: themeMarketplaceListings.submittedBy,
        submittedAt: themeMarketplaceListings.submittedAt,
        approvedBy: themeMarketplaceListings.approvedBy,
        approvedAt: themeMarketplaceListings.approvedAt,
        rejectionReason: themeMarketplaceListings.rejectionReason,
        downloadUrl: themeMarketplaceListings.downloadUrl,
        configJson: themeMarketplaceListings.configJson,
        changelog: themeMarketplaceListings.changelog,
        createdAt: themeMarketplaceListings.createdAt,
        updatedAt: themeMarketplaceListings.updatedAt,
      })
      .from(themeMarketplaceListings)
      .where(
        and(
          eq(themeMarketplaceListings.themeId, themeId),
          eq(themeMarketplaceListings.status, "approved")
        )
      )
      .limit(1);

    return (rows[0] as ThemeMarketplaceListing) || null;
  } catch {
    return null;
  }
});

/**
 * Fetch any theme listing by primary ID (for admin/developer inspection).
 */
export async function getThemeListingById(id: string): Promise<ThemeMarketplaceListing | null> {
  const db = getDb();
  if (!db || !id) return null;

  try {
    const rows = await db
      .select({
        id: themeMarketplaceListings.id,
        themeId: themeMarketplaceListings.themeId,
        version: themeMarketplaceListings.version,
        name: themeMarketplaceListings.name,
        description: themeMarketplaceListings.description,
        author: themeMarketplaceListings.author,
        authorUrl: themeMarketplaceListings.authorUrl,
        previewUrl: themeMarketplaceListings.previewUrl,
        screenshotUrls: themeMarketplaceListings.screenshotUrls,
        category: themeMarketplaceListings.category,
        pricing: themeMarketplaceListings.pricing,
        price: themeMarketplaceListings.price,
        status: themeMarketplaceListings.status,
        submittedBy: themeMarketplaceListings.submittedBy,
        submittedAt: themeMarketplaceListings.submittedAt,
        approvedBy: themeMarketplaceListings.approvedBy,
        approvedAt: themeMarketplaceListings.approvedAt,
        rejectionReason: themeMarketplaceListings.rejectionReason,
        downloadUrl: themeMarketplaceListings.downloadUrl,
        configJson: themeMarketplaceListings.configJson,
        changelog: themeMarketplaceListings.changelog,
        createdAt: themeMarketplaceListings.createdAt,
        updatedAt: themeMarketplaceListings.updatedAt,
      })
      .from(themeMarketplaceListings)
      .where(eq(themeMarketplaceListings.id, id))
      .limit(1);

    return (rows[0] as ThemeMarketplaceListing) || null;
  } catch {
    return null;
  }
}

/**
 * Fetch all themes submitted by a specific developer.
 */
export async function getDeveloperThemes(developerEmail: string): Promise<ThemeMarketplaceListing[]> {
  const db = getDb();
  if (!db || !developerEmail) return [];

  try {
    const rows = await db
      .select({
        id: themeMarketplaceListings.id,
        themeId: themeMarketplaceListings.themeId,
        version: themeMarketplaceListings.version,
        name: themeMarketplaceListings.name,
        description: themeMarketplaceListings.description,
        author: themeMarketplaceListings.author,
        authorUrl: themeMarketplaceListings.authorUrl,
        previewUrl: themeMarketplaceListings.previewUrl,
        screenshotUrls: themeMarketplaceListings.screenshotUrls,
        category: themeMarketplaceListings.category,
        pricing: themeMarketplaceListings.pricing,
        price: themeMarketplaceListings.price,
        status: themeMarketplaceListings.status,
        submittedBy: themeMarketplaceListings.submittedBy,
        submittedAt: themeMarketplaceListings.submittedAt,
        approvedBy: themeMarketplaceListings.approvedBy,
        approvedAt: themeMarketplaceListings.approvedAt,
        rejectionReason: themeMarketplaceListings.rejectionReason,
        downloadUrl: themeMarketplaceListings.downloadUrl,
        configJson: themeMarketplaceListings.configJson,
        changelog: themeMarketplaceListings.changelog,
        createdAt: themeMarketplaceListings.createdAt,
        updatedAt: themeMarketplaceListings.updatedAt,
      })
      .from(themeMarketplaceListings)
      .where(eq(themeMarketplaceListings.submittedBy, developerEmail))
      .orderBy(desc(themeMarketplaceListings.updatedAt))
      .limit(100);

    return rows as ThemeMarketplaceListing[];
  } catch {
    return [];
  }
}

/**
 * Fetch all theme listings pending review for super admin approval queue.
 */
export async function getPendingThemes(): Promise<ThemeMarketplaceListing[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({
        id: themeMarketplaceListings.id,
        themeId: themeMarketplaceListings.themeId,
        version: themeMarketplaceListings.version,
        name: themeMarketplaceListings.name,
        description: themeMarketplaceListings.description,
        author: themeMarketplaceListings.author,
        authorUrl: themeMarketplaceListings.authorUrl,
        previewUrl: themeMarketplaceListings.previewUrl,
        screenshotUrls: themeMarketplaceListings.screenshotUrls,
        category: themeMarketplaceListings.category,
        pricing: themeMarketplaceListings.pricing,
        price: themeMarketplaceListings.price,
        status: themeMarketplaceListings.status,
        submittedBy: themeMarketplaceListings.submittedBy,
        submittedAt: themeMarketplaceListings.submittedAt,
        approvedBy: themeMarketplaceListings.approvedBy,
        approvedAt: themeMarketplaceListings.approvedAt,
        rejectionReason: themeMarketplaceListings.rejectionReason,
        downloadUrl: themeMarketplaceListings.downloadUrl,
        configJson: themeMarketplaceListings.configJson,
        changelog: themeMarketplaceListings.changelog,
        createdAt: themeMarketplaceListings.createdAt,
        updatedAt: themeMarketplaceListings.updatedAt,
      })
      .from(themeMarketplaceListings)
      .where(eq(themeMarketplaceListings.status, "pending"))
      .orderBy(desc(themeMarketplaceListings.submittedAt))
      .limit(100);

    return rows as ThemeMarketplaceListing[];
  } catch {
    return [];
  }
}

/**
 * Super Admin Review action: approve, reject, or delist.
 */
export async function reviewThemeListing(options: {
  listingId: string;
  action: "approve" | "reject" | "delist";
  reviewerEmail: string;
  rejectionReason?: string;
}): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const now = Date.now();
  let nextStatus: ThemeListingStatus = "approved";
  let approvedBy: string | null = options.reviewerEmail;
  let approvedAt: number | null = now;
  let rejectionReason: string | null = null;

  if (options.action === "reject") {
    nextStatus = "rejected";
    approvedBy = null;
    approvedAt = null;
    rejectionReason = options.rejectionReason || "Theme does not meet marketplace standards.";
  } else if (options.action === "delist") {
    nextStatus = "delisted";
    approvedBy = null;
    approvedAt = null;
  }

  try {
    await db
      .update(themeMarketplaceListings)
      .set({
        status: nextStatus,
        approvedBy,
        approvedAt,
        rejectionReason,
        updatedAt: now,
      })
      .where(eq(themeMarketplaceListings.id, options.listingId));

    invalidateThemesCache();
    return true;
  } catch {
    return false;
  }
}
