import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  listCategories,
  createCategory,
  categorySchema,
  getCategoryBySlug,
  getCategoryById,
  buildCategoryTree,
  flattenCategoryHierarchy,
} from "@/lib/categories";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/categories
 * Protected route: Returns all categories with hierarchical relationships.
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

    const items = await listCategories();
    const tree = buildCategoryTree(items);
    const flattened = flattenCategoryHierarchy(tree);

    return NextResponse.json({
      success: true,
      data: {
        categories: items,
        flattened,
        tree,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/categories] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Protected route: Creates a new category with Zod validation.
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
    const parseResult = categorySchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid category data.",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Check slug uniqueness
    const existingSlug = await getCategoryBySlug(input.slug);
    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          error: `Category slug '${input.slug}' is already in use. Please choose a unique slug.`,
        },
        { status: 400 }
      );
    }

    // If parentId provided, verify parent exists
    if (input.parentId) {
      const parent = await getCategoryById(input.parentId);
      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            error: "Specified parent category does not exist.",
          },
          { status: 400 }
        );
      }
    }

    const created = await createCategory(input);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/categories] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category." },
      { status: 500 }
    );
  }
}
