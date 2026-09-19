import helloWorldManifest from "@/apps/hello-world/manifest.json";
import reviewsManifest from "@/apps/reviews/manifest.json";
import whatsappOrderManifest from "@/apps/whatsapp-order/manifest.json";
import wishlistManifest from "@/apps/wishlist/manifest.json";
import compareManifest from "@/apps/compare/manifest.json";
import bundlesManifest from "@/apps/bundles/manifest.json";
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
};

const VALIDATED_MANIFESTS: Record<string, AppManifest> = {};

for (const [id, raw] of Object.entries(RAW_MANIFESTS)) {
  const validation = validateManifest(raw);
  if (validation.valid && validation.data) {
    VALIDATED_MANIFESTS[id] = validation.data;
  } else {
    console.warn(`[AppsRegistry] Invalid manifest for app "${id}":`, validation.errors);
  }
}

export function getAllManifests(): AppManifest[] {
  return Object.values(VALIDATED_MANIFESTS);
}

export function getManifest(appId: string): AppManifest | null {
  return VALIDATED_MANIFESTS[appId] || null;
}
