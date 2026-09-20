import helloWorldManifest from "@/apps/hello-world/manifest.json";
import reviewsManifest from "@/apps/reviews/manifest.json";
import whatsappOrderManifest from "@/apps/whatsapp-order/manifest.json";
import wishlistManifest from "@/apps/wishlist/manifest.json";
import compareManifest from "@/apps/compare/manifest.json";
import bundlesManifest from "@/apps/bundles/manifest.json";
import orderTrackingManifest from "@/apps/order-tracking/manifest.json";
import broadcastManifest from "@/apps/broadcast/manifest.json";
import trustBadgesManifest from "@/apps/trust-badges/manifest.json";
import cookieConsentManifest from "@/apps/cookie-consent/manifest.json";
import digitalProductsManifest from "@/apps/digital-products/manifest.json";
import couponsManifest from "@/apps/coupons/manifest.json";
import productQaManifest from "@/apps/product-qa/manifest.json";
import aiReviewGeneratorManifest from "@/apps/ai-review-generator/manifest.json";
import { type AppManifest } from "@/types/apps";
import { validateManifest } from "./manifest";

/**
 * Static registry of app manifests loaded at build time.
 * Zero filesystem I/O at runtime for edge / Cloudflare Worker performance.
 */
const RAW_MANIFESTS: Record<string, unknown> = {
  "hello-world": helloWorldManifest,
  reviews: reviewsManifest,
  "whatsapp-order": whatsappOrderManifest,
  wishlist: wishlistManifest,
  compare: compareManifest,
  bundles: bundlesManifest,
  "order-tracking": orderTrackingManifest,
  broadcast: broadcastManifest,
  "trust-badges": trustBadgesManifest,
  "cookie-consent": cookieConsentManifest,
  "digital-products": digitalProductsManifest,
  coupons: couponsManifest,
  "product-qa": productQaManifest,
  "ai-review-generator": aiReviewGeneratorManifest,
};

const VALIDATED_MANIFESTS: Record<string, AppManifest> = {};

for (const [id, raw] of Object.entries(RAW_MANIFESTS)) {
  const validation = validateManifest(raw);
  if (validation.valid && validation.data) {
    VALIDATED_MANIFESTS[id] = validation.data;
  }
}

export function getAllManifests(): AppManifest[] {
  return Object.values(VALIDATED_MANIFESTS);
}

export function getManifest(appId: string): AppManifest | null {
  return VALIDATED_MANIFESTS[appId] || null;
}
