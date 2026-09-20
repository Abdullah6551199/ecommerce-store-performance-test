import { cache } from "react";
import { getDb, appMarketplaceListings } from "@/lib/db";
import { eq, and, sql, desc, asc, or, like } from "drizzle-orm";
import type { MarketplaceListing, MarketplaceListingStatus } from "@/types/marketplace";

interface CacheRecord<T> {
  data: T;
  timestamp: number;
}

const LISTINGS_CACHE_TTL_MS = 20 * 1000; // 20s TTL per permanent rules
const memoryCache = new Map<string, CacheRecord<any>>();

export function invalidateListingsCache(): void {
  memoryCache.clear();
}

/**
 * Fetch approved marketplace listings with search, category filtering, and sorting.
 * Cached per isolate with 20s TTL and wrapped in React.cache().
 */
export const getApprovedListings = cache(async (options?: {
  search?: string;
  category?: string;
  sort?: "newest" | "name" | "price_asc" | "price_desc";
  limit?: number;
  offset?: number;
}): Promise<MarketplaceListing[]> => {
  const search = options?.search?.trim().toLowerCase() || "";
  const category = options?.category?.trim() || "";
  const sort = options?.sort || "newest";
  const limit = Math.min(options?.limit ?? 50, 100);
  const offset = options?.offset ?? 0;

  const cacheKey = `approved:${search}:${category}:${sort}:${limit}:${offset}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < LISTINGS_CACHE_TTL_MS) {
    return cached.data;
  }

  const db = getDb();
  if (!db) {
    return [];
  }

  try {
    const conditions = [eq(appMarketplaceListings.status, "approved")];

    if (category && category !== "all") {
      conditions.push(eq(appMarketplaceListings.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(sql`LOWER(${appMarketplaceListings.name})`, `%${search}%`),
          like(sql`LOWER(${appMarketplaceListings.description})`, `%${search}%`),
          like(sql`LOWER(${appMarketplaceListings.appId})`, `%${search}%`)
        )!
      );
    }

    let orderByClause = desc(appMarketplaceListings.createdAt);
    if (sort === "name") {
      orderByClause = asc(appMarketplaceListings.name);
    } else if (sort === "price_asc") {
      orderByClause = asc(appMarketplaceListings.price);
    } else if (sort === "price_desc") {
      orderByClause = desc(appMarketplaceListings.price);
    }

    const rows = await db
      .select({
        id: appMarketplaceListings.id,
        appId: appMarketplaceListings.appId,
        version: appMarketplaceListings.version,
        name: appMarketplaceListings.name,
        description: appMarketplaceListings.description,
        author: appMarketplaceListings.author,
        authorUrl: appMarketplaceListings.authorUrl,
        iconUrl: appMarketplaceListings.iconUrl,
        category: appMarketplaceListings.category,
        pricing: appMarketplaceListings.pricing,
        price: appMarketplaceListings.price,
        status: appMarketplaceListings.status,
        submittedBy: appMarketplaceListings.submittedBy,
        submittedAt: appMarketplaceListings.submittedAt,
        approvedBy: appMarketplaceListings.approvedBy,
        approvedAt: appMarketplaceListings.approvedAt,
        rejectionReason: appMarketplaceListings.rejectionReason,
        downloadUrl: appMarketplaceListings.downloadUrl,
        manifestJson: appMarketplaceListings.manifestJson,
        changelog: appMarketplaceListings.changelog,
        createdAt: appMarketplaceListings.createdAt,
        updatedAt: appMarketplaceListings.updatedAt,
      })
      .from(appMarketplaceListings)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const listings = rows as MarketplaceListing[];
    memoryCache.set(cacheKey, { data: listings, timestamp: Date.now() });
    return listings;
  } catch (error) {
    return [];
  }
});

/**
 * Fetch a single approved listing by its app ID.
 */
export const getListingByAppId = cache(async (appId: string): Promise<MarketplaceListing | null> => {
  const db = getDb();
  if (!db || !appId) return null;

  try {
    const rows = await db
      .select({
        id: appMarketplaceListings.id,
        appId: appMarketplaceListings.appId,
        version: appMarketplaceListings.version,
        name: appMarketplaceListings.name,
        description: appMarketplaceListings.description,
        author: appMarketplaceListings.author,
        authorUrl: appMarketplaceListings.authorUrl,
        iconUrl: appMarketplaceListings.iconUrl,
        category: appMarketplaceListings.category,
        pricing: appMarketplaceListings.pricing,
        price: appMarketplaceListings.price,
        status: appMarketplaceListings.status,
        submittedBy: appMarketplaceListings.submittedBy,
        submittedAt: appMarketplaceListings.submittedAt,
        approvedBy: appMarketplaceListings.approvedBy,
        approvedAt: appMarketplaceListings.approvedAt,
        rejectionReason: appMarketplaceListings.rejectionReason,
        downloadUrl: appMarketplaceListings.downloadUrl,
        manifestJson: appMarketplaceListings.manifestJson,
        changelog: appMarketplaceListings.changelog,
        createdAt: appMarketplaceListings.createdAt,
        updatedAt: appMarketplaceListings.updatedAt,
      })
      .from(appMarketplaceListings)
      .where(
        and(
          eq(appMarketplaceListings.appId, appId),
          eq(appMarketplaceListings.status, "approved")
        )
      )
      .limit(1);

    return (rows[0] as MarketplaceListing) || null;
  } catch {
    return null;
  }
});

/**
 * Fetch any listing by ID (for admin/developer view).
 */
export async function getListingById(id: string): Promise<MarketplaceListing | null> {
  const db = getDb();
  if (!db || !id) return null;

  try {
    const rows = await db
      .select({
        id: appMarketplaceListings.id,
        appId: appMarketplaceListings.appId,
        version: appMarketplaceListings.version,
        name: appMarketplaceListings.name,
        description: appMarketplaceListings.description,
        author: appMarketplaceListings.author,
        authorUrl: appMarketplaceListings.authorUrl,
        iconUrl: appMarketplaceListings.iconUrl,
        category: appMarketplaceListings.category,
        pricing: appMarketplaceListings.pricing,
        price: appMarketplaceListings.price,
        status: appMarketplaceListings.status,
        submittedBy: appMarketplaceListings.submittedBy,
        submittedAt: appMarketplaceListings.submittedAt,
        approvedBy: appMarketplaceListings.approvedBy,
        approvedAt: appMarketplaceListings.approvedAt,
        rejectionReason: appMarketplaceListings.rejectionReason,
        downloadUrl: appMarketplaceListings.downloadUrl,
        manifestJson: appMarketplaceListings.manifestJson,
        changelog: appMarketplaceListings.changelog,
        createdAt: appMarketplaceListings.createdAt,
        updatedAt: appMarketplaceListings.updatedAt,
      })
      .from(appMarketplaceListings)
      .where(eq(appMarketplaceListings.id, id))
      .limit(1);

    return (rows[0] as MarketplaceListing) || null;
  } catch {
    return null;
  }
}

/**
 * Fetch all listings submitted by a specific developer.
 */
export async function getDeveloperListings(developerEmail: string): Promise<MarketplaceListing[]> {
  const db = getDb();
  if (!db || !developerEmail) return [];

  try {
    const rows = await db
      .select({
        id: appMarketplaceListings.id,
        appId: appMarketplaceListings.appId,
        version: appMarketplaceListings.version,
        name: appMarketplaceListings.name,
        description: appMarketplaceListings.description,
        author: appMarketplaceListings.author,
        authorUrl: appMarketplaceListings.authorUrl,
        iconUrl: appMarketplaceListings.iconUrl,
        category: appMarketplaceListings.category,
        pricing: appMarketplaceListings.pricing,
        price: appMarketplaceListings.price,
        status: appMarketplaceListings.status,
        submittedBy: appMarketplaceListings.submittedBy,
        submittedAt: appMarketplaceListings.submittedAt,
        approvedBy: appMarketplaceListings.approvedBy,
        approvedAt: appMarketplaceListings.approvedAt,
        rejectionReason: appMarketplaceListings.rejectionReason,
        downloadUrl: appMarketplaceListings.downloadUrl,
        manifestJson: appMarketplaceListings.manifestJson,
        changelog: appMarketplaceListings.changelog,
        createdAt: appMarketplaceListings.createdAt,
        updatedAt: appMarketplaceListings.updatedAt,
      })
      .from(appMarketplaceListings)
      .where(eq(appMarketplaceListings.submittedBy, developerEmail))
      .orderBy(desc(appMarketplaceListings.updatedAt))
      .limit(100);

    return rows as MarketplaceListing[];
  } catch {
    return [];
  }
}

/**
 * Fetch all listings pending review for super admin approval queue.
 */
export async function getPendingListings(): Promise<MarketplaceListing[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({
        id: appMarketplaceListings.id,
        appId: appMarketplaceListings.appId,
        version: appMarketplaceListings.version,
        name: appMarketplaceListings.name,
        description: appMarketplaceListings.description,
        author: appMarketplaceListings.author,
        authorUrl: appMarketplaceListings.authorUrl,
        iconUrl: appMarketplaceListings.iconUrl,
        category: appMarketplaceListings.category,
        pricing: appMarketplaceListings.pricing,
        price: appMarketplaceListings.price,
        status: appMarketplaceListings.status,
        submittedBy: appMarketplaceListings.submittedBy,
        submittedAt: appMarketplaceListings.submittedAt,
        approvedBy: appMarketplaceListings.approvedBy,
        approvedAt: appMarketplaceListings.approvedAt,
        rejectionReason: appMarketplaceListings.rejectionReason,
        downloadUrl: appMarketplaceListings.downloadUrl,
        manifestJson: appMarketplaceListings.manifestJson,
        changelog: appMarketplaceListings.changelog,
        createdAt: appMarketplaceListings.createdAt,
        updatedAt: appMarketplaceListings.updatedAt,
      })
      .from(appMarketplaceListings)
      .where(eq(appMarketplaceListings.status, "pending"))
      .orderBy(desc(appMarketplaceListings.submittedAt))
      .limit(100);

    return rows as MarketplaceListing[];
  } catch {
    return [];
  }
}

/**
 * Super Admin Review action: approve, reject, or delist.
 */
export async function reviewListing(options: {
  listingId: string;
  action: "approve" | "reject" | "delist";
  reviewerEmail: string;
  rejectionReason?: string;
}): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const now = Date.now();
  let nextStatus: MarketplaceListingStatus = "approved";
  let approvedBy: string | null = options.reviewerEmail;
  let approvedAt: number | null = now;
  let rejectionReason: string | null = null;

  if (options.action === "reject") {
    nextStatus = "rejected";
    approvedBy = null;
    approvedAt = null;
    rejectionReason = options.rejectionReason || "Listing does not meet marketplace standards.";
  } else if (options.action === "delist") {
    nextStatus = "delist" as any === "delist" ? "delisted" : "delisted";
    approvedBy = null;
    approvedAt = null;
  }

  try {
    await db
      .update(appMarketplaceListings)
      .set({
        status: nextStatus,
        approvedBy,
        approvedAt,
        rejectionReason,
        updatedAt: now,
      })
      .where(eq(appMarketplaceListings.id, options.listingId));

    invalidateListingsCache();
    return true;
  } catch {
    return false;
  }
}
