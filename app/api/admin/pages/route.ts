import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { listPages, createPage } from "@/lib/cms";

export const dynamic = "force-dynamic";

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

    const pages = await listPages();
    return NextResponse.json({ success: true, data: { pages } });
  } catch (error) {
    console.error("[GET /api/admin/pages] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages." },
      { status: 500 }
    );
  }
}

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

    const body = (await req.json()) as any;
    const { title, slug, content, seoTitle, seoDescription, ogImage, showInFooter, isPublished } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required." },
        { status: 400 }
      );
    }

    const newPage = await createPage({
      title,
      slug,
      content,
      seoTitle,
      seoDescription,
      ogImage,
      showInFooter: Boolean(showInFooter),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    return NextResponse.json({ success: true, data: { page: newPage } });
  } catch (error: any) {
    console.error("[POST /api/admin/pages] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create page." },
      { status: 500 }
    );
  }
}
