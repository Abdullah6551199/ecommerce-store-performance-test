import { NextRequest, NextResponse } from "next/server";
import { getNativeR2Bucket } from "@/lib/r2";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
};

/**
 * GET /api/media/[...path]
 * Streams media and product assets directly from Cloudflare R2 bucket.
 * Provides high-speed edge delivery with full browser caching headers.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "File path missing" }, { status: 400 });
    }

    const key = path.join("/");
    const ext = key.split(".").pop()?.toLowerCase() || "";
    const inferredMime = MIME_MAP[ext] || "application/octet-stream";

    const r2 = getNativeR2Bucket();
    if (r2) {
      const object = await r2.get(key);
      if (!object) {
        return NextResponse.json(
          { error: `Asset not found in R2: ${key}` },
          { status: 404 }
        );
      }

      const headers = new Headers();
      headers.set("Content-Type", object.httpMetadata?.contentType || inferredMime);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      if (object.httpEtag) {
        headers.set("ETag", object.httpEtag);
      }
      headers.set("Access-Control-Allow-Origin", "*");

      // Check If-None-Match for 304 Not Modified
      const clientEtag = req.headers.get("if-none-match");
      if (clientEtag && object.httpEtag && clientEtag === object.httpEtag) {
        return new Response(null, { status: 304, headers });
      }

      return new Response(object.body as ReadableStream, {
        status: 200,
        headers,
      });
    }

    // Local development fallback: Return simulated SVG placeholder if file not in local R2
    const placeholderSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#0d1611"/>
        <circle cx="200" cy="180" r="60" fill="#18C729" opacity="0.15"/>
        <path d="M170 180 L200 150 L230 180" stroke="#18C729" stroke-width="4" fill="none"/>
        <text x="200" y="270" font-family="sans-serif" font-size="14" fill="#ffffff" opacity="0.7" text-anchor="middle">
          ApexStore Media Asset
        </text>
        <text x="200" y="295" font-family="monospace" font-size="11" fill="#18C729" text-anchor="middle">
          ${key}
        </text>
      </svg>
    `.trim();

    return new Response(placeholderSvg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[GET /api/media/[...path]] Error:", error);
    return NextResponse.json(
      { error: "Failed to stream media asset from R2." },
      { status: 500 }
    );
  }
}
