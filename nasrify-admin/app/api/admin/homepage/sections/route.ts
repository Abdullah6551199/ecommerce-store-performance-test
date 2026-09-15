import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import {
  listHomepageSections,
  createHomepageSection,
  seedDefaultSectionsIfEmpty,
  DEFAULT_HOMEPAGE_SECTIONS,
} from "@/lib/homepage";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/homepage/sections
 * Protected route: Returns all sections (active & inactive) ordered by sortOrder.
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
    console.error("[GET /api/admin/homepage/sections] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve homepage sections." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/homepage/sections
 * Protected route: Creates a new section or resets to default templates if action === 'reset'.
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

    const body = (await req.json()) as any;

    if (body?.action === "reset_defaults") {
      // Re-seed default sections
      const createdList = [];
      for (const tpl of DEFAULT_HOMEPAGE_SECTIONS) {
        const item = await createHomepageSection({
          ...tpl,
          id: `sec-${tpl.type}-${Date.now()}`,
        });
        createdList.push(item);
      }
      try {
        revalidatePath("/");
      } catch (e) {
        console.warn("[revalidatePath] Failed:", e);
      }
      return NextResponse.json({
        success: true,
        message: "Default sections restored successfully.",
        data: createdList,
      });
    }

    if (!body.title || !body.type) {
      return NextResponse.json(
        { success: false, error: "Section title and type are required." },
        { status: 400 }
      );
    }

    const created = await createHomepageSection(body);
    try {
      revalidatePath("/");
    } catch (e) {
      console.warn("[revalidatePath] Failed:", e);
    }
    return NextResponse.json({
      success: true,
      message: "Section created successfully.",
      data: created,
    });
  } catch (error) {
    console.error("[POST /api/admin/homepage/sections] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create section.",
      },
      { status: 500 }
    );
  }
}
