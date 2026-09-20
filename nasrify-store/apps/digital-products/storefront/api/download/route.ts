import { NextRequest, NextResponse } from "next/server";
import { recordDownload, getDownloadByToken } from "@/apps/digital-products/lib/downloads";
import { verifyDownloadTokenSignature } from "@/apps/digital-products/lib/tokens";
import { getNativeR2Bucket } from "@/lib/r2";

export const dynamic = "force-dynamic";

/**
 * GET /api/apps/digital-products/download?token=XYZ
 * Secure download gate: verifies cryptographic token, enforces max downloads and expiry,
 * increments download count, and streams file directly from Cloudflare R2.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing download token." },
        { status: 400 }
      );
    }

    // 1. Verify token signature
    const isSignatureValid = await verifyDownloadTokenSignature(token);
    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or forged download token." },
        { status: 403 }
      );
    }

    // 2. Verify download allowance & increment counter atomically
    const check = await recordDownload(token);
    if (!check.allowed || !check.download) {
      return NextResponse.json(
        {
          success: false,
          error: check.reason || "Download not permitted.",
          downloadedCount: check.download?.downloadedCount,
          maxDownloads: check.download?.maxDownloads,
        },
        { status: 410 }
      );
    }

    const download = check.download;

    // 3. Retrieve file from Cloudflare R2
    const r2 = getNativeR2Bucket();
    if (r2) {
      const object = await r2.get(download.r2Key);
      if (!object) {
        return NextResponse.json(
          {
            success: false,
            error: "Digital asset not found in storage. Please contact store support.",
          },
          { status: 404 }
        );
      }

      const headers = new Headers();
      headers.set(
        "Content-Type",
        object.httpMetadata?.contentType || "application/octet-stream"
      );
      headers.set(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(download.fileName)}"`
      );
      headers.set("Content-Length", object.size.toString());
      headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

      return new Response(object.body as ReadableStream, {
        status: 200,
        headers,
      });
    }

    // Local simulation fallback if running in dev mode without R2
    const mockContent = `Digital Product Download Simulation\nFile: ${download.fileName}\nOrder ID: ${download.orderId}\nDownload Count: ${download.downloadedCount}/${download.maxDownloads}`;
    return new Response(mockContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${download.fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process download request." },
      { status: 500 }
    );
  }
}
