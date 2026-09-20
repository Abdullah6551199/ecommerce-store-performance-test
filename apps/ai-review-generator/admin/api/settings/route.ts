import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, aiReviewSettings } from "@/lib/db";
import { eq } from "drizzle-orm";

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

    const db = getDb();
    let settings = {
      id: "default",
      provider: "cloudflare",
      defaultTone: "positive",
      defaultLanguage: "english",
      maxReviewsPerBatch: 50,
      enabled: 1,
      updatedAt: Date.now(),
    };

    if (db) {
      try {
        const rows = await db
          .select()
          .from(aiReviewSettings)
          .where(eq(aiReviewSettings.id, "default"))
          .limit(1);

        if (rows.length > 0) {
          settings = {
            id: rows[0].id || "default",
            provider: rows[0].provider || "cloudflare",
            defaultTone: rows[0].defaultTone || "positive",
            defaultLanguage: rows[0].defaultLanguage || "english",
            maxReviewsPerBatch: Number(rows[0].maxReviewsPerBatch || 50),
            enabled: rows[0].enabled !== null && rows[0].enabled !== undefined ? Number(rows[0].enabled) : 1,
            updatedAt: Number(rows[0].updatedAt || Date.now()),
          };
        }
      } catch {}
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const db = getDb();
    const now = Date.now();

    if (db) {
      try {
        const existing = await db
          .select()
          .from(aiReviewSettings)
          .where(eq(aiReviewSettings.id, "default"))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(aiReviewSettings)
            .set({
              provider: body.provider || existing[0].provider,
              defaultTone: body.defaultTone || existing[0].defaultTone,
              defaultLanguage: body.defaultLanguage || existing[0].defaultLanguage,
              maxReviewsPerBatch: body.maxReviewsPerBatch ? parseInt(body.maxReviewsPerBatch, 10) : existing[0].maxReviewsPerBatch,
              enabled: body.enabled !== undefined ? (body.enabled ? 1 : 0) : existing[0].enabled,
              updatedAt: now,
            })
            .where(eq(aiReviewSettings.id, "default"));
        } else {
          await db.insert(aiReviewSettings).values({
            id: "default",
            provider: body.provider || "cloudflare",
            defaultTone: body.defaultTone || "positive",
            defaultLanguage: body.defaultLanguage || "english",
            maxReviewsPerBatch: body.maxReviewsPerBatch ? parseInt(body.maxReviewsPerBatch, 10) : 50,
            enabled: body.enabled !== undefined ? (body.enabled ? 1 : 0) : 1,
            updatedAt: now,
          });
        }
      } catch (err) {
        console.error("[settings/route] DB error:", err);
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save settings." },
      { status: 500 }
    );
  }
}

export const POST = PUT;
