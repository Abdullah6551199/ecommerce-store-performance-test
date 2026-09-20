import { getDb, appMarketplaceVersions } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import type { MarketplaceVersion } from "@/types/marketplace";

export async function getVersionsForListing(listingId: string): Promise<MarketplaceVersion[]> {
  const db = getDb();
  if (!db || !listingId) return [];

  try {
    const rows = await db
      .select({
        id: appMarketplaceVersions.id,
        listingId: appMarketplaceVersions.listingId,
        version: appMarketplaceVersions.version,
        submittedAt: appMarketplaceVersions.submittedAt,
        manifestJson: appMarketplaceVersions.manifestJson,
        downloadUrl: appMarketplaceVersions.downloadUrl,
        status: appMarketplaceVersions.status,
        notes: appMarketplaceVersions.notes,
      })
      .from(appMarketplaceVersions)
      .where(eq(appMarketplaceVersions.listingId, listingId))
      .orderBy(desc(appMarketplaceVersions.submittedAt))
      .limit(50);

    return rows as MarketplaceVersion[];
  } catch {
    return [];
  }
}

export async function createMarketplaceVersion(data: {
  listingId: string;
  version: string;
  manifestJson?: string | null;
  downloadUrl?: string | null;
  notes?: string | null;
}): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const id = crypto.randomUUID();
  try {
    await db.insert(appMarketplaceVersions).values({
      id,
      listingId: data.listingId,
      version: data.version,
      submittedAt: Date.now(),
      manifestJson: data.manifestJson || null,
      downloadUrl: data.downloadUrl || null,
      status: "pending",
      notes: data.notes || null,
    });
    return id;
  } catch {
    return null;
  }
}
