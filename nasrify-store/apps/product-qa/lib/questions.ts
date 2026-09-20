import { cache } from "react";
import { eq, and, desc, sql, asc, inArray } from "drizzle-orm";
import {
  getDb,
  productQuestions,
  productAnswers,
  productQaUpvotes,
  products,
  type ProductQuestionRecord,
  type ProductAnswerRecord,
} from "@/lib/db";
import type {
  ProductQuestion,
  QuestionWithAnswers,
  CreateQuestionInput,
  QuestionStatus,
  QAStats,
} from "../shared/types";

// Micro-cache store for 20s read acceleration
const readCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 20000;

function getCached<T>(key: string): T | null {
  const item = readCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    readCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  readCache.set(key, { data, expiry: Date.now() + ttlMs });
}

export function invalidateQACache(productId?: string): void {
  if (productId) {
    for (const key of readCache.keys()) {
      if (key.includes(productId)) {
        readCache.delete(key);
      }
    }
  } else {
    readCache.clear();
  }
}

// Memory fallback store for local dev / testing
export const memoryQuestions: ProductQuestion[] = [];

/**
 * Fetch published questions for a specific product with nested answers and upvote check.
 */
export const getProductQuestions = cache(
  async (
    productId: string,
    page = 1,
    limit = 10,
    customerEmail?: string | null
  ): Promise<{ questions: QuestionWithAnswers[]; total: number }> => {
    const cacheKey = `qa:product:${productId}:p${page}:l${limit}:u${customerEmail || "anon"}`;
    const cached = getCached<{ questions: QuestionWithAnswers[]; total: number }>(cacheKey);
    if (cached) return cached;

    const offset = Math.max(0, (page - 1) * limit);
    const db = getDb();

    if (db) {
      // Total published questions count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(productQuestions)
        .where(
          and(
            eq(productQuestions.productId, productId),
            eq(productQuestions.status, "published")
          )
        );
      const total = Number(countResult[0]?.count || 0);

      // Fetch questions ordered by pinned (desc), upvote_count (desc), created_at (desc)
      const qRows = await db
        .select({
          id: productQuestions.id,
          productId: productQuestions.productId,
          customerId: productQuestions.customerId,
          customerName: productQuestions.customerName,
          customerEmail: productQuestions.customerEmail,
          question: productQuestions.question,
          status: productQuestions.status,
          answerCount: productQuestions.answerCount,
          upvoteCount: productQuestions.upvoteCount,
          isPinned: productQuestions.isPinned,
          createdAt: productQuestions.createdAt,
          updatedAt: productQuestions.updatedAt,
        })
        .from(productQuestions)
        .where(
          and(
            eq(productQuestions.productId, productId),
            eq(productQuestions.status, "published")
          )
        )
        .orderBy(
          desc(productQuestions.isPinned),
          desc(productQuestions.upvoteCount),
          desc(productQuestions.createdAt)
        )
        .limit(limit)
        .offset(offset);

      if (qRows.length === 0) {
        const res = { questions: [], total };
        setCached(cacheKey, res);
        return res;
      }

      const qIds = qRows.map((q) => q.id);

      // Fetch published answers for these questions
      const ansRows = await db
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
            inArray(productAnswers.questionId, qIds),
            eq(productAnswers.status, "published")
          )
        )
        .orderBy(desc(productAnswers.isAccepted), asc(productAnswers.createdAt));

      // Upvote lookup if customerEmail is provided
      const upvotedSet = new Set<string>();
      if (customerEmail) {
        const upvotes = await db
          .select({ targetId: productQaUpvotes.targetId })
          .from(productQaUpvotes)
          .where(
            and(
              eq(productQaUpvotes.targetType, "question"),
              eq(productQaUpvotes.customerEmail, customerEmail.toLowerCase().trim()),
              inArray(productQaUpvotes.targetId, qIds)
            )
          );
        for (const u of upvotes) {
          upvotedSet.add(u.targetId);
        }
      }

      const answersByQ = new Map<string, typeof ansRows>();
      for (const a of ansRows) {
        if (!answersByQ.has(a.questionId)) {
          answersByQ.set(a.questionId, []);
        }
        answersByQ.get(a.questionId)!.push(a);
      }

      const questions: QuestionWithAnswers[] = qRows.map((q) => ({
        id: q.id,
        productId: q.productId,
        customerId: q.customerId,
        customerName: q.customerName,
        customerEmail: q.customerEmail,
        question: q.question,
        status: q.status as QuestionStatus,
        answerCount: q.answerCount,
        upvoteCount: q.upvoteCount,
        isPinned: Boolean(q.isPinned),
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        answers: (answersByQ.get(q.id) || []).map((ans) => ({
          ...ans,
          authorType: ans.authorType as any,
          status: ans.status as any,
          isAccepted: Boolean(ans.isAccepted),
        })),
        hasUpvoted: upvotedSet.has(q.id),
      }));

      const result = { questions, total };
      setCached(cacheKey, result);
      return result;
    }

    // Memory fallback
    const filtered = memoryQuestions
      .filter((q) => q.productId === productId && q.status === "published")
      .sort((a, b) => (Number(b.isPinned) - Number(a.isPinned)) || b.upvoteCount - a.upvoteCount || b.createdAt - a.createdAt);
    const paginated = filtered.slice(offset, offset + limit).map((q) => ({
      ...q,
      answers: [],
      hasUpvoted: false,
    }));
    return { questions: paginated, total: filtered.length };
  }
);

/**
 * Fetch a single question by ID.
 */
export const getQuestionById = cache(async (id: string): Promise<ProductQuestion | null> => {
  const db = getDb();
  if (db) {
    const rows = await db
      .select({
        id: productQuestions.id,
        productId: productQuestions.productId,
        customerId: productQuestions.customerId,
        customerName: productQuestions.customerName,
        customerEmail: productQuestions.customerEmail,
        question: productQuestions.question,
        status: productQuestions.status,
        answerCount: productQuestions.answerCount,
        upvoteCount: productQuestions.upvoteCount,
        isPinned: productQuestions.isPinned,
        createdAt: productQuestions.createdAt,
        updatedAt: productQuestions.updatedAt,
      })
      .from(productQuestions)
      .where(eq(productQuestions.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const q = rows[0];
    return {
      ...q,
      status: q.status as QuestionStatus,
      isPinned: Boolean(q.isPinned),
    };
  }

  return memoryQuestions.find((q) => q.id === id) || null;
});

/**
 * Create a new question.
 */
export async function createQuestion(
  input: CreateQuestionInput,
  autoPublish = false
): Promise<ProductQuestion> {
  const now = Date.now();
  const id = `q_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const status: QuestionStatus = autoPublish ? "published" : "pending";

  const newQuestion: ProductQuestion = {
    id,
    productId: input.productId,
    customerId: input.customerId || null,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.toLowerCase().trim(),
    question: input.question.trim(),
    status,
    answerCount: 0,
    upvoteCount: 0,
    isPinned: false,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  if (db) {
    await db.insert(productQuestions).values({
      id: newQuestion.id,
      productId: newQuestion.productId,
      customerId: newQuestion.customerId,
      customerName: newQuestion.customerName,
      customerEmail: newQuestion.customerEmail,
      question: newQuestion.question,
      status: newQuestion.status,
      answerCount: 0,
      upvoteCount: 0,
      isPinned: 0,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    memoryQuestions.unshift(newQuestion);
  }

  invalidateQACache(input.productId);
  return newQuestion;
}

/**
 * Update question status (pending | published | hidden).
 */
export async function updateQuestionStatus(
  id: string,
  status: QuestionStatus
): Promise<ProductQuestion | null> {
  const now = Date.now();
  const db = getDb();

  if (db) {
    const existing = await getQuestionById(id);
    if (!existing) return null;

    await db
      .update(productQuestions)
      .set({ status, updatedAt: now })
      .where(eq(productQuestions.id, id));

    invalidateQACache(existing.productId);
    return { ...existing, status, updatedAt: now };
  }

  const found = memoryQuestions.find((q) => q.id === id);
  if (found) {
    found.status = status;
    found.updatedAt = now;
    invalidateQACache(found.productId);
    return found;
  }
  return null;
}

/**
 * Pin or unpin a question to the top of the list.
 */
export async function pinQuestion(id: string, isPinned: boolean): Promise<boolean> {
  const now = Date.now();
  const db = getDb();

  if (db) {
    const existing = await getQuestionById(id);
    if (!existing) return false;

    await db
      .update(productQuestions)
      .set({ isPinned: isPinned ? 1 : 0, updatedAt: now })
      .where(eq(productQuestions.id, id));

    invalidateQACache(existing.productId);
    return true;
  }

  const found = memoryQuestions.find((q) => q.id === id);
  if (found) {
    found.isPinned = isPinned;
    found.updatedAt = now;
    invalidateQACache(found.productId);
    return true;
  }
  return false;
}

/**
 * Delete a question and all associated answers and upvotes.
 */
export async function deleteQuestion(id: string): Promise<boolean> {
  const db = getDb();
  if (db) {
    const existing = await getQuestionById(id);
    if (!existing) return false;

    await Promise.all([
      db.delete(productQuestions).where(eq(productQuestions.id, id)),
      db.delete(productAnswers).where(eq(productAnswers.questionId, id)),
      db.delete(productQaUpvotes).where(
        and(eq(productQaUpvotes.targetType, "question"), eq(productQaUpvotes.targetId, id))
      ),
    ]);

    invalidateQACache(existing.productId);
    return true;
  }

  const idx = memoryQuestions.findIndex((q) => q.id === id);
  if (idx !== -1) {
    const pid = memoryQuestions[idx].productId;
    memoryQuestions.splice(idx, 1);
    invalidateQACache(pid);
    return true;
  }
  return false;
}

/**
 * Admin view: Fetch questions with filtering, product info, and pagination.
 */
export async function getQuestionsForAdmin(
  filters: {
    status?: QuestionStatus | "all";
    productId?: string;
    search?: string;
    hasAnswers?: boolean | "all";
  } = {},
  page = 1,
  limit = 20
): Promise<{ questions: Array<ProductQuestion & { productName?: string }>; total: number }> {
  const offset = Math.max(0, (page - 1) * limit);
  const db = getDb();

  if (db) {
    const conditions = [];
    if (filters.status && filters.status !== "all") {
      conditions.push(eq(productQuestions.status, filters.status));
    }
    if (filters.productId) {
      conditions.push(eq(productQuestions.productId, filters.productId));
    }
    if (filters.search) {
      const q = `%${filters.search.toLowerCase().trim()}%`;
      conditions.push(
        sql`(LOWER(${productQuestions.question}) LIKE ${q} OR LOWER(${productQuestions.customerName}) LIKE ${q} OR LOWER(${productQuestions.customerEmail}) LIKE ${q})`
      );
    }
    if (filters.hasAnswers === true) {
      conditions.push(sql`${productQuestions.answerCount} > 0`);
    } else if (filters.hasAnswers === false) {
      conditions.push(sql`${productQuestions.answerCount} = 0`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(productQuestions)
      .where(whereClause);
    const total = Number(countRes[0]?.count || 0);

    const rows = await db
      .select({
        id: productQuestions.id,
        productId: productQuestions.productId,
        customerId: productQuestions.customerId,
        customerName: productQuestions.customerName,
        customerEmail: productQuestions.customerEmail,
        question: productQuestions.question,
        status: productQuestions.status,
        answerCount: productQuestions.answerCount,
        upvoteCount: productQuestions.upvoteCount,
        isPinned: productQuestions.isPinned,
        createdAt: productQuestions.createdAt,
        updatedAt: productQuestions.updatedAt,
        productName: products.name,
      })
      .from(productQuestions)
      .leftJoin(products, eq(productQuestions.productId, products.id))
      .where(whereClause)
      .orderBy(desc(productQuestions.isPinned), desc(productQuestions.createdAt))
      .limit(limit)
      .offset(offset);

    const questions = rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      customerId: r.customerId,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      question: r.question,
      status: r.status as QuestionStatus,
      answerCount: r.answerCount,
      upvoteCount: r.upvoteCount,
      isPinned: Boolean(r.isPinned),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      productName: r.productName || undefined,
    }));

    return { questions, total };
  }

  // Fallback
  return { questions: memoryQuestions.slice(offset, offset + limit), total: memoryQuestions.length };
}

/**
 * Aggregate summary KPIs for Q&A Dashboard Widget.
 */
export async function getQuestionStats(): Promise<QAStats> {
  const db = getDb();
  if (db) {
    const [counts, ansCount, topUpvoted] = await Promise.all([
      db
        .select({
          status: productQuestions.status,
          count: sql<number>`count(*)`,
        })
        .from(productQuestions)
        .groupBy(productQuestions.status),

      db
        .select({ count: sql<number>`count(*)` })
        .from(productAnswers),

      db
        .select({
          id: productQuestions.id,
          question: productQuestions.question,
          upvoteCount: productQuestions.upvoteCount,
          answerCount: productQuestions.answerCount,
          productName: products.name,
        })
        .from(productQuestions)
        .leftJoin(products, eq(productQuestions.productId, products.id))
        .orderBy(desc(productQuestions.upvoteCount), desc(productQuestions.answerCount))
        .limit(5),
    ]);

    let totalQuestions = 0;
    let pendingQuestions = 0;
    let publishedQuestions = 0;

    for (const c of counts) {
      const n = Number(c.count);
      totalQuestions += n;
      if (c.status === "pending") pendingQuestions = n;
      if (c.status === "published") publishedQuestions = n;
    }

    return {
      totalQuestions,
      pendingQuestions,
      publishedQuestions,
      totalAnswers: Number(ansCount[0]?.count || 0),
      topUpvotedQuestions: topUpvoted.map((t) => ({
        id: t.id,
        question: t.question,
        productName: t.productName || undefined,
        upvoteCount: t.upvoteCount,
        answerCount: t.answerCount,
      })),
    };
  }

  return {
    totalQuestions: memoryQuestions.length,
    pendingQuestions: memoryQuestions.filter((q) => q.status === "pending").length,
    publishedQuestions: memoryQuestions.filter((q) => q.status === "published").length,
    totalAnswers: 0,
    topUpvotedQuestions: [],
  };
}
