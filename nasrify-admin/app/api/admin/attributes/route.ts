import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listAttributes, createOrUpdateAttribute, attributeInputSchema } from "@/lib/variants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/attributes
 * Protected route: Lists all registered attributes and their values.
 */
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const attrs = await listAttributes();
    return NextResponse.json({
      success: true,
      data: attrs,
    });
  } catch (error) {
    console.error("[GET /api/admin/attributes] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attributes." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/attributes
 * Protected route: Creates or updates an attribute and its associated values.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = attributeInputSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid attribute data.",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, values } = parseResult.data;
    const result = await createOrUpdateAttribute(name, values);

    return NextResponse.json({
      success: true,
      message: "Attribute saved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("[POST /api/admin/attributes] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to save attribute." },
      { status: 500 }
    );
  }
}
