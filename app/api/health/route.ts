import { NextResponse } from "next/server";
import { checkDbHealth } from "@/lib/db";
import { checkR2Health } from "@/lib/r2";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Health check endpoint verifying Cloudflare D1 database and R2 storage readiness.
 */
export async function GET() {
  const [dbStatus, r2Status] = await Promise.all([
    checkDbHealth(),
    checkR2Health(),
  ]);

  const isHealthy = dbStatus.connected && r2Status.configured;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      storage: r2Status,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
