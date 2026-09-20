import { cache } from "react";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import {
  getDb,
  productAnswers,
  productQuestions,
  productQaUpvotes,
  type ProductAnswerRecord,
} from "@/lib/db";
import type { ProductAnswer, CreateAnswerInput } from "../shared/types";
import { invalidateQACache } from "./questions";

export const memoryAnswers: ProductAnswer[] = [];

/**
 * Fetch published answers for a specific question.
 */
export const getAnswersForQuestion = cache(
  async (questionId: string): Promise<ProductAnswer[]> => {
    const db = getDb();
    if (db) {
      const rows = await db
        .select({
          id: productAnswers.id,
          questionId: productAnswers.questionId,
          authorType: productAnswers.authorType,
          authorId: productAnswers.authorId,
          authorName: productAnswers.authorName,
          answer: productAnswers.answer,
          status: productAnswers.status,
          upvoteCount: productAnswers.upvoteCount,
          isAccepted: productAnswers.isAccepted,
          createdAt: productAnswers.createdAt,
          updatedAt: productAnswers.updatedAt,
        })
        .from(productAnswers)
        .where(
          and(
            eq(productAnswers.questionId, questionId),
            eq(productAnswers.status, "published")
          )
        )
        .orderBy(desc(productAnswers.isAccepted), desc(productAnswers.upvoteCount), asc(productAnswers.createdAt));

      return rows.map((r) => ({
        ...r,
        authorType: r.authorType as any,
        status: r.status as any,
        isAccepted: Boolean(r.isAccepted),
      }));
    }

    return memoryAnswers.filter((a) => a.questionId === questionId && a.status === "published");
  }
);

/**
 * Create an answer for a question.
 */
export async function createAnswer(input: CreateAnswerInput): Promise<ProductAnswer> {
  const now = Date.now();
  const id = `ans_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  const newAnswer: ProductAnswer = {
    id,
    questionId: input.questionId,
    authorType: input.authorType,
    authorId: input.authorId || null,
    authorName: input.authorName.trim(),
    answer: input.answer.trim(),
    status: "published",
    upvoteCount: 0,
    isAccepted: false,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  if (db) {
    await Promise.all([
      db.insert(productAnswers).values({
        id: newAnswer.id,
        questionId: newAnswer.questionId,
        authorType: newAnswer.authorType,
        authorId: newAnswer.authorId,
        authorName: newAnswer.authorName,
        answer: newAnswer.answer,
        status: newAnswer.status,
        upvoteCount: 0,
        isAccepted: 0,
        createdAt: now,
        updatedAt: now,
      }),
      // Increment answer count on question
      db
        .update(productQuestions)
        .set({
          answerCount: sql`${productQuestions.answerCount} + 1`,
          updatedAt: now,
        })
        .where(eq(productQuestions.id, input.questionId)),
    ]);
  } else {
    memoryAnswers.push(newAnswer);
  }

  invalidateQACache();
  return newAnswer;
}

/**
 * Update an answer.
 */
export async function updateAnswer(
  id: string,
  data: Partial<Pick<ProductAnswer, "answer" | "status" | "isAccepted">>
): Promise<boolean> {
  const now = Date.now();
  const db = getDb();

  if (db) {
    const updatePayload: any = { updatedAt: now };
    if (data.answer !== undefined) updatePayload.answer = data.answer.trim();
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.isAccepted !== undefined) updatePayload.isAccepted = data.isAccepted ? 1 : 0;

    await db
      .update(productAnswers)
      .set(updatePayload)
      .where(eq(productAnswers.id, id));

    invalidateQACache();
    return true;
  }

  const found = memoryAnswers.find((a) => a.id === id);
  if (found) {
    if (data.answer !== undefined) found.answer = data.answer.trim();
    if (data.status !== undefined) found.status = data.status;
    if (data.isAccepted !== undefined) found.isAccepted = data.isAccepted;
    found.updatedAt = now;
    invalidateQACache();
    return true;
  }
  return false;
}

/**
 * Delete an answer.
 */
export async function deleteAnswer(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    const rows = await db
      .select({ questionId: productAnswers.questionId })
      .from(productAnswers)
      .where(eq(productAnswers.id, id))
      .limit(1);

    if (rows.length === 0) return false;
    const questionId = rows[0].questionId;

    await Promise.all([
      db.delete(productAnswers).where(eq(productAnswers.id, id)),
      db.delete(productQaUpvotes).where(
        and(eq(productQaUpvotes.targetType, "answer"), eq(productQaUpvotes.targetId, id))
      ),
      db
        .update(productQuestions)
        .set({
          answerCount: sql`MAX(0, ${productQuestions.answerCount} - 1)`,
          updatedAt: Date.now(),
        })
        .where(eq(productQuestions.id, questionId)),
    ]);

    invalidateQACache();
    return true;
  }

  const idx = memoryAnswers.findIndex((a) => a.id === id);
  if (idx !== -1) {
    memoryAnswers.splice(idx, 1);
    invalidateQACache();
    return true;
  }
  return false;
}

/**
 * Accept an answer as the official verified solution.
 */
export async function acceptAnswer(id: string): Promise<boolean> {
  return updateAnswer(id, { isAccepted: true });
}
