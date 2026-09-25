/**
 * Presets Library for Stage 42.6: Advanced Theme Editor
 * Includes pre-built presets and D1 retrieval with 20-second micro-cache & React.cache()
 */

import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { advancedEditorPresets } from '@/lib/db/schema';
import { StylePreset } from '../shared/types';

export const BUILTIN_PRESETS: StylePreset[] = [
  // Typography
  {
    id: 'preset_typo_heading',
    name: 'Modern Heading',
    type: 'typography',
    presetJson: JSON.stringify({
      fontFamily: 'Inter',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
      textTransform: 'none',
    }),
    isGlobal: true,
  },
  {
    id: 'preset_typo_serif',
    name: 'Editorial Serif',
    type: 'typography',
    presetJson: JSON.stringify({
      fontFamily: 'Playfair Display',
      fontWeight: '400',
      letterSpacing: '0.01em',
      lineHeight: '1.4',
      textTransform: 'none',
    }),
    isGlobal: true,
  },
  {
    id: 'preset_typo_impact',
    name: 'Impact Display',
    type: 'typography',
    presetJson: JSON.stringify({
      fontFamily: 'Bebas Neue',
      fontWeight: '400',
      letterSpacing: '0.05em',
      lineHeight: '1.0',
      textTransform: 'uppercase',
    }),
    isGlobal: true,
  },
  // Button
  {
    id: 'preset_btn_primary',
    name: 'Primary Solid',
    type: 'button',
    presetJson: JSON.stringify({
      backgroundColor: '#2563EB',
      textColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '12px 24px',
      fontWeight: '600',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
    isGlobal: true,
  },
  {
    id: 'preset_btn_ghost',
    name: 'Outline Ghost',
    type: 'button',
    presetJson: JSON.stringify({
      backgroundColor: 'transparent',
      textColor: '#2563EB',
      borderWidth: '2px',
      borderColor: '#2563EB',
      borderRadius: '8px',
      padding: '10px 22px',
      fontWeight: '600',
    }),
    isGlobal: true,
  },
  {
    id: 'preset_btn_pill',
    name: 'Pill Rounded',
    type: 'button',
    presetJson: JSON.stringify({
      backgroundColor: '#111827',
      textColor: '#FFFFFF',
      borderRadius: '9999px',
      padding: '12px 28px',
      fontWeight: '600',
    }),
    isGlobal: true,
  },
  {
    id: 'preset_btn_shadow',
    name: 'Shadow Button',
    type: 'button',
    presetJson: JSON.stringify({
      backgroundColor: '#4F46E5',
      textColor: '#FFFFFF',
      borderRadius: '10px',
      padding: '14px 28px',
      boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
      fontWeight: '700',
    }),
    isGlobal: true,
  },
  // Shadow
  {
    id: 'preset_shadow_soft',
    name: 'Soft',
    type: 'shadow',
    presetJson: JSON.stringify({
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    }),
    isGlobal: true,
  },
  {
    id: 'preset_shadow_medium',
    name: 'Medium',
    type: 'shadow',
    presetJson: JSON.stringify({
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    }),
    isGlobal: true,
  },
  {
    id: 'preset_shadow_bold',
    name: 'Bold',
    type: 'shadow',
    presetJson: JSON.stringify({
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
    }),
    isGlobal: true,
  },
];

// 20-second micro-cache
let cachedPresets: { data: StylePreset[]; expiry: number } | null = null;
const CACHE_TTL_MS = 20 * 1000;

export function invalidatePresetsCache(): void {
  cachedPresets = null;
}

export const getPresets = cache(async (db: any, type?: string): Promise<StylePreset[]> => {
  const now = Date.now();
  if (cachedPresets && cachedPresets.expiry > now) {
    if (type) {
      return cachedPresets.data.filter((p) => p.type === type);
    }
    return cachedPresets.data;
  }

  if (!db) {
    return type ? BUILTIN_PRESETS.filter((p) => p.type === type) : BUILTIN_PRESETS;
  }

  try {
    const rows = await db
      .select({
        id: advancedEditorPresets.id,
        name: advancedEditorPresets.name,
        type: advancedEditorPresets.type,
        presetJson: advancedEditorPresets.presetJson,
        isGlobal: advancedEditorPresets.isGlobal,
        createdAt: advancedEditorPresets.createdAt,
      })
      .from(advancedEditorPresets)
      .limit(50);

    const merged = rows.length > 0 ? rows : BUILTIN_PRESETS;
    cachedPresets = { data: merged, expiry: now + CACHE_TTL_MS };

    return type ? merged.filter((p: any) => p.type === type) : merged;
  } catch {
    return type ? BUILTIN_PRESETS.filter((p) => p.type === type) : BUILTIN_PRESETS;
  }
});
