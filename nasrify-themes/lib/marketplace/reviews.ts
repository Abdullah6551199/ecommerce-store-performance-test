import { cache } from "react";
import {
  getDb,
  marketplaceReviews,
  marketplaceReviewVotes,
  appMarketplaceInstalls,
  themeMarketplaceInstalls,
} from "@/lib/db";
import { eq, and, or, desc, inArray } from "drizzle-orm";
import type {
  MarketplaceReview,
  RatingSummary,
  ReviewStatus,
} from "@/types/marketplace";

interface CacheRecord<T> {
  data: T;
  timestamp: number;
}

const SUMMARY_CACHE_TTL_MS = 20 * 1000; // 20s micro-cache per Stage 37C rules
const summaryCache = new Map<string, CacheRecord<RatingSummary>>();

export function invalidateReviewsCache(listingType?: string, listingId?: string): void {
  if (listingType && listingId) {
    summaryCache.delete(`summary:${listingType}:${listingId}`);
  } else {
    summaryCache.clear();
  }
}

/**
 * Check if the given user is a verified installer of the app/theme
 */
export const isVerifiedInstaller = cache(async (
  dbOrNull: any,
  type: "app" | "theme",
  listingId: string,
  userId?: string | null,
  userEmail?: string | null
): Promise<boolean> => {
  const db = dbOrNull || getDb();
  if (!db || (!userId && !userEmail)) return false;

  const candidates = [userId, userEmail].filter(Boolean) as string[];

  try {
    if (type === "app") {
      const found = await db
        .select({ id: appMarketplaceInstalls.id })
        .from(appMarketplaceInstalls)
        .where(
          and(
            eq(appMarketplaceInstalls.listingId, listingId),
            eq(appMarketplaceInstalls.status, "active"),
            or(
              ...candidates.map((c) => eq(appMarketplaceInstalls.storeId, c)),
              eq(appMarketplaceInstalls.storeId, "default-store")
            )
          )
        )
        .limit(1);

      return found.length > 0;
    } else {
      const found = await db
        .select({ id: themeMarketplaceInstalls.id })
        .from(themeMarketplaceInstalls)
        .where(
          and(
            eq(themeMarketplaceInstalls.listingId, listingId),
            eq(themeMarketplaceInstalls.status, "active"),
            or(
              ...candidates.map((c) => eq(themeMarketplaceInstalls.storeId, c)),
              eq(themeMarketplaceInstalls.storeId, "default-store")
            )
          )
        )
        .limit(1);

      return found.length > 0;
    }
  } catch {
    return false;
  }
});

/**
 * Get Rating Summary for a listing (average, count, 5-star distribution)
 * Cached with 20s TTL and wrapped in React.cache()
 */
export const getListingRatingSummary = cache(async (
  dbOrNull: any,
  type: "app" | "theme",
  listingId: string
): Promise<RatingSummary> => {
  const cacheKey = `summary:${type}:${listingId}`;
  const cached = summaryCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < SUMMARY_CACHE_TTL_MS) {
    return cached.data;
  }

  const defaultSummary: RatingSummary = {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    distributionPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const db = dbOrNull || getDb();
  if (!db || !listingId) return defaultSummary;

  try {
    // Explicit column selection (NO SELECT *)
    const rows = await db
      .select({
        rating: marketplaceReviews.rating,
      })
      .from(marketplaceReviews)
      .where(
        and(
          eq(marketplaceReviews.listingType, type),
          eq(marketplaceReviews.listingId, listingId),
          eq(marketplaceReviews.status, "published")
        )
      );

    if (rows.length === 0) {
      summaryCache.set(cacheKey, { data: defaultSummary, timestamp: now });
      return defaultSummary;
    }

    const total = rows.length;
    let sum = 0;
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const r of rows) {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      dist[star] = (dist[star] || 0) + 1;
      sum += r.rating;
    }

    const avg = Number((sum / total).toFixed(1));
    const percentages: Record<number, number> = {
      1: Math.round(((dist[1] || 0) / total) * 100),
      2: Math.round(((dist[2] || 0) / total) * 100),
      3: Math.round(((dist[3] || 0) / total) * 100),
      4: Math.round(((dist[4] || 0) / total) * 100),
      5: Math.round(((dist[5] || 0) / total) * 100),
    };

    const result: RatingSummary = {
      averageRating: avg,
      totalReviews: total,
      distribution: dist as { 1: number; 2: number; 3: number; 4: number; 5: number },
      distributionPercentages: percentages as { 1: number; 2: number; 3: number; 4: number; 5: number },
    };

    summaryCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch {
    return defaultSummary;
  }
});

/**
 * Fetch reviews for a listing with pagination (LIMIT 20)
 * Wrapped in React.cache()
 */
export const getListingReviews = cache(async (
  dbOrNull: any,
  type: "app" | "theme",
  listingId: string,
  limit: number = 20,
  offset: number = 0,
  currentUserId?: string | null
): Promise<MarketplaceReview[]> => {
  const db = dbOrNull || getDb();
  if (!db || !listingId) return [];

  const safeLimit = Math.min(Math.max(1, limit), 20); // STRICT: Max 20 per page
  const safeOffset = Math.max(0, offset);

  try {
    // Explicit column selection (NO SELECT *)
    const rows = await db
      .select({
        id: marketplaceReviews.id,
        listingType: marketplaceReviews.listingType,
        listingId: marketplaceReviews.listingId,
        userId: marketplaceReviews.userId,
        userEmail: marketplaceReviews.userEmail,
        userName: marketplaceReviews.userName,
        rating: marketplaceReviews.rating,
        title: marketplaceReviews.title,
        body: marketplaceReviews.body,
        helpfulCount: marketplaceReviews.helpfulCount,
        status: marketplaceReviews.status,
        teamResponse: marketplaceReviews.teamResponse,
        teamResponseAt: marketplaceReviews.teamResponseAt,
        createdAt: marketplaceReviews.createdAt,
        updatedAt: marketplaceReviews.updatedAt,
      })
      .from(marketplaceReviews)
      .where(
        and(
          eq(marketplaceReviews.listingType, type),
          eq(marketplaceReviews.listingId, listingId),
          eq(marketplaceReviews.status, "published")
        )
      )
      .orderBy(desc(marketplaceReviews.createdAt))
      .limit(safeLimit)
      .offset(safeOffset);

    if (rows.length === 0) return [];

    const reviewIds = rows.map((r: { id: string }) => r.id);
    const votesMap = new Map<string, "helpful" | "not_helpful">();

    if (currentUserId && reviewIds.length > 0) {
      try {
        const votes = await db
          .select({
            reviewId: marketplaceReviewVotes.reviewId,
            voteType: marketplaceReviewVotes.voteType,
          })
          .from(marketplaceReviewVotes)
          .where(
            and(
              eq(marketplaceReviewVotes.userId, currentUserId),
              inArray(marketplaceReviewVotes.reviewId, reviewIds)
            )
          );
        for (const v of votes) {
          votesMap.set(v.reviewId, v.voteType as "helpful" | "not_helpful");
        }
      } catch {
        // non-fatal
      }
    }

    const enriched = await Promise.all(
      rows.map(async (row: (typeof rows)[number]) => {
        const isVerified = await isVerifiedInstaller(
          db,
          type,
          listingId,
          row.userId,
          row.userEmail
        );
        return {
          ...row,
          listingType: row.listingType as "app" | "theme",
          status: row.status as ReviewStatus,
          isVerified,
          userVote: votesMap.get(row.id) || null,
        };
      })
    );

    return enriched;
  } catch {
    return [];
  }
});

/**
 * Fetch a specific user's review for a listing
 * Wrapped in React.cache()
 */
export const getUserReview = cache(async (
  dbOrNull: any,
  type: "app" | "theme",
  listingId: string,
  userId: string
): Promise<MarketplaceReview | null> => {
  const db = dbOrNull || getDb();
  if (!db || !listingId || !userId) return null;

  try {
    const rows = await db
      .select({
        id: marketplaceReviews.id,
        listingType: marketplaceReviews.listingType,
        listingId: marketplaceReviews.listingId,
        userId: marketplaceReviews.userId,
        userEmail: marketplaceReviews.userEmail,
        userName: marketplaceReviews.userName,
        rating: marketplaceReviews.rating,
        title: marketplaceReviews.title,
        body: marketplaceReviews.body,
        helpfulCount: marketplaceReviews.helpfulCount,
        status: marketplaceReviews.status,
        teamResponse: marketplaceReviews.teamResponse,
        teamResponseAt: marketplaceReviews.teamResponseAt,
        createdAt: marketplaceReviews.createdAt,
        updatedAt: marketplaceReviews.updatedAt,
      })
      .from(marketplaceReviews)
      .where(
        and(
          eq(marketplaceReviews.listingType, type),
          eq(marketplaceReviews.listingId, listingId),
          eq(marketplaceReviews.userId, userId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    const isVerified = await isVerifiedInstaller(db, type, listingId, r.userId, r.userEmail);

    return {
      ...r,
      listingType: r.listingType as "app" | "theme",
      status: r.status as ReviewStatus,
      isVerified,
      userVote: null,
    };
  } catch {
    return null;
  }
});

/**
 * Create a new review for an app or theme.
 * Enforces one review per user per listing.
 */
export async function createReview(
  dbOrNull: any,
  data: {
    listingType: "app" | "theme";
    listingId: string;
    userId: string;
    userEmail?: string | null;
    userName?: string | null;
    rating: number;
    title?: string | null;
    body?: string | null;
  }
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  const db = dbOrNull || getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  const rating = Math.max(1, Math.min(5, Math.round(data.rating)));
  if (!rating || isNaN(rating)) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }

  // 1. Validate user has not already reviewed this listing
  const existing = await getUserReview(db, data.listingType, data.listingId, data.userId);
  if (existing) {
    return {
      success: false,
      error: "You have already submitted a review for this listing. You can edit your existing review.",
    };
  }

  const now = Date.now();
  const id = crypto.randomUUID();

  try {
    await db.insert(marketplaceReviews).values({
      id,
      listingType: data.listingType,
      listingId: data.listingId,
      userId: data.userId,
      userEmail: data.userEmail || null,
      userName: data.userName || (data.userEmail ? data.userEmail.split("@")[0] : "Verified User"),
      rating,
      title: data.title?.trim().slice(0, 150) || null,
      body: data.body?.trim().slice(0, 1000) || null,
      helpfulCount: 0,
      status: "published",
      teamResponse: null,
      teamResponseAt: null,
      createdAt: now,
      updatedAt: now,
    });

    invalidateReviewsCache(data.listingType, data.listingId);
    return { success: true, reviewId: id };
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE") || err?.message?.includes("uq_reviews_listing_user")) {
      return {
        success: false,
        error: "You have already submitted a review for this listing.",
      };
    }
    return { success: false, error: err?.message || "Failed to create review" };
  }
}

/**
 * Update an existing review (user must own it)
 */
export async function updateOwnReview(
  dbOrNull: any,
  reviewId: string,
  userId: string,
  data: {
    rating?: number;
    title?: string | null;
    body?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const db = dbOrNull || getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  try {
    const existing = await db
      .select({
        id: marketplaceReviews.id,
        userId: marketplaceReviews.userId,
        listingType: marketplaceReviews.listingType,
        listingId: marketplaceReviews.listingId,
      })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, reviewId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Review not found" };
    }

    if (existing[0].userId !== userId) {
      return { success: false, error: "You are not authorized to edit this review" };
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (data.rating !== undefined) {
      const r = Math.max(1, Math.min(5, Math.round(data.rating)));
      updates.rating = r;
    }
    if (data.title !== undefined) {
      updates.title = data.title ? data.title.trim().slice(0, 150) : null;
    }
    if (data.body !== undefined) {
      updates.body = data.body ? data.body.trim().slice(0, 1000) : null;
    }

    await db
      .update(marketplaceReviews)
      .set(updates)
      .where(eq(marketplaceReviews.id, reviewId));

    invalidateReviewsCache(existing[0].listingType, existing[0].listingId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update review" };
  }
}

/**
 * Delete an existing review (user must own it, or team admin)
 */
export async function deleteOwnReview(
  dbOrNull: any,
  reviewId: string,
  userId: string,
  isTeamAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const db = dbOrNull || getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  try {
    const existing = await db
      .select({
        id: marketplaceReviews.id,
        userId: marketplaceReviews.userId,
        listingType: marketplaceReviews.listingType,
        listingId: marketplaceReviews.listingId,
      })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, reviewId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Review not found" };
    }

    if (!isTeamAdmin && existing[0].userId !== userId) {
      return { success: false, error: "You are not authorized to delete this review" };
    }

    await db
      .delete(marketplaceReviewVotes)
      .where(eq(marketplaceReviewVotes.reviewId, reviewId));

    await db
      .delete(marketplaceReviews)
      .where(eq(marketplaceReviews.id, reviewId));

    invalidateReviewsCache(existing[0].listingType, existing[0].listingId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete review" };
  }
}

/**
 * Toggle helpful mark on a review
 */
export async function markHelpful(
  dbOrNull: any,
  reviewId: string,
  userId: string
): Promise<{ success: boolean; voted: boolean; helpfulCount: number; error?: string }> {
  const db = dbOrNull || getDb();
  if (!db) return { success: false, voted: false, helpfulCount: 0, error: "Database unavailable" };

  try {
    const review = await db
      .select({
        id: marketplaceReviews.id,
        helpfulCount: marketplaceReviews.helpfulCount,
        listingType: marketplaceReviews.listingType,
        listingId: marketplaceReviews.listingId,
      })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, reviewId))
      .limit(1);

    if (review.length === 0) {
      return { success: false, voted: false, helpfulCount: 0, error: "Review not found" };
    }

    const currentHelpful = review[0].helpfulCount;

    const existingVote = await db
      .select({ id: marketplaceReviewVotes.id })
      .from(marketplaceReviewVotes)
      .where(
        and(
          eq(marketplaceReviewVotes.reviewId, reviewId),
          eq(marketplaceReviewVotes.userId, userId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      // Toggle off
      await db
        .delete(marketplaceReviewVotes)
        .where(eq(marketplaceReviewVotes.id, existingVote[0].id));

      const newCount = Math.max(0, currentHelpful - 1);
      await db
        .update(marketplaceReviews)
        .set({ helpfulCount: newCount })
        .where(eq(marketplaceReviews.id, reviewId));

      return { success: true, voted: false, helpfulCount: newCount };
    } else {
      // Toggle on
      await db.insert(marketplaceReviewVotes).values({
        id: crypto.randomUUID(),
        reviewId,
        userId,
        voteType: "helpful",
        createdAt: Date.now(),
      });

      const newCount = currentHelpful + 1;
      await db
        .update(marketplaceReviews)
        .set({ helpfulCount: newCount })
        .where(eq(marketplaceReviews.id, reviewId));

      return { success: true, voted: true, helpfulCount: newCount };
    }
  } catch (err: any) {
    return { success: false, voted: false, helpfulCount: 0, error: err?.message || "Failed to vote" };
  }
}

/**
 * Nasrify Team reply to a review
 */
export async function respondAsTeam(
  dbOrNull: any,
  reviewId: string,
  response: string
): Promise<{ success: boolean; error?: string }> {
  const db = dbOrNull || getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  try {
    const existing = await db
      .select({
        id: marketplaceReviews.id,
        listingType: marketplaceReviews.listingType,
        listingId: marketplaceReviews.listingId,
      })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, reviewId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Review not found" };
    }

    const now = Date.now();
    await db
      .update(marketplaceReviews)
      .set({
        teamResponse: response.trim(),
        teamResponseAt: now,
        updatedAt: now,
      })
      .where(eq(marketplaceReviews.id, reviewId));

    invalidateReviewsCache(existing[0].listingType, existing[0].listingId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to post team response" };
  }
}

/**
 * Nasrify Team moderation to hide a review
 */
export async function hideReview(
  dbOrNull: any,
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const db = dbOrNull || getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  try {
    const existing = await db
      .select({
        id: marketplaceReviews.id,
        listingType: marketplaceReviews.listingType,
        listingId: marketplaceReviews.listingId,
      })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, reviewId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Review not found" };
    }

    const now = Date.now();
    await db
      .update(marketplaceReviews)
      .set({
        status: "hidden",
        updatedAt: now,
      })
      .where(eq(marketplaceReviews.id, reviewId));

    invalidateReviewsCache(existing[0].listingType, existing[0].listingId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to hide review" };
  }
}
