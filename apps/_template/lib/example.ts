import { getAppSettings } from "@/lib/apps/installed";

export interface TemplateAppSettings {
  enableFeature: boolean;
  badgeTitle: string;
}

/**
 * Fetch settings configured by admin for this app.
 */
export async function getTemplateAppSettings(): Promise<TemplateAppSettings> {
  const settings = await getAppSettings<Partial<TemplateAppSettings>>("my-custom-app");
  return {
    enableFeature: settings?.enableFeature ?? true,
    badgeTitle: settings?.badgeTitle ?? "Featured Offer",
  };
}

/**
 * Helper function for app business logic.
 */
export function formatAppBadge(title: string): string {
  return `★ ${title.toUpperCase()} ★`;
}
