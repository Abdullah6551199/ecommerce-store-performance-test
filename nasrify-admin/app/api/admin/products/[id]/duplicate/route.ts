import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { duplicateProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/products/[id]/duplicate
 * Protected route: Clones a product, its pricing, inventory settings, and gallery images
 * with a new unique SKU and slug.
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
    const duplicated = await duplicateProduct(id);

    if (!duplicated) {
      return NextResponse.json(
        { success: false, error: "Source product not found or failed to duplicate." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Product duplicated as '${duplicated.name}'.`,
        data: duplicated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/products/[id]/duplicate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to duplicate product." },
      { status: 500 }
    );
  }
}
