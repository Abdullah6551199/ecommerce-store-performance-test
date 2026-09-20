import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { isAppEnabled, getAppSettings } from "@/lib/apps/installed";
import { createQuestion, getProductQuestions } from "@/apps/product-qa/lib/questions";
import type { ProductQASettings } from "@/apps/product-qa/shared/types";

export const dynamic = "force-dynamic";

const askSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  question: z.string().min(3, "Question must be at least 3 characters").max(500, "Question cannot exceed 500 characters"),
  customerName: z.string().min(1).max(100).optional(),
  customerEmail: z.string().email("Valid email required").optional(),
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
    const requireLogin = settings?.requireLogin ?? false;
    const allowGuestQuestions = settings?.allowGuestQuestions ?? true;
    const autoPublish = settings?.autoPublish ?? false;
    const maxQuestions = settings?.maxQuestionsPerProduct ?? 50;
    const notifyAdmin = settings?.notifyAdminOnNewQuestion ?? true;

    const customer = await getCurrentCustomer().catch(() => null);

    if (requireLogin && !customer) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to ask a question." },
        { status: 401 }
      );
    }

    if (!customer && !allowGuestQuestions) {
      return NextResponse.json(
        { success: false, error: "Guest questions are disabled. Please sign in to ask a question." },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const parseResult = askSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid question input" },
        { status: 400 }
      );
    }

    const { productId, question } = parseResult.data;

    // Check max questions limit for product
    const existing = await getProductQuestions(productId, 1, 1).catch(() => ({ total: 0 }));
    if (existing.total >= maxQuestions) {
      return NextResponse.json(
        { success: false, error: `Maximum of ${maxQuestions} questions reached for this product.` },
        { status: 400 }
      );
    }

    const name = customer?.name || parseResult.data.customerName?.trim() || "Guest";
    const email = customer?.email || parseResult.data.customerEmail?.trim() || "guest@example.com";

    const newQuestion = await createQuestion({
      productId,
      customerId: customer?.id || null,
      customerName: name,
      customerEmail: email,
      question,
      status: autoPublish ? "published" : "pending",
    });

    if (notifyAdmin) {
      console.log(`[Product-QA] Admin Notification Event: New question for product ${productId} by ${name} (${email}): "${question}"`);
    }

    return NextResponse.json({
      success: true,
      data: newQuestion,
      message: autoPublish
        ? "Your question has been published!"
        : "Your question has been submitted and is pending review.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit question" },
      { status: 500 }
    );
  }
}
