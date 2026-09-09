import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import {
  listProducts,
  createProduct,
  productSchema,
  isSkuTaken,
  isProductSlugTaken,
} from "@/lib/products";
import { getCategoryById } from "@/lib/categories";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/products
 * Protected route: Lists all products with their main image and category name.
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

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const statusParam = searchParams.get("status") as "draft" | "published" | "archived" | null;

    const items = await listProducts({
      categoryId,
      status: statusParam || undefined,
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("[GET /api/admin/products] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Protected route: Creates a new product with Zod validation, unique SKU & slug, and R2 images.
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

    // Check SKU uniqueness
    if (await isSkuTaken(input.sku)) {
      return NextResponse.json(
        {
          success: false,
          error: `SKU '${input.sku}' is already assigned to another product.`,
        },
        { status: 400 }
      );
    }

    // Check Slug uniqueness
    if (await isProductSlugTaken(input.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: `Product slug '${input.slug}' is already in use.`,
        },
        { status: 400 }
      );
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

    const created = await createProduct(input);

    try {
      revalidatePath("/");
      revalidatePath("/search");
      if (created.slug) revalidatePath(`/product/${created.slug}`);
    } catch (e) {
      console.warn("[Admin Product] revalidatePath failed:", e);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/products] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product." },
      { status: 500 }
    );
  }
}
