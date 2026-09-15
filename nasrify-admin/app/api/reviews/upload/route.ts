import { NextRequest, NextResponse } from "next/server";
import { uploadFile, validateUploadFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/r2";
import { getReviewSettings } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * POST /api/reviews/upload
 * Public endpoint to upload customer review photos to Cloudflare R2
 */
export async function POST(req: NextRequest) {
  try {
    const settings = await getReviewSettings();
    if (!settings.allowImages) {
      return NextResponse.json(
        { success: false, error: "Image uploads are disabled for reviews." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Missing 'file' field in multipart form-data." },
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

    const uploadResult = await uploadFile(file, "reviews");

    return NextResponse.json(
      {
        success: true,
        data: {
          url: uploadResult.url,
          key: uploadResult.key,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reviews/upload] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload review image.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
