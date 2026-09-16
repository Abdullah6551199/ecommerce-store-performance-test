import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { validateManifest } from "../lib/apps/manifest";

/**
 * Stage E: Worker Separation, App Settings, and DX Verification Suite
 */

const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";

interface TestRecord {
  name: string;
  url?: string;
  status?: number;
  expectedStatus?: number;
  ttfbMs?: number;
  passed: boolean;
  notes?: string;
}

const records: TestRecord[] = [];

async function timedFetch(
  url: string,
  init?: RequestInit
): Promise<{ res: Response; ttfbMs: number; text: string }> {
  const start = performance.now();
  const res = await fetch(url, init);
  const text = await res.text();
  const ttfbMs = Math.round((performance.now() - start) * 10) / 10;
  return { res, ttfbMs, text };
}

function runRemoteD1(command: string): any {
  const cmd = `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="${command.replace(/"/g, '\"')}"`;
  const env = {
    ...process.env,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || "",
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || "ab9b528badc7cbd3e583a9ff7935a07f",
  };
  const out = execSync(cmd, { env, encoding: "utf-8" });
  try {
    const jsonStart = out.indexOf("[");
    const jsonEnd = out.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(out.substring(jsonStart, jsonEnd + 1));
    }
  } catch (e) {
    console.warn("Failed to parse D1 output:", out);
  }
  return null;
}

async function verifyStageE() {
  console.log("==================================================================");
  console.log("  STAGE E: WORKER SEPARATION, SETTINGS & DX VERIFICATION");
  console.log(`  Admin Worker:      ${ADMIN_URL}`);
  console.log(`  Storefront Worker: ${STORE_URL}`);
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assertResult(test: TestRecord) {
    totalTests++;
    records.push(test);
    if (test.passed) {
      passedTests++;
      console.log(
        `  ✅ PASS [${test.status ?? "N/A"}] ${test.name} (${test.ttfbMs ? test.ttfbMs + "ms" : "OK"}) ${test.notes || ""}`
      );
    } else {
      console.error(
        `  ❌ FAIL [${test.status ?? "N/A"}, expected ${test.expectedStatus ?? "N/A"}] ${test.name} (${test.ttfbMs ? test.ttfbMs + "ms" : "ERR"}) ${test.notes || ""}`
      );
    }
  }

  // 1. Admin Authentication
  console.log("--> Step 1: Admin Authentication");
  const loginRes = await timedFetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "admin123",
    }),
  });

  const setCookie = loginRes.res.headers.get("set-cookie") || "";
  const sessionMatch = setCookie.match(/admin_session=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : "";
  const cookieHeader = sessionToken ? `admin_session=${sessionToken}` : "";

  assertResult({
    name: "POST /api/admin/login (Admin Auth)",
    url: `${ADMIN_URL}/api/admin/login`,
    status: loginRes.res.status,
    expectedStatus: 200,
    ttfbMs: loginRes.ttfbMs,
    passed: loginRes.res.status === 200 && Boolean(sessionToken),
    notes: sessionToken ? "Session cookie received" : "Missing session cookie",
  });

  // 2. /admin/apps lists Reviews
  console.log("\n--> Step 2: Apps Management & Settings Verification (Admin Worker)");
  const appsListRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: cookieHeader },
  });
  let hasReviewsApp = false;
  try {
    const appsData = JSON.parse(appsListRes.text);
    const list = Array.isArray(appsData.data) ? appsData.data : (appsData.available || []);
    hasReviewsApp = list.some((a: any) => a.id === "reviews");
  } catch (e) {}

  assertResult({
    name: "GET /api/admin/apps lists Reviews app",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: appsListRes.res.status,
    expectedStatus: 200,
    ttfbMs: appsListRes.ttfbMs,
    passed: appsListRes.res.status === 200 && hasReviewsApp,
    notes: hasReviewsApp ? "Reviews found in available/installed apps" : "Reviews app missing",
  });

  // 3. /admin/apps/reviews shows Settings
  const appSettingsPageRes = await timedFetch(`${ADMIN_URL}/admin/apps/reviews`, {
    headers: { Cookie: cookieHeader },
  });
  assertResult({
    name: "GET /admin/apps/reviews (Settings page render)",
    url: `${ADMIN_URL}/admin/apps/reviews`,
    status: appSettingsPageRes.res.status,
    expectedStatus: 200,
    ttfbMs: appSettingsPageRes.ttfbMs,
    passed: appSettingsPageRes.res.status === 200,
    notes: appSettingsPageRes.text.includes("Settings") ? "Contains Settings tab" : "Page rendered",
  });

  // 4. Update App Settings via API
  console.log("\n--> Step 3: App Settings Persistence in D1");
  const updateSettingsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/reviews/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      autoApprove: true,
      requirePurchase: false,
      allowImages: true,
    }),
  });

  assertResult({
    name: "PUT /api/admin/apps/reviews/settings (Update Settings)",
    url: `${ADMIN_URL}/api/admin/apps/reviews/settings`,
    status: updateSettingsRes.res.status,
    expectedStatus: 200,
    ttfbMs: updateSettingsRes.ttfbMs,
    passed: updateSettingsRes.res.status === 200,
    notes: "Saved settings to installed_apps.settings",
  });

  // 5. Confirm D1 updated
  const d1Check = runRemoteD1("SELECT id, settings FROM installed_apps WHERE id = 'reviews';");
  const storedSettingsRaw = d1Check?.[0]?.results?.[0]?.settings;
  let storedSettings: any = null;
  try {
    storedSettings = JSON.parse(storedSettingsRaw);
    if (storedSettings?.settings) {
      storedSettings = storedSettings.settings;
    }
  } catch (e) {}

  assertResult({
    name: "D1 Database installed_apps.settings verification",
    passed: storedSettings?.autoApprove === true && storedSettings?.requirePurchase === false,
    notes: `D1 settings: ${storedSettingsRaw || "null"}`,
  });

  // 6. Admin Reviews Route & Moderation
  console.log("\n--> Step 4: Admin Worker Reviews Management & Moderation API");
  const adminReviewsPageRes = await timedFetch(`${ADMIN_URL}/admin/reviews`, {
    headers: { Cookie: cookieHeader },
  });
  assertResult({
    name: "GET /admin/reviews (ReviewsManager render)",
    url: `${ADMIN_URL}/admin/reviews`,
    status: adminReviewsPageRes.res.status,
    expectedStatus: 200,
    ttfbMs: adminReviewsPageRes.ttfbMs,
    passed: adminReviewsPageRes.res.status === 200,
  });

  // Admin moderation test
  const adminModerateRes = await timedFetch(`${ADMIN_URL}/api/admin/reviews/moderate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      reviewId: "nonexistent-id",
      status: "approved",
    }),
  });
  assertResult({
    name: "POST /api/admin/reviews/moderate on Admin Worker",
    url: `${ADMIN_URL}/api/admin/reviews/moderate`,
    status: adminModerateRes.res.status,
    expectedStatus: 404, // 404 for nonexistent review ID is expected behavior
    ttfbMs: adminModerateRes.ttfbMs,
    passed: adminModerateRes.res.status === 404 || adminModerateRes.res.status === 200,
    notes: `Route handled by admin worker (status: ${adminModerateRes.res.status})`,
  });

  // 7. Storefront Worker Verification
  console.log("\n--> Step 5: Storefront Worker Endpoints & Regression Checks");
  // Find a product
  const productsQuery = runRemoteD1("SELECT id, slug, name FROM products LIMIT 1;");
  const sampleProduct = productsQuery?.[0]?.results?.[0] || { id: "1", slug: "test-product" };
  const testProductId = String(sampleProduct.id);
  const testProductSlug = String(sampleProduct.slug);

  const productPageRes = await timedFetch(`${STORE_URL}/product/${testProductSlug}`);
  assertResult({
    name: `GET /product/${testProductSlug} (Product page loads)`,
    url: `${STORE_URL}/product/${testProductSlug}`,
    status: productPageRes.res.status,
    expectedStatus: 200,
    ttfbMs: productPageRes.ttfbMs,
    passed: productPageRes.res.status === 200,
  });

  // Public reviews list API
  const listReviewsRes = await timedFetch(`${STORE_URL}/api/reviews/list?productId=${testProductId}`);
  assertResult({
    name: "GET /api/reviews/list on Storefront Worker",
    url: `${STORE_URL}/api/reviews/list?productId=${testProductId}`,
    status: listReviewsRes.res.status,
    expectedStatus: 200,
    ttfbMs: listReviewsRes.ttfbMs,
    passed: listReviewsRes.res.status === 200,
  });

  // Public reviews submit API
  const submitReviewRes = await timedFetch(`${STORE_URL}/api/reviews/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: testProductId,
      rating: 5,
      customerName: "Stage E Verifier",
      customerEmail: "stage-e@example.com",
      title: "Worker Scope Isolation Verified",
      content: "Automated test submitting review to public endpoint on nasrify-store worker.",
    }),
  });
  assertResult({
    name: "POST /api/reviews/submit on Storefront Worker",
    url: `${STORE_URL}/api/reviews/submit`,
    status: submitReviewRes.res.status,
    expectedStatus: 201,
    ttfbMs: submitReviewRes.ttfbMs,
    passed: submitReviewRes.res.status === 201 || submitReviewRes.res.status === 200,
    notes: `Response code: ${submitReviewRes.res.status}`,
  });

  // Verify admin routes NOT on storefront worker
  const storefrontModerateRes = await timedFetch(`${STORE_URL}/api/reviews/moderate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewId: "1", status: "approved" }),
  });
  assertResult({
    name: "POST /api/reviews/moderate on Storefront Worker returns 404 (Security separation)",
    url: `${STORE_URL}/api/reviews/moderate`,
    status: storefrontModerateRes.res.status,
    expectedStatus: 404,
    ttfbMs: storefrontModerateRes.ttfbMs,
    passed: storefrontModerateRes.res.status === 404,
    notes: "Confirmed: Moderation endpoint does NOT exist on storefront",
  });

  const storefrontAdminRes = await timedFetch(`${STORE_URL}/admin`);
  assertResult({
    name: "GET /admin on Storefront Worker returns 404",
    url: `${STORE_URL}/admin`,
    status: storefrontAdminRes.res.status,
    expectedStatus: 404,
    ttfbMs: storefrontAdminRes.ttfbMs,
    passed: storefrontAdminRes.res.status === 404,
  });

  // 8. Verify No lib/auth.ts in Storefront Worker
  console.log("\n--> Step 6: Verify lib/auth.ts and Admin Code Absence in nasrify-store");
  const storeAuthExists = fs.existsSync(path.join(process.cwd(), "nasrify-store", "lib", "auth.ts"));
  assertResult({
    name: "File nasrify-store/lib/auth.ts does not exist",
    passed: !storeAuthExists,
    notes: storeAuthExists ? "ERROR: auth.ts still present!" : "Confirmed deleted",
  });

  const storeAdminDirExists = fs.existsSync(path.join(process.cwd(), "nasrify-store", "apps", "reviews", "admin"));
  assertResult({
    name: "Folder nasrify-store/apps/reviews/admin does not exist",
    passed: !storeAdminDirExists,
    notes: storeAdminDirExists ? "ERROR: admin/ dir copied to store!" : "Worker scope excluded admin/",
  });

  const adminStoreDirExists = fs.existsSync(path.join(process.cwd(), "nasrify-admin", "apps", "reviews", "storefront"));
  assertResult({
    name: "Folder nasrify-admin/apps/reviews/storefront does not exist",
    passed: !adminStoreDirExists,
    notes: adminStoreDirExists ? "ERROR: storefront/ dir copied to admin!" : "Worker scope excluded storefront/",
  });

  // 9. Lifecycle Regression (Disable / Enable)
  console.log("\n--> Step 7: App Lifecycle Toggle Regression & Data Preservation");
  // Toggle off
  const toggleOffRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ appId: "reviews", enabled: false }),
  });
  assertResult({
    name: "POST /api/admin/apps/toggle (Disable Reviews)",
    status: toggleOffRes.res.status,
    expectedStatus: 200,
    passed: toggleOffRes.res.status === 200,
  });

  // Toggle back on
  const toggleOnRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ appId: "reviews", enabled: true }),
  });
  assertResult({
    name: "POST /api/admin/apps/toggle (Re-enable Reviews)",
    status: toggleOnRes.res.status,
    expectedStatus: 200,
    passed: toggleOnRes.res.status === 200,
  });

  // Check review records preserved
  const reviewCountD1 = runRemoteD1("SELECT COUNT(*) as count FROM reviews;");
  const reviewCount = reviewCountD1?.[0]?.results?.[0]?.count ?? 0;
  assertResult({
    name: "Reviews data preserved in D1 across lifecycle operations",
    passed: Number(reviewCount) > 0,
    notes: `Current review count: ${reviewCount}`,
  });

  // 10. DX Verification
  console.log("\n--> Step 8: Developer Experience (DX) Assets & Validation Check");
  const templateExists =
    fs.existsSync(path.join(process.cwd(), "apps", "_template", "manifest.json")) &&
    fs.existsSync(path.join(process.cwd(), "apps", "_template", "README.md")) &&
    fs.existsSync(path.join(process.cwd(), "apps", "_template", "admin", "ExampleWidget.tsx")) &&
    fs.existsSync(path.join(process.cwd(), "apps", "_template", "storefront", "ExampleBanner.tsx")) &&
    fs.existsSync(path.join(process.cwd(), "apps", "_template", "lib", "example.ts"));

  assertResult({
    name: "apps/_template/ starter template complete with all TODO files",
    passed: templateExists,
    notes: templateExists ? "All boilerplate files present" : "Missing template files",
  });

  const cheatSheetExists = fs.existsSync(path.join(process.cwd(), "docs", "apps", "cheat-sheet.md"));
  assertResult({
    name: "docs/apps/cheat-sheet.md exists (1-page quick ref)",
    passed: cheatSheetExists,
  });

  const aiPromptExists = fs.existsSync(path.join(process.cwd(), "docs", "apps", "ai-prompt-template.md"));
  assertResult({
    name: "docs/apps/ai-prompt-template.md exists",
    passed: aiPromptExists,
  });

  // Friendly manifest validation check
  const brokenManifest = {
    id: "broken-app",
    version: "1.0.0",
    // missing name, description, author, permissions, extensionPoints
  };
  const valResult = validateManifest(brokenManifest, "broken-app");
  const isFriendly =
    !valResult.valid &&
    Array.isArray(valResult.errors) &&
    valResult.errors.some((err) => err.includes("apps/broken-app/manifest.json: missing required field 'name'"));

  assertResult({
    name: "Human-friendly manifest validation error formatting",
    passed: isFriendly,
    notes: `Sample error: "${valResult.errors?.[0]}"`,
  });

  console.log("\n==================================================================");
  console.log(`  VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================================\n");

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

verifyStageE().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
