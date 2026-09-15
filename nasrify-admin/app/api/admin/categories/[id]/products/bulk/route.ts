import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getCategoryById } from "@/lib/categories";
import { getDb, products, productImages, productVariants } from "@/lib/db";
import { inArray, eq } from "drizzle-orm";
import { memoryProducts, deleteProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const body = (await req.json()) as any;
    const { action, productIds, targetCategoryId } = body;

    if (!action || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payload. Action and productIds array are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();

    switch (action) {
      case "change_category": {
        if (!targetCategoryId) {
          return NextResponse.json(
            { success: false, error: "Target category is required for changing category." },
            { status: 400 }
          );
        }
        const targetCategory = await getCategoryById(targetCategoryId);
        if (!targetCategory) {
          return NextResponse.json(
            { success: false, error: "Target category does not exist." },
            { status: 404 }
          );
        }

        if (db) {
          await db
            .update(products)
            .set({ categoryId: targetCategoryId, updatedAt: now })
            .where(inArray(products.id, productIds));
        }

        // Update memory cache
        for (const p of memoryProducts) {
          if (productIds.includes(p.id)) {
            p.categoryId = targetCategoryId;
            p.updatedAt = now;
          }
        }

        return NextResponse.json({
          success: true,
          message: `Moved ${productIds.length} products to ${targetCategory.name}.`,
        });
      }

      case "publish": {
        if (db) {
          await db
            .update(products)
            .set({ status: "published", updatedAt: now })
            .where(inArray(products.id, productIds));
        }

        for (const p of memoryProducts) {
          if (productIds.includes(p.id)) {
            p.status = "published";
            p.updatedAt = now;
          }
        }

        return NextResponse.json({
          success: true,
          message: `Published ${productIds.length} products.`,
        });
      }

      case "unpublish": {
        if (db) {
          await db
            .update(products)
            .set({ status: "draft", updatedAt: now })
            .where(inArray(products.id, productIds));
        }

        for (const p of memoryProducts) {
          if (productIds.includes(p.id)) {
            p.status = "draft";
            p.updatedAt = now;
          }
        }

        return NextResponse.json({
          success: true,
          message: `Set ${productIds.length} products to draft status.`,
        });
      }

      case "delete": {
        for (const id of productIds) {
          await deleteProduct(id);
        }

        return NextResponse.json({
          success: true,
          message: `Deleted ${productIds.length} products successfully.`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[POST /api/admin/categories/[id]/products/bulk] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute bulk action." },
      { status: 500 }
    );
  }
}
