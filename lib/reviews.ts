import { cache } from "react";
import { eq, desc, asc, and, sql, inArray, like, or } from "drizzle-orm";
import {
  getDb,
  reviews,
  reviewImages,
  reviewHelpful,
  orders,
  orderItems,
  settings,
  customers,
  type ReviewRecord,
  type NewReviewRecord,
  type ReviewImageRecord,
  type ReviewHelpfulRecord,
} from "./db";
import { createCustomerNotification } from "./customer-notifications";

export type { ReviewRecord, NewReviewRecord, ReviewImageRecord, ReviewHelpfulRecord };

export interface ReviewWithImages extends ReviewRecord {
  images: ReviewImageRecord[];
}

export interface ReviewSettings {
  autoApprove: boolean;
  requireVerifiedPurchase: boolean;
  allowImages: boolean;
  maxImages: number;
}

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  autoApprove: false,
  requireVerifiedPurchase: false,
  allowImages: true,
  maxImages: 5,
};

export interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: RatingBreakdown[];
}

export interface ReviewSubmissionInput {
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string | null;
  content: string;
  images?: string[];
  userIp?: string;
  orderId?: string | null;
}

// In-memory fallbacks for local dev / testing
let memoryReviews: ReviewRecord[] = [
  {
    id: "rev_demo_1",
    tenantId: null,
    productId: "prod_1",
    orderId: "ord_demo_1",
    customerId: null,
    customerName: "Alex Mercer",
    customerEmail: "alex.mercer@example.com",
    rating: 5,
    title: "Incredible build quality and comfort",
    content: "These shoes completely exceeded my expectations. Cushioning is responsive and the breathability is top tier for marathon runs.",
    isVerifiedPurchase: 1,
    status: "approved",
    helpfulCount: 14,
    notHelpfulCount: 1,
    adminReply: "Thank you for the wonderful feedback Alex! We are thrilled to hear that.",
    adminReplyAt: "2026-09-10T12:00:00.000Z",
    createdAt: "2026-09-08T10:15:00.000Z",
    updatedAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "rev_demo_2",
    tenantId: null,
    productId: "prod_1",
    orderId: null,
    customerId: null,
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@example.com",
    rating: 4,
    title: "Great performance, slightly snug fit",
    content: "Excellent grip and support during agility workouts. I'd recommend sizing up half a size if you have wider feet.",
    isVerifiedPurchase: 0,
    status: "approved",
    helpfulCount: 8,
    notHelpfulCount: 0,
    adminReply: null,
    adminReplyAt: null,
    createdAt: "2026-09-09T14:30:00.000Z",
    updatedAt: "2026-09-09T14:30:00.000Z",
  },
];

let memoryReviewImages: ReviewImageRecord[] = [];
let memoryReviewVotes: ReviewHelpfulRecord[] = [];
let memoryReviewSettings: ReviewSettings = { ...DEFAULT_REVIEW_SETTINGS };

const REVIEW_SETTINGS_KEY = "review_settings";

/**
 * Retrieve review configuration settings
 */
export async function getReviewSettings(): Promise<ReviewSettings> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, REVIEW_SETTINGS_KEY))
        .limit(1);

      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        return {
          ...DEFAULT_REVIEW_SETTINGS,
          ...parsed,
        };
      }
    } catch (err) {
      console.warn("[getReviewSettings] Error reading settings from D1:", err);
    }
  }
  return memoryReviewSettings;
}

/**
 * Update review configuration settings
 */
export async function updateReviewSettings(updates: Partial<ReviewSettings>): Promise<ReviewSettings> {
  const current = await getReviewSettings();
  const updated: ReviewSettings = { ...current, ...updates };

  const db = getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, REVIEW_SETTINGS_KEY))
        .limit(1);

      const jsonVal = JSON.stringify(updated);
      const now = new Date().toISOString();

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value: jsonVal, updatedAt: now })
          .where(eq(settings.key, REVIEW_SETTINGS_KEY));
      } else {
        await db.insert(settings).values({
          id: `setting_${REVIEW_SETTINGS_KEY}`,
          key: REVIEW_SETTINGS_KEY,
          value: jsonVal,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.warn("[updateReviewSettings] Error saving settings in D1:", err);
    }
  }

  memoryReviewSettings = updated;
  return updated;
}

/**
 * Verify if a customer email actually purchased the product in a past order
 */
export async function checkVerifiedPurchase(
  email: string,
  productId: string
): Promise<{ isVerified: boolean; orderId?: string }> {
  if (!email || !productId) return { isVerified: false };

  const cleanEmail = email.trim().toLowerCase();
  const db = getDb();

  if (db) {
    try {
      // Find orders matching this email with status not cancelled/returned
      const userOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            sql`LOWER(${orders.email}) = ${cleanEmail}`,
            sql`${orders.status} NOT IN ('cancelled', 'returned')`
          )
        );

      if (userOrders.length > 0) {
        const orderIds = userOrders.map((o) => o.id);
        const matchingItems = await db
          .select()
          .from(orderItems)
          .where(
            and(
              inArray(orderItems.orderId, orderIds),
              eq(orderItems.productId, productId)
            )
          )
          .limit(1);

        if (matchingItems.length > 0) {
          return { isVerified: true, orderId: matchingItems[0].orderId };
        }
      }
    } catch (err) {
      console.warn("[checkVerifiedPurchase] Error checking order history:", err);
    }
  }

  return { isVerified: false };
}

/**
 * Public: Get approved reviews for a product with sorting and star filtering
 */
export const getProductReviews = cache(
  async (
    productId: string,
    options: {
      status?: "approved" | "pending" | "rejected" | "all";
      rating?: number;
      sort?: "recent" | "helpful" | "highest" | "lowest";
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ reviews: ReviewWithImages[]; total: number }> => {
    const { status = "approved", rating, sort = "recent", limit = 20, offset = 0 } = options;

    const db = getDb();
    if (db) {
      try {
        const conditions = [eq(reviews.productId, productId)];

        if (status !== "all") {
          conditions.push(eq(reviews.status, status));
        }

        if (rating && rating >= 1 && rating <= 5) {
          conditions.push(eq(reviews.rating, rating));
        }

        let orderByClause = desc(reviews.createdAt);
        if (sort === "helpful") {
          orderByClause = desc(reviews.helpfulCount);
        } else if (sort === "highest") {
          orderByClause = desc(reviews.rating);
        } else if (sort === "lowest") {
          orderByClause = asc(reviews.rating);
        }

        const reviewRows = await db
          .select()
          .from(reviews)
          .where(and(...conditions))
          .orderBy(orderByClause)
          .limit(limit)
          .offset(offset);

        // Fetch associated images for all returned reviews
        const reviewIds = reviewRows.map((r) => r.id);
        let imagesByReviewId: Record<string, ReviewImageRecord[]> = {};

        if (reviewIds.length > 0) {
          const imageRows = await db
            .select()
            .from(reviewImages)
            .where(inArray(reviewImages.reviewId, reviewIds))
            .orderBy(asc(reviewImages.sortOrder));

          for (const img of imageRows) {
            if (!imagesByReviewId[img.reviewId]) {
              imagesByReviewId[img.reviewId] = [];
            }
            imagesByReviewId[img.reviewId].push(img);
          }
        }

        // Count total matching
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(and(...conditions));

        const total = Number(countResult[0]?.count || 0);

        const reviewsWithImages: ReviewWithImages[] = reviewRows.map((r) => ({
          ...r,
          images: imagesByReviewId[r.id] || [],
        }));

        return { reviews: reviewsWithImages, total };
      } catch (err) {
        console.warn("[getProductReviews] D1 query failed, using memory fallback:", err);
      }
    }

    // Memory fallback
    let filtered = memoryReviews.filter(
      (r) =>
        r.productId === productId &&
        (status === "all" ? true : r.status === status) &&
        (!rating || r.rating === rating)
    );

    if (sort === "helpful") {
      filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (sort === "highest") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === "lowest") {
      filtered.sort((a, b) => a.rating - b.rating);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit).map((r) => ({
      ...r,
      images: memoryReviewImages.filter((img) => img.reviewId === r.id),
    }));

    return { reviews: paginated, total };
  }
);

/**
 * Public: Get aggregate rating summary and star breakdown for a product
 */
export const getProductRatingSummary = cache(
  async (productId: string): Promise<ProductRatingSummary> => {
    const db = getDb();
    if (db) {
      try {
        const approvedReviews = await db
          .select({
            rating: reviews.rating,
          })
          .from(reviews)
          .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));

        const totalReviews = approvedReviews.length;
        if (totalReviews === 0) {
          return {
            averageRating: 0,
            totalReviews: 0,
            breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percentage: 0 })),
          };
        }

        const sum = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = Number((sum / totalReviews).toFixed(1));

        const breakdown: RatingBreakdown[] = [5, 4, 3, 2, 1].map((stars) => {
          const count = approvedReviews.filter((r) => r.rating === stars).length;
          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
          return { stars, count, percentage };
        });

        return {
          averageRating,
          totalReviews,
          breakdown,
        };
      } catch (err) {
        console.warn("[getProductRatingSummary] D1 query failed, using memory fallback:", err);
      }
    }

    // Memory fallback
    const approved = memoryReviews.filter((r) => r.productId === productId && r.status === "approved");
    const totalReviews = approved.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percentage: 0 })),
      };
    }

    const sum = approved.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = Number((sum / totalReviews).toFixed(1));

    const breakdown: RatingBreakdown[] = [5, 4, 3, 2, 1].map((stars) => {
      const count = approved.filter((r) => r.rating === stars).length;
      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      return { stars, count, percentage };
    });

    return {
      averageRating,
      totalReviews,
      breakdown,
    };
  }
);

/**
 * Public: Create a new customer review
 */
export async function createReview(
  input: ReviewSubmissionInput
): Promise<{ review: ReviewWithImages; message: string }> {
  const { productId, customerName, customerEmail, rating, title, content, images = [] } = input;

  if (!productId || !customerName || !customerEmail || !content) {
    throw new Error("Product, customer name, customer email, and content are required.");
  }

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  const reviewSettings = await getReviewSettings();

  // Check verified purchase
  const verification = await checkVerifiedPurchase(customerEmail, productId);

  if (reviewSettings.requireVerifiedPurchase && !verification.isVerified) {
    throw new Error("Only verified purchasers of this item can leave a review.");
  }

  const isVerifiedPurchase = verification.isVerified ? 1 : 0;
  const status = reviewSettings.autoApprove ? "approved" : "pending";
  const now = new Date().toISOString();
  const reviewId = `rev_${crypto.randomUUID()}`;

  const newReviewRecord: ReviewRecord = {
    id: reviewId,
    tenantId: null,
    productId,
    orderId: verification.orderId || input.orderId || null,
    customerId: null,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim().toLowerCase(),
    rating,
    title: title?.trim() || null,
    content: content.trim(),
    isVerifiedPurchase,
    status,
    helpfulCount: 0,
    notHelpfulCount: 0,
    adminReply: null,
    adminReplyAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const attachedImages: ReviewImageRecord[] = [];

  if (reviewSettings.allowImages && images.length > 0) {
    const validImages = images.slice(0, reviewSettings.maxImages);
    validImages.forEach((url, idx) => {
      attachedImages.push({
        id: `rev_img_${crypto.randomUUID()}`,
        reviewId,
        imageUrl: url,
        sortOrder: idx,
        createdAt: now,
      });
    });
  }

  const db = getDb();
  if (db) {
    try {
      await db.insert(reviews).values(newReviewRecord);

      if (attachedImages.length > 0) {
        for (const img of attachedImages) {
          await db.insert(reviewImages).values(img);
        }
      }

      // If verified purchase, set has_review = 1 on the order to prevent duplicate reviews
      if (verification.orderId) {
        await db
          .update(orders)
          .set({ hasReview: 1, updatedAt: now })
          .where(eq(orders.id, verification.orderId));
      }
    } catch (err) {
      console.error("[createReview] D1 insert error:", err);
      throw new Error(`Failed to save review: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    // Memory fallback
    memoryReviews.unshift(newReviewRecord);
    memoryReviewImages.push(...attachedImages);
  }

  const message =
    status === "approved"
      ? "Thank you! Your review has been published."
      : "Thank you! Your review is pending approval.";

  return {
    review: {
      ...newReviewRecord,
      images: attachedImages,
    },
    message,
  };
}

/**
 * Public: Vote a review as helpful or not helpful
 */
export async function voteReviewHelpful(
  reviewId: string,
  userIp: string,
  voteType: "helpful" | "not_helpful"
): Promise<{ helpfulCount: number; notHelpfulCount: number; voteType: string }> {
  if (!reviewId || !userIp) {
    throw new Error("Review ID and IP address are required.");
  }

  if (voteType !== "helpful" && voteType !== "not_helpful") {
    throw new Error("Invalid vote type.");
  }

  const now = new Date().toISOString();
  const db = getDb();

  if (db) {
    // Check if user already voted
    const existingVote = await db
      .select()
      .from(reviewHelpful)
      .where(and(eq(reviewHelpful.reviewId, reviewId), eq(reviewHelpful.userIp, userIp)))
      .limit(1);

    if (existingVote.length > 0) {
      const oldType = existingVote[0].voteType;
      if (oldType === voteType) {
        // Already voted this way, return current counts
        const currentReview = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
        return {
          helpfulCount: currentReview[0]?.helpfulCount || 0,
          notHelpfulCount: currentReview[0]?.notHelpfulCount || 0,
          voteType,
        };
      }

      // Changed vote type
      await db
        .update(reviewHelpful)
        .set({ voteType, createdAt: now })
        .where(eq(reviewHelpful.id, existingVote[0].id));

      if (voteType === "helpful") {
        await db
          .update(reviews)
          .set({
            helpfulCount: sql`${reviews.helpfulCount} + 1`,
            notHelpfulCount: sql`CASE WHEN ${reviews.notHelpfulCount} > 0 THEN ${reviews.notHelpfulCount} - 1 ELSE 0 END`,
            updatedAt: now,
          })
          .where(eq(reviews.id, reviewId));
      } else {
        await db
          .update(reviews)
          .set({
            helpfulCount: sql`CASE WHEN ${reviews.helpfulCount} > 0 THEN ${reviews.helpfulCount} - 1 ELSE 0 END`,
            notHelpfulCount: sql`${reviews.notHelpfulCount} + 1`,
            updatedAt: now,
          })
          .where(eq(reviews.id, reviewId));
      }
    } else {
      // New vote
      const voteId = `vote_${crypto.randomUUID()}`;
      await db.insert(reviewHelpful).values({
        id: voteId,
        reviewId,
        userIp,
        voteType,
        createdAt: now,
      });

      if (voteType === "helpful") {
        await db
          .update(reviews)
          .set({
            helpfulCount: sql`${reviews.helpfulCount} + 1`,
            updatedAt: now,
          })
          .where(eq(reviews.id, reviewId));
      } else {
        await db
          .update(reviews)
          .set({
            notHelpfulCount: sql`${reviews.notHelpfulCount} + 1`,
            updatedAt: now,
          })
          .where(eq(reviews.id, reviewId));
      }
    }

    const updatedReview = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
    return {
      helpfulCount: updatedReview[0]?.helpfulCount || 0,
      notHelpfulCount: updatedReview[0]?.notHelpfulCount || 0,
      voteType,
    };
  }

  // Memory fallback
  const rev = memoryReviews.find((r) => r.id === reviewId);
  if (rev) {
    const existing = memoryReviewVotes.find((v) => v.reviewId === reviewId && v.userIp === userIp);
    if (!existing) {
      memoryReviewVotes.push({
        id: `vote_${crypto.randomUUID()}`,
        reviewId,
        userIp,
        voteType,
        createdAt: now,
      });
      if (voteType === "helpful") rev.helpfulCount++;
      else rev.notHelpfulCount++;
    } else if (existing.voteType !== voteType) {
      if (voteType === "helpful") {
        rev.helpfulCount++;
        rev.notHelpfulCount = Math.max(0, rev.notHelpfulCount - 1);
      } else {
        rev.notHelpfulCount++;
        rev.helpfulCount = Math.max(0, rev.helpfulCount - 1);
      }
      existing.voteType = voteType;
    }
    return {
      helpfulCount: rev.helpfulCount,
      notHelpfulCount: rev.notHelpfulCount,
      voteType,
    };
  }

  return { helpfulCount: 0, notHelpfulCount: 0, voteType };
}

/**
 * Admin: List reviews with filtering, search, and pagination
 */
export async function adminListReviews(options: {
  status?: "all" | "pending" | "approved" | "rejected";
  search?: string;
  productId?: string;
  page?: number;
  limit?: number;
}): Promise<{ reviews: ReviewWithImages[]; total: number; page: number; totalPages: number }> {
  const { status = "all", search = "", productId, page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const db = getDb();
  if (db) {
    try {
      const conditions = [];

      if (status !== "all") {
        conditions.push(eq(reviews.status, status));
      }

      if (productId) {
        conditions.push(eq(reviews.productId, productId));
      }

      if (search) {
        const query = `%${search.toLowerCase()}%`;
        conditions.push(
          or(
            sql`LOWER(${reviews.customerName}) LIKE ${query}`,
            sql`LOWER(${reviews.customerEmail}) LIKE ${query}`,
            sql`LOWER(${reviews.title}) LIKE ${query}`,
            sql`LOWER(${reviews.content}) LIKE ${query}`
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const reviewRows = await db
        .select()
        .from(reviews)
        .where(whereClause)
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(whereClause);

      const total = Number(countResult[0]?.count || 0);

      // Fetch images
      const reviewIds = reviewRows.map((r) => r.id);
      let imagesByReviewId: Record<string, ReviewImageRecord[]> = {};

      if (reviewIds.length > 0) {
        const imageRows = await db
          .select()
          .from(reviewImages)
          .where(inArray(reviewImages.reviewId, reviewIds))
          .orderBy(asc(reviewImages.sortOrder));

        for (const img of imageRows) {
          if (!imagesByReviewId[img.reviewId]) {
            imagesByReviewId[img.reviewId] = [];
          }
          imagesByReviewId[img.reviewId].push(img);
        }
      }

      const reviewsWithImages: ReviewWithImages[] = reviewRows.map((r) => ({
        ...r,
        images: imagesByReviewId[r.id] || [],
      }));

      return {
        reviews: reviewsWithImages,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.warn("[adminListReviews] D1 query failed, using memory fallback:", err);
    }
  }

  // Memory fallback
  let filtered = [...memoryReviews];
  if (status !== "all") {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (productId) {
    filtered = filtered.filter((r) => r.productId === productId);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.customerEmail.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        r.content.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit).map((r) => ({
    ...r,
    images: memoryReviewImages.filter((img) => img.reviewId === r.id),
  }));

  return {
    reviews: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin: Get single review by ID
 */
export async function adminGetReview(id: string): Promise<ReviewWithImages | null> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
      if (rows.length === 0) return null;

      const images = await db
        .select()
        .from(reviewImages)
        .where(eq(reviewImages.reviewId, id))
        .orderBy(asc(reviewImages.sortOrder));

      return {
        ...rows[0],
        images,
      };
    } catch (err) {
      console.warn("[adminGetReview] D1 error:", err);
    }
  }

  const rev = memoryReviews.find((r) => r.id === id);
  if (!rev) return null;
  return {
    ...rev,
    images: memoryReviewImages.filter((img) => img.reviewId === id),
  };
}

/**
 * Admin: Update review (approve/reject/reply)
 */
export async function adminUpdateReview(
  id: string,
  updates: {
    status?: "pending" | "approved" | "rejected";
    adminReply?: string | null;
    reason?: string;
  }
): Promise<ReviewWithImages | null> {
  const now = new Date().toISOString();
  const db = getDb();

  const patch: Partial<NewReviewRecord> = {
    updatedAt: now,
  };

  if (updates.status) {
    patch.status = updates.status;
  }

  if (updates.adminReply !== undefined) {
    patch.adminReply = updates.adminReply;
    patch.adminReplyAt = updates.adminReply ? now : null;
  }

  if (db) {
    try {
      await db.update(reviews).set(patch).where(eq(reviews.id, id));
      const updatedRev = await adminGetReview(id);

      if (updates.status === "approved" && updatedRev) {
        let custId = updatedRev.customerId;
        if (!custId && updatedRev.customerEmail) {
          try {
            const cRows = await db
              .select({ id: customers.id })
              .from(customers)
              .where(sql`LOWER(${customers.email}) = ${updatedRev.customerEmail.toLowerCase().trim()}`)
              .limit(1);
            if (cRows.length > 0) custId = cRows[0].id;
          } catch {}
        }

        if (custId) {
          try {
            await createCustomerNotification({
              customerId: custId,
              type: "review_approved",
              title: "Review Published!",
              message: "Your product review has been approved and is now live on our store. Thank you!",
              link: "/account/reviews",
            });
          } catch {}
        }
      }

      return updatedRev;
    } catch (err) {
      console.error("[adminUpdateReview] D1 error:", err);
      throw err;
    }
  }

  // Memory fallback
  const index = memoryReviews.findIndex((r) => r.id === id);
  if (index !== -1) {
    memoryReviews[index] = {
      ...memoryReviews[index],
      ...patch,
    };
    return {
      ...memoryReviews[index],
      images: memoryReviewImages.filter((img) => img.reviewId === id),
    };
  }

  return null;
}

/**
 * Admin: Delete a review
 */
export async function adminDeleteReview(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    try {
      // Cascading foreign keys will delete review_images and review_helpful
      await db.delete(reviews).where(eq(reviews.id, id));
      return true;
    } catch (err) {
      console.error("[adminDeleteReview] D1 error:", err);
      throw err;
    }
  }

  memoryReviews = memoryReviews.filter((r) => r.id !== id);
  memoryReviewImages = memoryReviewImages.filter((img) => img.reviewId !== id);
  memoryReviewVotes = memoryReviewVotes.filter((v) => v.reviewId !== id);
  return true;
}

/**
 * Admin: Bulk actions (approve, reject, delete)
 */
export async function adminBulkReviewAction(
  ids: string[],
  action: "approve" | "reject" | "delete"
): Promise<{ success: boolean; affectedCount: number }> {
  if (!ids || ids.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  const db = getDb();
  const now = new Date().toISOString();

  if (db) {
    try {
      if (action === "delete") {
        await db.delete(reviews).where(inArray(reviews.id, ids));
      } else {
        const newStatus = action === "approve" ? "approved" : "rejected";
        await db
          .update(reviews)
          .set({ status: newStatus, updatedAt: now })
          .where(inArray(reviews.id, ids));
      }
      return { success: true, affectedCount: ids.length };
    } catch (err) {
      console.error("[adminBulkReviewAction] D1 error:", err);
      throw err;
    }
  }

  // Memory fallback
  if (action === "delete") {
    memoryReviews = memoryReviews.filter((r) => !ids.includes(r.id));
  } else {
    const newStatus = action === "approve" ? "approved" : "rejected";
    memoryReviews = memoryReviews.map((r) =>
      ids.includes(r.id) ? { ...r, status: newStatus, updatedAt: now } : r
    );
  }

  return { success: true, affectedCount: ids.length };
}

/**
 * Admin: Get review statistics (Total, Pending, Approved, Rejected, Average Rating)
 */
export async function adminGetReviewStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}> {
  const db = getDb();
  if (db) {
    try {
      const allReviews = await db.select({ rating: reviews.rating, status: reviews.status }).from(reviews);

      const total = allReviews.length;
      const pending = allReviews.filter((r) => r.status === "pending").length;
      const approved = allReviews.filter((r) => r.status === "approved").length;
      const rejected = allReviews.filter((r) => r.status === "rejected").length;

      const approvedRows = allReviews.filter((r) => r.status === "approved");
      const sum = approvedRows.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = approvedRows.length > 0 ? Number((sum / approvedRows.length).toFixed(1)) : 0;

      return {
        total,
        pending,
        approved,
        rejected,
        averageRating,
      };
    } catch (err) {
      console.warn("[adminGetReviewStats] D1 error:", err);
    }
  }

  // Memory fallback
  const total = memoryReviews.length;
  const pending = memoryReviews.filter((r) => r.status === "pending").length;
  const approved = memoryReviews.filter((r) => r.status === "approved").length;
  const rejected = memoryReviews.filter((r) => r.status === "rejected").length;

  const approvedRows = memoryReviews.filter((r) => r.status === "approved");
  const sum = approvedRows.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = approvedRows.length > 0 ? Number((sum / approvedRows.length).toFixed(1)) : 0;

  return {
    total,
    pending,
    approved,
    rejected,
    averageRating,
  };
}
