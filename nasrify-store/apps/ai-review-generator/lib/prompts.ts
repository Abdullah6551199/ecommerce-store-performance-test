import type { AIGenerationOptions } from "../shared/types";

export const SYSTEM_PROMPT = `You are a review generator for an e-commerce store. Generate realistic, varied customer reviews.
Never mention that you are an AI. Write naturally as a real customer would. Each review must be unique — different length, wording, and specific details.
Return ONLY valid JSON: an array of objects with keys:
[
  {
    "rating": number,
    "title": "string (3-8 words)",
    "body": "string (2-5 sentences, realistic details)",
    "authorName": "string"
  }
]
Do NOT output markdown fences, preamble, or any trailing commentary. Output ONLY the raw JSON array.`;

export function buildUserPrompt(options: AIGenerationOptions): string {
  const {
    productTitle,
    productDescription,
    productCategory,
    count,
    ratingMin,
    ratingMax,
    tone,
    language,
    reviewerStyle,
  } = options;

  let languageInstruction = "Write in fluent, natural English.";
  if (language === "urdu") {
    languageInstruction = "Write the reviews in Urdu (Arabic script).";
  } else if (language === "roman_urdu") {
    languageInstruction = "Write the reviews in Roman Urdu (e.g. 'Bohat achi quality hai, delivery bhi fast thi').";
  } else if (language === "mixed") {
    languageInstruction = "Provide a mix of English and Roman Urdu reviews (some in English, some in conversational Roman Urdu).";
  }

  let toneInstruction = "Warm and positive, satisfied customer.";
  if (tone === "casual") toneInstruction = "Casual, conversational, everyday shopper vibe.";
  if (tone === "detailed") toneInstruction = "In-depth, reviewing material quality, sizing, packaging, and user experience.";
  if (tone === "brief") toneInstruction = "Short and to the point (1-2 punchy sentences).";
  if (tone === "enthusiastic") toneInstruction = "High energy, thrilled with purchase, highly recommended.";

  return `Product: ${productTitle}
Description: ${productDescription || "High quality performance product."}
Category: ${productCategory || "General merchandise"}

Generate ${count} unique reviews.
Rating range: ${ratingMin} to ${ratingMax} stars (distribute realistically between min and max).
Tone: ${toneInstruction}
Language: ${languageInstruction}
Reviewer names should feel: ${reviewerStyle} (use authentic first and last names).

Requirements:
- Each review unique — different wording, length, specific details.
- Include product-specific mentions (features, build quality, comfort/utility, packaging, or speed of delivery).
- Body length: 2-5 sentences (varies per review).
- Title: 3-8 words.
- No two reviews should start with the same word.
- Return raw JSON array only, no backticks, no explanation.`;
}
