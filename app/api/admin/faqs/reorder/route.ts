import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { reorderFaqs } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as any;
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Array of items with id and sortOrder required." },
        { status: 400 }
      );
    }

    await reorderFaqs(items);

    return NextResponse.json({
      success: true,
      message: "FAQs reordered successfully.",
    });
  } catch (error: any) {
    console.error("[PUT /api/admin/faqs/reorder] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reorder FAQs." },
      { status: 500 }
    );
  }
}
