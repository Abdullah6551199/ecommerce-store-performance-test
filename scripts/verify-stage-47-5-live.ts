/**
 * Verification Script for Stage 47.5
 */
const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";
const CACHE_SECRET = "8b051f18ed04fdbfc3aa401da65480ff4cb3bb6d6d84b553be03a58e2d46e273";

async function loginAdmin() {
  const res = await fetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@apexstore.com", password: "admin123" }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error("No cookie received from login");
  return setCookie.split(";")[0];
}

async function run() {
  console.log("=== STAGE 47.5 LIVE VERIFICATION ===");
  const cookie = await loginAdmin();
  console.log("1. Admin Login: SUCCESS");

  // A. Check draft load
  const draftRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft?page=homepage`, {
    headers: { Cookie: cookie },
  });
  console.log("2. GET /api/admin/theme-editor/draft (homepage):", draftRes.status);
  const draftData = await draftRes.json();
  console.log("   - Theme name:", draftData.theme?.name);
  console.log("   - Sections count:", draftData.theme?.sections?.length);

  // B. Save a draft test with updated Hero heading
  const testHeading = `Stage 47.5 Live Verified Heading - ${Date.now()}`;
  const themeToSave = JSON.parse(JSON.stringify(draftData.theme));
  const heroSec = themeToSave.sections.find((s: any) => s.type === "hero");
  if (heroSec) {
    heroSec.settings = heroSec.settings || {};
    heroSec.settings.heading = testHeading;
    heroSec.settings._components = heroSec.settings._components || {};
    heroSec.settings._components.heading = {
      type: "heading",
      settings: { text: testHeading },
    };
  }

  const saveRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft?page=homepage`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      page_type: "homepage",
      theme_json: themeToSave,
    }),
  });
  console.log("3. POST /api/admin/theme-editor/draft (save):", saveRes.status);

  // C. Publish the draft
  const pubRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      page_type: "homepage",
      theme_json: themeToSave,
    }),
  });
  console.log("4. POST /api/admin/theme-editor/publish:", pubRes.status);

  // D. Invalidate storefront cache
  const invRes = await fetch(`${STORE_URL}/api/cache/invalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cache-secret": CACHE_SECRET,
    },
    body: JSON.stringify({ target: "all" }),
  });
  console.log("5. Invalidate Storefront Cache:", invRes.status);

  // E. Check Storefront HTML
  const start = Date.now();
  const storeRes = await fetch(`${STORE_URL}/?t=${Date.now()}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  const duration = Date.now() - start;
  const html = await storeRes.text();
  console.log("6. GET Storefront Homepage Status:", storeRes.status, `(${duration}ms)`);
  console.log("   - Contains test heading?", html.includes(testHeading));
  console.log("   - Word animation observer present?", html.includes("anim-") || html.includes("nasrify-word-anim-keyframes") || html.includes("ThemeAnimationObserver") || html.includes("anim-bounce"));

  // F. Check Storefront Preview URL
  const previewRes = await fetch(`${STORE_URL}/?preview=1&page=homepage`, {
    headers: { "Cache-Control": "no-cache" },
  });
  const previewHtml = await previewRes.text();
  console.log("7. GET Storefront ?preview=1 Status:", previewRes.status);
  console.log("   - Cache Status Header:", previewRes.headers.get("x-cache-status"));
  console.log("   - Contains test heading?", previewHtml.includes(testHeading));

  // G. Multi-page draft test (product page)
  const productDraftRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft?page=product`, {
    headers: { Cookie: cookie },
  });
  console.log("8. GET /api/admin/theme-editor/draft (product page):", productDraftRes.status);
  const prodDraftData = await productDraftRes.json();
  console.log("   - Product sections count:", prodDraftData.theme?.sections?.length);

  console.log("\n=== ALL LIVE VERIFICATION CHECKS COMPLETE ===");
}

run().catch(console.error);
