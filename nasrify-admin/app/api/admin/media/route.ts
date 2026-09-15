import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, media } from "@/lib/db";
import { desc, like, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * GET /api/admin/media
 * Protected admin endpoint returning all media assets from D1 with search and storage metrics.
 */
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
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const typeFilter = searchParams.get("type")?.trim() || "";

    const db = getDb();
    if (!db) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          summary: {
            totalFiles: 0,
            totalSizeBytes: 0,
            totalSizeFormatted: "0 B",
          },
        },
      });
    }

    // Fetch all media items
    let query = db.select().from(media).orderBy(desc(media.createdAt));
    const allItems = await query;

    // In-memory or D1 filter
    let filtered = allItems;
    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.url.toLowerCase().includes(search) ||
          (m.altText && m.altText.toLowerCase().includes(search)) ||
          m.type.toLowerCase().includes(search)
      );
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((m) => m.type.includes(typeFilter));
    }

    // Calculate overall storage metrics
    const totalSizeBytes = allItems.reduce((acc, m) => acc + (m.size || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        items: filtered,
        summary: {
          totalFiles: allItems.length,
          filteredCount: filtered.length,
          totalSizeBytes,
          totalSizeFormatted: formatBytes(totalSizeBytes),
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/media] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load media assets.",
      },
      { status: 500 }
    );
  }
}
