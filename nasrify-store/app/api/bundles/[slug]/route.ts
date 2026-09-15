import { NextRequest, NextResponse } from "next/server";
import { getBundleBySlug } from "@/lib/bundles";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const bundle = await getBundleBySlug(slug);

    if (!bundle || bundle.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Bundle not found or inactive" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error("GET /api/bundles/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}
