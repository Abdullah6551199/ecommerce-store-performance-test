import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getProductById } from "@/lib/products";
import {
  getVariantsByProductId,
  saveProductVariants,
  variantInputSchema,
  isVariantSkuTaken,
} from "@/lib/variants";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const payloadSchema = z.union([
  z.object({
    variants: z.array(variantInputSchema),
  }),
  z.array(variantInputSchema),
]);

/**
 * GET /api/admin/products/[id]/variants
 * Protected route: Lists all variants for a specific product.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const variants = await getVariantsByProductId(id);

    return NextResponse.json({
      success: true,
      data: variants,
    });
  } catch (error) {
    console.error("[GET /api/admin/products/[id]/variants] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch variants." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products/[id]/variants
 * Protected route: Bulk create or update variants for a specific product.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = payloadSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid variants data.",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const variantsList = Array.isArray(parseResult.data)
      ? parseResult.data
      : parseResult.data.variants;

    // Check SKU collisions
    for (const v of variantsList) {
      const taken = await isVariantSkuTaken(v.sku, v.id);
      if (taken) {
        return NextResponse.json(
          {
            success: false,
            error: `SKU '${v.sku}' is already assigned to another variant.`,
          },
          { status: 400 }
        );
      }
    }

    const savedVariants = await saveProductVariants(id, variantsList, product.price);

    return NextResponse.json({
      success: true,
      message: "Variants saved successfully.",
      data: savedVariants,
    });
  } catch (error) {
    console.error("[POST /api/admin/products/[id]/variants] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save variants." },
      { status: 500 }
    );
  }
}
