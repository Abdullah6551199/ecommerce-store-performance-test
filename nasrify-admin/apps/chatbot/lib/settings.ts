import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { chatbotSettings } from '@/lib/db/schema';
import { ChatbotSettings, DEFAULT_CHATBOT_SETTINGS } from '../shared/types';

// 20-second micro-cache
let cachedSettings: { data: ChatbotSettings; expiry: number } | null = null;
const CACHE_TTL_MS = 20 * 1000;

export function invalidateChatbotSettingsCache(): void {
  cachedSettings = null;
}

export function getXKiroApiKey(): string {
  try {
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext();
    if (ctx?.env?.XKIRO_API_KEY) return ctx.env.XKIRO_API_KEY;
  } catch {}

  return (
    (globalThis as any)?.XKIRO_API_KEY ||
    process.env?.XKIRO_API_KEY ||
    ''
  );
}

/**
 * Load Chatbot Settings with React.cache() + 20s micro-cache
 * Strictly selects needed columns (NO SELECT *)
 */
export const getChatbotSettings = cache(
  async (db: any): Promise<ChatbotSettings> => {
    const now = Date.now();
    if (cachedSettings && cachedSettings.expiry > now) {
      return cachedSettings.data;
    }

    if (!db) {
      return DEFAULT_CHATBOT_SETTINGS;
    }

    try {
      const rows = await db
        .select({
          id: chatbotSettings.id,
          enabled: chatbotSettings.enabled,
          preferredModel: chatbotSettings.preferredModel,
          fallbackModels: chatbotSettings.fallbackModels,
          systemPrompt: chatbotSettings.systemPrompt,
          maxTokens: chatbotSettings.maxTokens,
          temperature: chatbotSettings.temperature,
          welcomeMessage: chatbotSettings.welcomeMessage,
          placeholderText: chatbotSettings.placeholderText,
          position: chatbotSettings.position,
          accentColor: chatbotSettings.accentColor,
          updatedAt: chatbotSettings.updatedAt,
        })
        .from(chatbotSettings)
        .where(eq(chatbotSettings.id, 'default'))
        .limit(1);

      if (rows.length === 0) {
        return DEFAULT_CHATBOT_SETTINGS;
      }

      const row = rows[0];
      let fallbackList: string[] = DEFAULT_CHATBOT_SETTINGS.fallbackModels;
      if (row.fallbackModels) {
        try {
          fallbackList = JSON.parse(row.fallbackModels);
        } catch {
          fallbackList = DEFAULT_CHATBOT_SETTINGS.fallbackModels;
        }
      }

      const result: ChatbotSettings = {
        id: row.id,
        enabled: row.enabled === 1,
        preferredModel: row.preferredModel || DEFAULT_CHATBOT_SETTINGS.preferredModel,
        fallbackModels: fallbackList,
        systemPrompt: row.systemPrompt || '',
        maxTokens: row.maxTokens ?? 300,
        temperature: row.temperature ?? 0.7,
        welcomeMessage: row.welcomeMessage || DEFAULT_CHATBOT_SETTINGS.welcomeMessage,
        placeholderText: row.placeholderText || DEFAULT_CHATBOT_SETTINGS.placeholderText,
        position: (row.position as any) || 'bottom-right',
        accentColor: row.accentColor || '#25D366',
        requireLogin: false,
        rateLimitPerHour: 30,
        updatedAt: row.updatedAt ?? undefined,
      };

      cachedSettings = { data: result, expiry: now + CACHE_TTL_MS };
      return result;
    } catch {
      return DEFAULT_CHATBOT_SETTINGS;
    }
  }
);
