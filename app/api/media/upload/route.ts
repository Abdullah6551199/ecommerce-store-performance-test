import { NextRequest, NextResponse } from "next/server";
import { uploadFile, validateUploadFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/r2";
import { getDb, media } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/media/upload
 * Accepts multipart/form-data with 'file', optional 'altText', and optional 'folder'.
 * Validates MIME type (image/jpeg, image/png, image/webp, image/avif) and size (<= 5MB).
 * Uploads to Cloudflare R2 and persists asset metadata into the 'media' table.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const altText = (formData.get("altText") as string) || undefined;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Missing 'file' field in multipart form-data.",
          },
        },
        { status: 400 }
      );
    }

    // Validate type and size
    const validation = validateUploadFile({ size: file.size, type: file.type });
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: validation.error,
            allowedTypes: ALLOWED_IMAGE_TYPES,
            maxSizeBytes: MAX_FILE_SIZE_BYTES,
          },
        },
        { status: 400 }
      );
    }

    // Upload to R2
    const uploadResult = await uploadFile(file, folder, { altText });

    // Persist media metadata into D1 database if client available
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
        console.warn("[Media Upload] Failed to write media metadata to D1:", dbErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: uploadResult.id,
          url: uploadResult.url,
          key: uploadResult.key,
          type: uploadResult.type,
          size: uploadResult.size,
          altText: uploadResult.altText,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Media Upload Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message: error instanceof Error ? error.message : "Internal server error during upload",
        },
      },
      { status: 500 }
    );
  }
}
