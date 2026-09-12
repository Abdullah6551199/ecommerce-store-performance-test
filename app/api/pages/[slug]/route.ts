import { NextRequest, NextResponse } from "next/server";
import { getPageBySlug } from "@/lib/cms";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page || (!page.isPublished && !page.isDefault)) {
      return NextResponse.json(
        { success: false, error: "Page not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { page } });
  } catch (error) {
    console.error("[GET /api/pages/[slug]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page." },
      { status: 500 }
    );
  }
}
