import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listBundles } from "@/apps/bundles/lib/bundles";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = (searchParams.get("status")?.trim().toLowerCase() || "all") as "active" | "draft" | "all";
    const isFeaturedParam = searchParams.get("isFeatured");
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === "true" : undefined;
    const sortBy = (searchParams.get("sortBy") || "sortOrder") as "name" | "price" | "discount" | "createdAt" | "sortOrder";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";
    const limit = Number(searchParams.get("limit")) || 100;
    const offset = Number(searchParams.get("offset")) || 0;

    const bundles = await listBundles({
      status,
      search: search || undefined,
      isFeatured,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, bundles, count: bundles.length });
  } catch (error) {
    console.error("[GET /api/apps/bundles/admin/list] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}
