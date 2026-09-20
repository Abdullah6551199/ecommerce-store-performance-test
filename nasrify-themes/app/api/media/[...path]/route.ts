import { NextRequest, NextResponse } from "next/server";
import { getR2Bucket } from "@/lib/db";

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
};

/**
 * GET /api/media/[...path]
 * Streams theme preview images & screenshots directly from Cloudflare R2 bucket.
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

    const r2 = getR2Bucket();
    if (r2) {
      const object = await r2.get(key);
      if (!object) {
        return NextResponse.json(
          { error: `Asset not found: ${key}` },
          { status: 404 }
        );
      }

      const headers = new Headers();
      headers.set("Content-Type", object.httpMetadata?.contentType || inferredMime);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("CDN-Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Access-Control-Allow-Origin", "*");

      const etag = object.httpEtag || `"${key}-${object.size}"`;
      headers.set("ETag", etag);

      const clientEtag = req.headers.get("if-none-match");
      if (clientEtag && clientEtag === etag) {
        return new Response(null, { status: 304, headers });
      }

      return new Response(object.body as ReadableStream, {
        status: 200,
        headers,
      });
    }

    // Development fallback SVG placeholder
    const placeholderSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#18181b"/>
        <circle cx="300" cy="180" r="60" fill="#960DF2" opacity="0.2"/>
        <path d="M270 180 L300 150 L330 180" stroke="#C06EF7" stroke-width="4" fill="none"/>
        <text x="300" y="270" font-family="sans-serif" font-size="16" fill="#ffffff" opacity="0.8" text-anchor="middle">
          Theme Asset Preview
        </text>
        <text x="300" y="295" font-family="monospace" font-size="12" fill="#C06EF7" text-anchor="middle">
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
    return NextResponse.json(
      { error: "Failed to stream media asset." },
      { status: 500 }
    );
  }
}
