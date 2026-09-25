import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { getXKiroApiKey } from '@/apps/chatbot/lib/settings';
import { callXKiro } from '@/apps/chatbot/lib/xkiro';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getXKiroApiKey();
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'XKIRO_API_KEY is not configured in Cloudflare Worker Secrets.',
      });
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const preferredModel = body?.preferredModel || 'deepseek/deepseek-v4.1-flash:free';
    const fallbackModels = body?.fallbackModels || [];

    const startTime = Date.now();
    const result = await callXKiro(
      apiKey,
      [
        {
          role: 'system',
          content: 'You are a store assistant. Respond politely in under 15 words confirming connectivity.',
        },
        {
          role: 'user',
          content: 'Connection test: Please confirm you are online.',
        },
      ],
      {
        preferredModel,
        fallbackModels,
        maxTokens: 50,
        temperature: 0.5,
      }
    );

    const latencyMs = Date.now() - startTime;

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to connect to xKiro models.',
        latencyMs,
      });
    }

    return NextResponse.json({
      success: true,
      reply: result.reply,
      model_used: result.model_used,
      latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal connection test failure' },
      { status: 500 }
    );
  }
}
