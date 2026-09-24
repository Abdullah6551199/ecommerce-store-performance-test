import { NextRequest, NextResponse } from "next/server";
import { getNativeR2Bucket } from "@/lib/r2";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: "Font path missing" }, { status: 400 });
    }

    // Join path segments: e.g. ["inter", "400-normal-latin.woff2"] -> "fonts/inter/400-normal-latin.woff2"
    let fullKey = pathSegments.join("/");
    if (!fullKey.startsWith("fonts/")) {
      fullKey = `fonts/${fullKey}`;
    }

    const headers = new Headers();
    headers.set("Content-Type", "font/woff2");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");

    // 1. Try native Cloudflare R2 bucket binding
    const r2 = getNativeR2Bucket();
    if (r2) {
      const obj = await r2.get(fullKey);
      if (obj) {
        return new Response(obj.body, {
          status: 200,
          headers,
        });
      }
    }

    // 2. Local fallback from .fonts-cache (for local development)
    const localRelPath = fullKey.replace(/^fonts\//, "");
    const localCachedPath = path.resolve(process.cwd(), ".fonts-cache", localRelPath);
    if (fs.existsSync(localCachedPath)) {
      const fileBuffer = fs.readFileSync(localCachedPath);
      return new Response(fileBuffer, {
        status: 200,
        headers,
      });
    }

    return NextResponse.json(
      { error: `Font file not found: ${fullKey}` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to serve font" },
      { status: 500 }
    );
  }
}
