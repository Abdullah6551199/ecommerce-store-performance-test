import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getHomepageSectionById,
  updateHomepageSection,
  deleteHomepageSection,
} from "@/lib/homepage";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSectionSchema = z.object({
  type: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  content: z.record(z.string(), z.any()).optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/admin/homepage/[id]
 * Protected route: Updates a specific homepage section with Zod validation.
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
    const body = await req.json().catch(() => ({}));

    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid update data.",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const existing = await getHomepageSectionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Section not found." },
        { status: 404 }
      );
    }

    const updated = await updateHomepageSection(id, parsed.data);
    return NextResponse.json({
      success: true,
      message: "Homepage section updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/homepage/[id]] Error:", error);
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
 * DELETE /api/admin/homepage/[id]
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
    console.error("[DELETE /api/admin/homepage/[id]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete section.",
      },
      { status: 500 }
    );
  }
}
