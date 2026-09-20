import { NextRequest, NextResponse } from "next/server";
import { uploadThemeAsset, validateUploadFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/r2";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/media/upload
 * Uploads theme previews and screenshot assets to Cloudflare R2 bucket.
 * Requires admin or authenticated developer session.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Session required to upload media assets.",
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const altText = (formData.get("altText") as string) || undefined;
    const folder = (formData.get("folder") as string) || "themes";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'file' in multipart form data.",
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

    const uploadResult = await uploadThemeAsset(file, folder, { altText });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: uploadResult.id,
          url: uploadResult.url,
          key: uploadResult.key,
          size: uploadResult.size,
          type: uploadResult.type,
          altText: uploadResult.altText,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload theme media",
      },
      { status: 500 }
    );
  }
}
