import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getHomepageSectionById,
  updateHomepageSection,
  deleteHomepageSection,
  HomepageSectionRecord,
} from "@/lib/homepage";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/homepage/sections/[id]
 * Protected route: Updates a specific homepage section.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = (await req.json()) as Partial<HomepageSectionRecord>;

    const existing = await getHomepageSectionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Section not found." },
        { status: 404 }
      );
    }

    const updated = await updateHomepageSection(id, body);
    return NextResponse.json({
      success: true,
      message: "Homepage section updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/homepage/sections/[id]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update section.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/homepage/sections/[id]
 * Protected route: Deletes a homepage section.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const existing = await getHomepageSectionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Section not found." },
        { status: 404 }
      );
    }

    await deleteHomepageSection(id);
    return NextResponse.json({
      success: true,
      message: "Homepage section deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/homepage/sections/[id]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete section.",
      },
      { status: 500 }
    );
  }
}
