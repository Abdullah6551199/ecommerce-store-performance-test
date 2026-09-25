/**
 * Settings helpers for Stage 42.6: Advanced Theme Editor
 */

import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { advancedEditorSettings } from '@/lib/db/schema';
import { AdvancedEditorAppSettings, DEFAULT_ADVANCED_SETTINGS } from '../shared/types';

let cachedSettings: { data: AdvancedEditorAppSettings; expiry: number } | null = null;
const CACHE_TTL_MS = 20 * 1000;

export function invalidateSettingsCache(): void {
  cachedSettings = null;
}

export const getAdvancedEditorSettings = cache(
  async (db: any): Promise<AdvancedEditorAppSettings> => {
    const now = Date.now();
    if (cachedSettings && cachedSettings.expiry > now) {
      return cachedSettings.data;
    }

    if (!db) {
      return DEFAULT_ADVANCED_SETTINGS;
    }

    try {
      const rows = await db
        .select({
          id: advancedEditorSettings.id,
          enabled: advancedEditorSettings.enabled,
          enableCustomCss: advancedEditorSettings.enableCustomCss,
          enableAnimations: advancedEditorSettings.enableAnimations,
          enableResponsive: advancedEditorSettings.enableResponsive,
          enableBreakpoints: advancedEditorSettings.enableBreakpoints,
          breakpoints: advancedEditorSettings.breakpoints,
          updatedAt: advancedEditorSettings.updatedAt,
        })
        .from(advancedEditorSettings)
        .where(eq(advancedEditorSettings.id, 'default'))
        .limit(1);

      if (rows.length === 0) {
        return DEFAULT_ADVANCED_SETTINGS;
      }

      const r = rows[0];
      let bpList = DEFAULT_ADVANCED_SETTINGS.breakpoints;
      if (r.breakpoints) {
        try {
          bpList = JSON.parse(r.breakpoints);
        } catch {
          bpList = DEFAULT_ADVANCED_SETTINGS.breakpoints;
        }
      }

      const result: AdvancedEditorAppSettings = {
        enabled: r.enabled === 1,
        enableCustomCSS: r.enableCustomCss === 1,
        enableAnimations: r.enableAnimations === 1,
        enableResponsive: r.enableResponsive === 1,
        enableBreakpoints: r.enableBreakpoints === 1,
        breakpoints: bpList,
        updatedAt: r.updatedAt ?? undefined,
      };

      cachedSettings = { data: result, expiry: now + CACHE_TTL_MS };
      return result;
    } catch {
      return DEFAULT_ADVANCED_SETTINGS;
    }
  }
);
