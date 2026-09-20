import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { generateReviews } from "@/apps/ai-review-generator/lib/generator";
import { insertGeneratedBatch } from "@/apps/ai-review-generator/lib/inserts";
import type { AIGenerationOptions } from "@/apps/ai-review-generator/shared/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const productId = body.productId?.toString().trim();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'productId'" },
        { status: 400 }
      );
    }

    const count = Math.min(200, Math.max(1, parseInt(body.count || "5", 10)));
    const ratingMin = Math.min(5, Math.max(1, parseInt(body.ratingMin || "4", 10)));
    const ratingMax = Math.min(5, Math.max(ratingMin, parseInt(body.ratingMax || "5", 10)));
    const tone = body.tone || "positive";
    const language = body.language || "english";
    const reviewerStyle = body.reviewerStyle || "mix";
    const dateRangeDays = Math.max(1, parseInt(body.dateRangeDays || "30", 10));
    const approvalMode = body.approvalMode === "auto" ? "auto" : "pending";

    // Fetch product details for accurate context
    let productTitle = body.productTitle || "Product";
    let productDescription = body.productDescription || "";
    let productCategory = body.productCategory || "";

    const db = getDb();
    if (db) {
      try {
        const prod = await db
          .select({ name: products.name, description: products.description })
          .from(products)
          .where(eq(products.id, productId))
          .limit(1);

        if (prod.length > 0) {
          productTitle = prod[0].name || productTitle;
          productDescription = prod[0].description || productDescription;
        }
      } catch {}
    }

    const options: AIGenerationOptions = {
      productId,
      productTitle,
      productDescription,
      productCategory,
      count,
      ratingMin,
      ratingMax,
      tone,
      language,
      reviewerStyle,
      dateRangeDays,
      approvalMode,
      createdBy: admin.email || "Admin",
    };

    // 1. Generate Reviews
    const genResult = await generateReviews(options);

    // 2. Persist into reviews and ai_review_generations
    const batch = await insertGeneratedBatch(options, genResult.reviews);

    return NextResponse.json({
      success: true,
      data: {
        batchId: batch.id,
        requestedCount: count,
        generatedCount: genResult.reviews.length,
        provider: genResult.provider,
        model: genResult.model,
        neuronsUsed: genResult.neuronsUsed,
        approvalMode,
        sampleReviews: genResult.reviews.slice(0, 3),
      },
      message: `${genResult.reviews.length} reviews generated (${approvalMode === "auto" ? "Auto-published" : "Pending approval"}).`,
    });
  } catch (err: any) {
    console.error("[generate/route] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to generate reviews." },
      { status: 500 }
    );
  }
}
