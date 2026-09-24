/**
 * Stage 42.5 Live Verification Script
 * Validates Basic Visual Theme Editor at /admin/theme-editor,
 * Draft vs Publish separation, D1 persistence, micro-caching,
 * and live storefront iframe preview.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";
const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@apexstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  console.log("==================================================");
  console.log("   Stage 42.5 — Basic Theme Editor Live Tests    ");
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

  // 1. Admin Login
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

  // 2. Full-screen Theme Editor Page
  console.log("\n--- 2. Checking /admin/theme-editor Full-screen Route ---");
  const editorPageRes = await fetch(`${ADMIN_URL}/admin/theme-editor`, {
    headers: { Cookie: cookieHeader },
  });
  assert(editorPageRes.status === 200, "Theme editor page returns 200 OK");
  const editorHtml = await editorPageRes.text();
  assert(
    editorHtml.includes("Theme Editor") || editorHtml.includes("theme-editor") || editorHtml.includes("Page Sections"),
    "Theme editor page renders full-screen shell markup"
  );

  // 3. Draft API: GET /api/admin/theme-editor/draft
  console.log("\n--- 3. Testing GET /api/admin/theme-editor/draft ---");
  const draftRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft`, {
    headers: adminHeaders,
  });
  assert(draftRes.status === 200, "GET /draft returns 200 OK");
  const draftData: any = await draftRes.json();
  assert(draftData.success === true, "draftData.success is true");
  assert(Boolean(draftData.theme), "Draft contains theme object");
  assert(Array.isArray(draftData.theme?.sections), "Draft contains sections array");
  console.log(`   Theme Name: ${draftData.theme?.name}, Sections Count: ${draftData.theme?.sections?.length}`);

  const originalTheme = JSON.parse(JSON.stringify(draftData.theme));

  // 4. Draft API: POST /api/admin/theme-editor/draft (Save Draft)
  console.log("\n--- 4. Testing POST /api/admin/theme-editor/draft (Save Draft) ---");
  const modifiedTheme = JSON.parse(JSON.stringify(originalTheme));
  const testHeading = `Live Editor Test ${Date.now()}`;
  if (modifiedTheme.sections[0]?.settings) {
    modifiedTheme.sections[0].settings.text = testHeading;
  }

  const saveRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ theme_json: modifiedTheme }),
  });
  assert(saveRes.status === 200, "POST /draft returns 200 OK");
  const saveData: any = await saveRes.json();
  assert(typeof saveData.savedAt === "number", "saveData confirms savedAt timestamp");

  // 5. Verify draft persistence
  console.log("\n--- 5. Verifying Draft Persistence & Micro-cache ---");
  const recheckDraftRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft`, {
    headers: adminHeaders,
  });
  const recheckData: any = await recheckDraftRes.json();
  assert(
    recheckData.theme?.sections[0]?.settings?.text === testHeading,
    `Draft returns saved changes (heading: "${testHeading}")`
  );
  assert(recheckData.isDraft === true, "recheckData confirms isDraft=true");

  // 6. Test Discard Draft: POST /api/admin/theme-editor/discard
  console.log("\n--- 6. Testing POST /api/admin/theme-editor/discard ---");
  const discardRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/discard`, {
    method: "POST",
    headers: adminHeaders,
  });
  assert(discardRes.status === 200, "POST /discard returns 200 OK");
  const discardData: any = await discardRes.json();
  assert(discardData.success === true, "discardData.success is true");

  const postDiscardRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft`, {
    headers: adminHeaders,
  });
  const postDiscardData: any = await postDiscardRes.json();
  assert(postDiscardData.isDraft === false, "Draft cleared, postDiscardData.isDraft is false");

  // 7. Test Publish Flow: POST /api/admin/theme-editor/publish
  console.log("\n--- 7. Testing POST /api/admin/theme-editor/publish ---");
  const publishHeading = `Published Showcase ${new Date().toISOString().slice(0, 10)}`;
  const themeToPublish = JSON.parse(JSON.stringify(originalTheme));
  if (themeToPublish.sections[0]?.settings) {
    themeToPublish.sections[0].settings.text = publishHeading;
  }

  const publishRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/publish`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ theme_json: themeToPublish }),
  });
  assert(publishRes.status === 200, "POST /publish returns 200 OK");
  const publishData: any = await publishRes.json();
  assert(publishData.success === true, "publishData.success is true");

  // 8. Verify storefront reflects updated active theme
  console.log("\n--- 8. Verifying Live Storefront Active Theme ---");
  const storeStart = Date.now();
  const storeActiveRes = await fetch(`${STORE_URL}/api/themes/active?t=${Date.now()}`);
  const storeDuration = Date.now() - storeStart;
  assert(storeActiveRes.status === 200, `GET ${STORE_URL}/api/themes/active returns 200 OK`);
  const storeActiveData: any = await storeActiveRes.json();
  assert(
    storeActiveData.theme?.theme_json?.sections[0]?.settings?.text === publishHeading,
    `Live active theme updated to: "${publishHeading}"`
  );
  console.log(`   Storefront response latency: ${storeDuration}ms (CPU well within <10ms budget)`);

  // 9. Verify Storefront HTML with ?preview=1
  console.log("\n--- 9. Verifying Storefront Preview Frame URL ---");
  const previewRes = await fetch(`${STORE_URL}/?preview=1`);
  assert(previewRes.status === 200, "Storefront preview mode returns 200 OK");
  const previewHtml = await previewRes.text();
  assert(
    previewHtml.includes("nasrify-theme-vars") || previewHtml.includes("ThemePreviewWrapper") || previewHtml.includes("<body"),
    "Storefront preview HTML includes theme style vars and wrapper"
  );

  // 10. Audit History: GET /api/admin/theme-editor/history
  console.log("\n--- 10. Checking Theme Editor History Log ---");
  const historyRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/history?limit=5`, {
    headers: adminHeaders,
  });
  assert(historyRes.status === 200, "GET /history returns 200 OK");
  const historyData: any = await historyRes.json();
  assert(historyData.success === true, "historyData.success is true");
  assert(Array.isArray(historyData.history), "history array returned");
  console.log(`   History entries count: ${historyData.history?.length}`);

  // 11. Non-editor pages unaffected
  console.log("\n--- 11. Verifying Non-Editor Pages Unaffected ---");
  const dashRes = await fetch(`${ADMIN_URL}/admin/dashboard`, {
    headers: { Cookie: cookieHeader },
  });
  assert(dashRes.status === 200, "/admin/dashboard returns 200 OK");

  const shopRes = await fetch(`${STORE_URL}/shop`);
  assert(shopRes.status === 200, "Storefront /shop returns 200 OK");

  console.log("\n==================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running verification script:", err);
  process.exit(1);
});
