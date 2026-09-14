import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { listBundles, createBundle, CreateBundleInput } from "@/lib/bundles";

export const dynamic = "force-dynamic";

const createBundleSchema = z.object({
  name: z.string().trim().min(1, "Bundle name is required"),
  slug: z.string().trim().optional(),
  description: z.string().trim().nullable().optional(),
  bundlePrice: z.coerce.number().min(0, "Bundle price must be positive"),
  imageUrl: z.string().trim().nullable().optional(),
  status: z.enum(["active", "draft"]).default("active"),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().default(0),
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product ID is required"),
      variantId: z.string().nullable().optional(),
      quantity: z.coerce.number().min(1).default(1),
      sortOrder: z.coerce.number().optional(),
    })
  ).min(1, "At least one product must be added to the bundle"),
});

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
    console.error("GET /api/admin/bundles error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createBundleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const bundle = await createBundle(parsed.data as CreateBundleInput);
    return NextResponse.json({ success: true, bundle }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/bundles error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bundle" },
      { status: 500 }
    );
  }
}
