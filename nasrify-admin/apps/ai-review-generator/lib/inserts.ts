import { getDb, reviews, aiReviewGenerations } from "@/lib/db";
import { eq, desc, sql } from "drizzle-orm";
import { generateFakeEmail } from "./reviewer-names";
import type { AIGenerationOptions, AIGeneratedReview, AIGenerationRecord, AIStats } from "../shared/types";

export async function insertGeneratedBatch(
  options: AIGenerationOptions,
  generatedReviews: AIGeneratedReview[]
): Promise<AIGenerationRecord> {
  const db = getDb();
  const generationId = `aigen_${crypto.randomUUID().slice(0, 16)}`;
  const now = Date.now();
  const dayMs = 86400000;

  const record: AIGenerationRecord = {
    id: generationId,
    productId: options.productId,
    requestedCount: options.count,
    generatedCount: generatedReviews.length,
    ratingMin: options.ratingMin,
    ratingMax: options.ratingMax,
    tone: options.tone,
    language: options.language,
    reviewerStyle: options.reviewerStyle,
    dateRangeDays: options.dateRangeDays,
    approvalMode: options.approvalMode,
    status: "completed",
    errorMessage: null,
    createdBy: options.createdBy || "admin",
    createdAt: now,
    completedAt: now,
  };

  if (!db) {
    console.warn("[insertGeneratedBatch] DB unavailable, skipping persistent insert");
    return record;
  }

  // 1. Record generation batch
  try {
    await db.insert(aiReviewGenerations).values({
      id: record.id,
      productId: record.productId,
      requestedCount: record.requestedCount,
      generatedCount: record.generatedCount,
      ratingMin: record.ratingMin,
      ratingMax: record.ratingMax,
      tone: record.tone,
      language: record.language,
      reviewerStyle: record.reviewerStyle,
      dateRangeDays: record.dateRangeDays,
      approvalMode: record.approvalMode,
      status: record.status,
      errorMessage: record.errorMessage,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      completedAt: record.completedAt,
    });
  } catch (err) {
    console.error("[insertGeneratedBatch] Error writing aiReviewGenerations record:", err);
  }

  // 2. Insert reviews into existing reviews table
  const spreadDays = Math.max(1, options.dateRangeDays || 30);
  const status = options.approvalMode === "auto" ? "approved" : "pending";

  for (const r of generatedReviews) {
    const randomDaysAgo = Math.floor(Math.random() * spreadDays);
    const createdAtMs = now - randomDaysAgo * dayMs;
    const createdAtIso = new Date(createdAtMs).toISOString();
    const reviewId = `rev_${crypto.randomUUID().slice(0, 16)}`;
    const email = generateFakeEmail(r.authorName);

    try {
      await db.insert(reviews).values({
        id: reviewId,
        productId: options.productId,
        tenantId: null,
        orderId: null,
        customerId: null,
        customerName: r.authorName,
        customerEmail: email,
        rating: r.rating,
        title: r.title,
        content: r.body,
        isVerifiedPurchase: 1,
        status: status as any,
        helpfulCount: 0,
        notHelpfulCount: 0,
        isAiGenerated: 1,
        aiGenerationId: generationId,
        createdAt: createdAtIso,
        updatedAt: createdAtIso,
      });
    } catch (insertErr) {
      console.error("[insertGeneratedBatch] Error inserting review row:", insertErr);
    }
  }

  return record;
}

export async function getGenerationHistory(page = 1, limit = 20): Promise<{ items: AIGenerationRecord[]; total: number }> {
  const db = getDb();
  if (!db) return { items: [], total: 0 };

  try {
    const offset = (page - 1) * limit;
    const rows = await db
      .select()
      .from(aiReviewGenerations)
      .orderBy(desc(aiReviewGenerations.createdAt))
      .limit(limit)
      .offset(offset);

    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiReviewGenerations);

    const total = Number(countRes[0]?.count || 0);

    return {
      items: rows as AIGenerationRecord[],
      total,
    };
  } catch (err) {
    console.error("[getGenerationHistory] Error:", err);
    return { items: [], total: 0 };
  }
}

export async function deleteGenerationBatch(batchId: string): Promise<{ deletedReviews: number; success: boolean }> {
  const db = getDb();
  if (!db) return { deletedReviews: 0, success: false };

  try {
    // 1. Delete associated reviews from reviews table
    const deleteReviewsRes = await db
      .delete(reviews)
      .where(eq(reviews.aiGenerationId, batchId));

    // 2. Remove batch row from aiReviewGenerations
    await db
      .delete(aiReviewGenerations)
      .where(eq(aiReviewGenerations.id, batchId));

    return { deletedReviews: 1, success: true };
  } catch (err) {
    console.error("[deleteGenerationBatch] Error deleting batch:", err);
    return { deletedReviews: 0, success: false };
  }
}

export async function getAIStats(): Promise<AIStats> {
  const db = getDb();
  if (!db) {
    return { totalGenerated: 0, totalThisMonth: 0, batchesCount: 0, estimatedNeuronsUsed: 0 };
  }

  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const batches = await db.select().from(aiReviewGenerations);
    let totalGenerated = 0;
    let totalThisMonth = 0;

    for (const b of batches) {
      const count = Number(b.generatedCount || 0);
      totalGenerated += count;
      if (b.createdAt && Number(b.createdAt) >= startOfMonth) {
        totalThisMonth += count;
      }
    }

    return {
      totalGenerated,
      totalThisMonth,
      batchesCount: batches.length,
      estimatedNeuronsUsed: Math.round(totalGenerated * 14),
    };
  } catch (err) {
    console.error("[getAIStats] Error:", err);
    return { totalGenerated: 0, totalThisMonth: 0, batchesCount: 0, estimatedNeuronsUsed: 0 };
  }
}
