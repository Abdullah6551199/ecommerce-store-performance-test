import { cache } from 'react';
import { sql, inArray, eq, like, or } from 'drizzle-orm';
import {
  settings,
  products,
  categories,
  shippingZones,
  faqs,
} from '@/lib/db/schema';

// 20-second in-memory micro-cache
const contextCache = new Map<string, { context: string; expiry: number }>();
const CACHE_TTL_MS = 20 * 1000;

function getCachedContext(key: string): string | null {
  const item = contextCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    contextCache.delete(key);
    return null;
  }
  return item.context;
}

function setCachedContext(key: string, context: string): void {
  contextCache.set(key, { context, expiry: Date.now() + CACHE_TTL_MS });
}

/**
 * Extract search keywords from customer query
 */
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'about', 'can', 'you', 'tell', 'me', 'please', 'show',
    'your', 'our', 'have', 'has', 'had', 'is', 'are', 'was', 'were', 'do', 'does',
    'i', 'want', 'need', 'like', 'hello', 'hi', 'hey', 'help', 'good', 'much', 'cost'
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 5);
}

/**
 * Build compact store context for RAG
 * Strictly projects needed columns (NO SELECT *)
 * React.cache() deduplication + 20s micro-cache
 */
export const buildStoreContext = cache(
  async (db: any, query: string = ''): Promise<string> => {
    const keywords = extractKeywords(query);
    const cacheKey = keywords.length > 0 ? keywords.join('_') : 'default_store_ctx';

    const cached = getCachedContext(cacheKey);
    if (cached) return cached;

    if (!db) {
      return `Store: Nasrify Demo Store\nSupport: support@nasrify.com\nPolicies: 30-day standard return on unused items with original packaging.\nShipping: Standard delivery in 3-5 business days.`;
    }

    try {
      // 1. Store settings
      const settingsList = await db
        .select({
          key: settings.key,
          value: settings.value,
        })
        .from(settings)
        .where(
          inArray(settings.key, [
            'store_name',
            'store_email',
            'store_phone',
            'currency',
            'return_policy',
            'shipping_policy',
          ])
        )
        .limit(10);

      const settingsMap: Record<string, string> = {};
      for (const item of settingsList) {
        if (typeof item.value === 'string') {
          settingsMap[item.key] = item.value;
        } else if (item.value) {
          settingsMap[item.key] = JSON.stringify(item.value);
        }
      }

      const storeName = settingsMap.store_name || 'Nasrify Store';
      const storeEmail = settingsMap.store_email || 'support@apexstore.com';
      const storePhone = settingsMap.store_phone || '+1 (800) 555-0199';
      const currency = settingsMap.currency || 'USD';
      const returnPolicy = settingsMap.return_policy || '30-day returns on unworn items with original tags and packaging.';
      const shippingPolicy = settingsMap.shipping_policy || 'Standard shipping takes 3-5 business days.';

      // 2. Categories list
      const categoryRows = await db
        .select({
          name: categories.name,
        })
        .from(categories)
        .where(eq(categories.status, 'active'))
        .limit(8);

      const categoryNames = categoryRows.map((c: any) => c.name).join(', ') || 'General Products';

      // 3. Products lookup
      let productRows: any[] = [];
      if (keywords.length > 0) {
        const keywordConditions = keywords.map((kw) =>
          or(
            like(products.name, `%${kw}%`),
            like(products.description, `%${kw}%`)
          )
        );

        productRows = await db
          .select({
            name: products.name,
            price: products.price,
            salePrice: products.salePrice,
            stockStatus: products.stockStatus,
            shortDescription: products.shortDescription,
          })
          .from(products)
          .where(or(...keywordConditions))
          .limit(5);
      }

      // If no keyword match or query was general, fetch top 5 catalog products
      if (productRows.length === 0) {
        productRows = await db
          .select({
            name: products.name,
            price: products.price,
            salePrice: products.salePrice,
            stockStatus: products.stockStatus,
            shortDescription: products.shortDescription,
          })
          .from(products)
          .where(eq(products.stockStatus, 'in_stock'))
          .limit(5);
      }

      const productLines = productRows.map((p: any) => {
        const effectivePrice = p.salePrice ?? p.price;
        const desc = p.shortDescription ? ` - ${p.shortDescription.slice(0, 60)}` : '';
        return `• ${p.name}: ${currency} ${effectivePrice} (${p.stockStatus.replace('_', ' ')})${desc}`;
      });

      // 4. Shipping zones + rates
      let shippingLines: string[] = [];
      try {
        const shippingRows = await db
          .select({
            name: shippingZones.name,
            rateType: shippingZones.rateType,
            rate: shippingZones.rate,
            freeShippingThreshold: shippingZones.freeShippingThreshold,
            deliveryTimeMin: shippingZones.deliveryTimeMin,
            deliveryTimeMax: shippingZones.deliveryTimeMax,
          })
          .from(shippingZones)
          .where(eq(shippingZones.isActive, true))
          .limit(4);

        shippingLines = shippingRows.map((s: any) => {
          const time = s.deliveryTimeMin && s.deliveryTimeMax ? ` (${s.deliveryTimeMin}-${s.deliveryTimeMax} days)` : '';
          const freeOver = s.freeShippingThreshold ? `, Free over ${currency} ${s.freeShippingThreshold}` : '';
          return `• ${s.name}: ${s.rate === 0 ? 'Free' : `${currency} ${s.rate}`}${freeOver}${time}`;
        });
      } catch {
        shippingLines = [`• Standard Delivery: ${shippingPolicy}`];
      }

      // 5. FAQs lookup
      let faqLines: string[] = [];
      try {
        const faqRows = await db
          .select({
            question: faqs.question,
            answer: faqs.answer,
          })
          .from(faqs)
          .where(eq(faqs.isActive, true))
          .limit(4);

        faqLines = faqRows.map((f: any) => `• Q: ${f.question}\n  A: ${f.answer.slice(0, 100)}`);
      } catch {
        faqLines = [];
      }

      // Assemble compact context (bounded to under 1500 tokens)
      const context = [
        `Store: ${storeName} (Currency: ${currency})`,
        `Contact Support: Email: ${storeEmail} | Phone: ${storePhone}`,
        `Return & Refund Policy: ${returnPolicy.slice(0, 200)}`,
        `Shipping:`,
        shippingLines.length > 0 ? shippingLines.join('\n') : `• ${shippingPolicy}`,
        `Categories Available: ${categoryNames}`,
        productLines.length > 0 ? `Featured / Matching Products:\n${productLines.join('\n')}` : '',
        faqLines.length > 0 ? `Frequently Asked Questions:\n${faqLines.join('\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      setCachedContext(cacheKey, context);
      return context;
    } catch {
      return `Store: Nasrify Demo Store\nSupport: support@apexstore.com\nPolicies: 30-day standard return on unused items.\nShipping: Standard delivery in 3-5 business days.`;
    }
  }
);
