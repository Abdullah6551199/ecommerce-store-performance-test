import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  productSchema,
  isSkuTaken,
  isProductSlugTaken,
} from "@/lib/products";
import { getCategoryById } from "@/lib/categories";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/products/[id]
 * Protected route: Returns single product with all images and category details.
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
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("[GET /api/admin/products/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products/[id]
 * Protected route: Updates an existing product with Zod validation.
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
    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = productSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "Invalid product data.",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Check SKU uniqueness if changed
    if (input.sku.toUpperCase() !== existing.sku) {
      if (await isSkuTaken(input.sku, id)) {
        return NextResponse.json(
          {
            success: false,
            error: `SKU '${input.sku}' is already assigned to another product.`,
          },
          { status: 400 }
        );
      }
    }

    // Check Slug uniqueness if changed
    if (input.slug.toLowerCase() !== existing.slug) {
      if (await isProductSlugTaken(input.slug, id)) {
        return NextResponse.json(
          {
            success: false,
            error: `Slug '${input.slug}' is already in use by another product.`,
          },
          { status: 400 }
        );
      }
    }

    // Check Category if provided
    if (input.categoryId) {
      const cat = await getCategoryById(input.categoryId);
      if (!cat) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected category does not exist.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await updateProduct(id, input);

    try {
      revalidatePath("/");
      revalidatePath("/search");
      if (existing.slug) revalidatePath(`/product/${existing.slug}`);
      if (input.slug && input.slug !== existing.slug) revalidatePath(`/product/${input.slug}`);
    } catch (e) {
      console.warn("[revalidatePath] Failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Protected route: Deletes product and all associated gallery images from D1.
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
    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete product from database." },
        { status: 500 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/search");
      if (existing.slug) revalidatePath(`/product/${existing.slug}`);
    } catch (e) {
      console.warn("[revalidatePath] Failed:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Product '${existing.name}' deleted successfully.`,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
