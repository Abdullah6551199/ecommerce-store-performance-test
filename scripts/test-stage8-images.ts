import { normalizeImageUrl } from "../lib/utils";
import { getPublicUrl } from "../lib/r2";

console.log("=== Testing Stage 8 Image Fixes ===");

// Test 1: normalizeImageUrl with various formats
const legacyAssetsUrl = "https://assets.ecommerce-store.workers.dev/products/7b35c240-30a3-4a13-bb37-0d01045853a0.png";
const normalizedLegacy = normalizeImageUrl(legacyAssetsUrl);
console.log("1. Legacy assets URL normalization:");
console.log("   Input:", legacyAssetsUrl);
console.log("   Output:", normalizedLegacy);
if (normalizedLegacy === "/api/media/products/7b35c240-30a3-4a13-bb37-0d01045853a0.png") {
  console.log("   ✅ Legacy URL successfully converted to /api/media/");
} else {
  console.error("   ❌ Failed to normalize legacy URL");
  process.exit(1);
}

// Test 2: R2 S3-compatible raw URL
const rawR2Url = "https://ab9b528badc7cbd3e583a9ff7935a07f.r2.cloudflarestorage.com/ecommerce-store-assets/products/demo.jpg";
const normalizedR2 = normalizeImageUrl(rawR2Url);
console.log("\n2. Raw R2 URL normalization:");
console.log("   Input:", rawR2Url);
console.log("   Output:", normalizedR2);
if (normalizedR2 === "/api/media/ecommerce-store-assets/products/demo.jpg") {
  console.log("   ✅ Raw R2 URL successfully converted to /api/media/");
} else {
  console.error("   ❌ Failed to normalize raw R2 URL");
  process.exit(1);
}

// Test 3: Unsplash optimization
const unsplashUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff";
const normalizedUnsplash = normalizeImageUrl(unsplashUrl);
console.log("\n3. Unsplash URL optimization:");
console.log("   Input:", unsplashUrl);
console.log("   Output:", normalizedUnsplash);
if (normalizedUnsplash.includes("auto=format&fit=crop&w=800&q=80")) {
  console.log("   ✅ Unsplash URL enriched with responsive formatting params");
} else {
  console.error("   ❌ Failed to enrich Unsplash URL");
  process.exit(1);
}

// Test 4: getPublicUrl
const generatedUrl = getPublicUrl("products/test-image.png");
console.log("\n4. getPublicUrl generation:");
console.log("   Output:", generatedUrl);
if (generatedUrl === "/api/media/products/test-image.png") {
  console.log("   ✅ getPublicUrl correctly generates relative /api/media path");
} else {
  console.error("   ❌ getPublicUrl failed:", generatedUrl);
  process.exit(1);
}

// Test 5: Empty/Null handling
const emptyTest = normalizeImageUrl(null);
if (emptyTest === "") {
  console.log("\n5. Null/empty safe fallback: ✅");
} else {
  console.error("   ❌ Failed on null/empty URL");
  process.exit(1);
}

console.log("\n🎉 ALL IMAGE NORMALIZATION TESTS PASSED!");
