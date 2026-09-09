import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteVariantById } from "@/lib/variants";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ variantId: string }>;
}

/**
 * DELETE /api/admin/variants/[variantId]
 * Protected route: Deletes a specific product variant by ID.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { variantId } = await context.params;
    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json(
        { success: false, error: "Variant ID is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteVariantById(variantId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Variant not found or could not be deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Variant deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/variants/[variantId]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete variant." },
      { status: 500 }
    );
  }
}
