import { NextResponse } from "next/server";
import { getDb, activeTheme } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const rows = await db
      .select()
      .from(activeTheme)
      .where(eq(activeTheme.id, "default"))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "No active theme configured" }, { status: 404 });
    }

    const parsed = JSON.parse(rows[0].themeJson);
    return NextResponse.json(
      { success: true, theme: parsed, themeId: rows[0].themeId, activatedAt: rows[0].activatedAt },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load active theme" },
      { status: 500 }
    );
  }
}
