import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { getRandomName } from "./reviewer-names";
import type { AIGenerationOptions, AIGeneratedReview } from "../shared/types";

export interface GenerationResult {
  reviews: AIGeneratedReview[];
  provider: "cloudflare-ai" | "fallback-local";
  model: string;
  neuronsUsed?: number;
}

export function getWorkersAI(): any {
  try {
    // OpenNext Cloudflare runtime binding
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    if (ctx?.env?.AI) return ctx.env.AI;
  } catch {}

  return (globalThis as any)?.AI || (process.env as any)?.AI || null;
}

export async function generateReviews(
  options: AIGenerationOptions
): Promise<GenerationResult> {
  const ai = getWorkersAI();
  const prompt = buildUserPrompt(options);
  const modelName = "@cf/meta/llama-3.1-8b-instruct";

  if (ai && typeof ai.run === "function") {
    try {
      const response: any = await ai.run(modelName, {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.85,
      });

      const rawText =
        typeof response === "string"
          ? response
          : response?.response || response?.result?.response || JSON.stringify(response);

      const parsed = parseReviewsFromResponse(rawText, options);
      if (parsed.length > 0) {
        return {
          reviews: parsed,
          provider: "cloudflare-ai",
          model: modelName,
          neuronsUsed: Math.round(options.count * 12 + 15),
        };
      }
    } catch (err) {
      console.warn("[AIReviewGenerator] Cloudflare AI call failed or timed out, using fallback:", err);
    }
  }

  // Fallback generation
  const fallback = generateSyntheticReviews(options);
  return {
    reviews: fallback,
    provider: "fallback-local",
    model: "synthetic-heuristic-v1",
    neuronsUsed: 0,
  };
}

export function parseReviewsFromResponse(
  rawText: string,
  options: AIGenerationOptions
): AIGeneratedReview[] {
  try {
    // 1. Strip markdown fences if present
    let cleanText = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

    // 2. Locate bracket bounds
    const firstBracket = cleanText.indexOf("[");
    const lastBracket = cleanText.lastIndexOf("]");

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    }

    const items = JSON.parse(cleanText);
    if (Array.isArray(items)) {
      const valid: AIGeneratedReview[] = [];
      for (const it of items) {
        if (!it) continue;
        const rating = Math.min(
          options.ratingMax,
          Math.max(options.ratingMin, parseInt(it.rating || options.ratingMax, 10))
        );
        const title = (it.title || "Great product").toString().trim().slice(0, 100);
        const body = (it.body || it.content || it.comment || "Very satisfied with this purchase.")
          .toString()
          .trim()
          .slice(0, 1200);
        const authorName = (it.authorName || it.name || getRandomName(options.reviewerStyle))
          .toString()
          .trim()
          .slice(0, 60);

        if (body.length > 5) {
          valid.push({ rating, title, body, authorName });
        }
      }
      return valid.slice(0, options.count);
    }
  } catch (err) {
    console.warn("[AIReviewGenerator] JSON parse error from AI response:", err);
  }

  return [];
}

/**
 * High-quality fallback review generator for local or offline testing
 */
export function generateSyntheticReviews(options: AIGenerationOptions): AIGeneratedReview[] {
  const titles = [
    `Remarkable quality for ${options.productTitle}`,
    `Exceeded expectations completely`,
    `Very impressed with the build quality`,
    `A solid investment, works as advertised`,
    `Fast delivery and premium finishing`,
    `Genuinely great value for money`,
    `Top notch durability and performance`,
    `Pleasantly surprised by how good this is`,
    `One of the best purchases this year`,
    `Exactly what I needed for daily use`
  ];

  const templates = [
    `The ${options.productTitle} arrived neatly boxed and well protected. I was immediately impressed by the attention to detail and materials. It performs seamlessly and feels built to last.`,
    `Been using this for a couple of weeks now and it has completely changed my daily routine. The ergonomics and quality of the ${options.productTitle} are simply stellar. Highly recommended to anyone considering it.`,
    `Decided to pick up the ${options.productTitle} after researching similar options in ${options.productCategory || "this category"}. Delivery was swift and setup was instantaneous. Very satisfied with this purchase.`,
    `Everything from the tactile feel to everyday reliability is top tier. The craftsmanship on the ${options.productTitle} is evident from the moment you unbox it. Will definitely be ordering from here again.`,
    `Solid construction, elegant appearance, and practical performance. Fits into my setup effortlessly. No issues after heavy usage. Five stars all around.`
  ];

  const results: AIGeneratedReview[] = [];
  for (let i = 0; i < options.count; i++) {
    const ratingSpread = options.ratingMax - options.ratingMin;
    const rating = Math.round(options.ratingMin + Math.random() * ratingSpread);
    const title = titles[i % titles.length] + (i >= titles.length ? ` #${i + 1}` : "");
    const body = templates[i % templates.length];
    const authorName = getRandomName(options.reviewerStyle);

    results.push({
      rating,
      title,
      body,
      authorName
    });
  }

  return results;
}
