/**
 * xKiro API Client with Automatic Multi-Model Fallback Routing
 * Connects to OpenAI-compatible gateway https://api.xkiro.com/v1/chat/completions
 * No SDK dependencies - pure fetch()
 */

export interface ChatMessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface XKiroCallOptions {
  preferredModel?: string;
  fallbackModels?: string[];
  maxTokens?: number;
  temperature?: number;
}

export interface XKiroCallResult {
  success: boolean;
  reply: string;
  model_used?: string;
  tokens_used?: number;
  error?: string;
}

// 5-minute in-memory working model cache
let workingModelCache: { model: string; expiresAt: number } | null = null;

const DEFAULT_FALLBACK_CHAIN = [
  'qwen/qwen3.6-plus:free',
  'qwen/qwen3.7-flash:free',
  'qwen/qwen3.5-plus:free',
  'qwen/qwen3.5-flash:free',
  'mistralai/mistral-medium-3.5:free',
  'minimax/minimax-m3:free',
  'deepseek/deepseek-v4.1-flash:free',
];

/**
 * Call xKiro chat completions with automated fallback
 */
export async function callXKiro(
  apiKey: string,
  messages: ChatMessagePayload[],
  options: XKiroCallOptions = {}
): Promise<XKiroCallResult> {
  if (!apiKey) {
    return {
      success: false,
      reply: 'Chatbot service is currently unconfigured. Please contact store support.',
      error: 'XKIRO_API_KEY missing',
    };
  }

  const preferred = options.preferredModel || 'deepseek/deepseek-v4.1-flash:free';
  const customFallbacks = options.fallbackModels || [];

  // Build candidate order:
  // 1. If we have a cached working model (within 5 min) that matches preferred or fallback, try it first
  // 2. preferredModel
  // 3. user-configured fallbacks
  // 4. system defaults
  const candidates: string[] = [];

  const now = Date.now();
  if (workingModelCache && workingModelCache.expiresAt > now) {
    candidates.push(workingModelCache.model);
  }

  candidates.push(preferred);
  for (const m of customFallbacks) {
    if (!candidates.includes(m)) candidates.push(m);
  }
  for (const m of DEFAULT_FALLBACK_CHAIN) {
    if (!candidates.includes(m)) candidates.push(m);
  }

  const maxTokens = options.maxTokens ?? 300;
  const temperature = options.temperature ?? 0.7;

  let lastError = '';

  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];

    // Try model (with 1 retry on 500 error)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch('https://api.xkiro.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens,
            temperature,
            stream: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 200) {
          const data = (await response.json()) as any;
          const reply = data?.choices?.[0]?.message?.content?.trim();

          if (reply) {
            // Cache successful model for 5 minutes
            workingModelCache = {
              model,
              expiresAt: Date.now() + 5 * 60 * 1000,
            };

            return {
              success: true,
              reply,
              model_used: model,
              tokens_used: data?.usage?.total_tokens || 0,
            };
          }
        }

        // Parse error message
        let errMsg = '';
        try {
          const errData = (await response.json()) as any;
          errMsg = errData?.error?.message || response.statusText;
        } catch {
          errMsg = `HTTP ${response.status}`;
        }

        lastError = `${model} failed (${response.status}: ${errMsg})`;

        // On 500 error, retry once on same model
        if (response.status === 500 && attempt === 0) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }

        // On 403 (premium/permission), 429 (rate limit), or other error, break attempt loop to switch to next fallback
        break;
      } catch (err: any) {
        lastError = `${model} exception: ${err?.message || 'timeout'}`;
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        break;
      }
    }
  }

  // All models failed
  return {
    success: false,
    reply: "I'm having trouble connecting to support right now. Please try again in a few moments or contact our support team.",
    error: lastError || 'All model fallbacks exhausted',
  };
}
