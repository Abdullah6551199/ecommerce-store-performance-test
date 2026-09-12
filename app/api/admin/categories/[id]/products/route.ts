import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getCategoryById } from "@/lib/categories";
import { listProducts, type ProductWithImagesAndCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/categories/[id]/products
 * Admin-protected: Lists products within a specific category with search, status/stock filtering & pagination.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const sessionToken = req.cookies.get("admin_session")?.value;
    const admin = await getCurrentAdmin(sessionToken);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in as admin." },
        { status: 401 }
      );
    }

    const { id: categoryId } = await params;
    const category = await getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const status = url.searchParams.get("status") || "all";
    const stock = url.searchParams.get("stock") || "all";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10));

    // Fetch all products belonging to this category
    const allCategoryProducts = await listProducts({
      categoryId,
      status: status !== "all" ? (status as any) : undefined,
    });

    // In-memory filter for search query and stock availability
    let filtered = allCategoryProducts;
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          (p.brand && p.brand.toLowerCase().includes(search))
      );
    }

    if (stock === "in_stock") {
      filtered = filtered.filter(
        (p) =>
          p.stockStatus !== "out_of_stock" &&
          (!p.trackInventory || p.stockQuantity > 0 || p.allowBackorders)
      );
    } else if (stock === "out_of_stock") {
      filtered = filtered.filter(
        (p) =>
          p.stockStatus === "out_of_stock" ||
          (p.trackInventory && p.stockQuantity <= 0 && !p.allowBackorders)
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        category,
        products: paginated,
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/categories/[id]/products] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products for category." },
      { status: 500 }
    );
  }
}
