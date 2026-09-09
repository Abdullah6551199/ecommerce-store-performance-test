import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { reorderHomepageSections, listHomepageSections } from "@/lib/homepage";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/homepage/sections/reorder
 * Protected route: Sets the sortOrder based on the array of section IDs.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionToken =
      req.cookies.get("admin_session")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    const admin = await getCurrentAdmin(sessionToken);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as { orderedIds?: string[] };
    if (!body || !Array.isArray(body.orderedIds)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'orderedIds' array." },
        { status: 400 }
      );
    }

    await reorderHomepageSections(body.orderedIds);
    const updatedSections = await listHomepageSections({ activeOnly: false });

    return NextResponse.json({
      success: true,
      message: "Section sequence reordered successfully.",
      data: updatedSections,
    });
  } catch (error) {
    console.error("[POST /api/admin/homepage/sections/reorder] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reorder sections.",
      },
      { status: 500 }
    );
  }
}
