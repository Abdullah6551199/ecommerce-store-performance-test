import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { createAnswer } from "@/apps/product-qa/lib/answers";

export const dynamic = "force-dynamic";

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(2).max(1000),
  authorName: z.string().min(1).max(100).optional(),
  authorType: z.enum(["admin", "customer", "nasrify_team"]).default("customer"),
});

export async function POST(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer().catch(() => null);
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const parseResult = answerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid answer payload" },
        { status: 400 }
      );
    }

    const { questionId, answer, authorName, authorType } = parseResult.data;

    const newAnswer = await createAnswer({
      questionId,
      answer,
      authorName: customer?.name || authorName || "Shopper",
      authorType: customer ? "customer" : authorType || "customer",
      authorId: customer?.id || null,
    });

    return NextResponse.json({ success: true, data: newAnswer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to post answer" },
      { status: 500 }
    );
  }
}
