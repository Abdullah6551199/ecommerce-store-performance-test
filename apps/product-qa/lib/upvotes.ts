import { eq, and, sql } from "drizzle-orm";
import {
  getDb,
  productQuestions,
  productAnswers,
  productQaUpvotes,
} from "@/lib/db";
import type { UpvoteTargetType } from "../shared/types";
import { invalidateQACache } from "./questions";

export const memoryUpvotes: Array<{
  targetType: UpvoteTargetType;
  targetId: string;
  customerEmail: string;
}> = [];

/**
 * Check if a customer has already upvoted a question or answer.
 */
export async function hasUpvoted(
  targetType: UpvoteTargetType,
  targetId: string,
  customerEmail: string
): Promise<boolean> {
  const email = customerEmail.toLowerCase().trim();
  const db = getDb();

  if (db) {
    const rows = await db
      .select({ id: productQaUpvotes.id })
      .from(productQaUpvotes)
      .where(
        and(
          eq(productQaUpvotes.targetType, targetType),
          eq(productQaUpvotes.targetId, targetId),
          eq(productQaUpvotes.customerEmail, email)
        )
      )
      .limit(1);

    return rows.length > 0;
  }

  return memoryUpvotes.some(
    (u) => u.targetType === targetType && u.targetId === targetId && u.customerEmail === email
  );
}

/**
 * Toggle upvote on a question (increment count if new, decrement if removed).
 */
export async function toggleQuestionUpvote(
  questionId: string,
  customerEmail: string,
  customerId?: string | null
): Promise<{ upvoted: boolean; upvoteCount: number }> {
  const email = customerEmail.toLowerCase().trim();
  const db = getDb();
  const now = Date.now();

  if (db) {
    const existing = await db
      .select({ id: productQaUpvotes.id })
      .from(productQaUpvotes)
      .where(
        and(
          eq(productQaUpvotes.targetType, "question"),
          eq(productQaUpvotes.targetId, questionId),
          eq(productQaUpvotes.customerEmail, email)
        )
      )
      .limit(1);

    let upvoted = false;

    if (existing.length > 0) {
      // Remove upvote
      await Promise.all([
        db.delete(productQaUpvotes).where(eq(productQaUpvotes.id, existing[0].id)),
        db
          .update(productQuestions)
          .set({
            upvoteCount: sql`MAX(0, ${productQuestions.upvoteCount} - 1)`,
            updatedAt: now,
          })
          .where(eq(productQuestions.id, questionId)),
      ]);
      upvoted = false;
    } else {
      // Add upvote
      const upvoteId = `upv_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
      await Promise.all([
        db.insert(productQaUpvotes).values({
          id: upvoteId,
          targetType: "question",
          targetId: questionId,
          customerId: customerId || null,
          customerEmail: email,
          createdAt: now,
        }),
        db
          .update(productQuestions)
          .set({
            upvoteCount: sql`${productQuestions.upvoteCount} + 1`,
            updatedAt: now,
          })
          .where(eq(productQuestions.id, questionId)),
      ]);
      upvoted = true;
    }

    // Fetch refreshed count
    const updated = await db
      .select({ upvoteCount: productQuestions.upvoteCount, productId: productQuestions.productId })
      .from(productQuestions)
      .where(eq(productQuestions.id, questionId))
      .limit(1);

    const count = updated[0]?.upvoteCount || 0;
    invalidateQACache(updated[0]?.productId);
    return { upvoted, upvoteCount: count };
  }

  // Fallback
  const idx = memoryUpvotes.findIndex(
    (u) => u.targetType === "question" && u.targetId === questionId && u.customerEmail === email
  );
  if (idx !== -1) {
    memoryUpvotes.splice(idx, 1);
    invalidateQACache();
    return { upvoted: false, upvoteCount: 0 };
  } else {
    memoryUpvotes.push({ targetType: "question", targetId: questionId, customerEmail: email });
    invalidateQACache();
    return { upvoted: true, upvoteCount: 1 };
  }
}

/**
 * Toggle upvote on an answer.
 */
export async function toggleAnswerUpvote(
  answerId: string,
  customerEmail: string,
  customerId?: string | null
): Promise<{ upvoted: boolean; upvoteCount: number }> {
  const email = customerEmail.toLowerCase().trim();
  const db = getDb();
  const now = Date.now();

  if (db) {
    const existing = await db
      .select({ id: productQaUpvotes.id })
      .from(productQaUpvotes)
      .where(
        and(
          eq(productQaUpvotes.targetType, "answer"),
          eq(productQaUpvotes.targetId, answerId),
          eq(productQaUpvotes.customerEmail, email)
        )
      )
      .limit(1);

    let upvoted = false;

    if (existing.length > 0) {
      await Promise.all([
        db.delete(productQaUpvotes).where(eq(productQaUpvotes.id, existing[0].id)),
        db
          .update(productAnswers)
          .set({
            upvoteCount: sql`MAX(0, ${productAnswers.upvoteCount} - 1)`,
            updatedAt: now,
          })
          .where(eq(productAnswers.id, answerId)),
      ]);
      upvoted = false;
    } else {
      const upvoteId = `upv_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
      await Promise.all([
        db.insert(productQaUpvotes).values({
          id: upvoteId,
          targetType: "answer",
          targetId: answerId,
          customerId: customerId || null,
          customerEmail: email,
          createdAt: now,
        }),
        db
          .update(productAnswers)
          .set({
            upvoteCount: sql`${productAnswers.upvoteCount} + 1`,
            updatedAt: now,
          })
          .where(eq(productAnswers.id, answerId)),
      ]);
      upvoted = true;
    }

    const updated = await db
      .select({ upvoteCount: productAnswers.upvoteCount })
      .from(productAnswers)
      .where(eq(productAnswers.id, answerId))
      .limit(1);

    const count = updated[0]?.upvoteCount || 0;
    invalidateQACache();
    return { upvoted, upvoteCount: count };
  }

  // Fallback
  const idx = memoryUpvotes.findIndex(
    (u) => u.targetType === "answer" && u.targetId === answerId && u.customerEmail === email
  );
  if (idx !== -1) {
    memoryUpvotes.splice(idx, 1);
    invalidateQACache();
    return { upvoted: false, upvoteCount: 0 };
  } else {
    memoryUpvotes.push({ targetType: "answer", targetId: answerId, customerEmail: email });
    invalidateQACache();
    return { upvoted: true, upvoteCount: 1 };
  }
}
