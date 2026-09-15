import { NextRequest, NextResponse } from "next/server";
import { uploadFile, validateUploadFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/r2";
import { getDb, media } from "@/lib/db";
import { desc } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/media
 * Retrieve media items from D1
 */
export async function GET() {
  const db = getDb();
  if (db) {
    try {
      const items = await db.select().from(media).orderBy(desc(media.createdAt)).limit(50);
      return NextResponse.json({ success: true, data: items });
    } catch (err) {
      console.warn("[GET /api/media] D1 read error:", err);
    }
  }
  return NextResponse.json({ success: true, data: [] });
}

/**
 * POST /api/media
 * Uploads file to Cloudflare R2 and persists into 'media' table
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const altText = (formData.get("altText") as string) || undefined;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'file' field in multipart form-data.",
        },
        { status: 400 }
      );
    }

    const validation = validateUploadFile({ size: file.size, type: file.type });
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          allowedTypes: ALLOWED_IMAGE_TYPES,
          maxSizeBytes: MAX_FILE_SIZE_BYTES,
        },
        { status: 400 }
      );
    }

    const uploadResult = await uploadFile(file, folder, { altText });

    const db = getDb();
    if (db) {
      try {
        await db.insert(media).values({
          id: uploadResult.id,
          url: uploadResult.url,
          type: uploadResult.type,
          altText: uploadResult.altText || null,
          size: uploadResult.size,
        });
      } catch (dbErr) {
        console.warn("[POST /api/media] Failed to save media metadata to D1:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: uploadResult,
    });
  } catch (error) {
    console.error("[POST /api/media] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Media upload failed.",
      },
      { status: 500 }
    );
  }
}
