import { NextResponse } from "next/server";
import { getDb, activeTheme, themes } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getActiveTheme, validateThemeConfig } from "@/lib/themes/loader";
import { DEFAULT_THEME } from "@/lib/themes/default-theme";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    if (db) {
      const rows = await db
        .select({
          id: activeTheme.themeId,
          activatedAt: activeTheme.activatedAt,
          activatedBy: activeTheme.activatedBy,
          themeJson: activeTheme.themeJson,
          slug: themes.slug,
          name: themes.name,
          version: themes.version,
          isBuiltIn: themes.isBuiltIn,
          status: themes.status,
        })
        .from(activeTheme)
        .leftJoin(themes, eq(activeTheme.themeId, themes.id))
        .where(eq(activeTheme.id, "default"))
        .limit(1);

      if (rows.length > 0 && rows[0].themeJson) {
        const row = rows[0];
        const parsed = validateThemeConfig(row.themeJson) || DEFAULT_THEME;
        const themePayload = {
          ...parsed,
          id: row.id,
          slug: row.slug || "nasrify-default",
          name: row.name || parsed.name,
          version: row.version || parsed.version,
          is_built_in: row.isBuiltIn ?? 1,
          theme_json: parsed,
        };

        return NextResponse.json(
          { success: true, theme: themePayload },
          {
            headers: {
              "Cache-Control": "public, max-age=60, s-maxage=60",
            },
          }
        );
      }
    }

    const fallback = await getActiveTheme();
    return NextResponse.json(
      {
        success: true,
        theme: {
          ...fallback,
          id: "theme-default",
          slug: "nasrify-default",
          name: fallback.name,
          version: fallback.version,
          is_built_in: 1,
          theme_json: fallback,
        },
      },
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
