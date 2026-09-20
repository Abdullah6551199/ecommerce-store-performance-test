import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { isAppEnabled, getAppSettings } from "@/lib/apps/installed";
import { toggleQuestionUpvote, toggleAnswerUpvote } from "@/apps/product-qa/lib/upvotes";
import type { ProductQASettings } from "@/apps/product-qa/shared/types";

export const dynamic = "force-dynamic";

const upvoteSchema = z.object({
  targetType: z.enum(["question", "answer"]),
  targetId: z.string().min(1, "Target ID is required"),
  customerEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const isEnabled = await isAppEnabled("product-qa").catch(() => true);
    if (!isEnabled) {
      return NextResponse.json(
        { success: false, error: "Product Q&A app is currently disabled" },
        { status: 403 }
      );
    }

    const settings = await getAppSettings<ProductQASettings>("product-qa").catch(() => null);
    if (settings && settings.showUpvotes === false) {
      return NextResponse.json(
        { success: false, error: "Upvoting is disabled by store settings" },
        { status: 403 }
      );
    }

    const customer = await getCurrentCustomer().catch(() => null);

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const parseResult = upvoteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid upvote request" },
        { status: 400 }
      );
    }

    const { targetType, targetId } = parseResult.data;

    // Use logged in customer's email, or client provided email/hash, or fallback to IP/header
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "anon";
    const email =
      customer?.email ||
      parseResult.data.customerEmail ||
      `guest_${ip.replace(/[^a-zA-Z0-9]/g, "")}@storefront.local`;

    let result: { upvoted: boolean; upvoteCount: number };

    if (targetType === "question") {
      result = await toggleQuestionUpvote(targetId, email, customer?.id || null);
    } else {
      result = await toggleAnswerUpvote(targetId, email, customer?.id || null);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to toggle upvote" },
      { status: 500 }
    );
  }
}
