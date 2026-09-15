import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { reorderHomepageSections, listHomepageSections } from "@/lib/homepage";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1, "Section ID cannot be empty")).min(1, "At least one section ID is required"),
});

async function handleReorder(req: NextRequest) {
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

    const body = await req.json().catch(() => ({}));
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid reorder payload.",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    await reorderHomepageSections(parsed.data.orderedIds);
    const updatedSections = await listHomepageSections({ activeOnly: false });

    return NextResponse.json({
      success: true,
      message: "Homepage section sequence reordered successfully.",
      data: updatedSections,
    });
  } catch (error) {
    console.error("[PUT /api/admin/homepage/reorder] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reorder sections.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/homepage/reorder
 * Protected route: Sets the sortOrder based on the array of section IDs with Zod validation.
 */
export async function PUT(req: NextRequest) {
  return handleReorder(req);
}

/**
 * POST /api/admin/homepage/reorder
 * Backward compatibility alias for PUT.
 */
export async function POST(req: NextRequest) {
  return handleReorder(req);
}
