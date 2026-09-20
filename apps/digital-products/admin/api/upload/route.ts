import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getNativeR2Bucket } from "@/lib/r2";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB per specification

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "zip",
  "mp3",
  "mp4",
  "webm",
  "jpg",
  "jpeg",
  "png",
  "epub",
  "docx",
  "xlsx",
  "txt",
]);

/**
 * POST /api/apps/digital-products/upload
 * Secure admin endpoint to upload downloadable product files to Cloudflare R2
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
    const productId = ((formData.get("productId") as string) || "general").trim();

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Missing 'file' in multipart form data." },
        { status: 400 }
      );
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 500MB.`,
        },
        { status: 400 }
      );
    }

    // Filename & extension validation
    const originalName = (file instanceof File ? file.name : "downloadable-file.bin") || "downloadable-file.bin";
    const ext = originalName.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file extension .${ext}. Allowed formats: PDF, ZIP, MP3, MP4, WEBM, JPG, PNG, EPUB, DOCX, XLSX, TXT.`,
        },
        { status: 400 }
      );
    }

    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileId = crypto.randomUUID().slice(0, 8);
    const r2Key = `digital-products/${productId}/${fileId}-${sanitizedName}`;

    const mimeType = file.type || "application/octet-stream";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const r2 = getNativeR2Bucket();
    if (r2) {
      await r2.put(r2Key, buffer, {
        httpMetadata: {
          contentType: mimeType,
        },
        customMetadata: {
          originalName,
          uploadedBy: admin.email,
          uploadedAt: Date.now().toString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      file: {
        name: originalName,
        size: file.size,
        mime: mimeType,
        r2_key: r2Key,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload digital file." },
      { status: 500 }
    );
  }
}
