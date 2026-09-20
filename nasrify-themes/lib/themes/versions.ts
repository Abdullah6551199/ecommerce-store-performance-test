import { getDb, themeMarketplaceVersions } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import type { ThemeMarketplaceVersion } from "@/types/themes";

export async function getVersionsForTheme(listingId: string): Promise<ThemeMarketplaceVersion[]> {
  const db = getDb();
  if (!db || !listingId) return [];

  try {
    const rows = await db
      .select({
        id: themeMarketplaceVersions.id,
        listingId: themeMarketplaceVersions.listingId,
        version: themeMarketplaceVersions.version,
        submittedAt: themeMarketplaceVersions.submittedAt,
        configJson: themeMarketplaceVersions.configJson,
        downloadUrl: themeMarketplaceVersions.downloadUrl,
        status: themeMarketplaceVersions.status,
        notes: themeMarketplaceVersions.notes,
      })
      .from(themeMarketplaceVersions)
      .where(eq(themeMarketplaceVersions.listingId, listingId))
      .orderBy(desc(themeMarketplaceVersions.submittedAt))
      .limit(50);

    return rows as ThemeMarketplaceVersion[];
  } catch {
    return [];
  }
}

export const getThemeVersions = getVersionsForTheme;

export async function createThemeVersion(data: {
  listingId: string;
  version: string;
  configJson?: string | null;
  downloadUrl?: string | null;
  notes?: string | null;
}): Promise<string | null> {
  const db = getDb();
  if (!db) return null;

  const id = crypto.randomUUID();
  try {
    await db.insert(themeMarketplaceVersions).values({
      id,
      listingId: data.listingId,
      version: data.version,
      submittedAt: Date.now(),
      configJson: data.configJson || null,
      downloadUrl: data.downloadUrl || null,
      status: "pending",
      notes: data.notes || null,
    });
    return id;
  } catch {
    return null;
  }
}
