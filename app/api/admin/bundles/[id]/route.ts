import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { getBundleById, updateBundle, deleteBundle, UpdateBundleInput } from "@/lib/bundles";

export const dynamic = "force-dynamic";

const updateBundleSchema = z.object({
  name: z.string().trim().min(1, "Bundle name is required").optional(),
  slug: z.string().trim().optional(),
  description: z.string().trim().nullable().optional(),
  bundlePrice: z.coerce.number().min(0, "Bundle price must be positive").optional(),
  imageUrl: z.string().trim().nullable().optional(),
  status: z.enum(["active", "draft"]).optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product ID is required"),
      variantId: z.string().nullable().optional(),
      quantity: z.coerce.number().min(1).default(1),
      sortOrder: z.coerce.number().optional(),
    })
  ).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bundle = await getBundleById(id);

    if (!bundle) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error("GET /api/admin/bundles/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateBundleSchema.safeParse(body);

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

    const updated = await updateBundle(id, parsed.data as UpdateBundleInput);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, bundle: updated });
  } catch (error) {
    console.error("PUT /api/admin/bundles/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bundle = await getBundleById(id);
    if (!bundle) {
      return NextResponse.json(
        { success: false, error: "Bundle not found" },
        { status: 404 }
      );
    }

    await deleteBundle(id);
    return NextResponse.json({ success: true, message: "Bundle deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/bundles/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}
