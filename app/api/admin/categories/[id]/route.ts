import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  categorySchema,
  listCategories,
  getDescendantIds,
} from "@/lib/categories";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/categories/[id]
 * Protected route: Returns a single category by ID.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("[GET /api/admin/categories/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categories/[id]
 * Protected route: Updates an existing category with Zod validation.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
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

    // Check slug uniqueness if changed
    if (input.slug !== existing.slug) {
      const slugOwner = await getCategoryBySlug(input.slug);
      if (slugOwner && slugOwner.id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: `Slug '${input.slug}' is already in use by another category.`,
          },
          { status: 400 }
        );
      }
    }

    // Circular parent hierarchy prevention
    if (input.parentId) {
      if (input.parentId === id) {
        return NextResponse.json(
          {
            success: false,
            error: "A category cannot be its own parent.",
          },
          { status: 400 }
        );
      }

      // Check if parentId is one of category's descendants
      const allCategories = await listCategories();
      const descendantIds = getDescendantIds(allCategories, id);
      if (descendantIds.has(input.parentId)) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot set a descendant subcategory as the parent category.",
          },
          { status: 400 }
        );
      }

      // Check parent exists
      const parent = await getCategoryById(input.parentId);
      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected parent category does not exist.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await updateCategory(id, input);

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/categories/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Protected route: Deletes a category and unlinks its child categories.
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

    const { id } = await context.params;
    const existing = await getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
      );
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete category from database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Category '${existing.name}' deleted successfully.`,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/categories/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
