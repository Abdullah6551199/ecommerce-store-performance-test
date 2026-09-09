import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  listHomepageSections,
  createHomepageSection,
  seedDefaultSectionsIfEmpty,
  DEFAULT_HOMEPAGE_SECTIONS,
} from "@/lib/homepage";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSectionSchema = z.object({
  action: z.enum(["reset_defaults"]).optional(),
  id: z.string().optional(),
  type: z.string().min(1, "Section type is required"),
  title: z.string().min(1, "Section title is required"),
  content: z.record(z.string(), z.any()).optional().default({}),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * GET /api/admin/homepage
 * Protected route: Returns all sections ordered by sortOrder.
 */
export async function GET(req: NextRequest) {
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

    let sections = await listHomepageSections({ activeOnly: false });
    if (sections.length === 0) {
      sections = await seedDefaultSectionsIfEmpty();
    }

    return NextResponse.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("[GET /api/admin/homepage] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve homepage sections." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/homepage
 * Protected route: Creates a new section or resets to default templates if action === 'reset_defaults'.
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

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;

    // Handle reset defaults
    if (body?.action === "reset_defaults") {
      const createdList = [];
      for (const tpl of DEFAULT_HOMEPAGE_SECTIONS) {
        const item = await createHomepageSection({
          ...tpl,
          id: `sec-${tpl.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        });
        createdList.push(item);
      }
      return NextResponse.json({
        success: true,
        message: "Default sections restored successfully.",
        data: createdList,
      });
    }

    // Zod validation
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid section data.",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const created = await createHomepageSection(parsed.data);
    return NextResponse.json({
      success: true,
      message: "Homepage section created successfully.",
      data: created,
    });
  } catch (error) {
    console.error("[POST /api/admin/homepage] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create section.",
      },
      { status: 500 }
    );
  }
}
