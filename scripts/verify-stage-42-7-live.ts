/**
 * Stage 42.7 Live Verification Script
 * Validates:
 * 1. D1 font tables & curated records count
 * 2. Storefront R2 font streaming endpoint /api/fonts/[...path]
 * 3. Cache headers (immutable, max-age=31536000) & Content-Type font/woff2
 * 4. Admin font listing API /api/admin/fonts with category/curated filter
 * 5. Admin curate toggle API /api/admin/fonts/curate
 * 6. Admin settings fonts page /admin/settings/fonts loads
 * 7. Storefront HTML embeds @font-face and <link rel="preload">
 * 8. Performance & font payload targets
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";
const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@apexstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  console.log("==================================================");
  console.log("     Stage 42.7 — Font System Live Verification   ");
  console.log("==================================================");
  console.log(`Store URL: ${STORE_URL}`);
  console.log(`Admin URL: ${ADMIN_URL}`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Authenticate Admin
  console.log("\n--- 1. Authenticating Admin Session ---");
  const loginRes = await fetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  assert(loginRes.status === 200, "Admin login successful (200 OK)");

  const setCookie = loginRes.headers.get("set-cookie");
  assert(Boolean(setCookie), "Admin auth session cookie received");
  const cookieHeader = setCookie?.split(";")[0] || "";

  const adminHeaders = {
    Cookie: cookieHeader,
    "Content-Type": "application/json",
  };

  // 2. Test Storefront Font Streaming Route
  console.log("\n--- 2. Storefront R2 Font Delivery ---");
  const fontUrl = `${STORE_URL}/api/fonts/inter/400-normal-latin.woff2`;
  const fontRes = await fetch(fontUrl);
  assert(fontRes.status === 200, `Font route returns 200 OK (${fontUrl})`);

  const contentType = fontRes.headers.get("content-type");
  assert(contentType === "font/woff2", `Content-Type is font/woff2 (got: ${contentType})`);

  const cacheControl = fontRes.headers.get("cache-control") || "";
  assert(
    cacheControl.includes("immutable") && cacheControl.includes("max-age=31536000"),
    `Cache-Control header has immutable long-cache (got: ${cacheControl})`
  );

  const fontBuffer = await fontRes.arrayBuffer();
  const fontBytes = fontBuffer.byteLength;
  console.log(`Inter 400 woff2 file size: ${(fontBytes / 1024).toFixed(1)} KB`);
  assert(fontBytes > 5000 && fontBytes < 100000, "Font payload size is within valid range (<100KB)");

  // Test another font (Playfair Display)
  const fontUrl2 = `${STORE_URL}/api/fonts/playfair-display/400-normal-latin.woff2`;
  const fontRes2 = await fetch(fontUrl2);
  assert(fontRes2.status === 200, `Playfair Display font route returns 200 OK (${fontUrl2})`);
  const fontBuffer2 = await fontRes2.arrayBuffer();
  console.log(`Playfair Display 400 woff2 file size: ${(fontBuffer2.byteLength / 1024).toFixed(1)} KB`);

  // 3. Test Admin Font Listing API
  console.log("\n--- 3. Admin Font Listing API (/api/admin/fonts) ---");
  const fontsRes = await fetch(`${ADMIN_URL}/api/admin/fonts?curated=1`, {
    headers: adminHeaders,
  });
  assert(fontsRes.status === 200, "Admin font API returns 200 OK");
  const fontsData = (await fontsRes.json()) as any;
  assert(Array.isArray(fontsData.fonts), "Response contains fonts array");
  console.log(`Curated fonts count returned: ${fontsData.fonts.length}`);
  assert(fontsData.fonts.length >= 20, "Curated fonts count >= 20");

  const interFont = fontsData.fonts.find((f: any) => f.slug === "inter");
  assert(Boolean(interFont), "Inter font found in curated list");
  assert(interFont?.isCurated === 1, "Inter isCurated flag is 1");

  // Filter test by category
  const serifRes = await fetch(`${ADMIN_URL}/api/admin/fonts?curated=1&category=serif`, {
    headers: adminHeaders,
  });
  const serifData = (await serifRes.json()) as any;
  const allSerif = serifData.fonts.every((f: any) => f.category === "serif");
  assert(allSerif && serifData.fonts.length > 0, "Category filter (serif) works accurately");

  // 4. Test Curate Toggle API
  console.log("\n--- 4. Font Curate Toggle API (/api/admin/fonts/curate) ---");
  const testFontId = "jetbrains-mono";
  // Toggle off
  const toggleOffRes = await fetch(`${ADMIN_URL}/api/admin/fonts/curate`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ fontId: testFontId, isCurated: false }),
  });
  if (toggleOffRes.status !== 200) {
    console.error("toggleOff failed with:", await toggleOffRes.clone().text());
  }
  assert(toggleOffRes.status === 200, "Curate toggle POST returns 200 OK");
  const toggleOffData = (await toggleOffRes.json()) as any;
  assert(toggleOffData.isCurated === false, "Font isCurated updated to false");

  // Toggle back on
  const toggleOnRes = await fetch(`${ADMIN_URL}/api/admin/fonts/curate`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ fontId: testFontId, isCurated: true }),
  });
  const toggleOnData = (await toggleOnRes.json()) as any;
  assert(toggleOnData.isCurated === true, "Font isCurated toggled back to true");

  // 5. Test Admin Settings Fonts Page
  console.log("\n--- 5. Admin Settings Fonts UI (/admin/settings/fonts) ---");
  const pageRes = await fetch(`${ADMIN_URL}/admin/settings/fonts`, {
    headers: adminHeaders,
  });
  assert(pageRes.status === 200, "Font manager page returns 200 OK");
  const pageHtml = await pageRes.text();
  assert(pageHtml.includes("Font System") || pageHtml.includes("Typography"), "Page contains font manager heading");

  // 6. Test Storefront HTML Injection
  console.log("\n--- 6. Storefront HTML Font Injection ---");
  const storeHomeRes = await fetch(`${STORE_URL}/`);
  assert(storeHomeRes.status === 200, "Storefront home returns 200 OK");
  const storeHtml = await storeHomeRes.text();

  assert(storeHtml.includes('id="nasrify-fonts-css"'), "Storefront includes nasrify-fonts-css style tag");
  assert(storeHtml.includes("@font-face"), "Storefront includes @font-face declaration");
  assert(storeHtml.includes("font-display: swap"), "Storefront @font-face includes font-display: swap");
  assert(storeHtml.includes('rel="preload"') && storeHtml.includes('as="font"'), "Storefront includes font preload tags");

  // 7. Storefront Performance / Latency Check
  console.log("\n--- 7. Storefront Latency & Performance Check ---");
  const startTime = Date.now();
  const perfRes = await fetch(`${STORE_URL}/`);
  const latency = Date.now() - startTime;
  console.log(`Storefront HTML response time: ${latency}ms`);
  assert(perfRes.status === 200, "Storefront responds 200 OK");

  console.log("\n==================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
