import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, gt, sql, desc, asc } from 'drizzle-orm';
import { getDb, chatbotConversations } from '@/lib/db';
import { getChatbotSettings, getXKiroApiKey } from '@/apps/chatbot/lib/settings';
import { buildStoreContext } from '@/apps/chatbot/lib/store-context';
import { buildSystemPrompt } from '@/apps/chatbot/lib/prompts';
import { callXKiro, ChatMessagePayload } from '@/apps/chatbot/lib/xkiro';

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message too long'),
  sessionId: z.string().trim().min(1, 'Session ID is required').max(128, 'Invalid session ID'),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { message, sessionId } = parsed.data;
    const db = getDb();

    // 1. Load settings
    const settings = await getChatbotSettings(db);
    if (!settings.enabled) {
      return NextResponse.json({
        reply: 'The chat assistant is currently unavailable.',
        model_used: 'none',
      });
    }

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // 2. Rate Limit Check
    if (db) {
      try {
        // Session hourly rate limit
        const sessionCountRes = await db
          .select({ count: sql<number>`count(*)` })
          .from(chatbotConversations)
          .where(
            and(
              eq(chatbotConversations.sessionId, sessionId),
              eq(chatbotConversations.role, 'user'),
              gt(chatbotConversations.createdAt, oneHourAgo)
            )
          );

        const sessionMsgCount = Number(sessionCountRes[0]?.count || 0);
        const maxPerHour = settings.rateLimitPerHour || 30;

        if (sessionMsgCount >= maxPerHour) {
          return NextResponse.json({
            reply: "You've reached the message limit. Please try again later.",
            model_used: 'rate_limited',
          });
        }

        // Global store daily rate limit (1000 msgs/day)
        const globalCountRes = await db
          .select({ count: sql<number>`count(*)` })
          .from(chatbotConversations)
          .where(
            and(
              eq(chatbotConversations.role, 'user'),
              gt(chatbotConversations.createdAt, oneDayAgo)
            )
          );

        const globalMsgCount = Number(globalCountRes[0]?.count || 0);
        if (globalMsgCount >= 1000) {
          return NextResponse.json({
            reply: 'Our support assistant is temporarily at daily capacity. Please contact customer service directly.',
            model_used: 'global_rate_limited',
          });
        }
      } catch {
        // Graceful continuation if counting has any transient issue
      }
    }

    // 3. Obtain API Key
    const apiKey = getXKiroApiKey();
    if (!apiKey) {
      return NextResponse.json({
        reply: 'Chat service is temporarily offline. Please reach out to our store support email.',
        model_used: 'none',
      });
    }

    // 4. Build RAG Store Context
    const storeContext = await buildStoreContext(db, message);
    const systemPrompt = buildSystemPrompt('Our Store', storeContext, settings.systemPrompt);

    // 5. Gather recent conversation history for context continuity (last 4 messages)
    const historyMessages: ChatMessagePayload[] = [];
    if (db) {
      try {
        const pastRows = await db
          .select({
            role: chatbotConversations.role,
            content: chatbotConversations.content,
          })
          .from(chatbotConversations)
          .where(eq(chatbotConversations.sessionId, sessionId))
          .orderBy(desc(chatbotConversations.createdAt))
          .limit(4);

        // Reverse to chronological order
        pastRows.reverse().forEach((r: any) => {
          if (r.role === 'user' || r.role === 'assistant') {
            historyMessages.push({ role: r.role, content: r.content });
          }
        });
      } catch {
        // History non-fatal
      }
    }

    // 6. Assemble API message payload
    const messages: ChatMessagePayload[] = [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user', content: message },
    ];

    // 7. Call xKiro with automatic fallback routing
    const result = await callXKiro(apiKey, messages, {
      preferredModel: settings.preferredModel,
      fallbackModels: settings.fallbackModels,
      maxTokens: settings.maxTokens,
      temperature: settings.temperature,
    });

    const reply = result.reply || "I couldn't find that. Would you like to contact support?";
    const modelUsed = result.model_used || 'unknown';
    const tokensUsed = result.tokens_used || 0;

    // 8. Persist conversation in D1
    if (db) {
      try {
        const userMsgId = crypto.randomUUID();
        const assistantMsgId = crypto.randomUUID();

        await db.insert(chatbotConversations).values([
          {
            id: userMsgId,
            sessionId,
            role: 'user',
            content: message,
            modelUsed: null,
            tokensUsed: 0,
            createdAt: now,
          },
          {
            id: assistantMsgId,
            sessionId,
            role: 'assistant',
            content: reply,
            modelUsed,
            tokensUsed,
            createdAt: now + 1,
          },
        ]);
      } catch {
        // DB logging failure should never prevent response delivery to user
      }
    }

    return NextResponse.json({
      reply,
      model_used: modelUsed,
    });
  } catch (err: any) {
    console.error('[Chatbot Error]', err);
    return NextResponse.json(
      {
        reply: "I'm having trouble processing your request. Please contact our support team.",
        model_used: 'fallback_error',
      },
      { status: 200 } // Graceful fallback per requirements
    );
  }
}
