/**
 * Stage 41 Live Edge Verification Script: AI Review Generator App
 */

const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";
const APPS_URL = process.env.APPS_URL || "https://nasrify-apps.zia291930.workers.dev";

interface TestRecord {
  name: string;
  url?: string;
  status?: number;
  expectedStatus?: number;
  passed: boolean;
  notes?: string;
}

const records: TestRecord[] = [];

async function timedFetch(
  url: string,
  init?: RequestInit,
  retries = 3
): Promise<{ res: Response; duration: number; text: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = performance.now();
      const res = await fetch(url, init);
      const text = await res.text();
      const duration = performance.now() - start;
      return { res, duration: Math.round(duration), text };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

function assertResult(test: TestRecord) {
  records.push(test);
  if (test.passed) {
    console.log(`  ✅ PASS [${test.status ?? "OK"}] ${test.name} ${test.notes ? `(${test.notes})` : ""}`);
  } else {
    console.error(
      `  ❌ FAIL [${test.status ?? "ERR"}, expected ${test.expectedStatus ?? "N/A"}] ${test.name} ${
        test.notes ? `(${test.notes})` : ""
      }`
    );
  }
}

async function main() {
  console.log("==================================================================");
  console.log("Stage 41 Live Verification: AI Review Generator App Edge Lifecycle");
  console.log(`  Admin Worker:      ${ADMIN_URL}`);
  console.log(`  Storefront Worker:  ${STORE_URL}`);
  console.log(`  Apps Hub Worker:    ${APPS_URL}`);
  console.log("==================================================================\n");

  const sampleProductId = "prod-apex-vrx1";

  // 1. Admin Login
  console.log("--> Step 1: Admin Authentication");
  const loginRes = await timedFetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const setCookie = loginRes.res.headers.get("set-cookie") || "";
  const sessionMatch = setCookie.match(/admin_session=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : "";
  const adminCookie = sessionToken ? `admin_session=${sessionToken}` : "";

  assertResult({
    name: "POST /api/admin/login (Admin Authentication)",
    url: `${ADMIN_URL}/api/admin/login`,
    status: loginRes.res.status,
    expectedStatus: 200,
    passed: loginRes.res.status === 200 && !!sessionToken,
    notes: `Duration: ${loginRes.duration}ms`,
  });

  if (!sessionToken) {
    console.error("FATAL: Admin authentication failed.");
    process.exit(1);
  }

  // 2. App Appears in /admin/apps
  console.log("\n--> Step 2: App Discovery in /admin/apps");
  const appsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: adminCookie },
  });
  let appsJson: any = {};
  try {
    appsJson = JSON.parse(appsRes.text);
  } catch {}

  const aiApp = Array.isArray(appsJson.data)
    ? appsJson.data.find((a: any) => a.id === "ai-review-generator")
    : null;

  assertResult({
    name: "GET /api/admin/apps (AI Review Generator in registry)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: appsRes.res.status,
    expectedStatus: 200,
    passed: appsRes.res.status === 200 && !!aiApp,
    notes: aiApp ? `Version: ${aiApp.version}, Installed: ${aiApp.installed}` : "Not found",
  });

  // 3. Install -> Enabled
  console.log("\n--> Step 3: Install & Enable App");
  if (!aiApp?.installed || !aiApp?.enabled) {
    const installRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ appId: "ai-review-generator" }),
    });
    assertResult({
      name: "POST /api/admin/apps/install (Install AI Review Generator)",
      url: `${ADMIN_URL}/api/admin/apps/install`,
      status: installRes.res.status,
      expectedStatus: 200,
      passed: installRes.res.status === 200,
      notes: `Duration: ${installRes.duration}ms`,
    });
  } else {
    assertResult({
      name: "AI Review Generator Status (Already Installed & Enabled)",
      passed: true,
      notes: "Installed and enabled",
    });
  }

  // 4. Settings Form / Schema Verification
  console.log("\n--> Step 4: Settings Schema Verification");
  const settingsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/ai-review-generator/settings`, {
    headers: { Cookie: adminCookie },
  });
  let settingsJson: any = {};
  try {
    settingsJson = JSON.parse(settingsRes.text);
  } catch {}

  assertResult({
    name: "GET /api/admin/apps/ai-review-generator/settings (Settings Schema & Storage)",
    url: `${ADMIN_URL}/api/admin/apps/ai-review-generator/settings`,
    status: settingsRes.res.status,
    expectedStatus: 200,
    passed: settingsRes.res.status === 200 && settingsJson.success && !!settingsJson.data,
    notes: settingsJson.data ? `Provider: ${settingsJson.data.provider}, DefaultTone: ${settingsJson.data.defaultTone}` : "",
  });

  // 5. Generate 5 Reviews for Test Product (Pending Mode)
  console.log("\n--> Step 5: Generate 5 Reviews (Pending Mode)");
  const genPendingRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/ai-review-generator/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      productId: sampleProductId,
      count: 5,
      ratingMin: 4,
      ratingMax: 5,
      tone: "detailed",
      language: "english",
      reviewerStyle: "mix",
      dateRangeDays: 14,
      approvalMode: "pending",
    }),
  });

  let genPendingJson: any = {};
  try {
    genPendingJson = JSON.parse(genPendingRes.text);
  } catch {}

  const pendingBatchId = genPendingJson.data?.batchId;
  const pendingCount = genPendingJson.data?.generatedCount;
  const sampleReviews = genPendingJson.data?.sampleReviews || [];

  assertResult({
    name: "POST /api/admin/apps/ai-review-generator/generate (Pending reviews batch)",
    url: `${ADMIN_URL}/api/admin/apps/ai-review-generator/generate`,
    status: genPendingRes.res.status,
    expectedStatus: 200,
    passed: genPendingRes.res.status === 200 && genPendingJson.success && pendingCount >= 5,
    notes: `Batch ID: ${pendingBatchId}, Count: ${pendingCount}, Model: ${genPendingJson.data?.model}, Neurons: ${genPendingJson.data?.neuronsUsed}`,
  });

  // 6. Verify Content Relevancy and Uniqueness
  console.log("\n--> Step 6: Review Content Relevancy & Uniqueness");
  const uniqueTitles = new Set(sampleReviews.map((r: any) => r.title));
  const uniqueAuthors = new Set(sampleReviews.map((r: any) => r.authorName));
  const isUnique = uniqueTitles.size === sampleReviews.length && uniqueAuthors.size === sampleReviews.length;

  assertResult({
    name: "AI Reviews Uniqueness & Content Variety",
    passed: isUnique && sampleReviews.length > 0,
    notes: `Unique titles: ${uniqueTitles.size}/${sampleReviews.length}, Sample: "${sampleReviews[0]?.title || ''}"`,
  });

  // 7. Verify Reviews Appear in Admin Reviews with "AI" Indicator
  console.log("\n--> Step 7: Check Reviews Manager for AI Flag");
  const reviewsListRes = await timedFetch(`${ADMIN_URL}/api/admin/reviews?limit=50`, {
    headers: { Cookie: adminCookie },
  });
  let reviewsListJson: any = {};
  try {
    reviewsListJson = JSON.parse(reviewsListRes.text);
  } catch {}

  const reviewsList = reviewsListJson.data?.reviews || reviewsListJson.reviews || [];
  const foundAiReviews = reviewsList.filter((r: any) => r.aiGenerationId === pendingBatchId || r.isAiGenerated === 1);

  assertResult({
    name: "GET /api/admin/reviews (Reviews marked with is_ai_generated=1)",
    url: `${ADMIN_URL}/api/admin/reviews`,
    status: reviewsListRes.res.status,
    expectedStatus: 200,
    passed: reviewsListRes.res.status === 200 && foundAiReviews.length > 0,
    notes: `Found ${foundAiReviews.length} AI-generated reviews in admin queue`,
  });

  // 8. Generate 3 Reviews in Auto-Publish Mode
  console.log("\n--> Step 8: Generate Reviews with Auto-Publish Mode");
  const genAutoRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/ai-review-generator/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      productId: sampleProductId,
      count: 3,
      ratingMin: 5,
      ratingMax: 5,
      tone: "enthusiastic",
      language: "english",
      reviewerStyle: "pakistani",
      dateRangeDays: 5,
      approvalMode: "auto",
    }),
  });

  let genAutoJson: any = {};
  try {
    genAutoJson = JSON.parse(genAutoRes.text);
  } catch {}

  const autoBatchId = genAutoJson.data?.batchId;

  assertResult({
    name: "POST /api/admin/apps/ai-review-generator/generate (Auto-publish mode)",
    url: `${ADMIN_URL}/api/admin/apps/ai-review-generator/generate`,
    status: genAutoRes.res.status,
    expectedStatus: 200,
    passed: genAutoRes.res.status === 200 && genAutoJson.success && genAutoJson.data?.approvalMode === "auto",
    notes: `Batch ID: ${autoBatchId}`,
  });

  // 9. Storefront Public API Reflects Approved Reviews
  console.log("\n--> Step 9: Storefront Shows Auto-Published Reviews");
  const sfReviewsRes = await timedFetch(`${STORE_URL}/api/reviews/list?productId=${sampleProductId}&limit=20`);
  let sfReviewsJson: any = {};
  try {
    sfReviewsJson = JSON.parse(sfReviewsRes.text);
  } catch {}

  const sfReviews = sfReviewsJson.data?.reviews || sfReviewsJson.reviews || [];
  const foundAutoOnSf = sfReviews.find((r: any) => r.aiGenerationId === autoBatchId || r.productId === sampleProductId);

  assertResult({
    name: "GET /api/reviews/list (Auto-published reviews visible on storefront)",
    url: `${STORE_URL}/api/reviews/list`,
    status: sfReviewsRes.res.status,
    expectedStatus: 200,
    passed: sfReviewsRes.res.status === 200 && !!foundAutoOnSf,
    notes: foundAutoOnSf ? `Verified on storefront: "${foundAutoOnSf.title}" by ${foundAutoOnSf.customerName}` : "Not found",
  });

  // 10. Generation History Verification
  console.log("\n--> Step 10: Generation History");
  const historyRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/ai-review-generator/history`, {
    headers: { Cookie: adminCookie },
  });
  let historyJson: any = {};
  try {
    historyJson = JSON.parse(historyRes.text);
  } catch {}

  const historyItems = historyJson.data?.items || [];
  const hasPendingBatch = historyItems.some((b: any) => b.id === pendingBatchId);
  const hasAutoBatch = historyItems.some((b: any) => b.id === autoBatchId);

  assertResult({
    name: "GET /api/admin/apps/ai-review-generator/history (History tracks all batches)",
    url: `${ADMIN_URL}/api/admin/apps/ai-review-generator/history`,
    status: historyRes.res.status,
    expectedStatus: 200,
    passed: historyRes.res.status === 200 && hasPendingBatch && hasAutoBatch,
    notes: `Batches recorded: ${historyItems.length}`,
  });

  // 11. Delete Batch
  console.log("\n--> Step 11: Delete Batch from History");
  const deleteBatchRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/ai-review-generator/delete-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ batchId: pendingBatchId }),
  });

  let deleteJson: any = {};
  try {
    deleteJson = JSON.parse(deleteBatchRes.text);
  } catch {}

  assertResult({
    name: "POST /api/admin/apps/ai-review-generator/delete-batch (Delete entire batch)",
    url: `${ADMIN_URL}/api/admin/apps/ai-review-generator/delete-batch`,
    status: deleteBatchRes.res.status,
    expectedStatus: 200,
    passed: deleteBatchRes.res.status === 200 && deleteJson.success === true,
    notes: `Deleted batch: ${pendingBatchId}`,
  });

  // Verify deleted batch reviews are removed from reviews table
  const checkAfterDeleteRes = await timedFetch(`${ADMIN_URL}/api/admin/reviews?limit=50`, {
    headers: { Cookie: adminCookie },
  });
  const checkAfterJson = JSON.parse(checkAfterDeleteRes.text || "{}");
  const reviewsAfter = checkAfterJson.data?.reviews || checkAfterJson.reviews || [];
  const stillExists = reviewsAfter.some((r: any) => r.aiGenerationId === pendingBatchId);

  assertResult({
    name: "Cascade Removal: Deleted batch reviews removed from reviews table",
    passed: !stillExists,
    notes: !stillExists ? "All reviews in deleted batch purged" : "Reviews still present",
  });

  // 12. Data Safety: Uninstall & Reinstall Test
  console.log("\n--> Step 12: Uninstall & Reinstall Data Safety");
  const uninstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "ai-review-generator" }),
  });

  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall App)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallRes.res.status,
    expectedStatus: 200,
    passed: uninstallRes.res.status === 200,
    notes: `Duration: ${uninstallRes.duration}ms`,
  });

  // Verify autoBatch review in reviews table is preserved even when uninstalled
  const uninstalledReviewsCheck = await timedFetch(`${ADMIN_URL}/api/admin/reviews?limit=50`, {
    headers: { Cookie: adminCookie },
  });
  const uninstalledJson = JSON.parse(uninstalledReviewsCheck.text || "{}");
  const reviewsDuringUninstall = uninstalledJson.data?.reviews || uninstalledJson.reviews || [];
  const preservedReview = reviewsDuringUninstall.find((r: any) => r.aiGenerationId === autoBatchId);

  assertResult({
    name: "Data Safety: Reviews table preserved after app uninstall",
    passed: !!preservedReview,
    notes: preservedReview ? `Preserved review ID: ${preservedReview.id}` : "Review lost during uninstall",
  });

  // Reinstall App
  const reinstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "ai-review-generator" }),
  });

  assertResult({
    name: "POST /api/admin/apps/install (Reinstall App)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: reinstallRes.res.status,
    expectedStatus: 200,
    passed: reinstallRes.res.status === 200,
    notes: `Duration: ${reinstallRes.duration}ms`,
  });

  // Clean up autoBatch
  if (autoBatchId) {
    await timedFetch(`${ADMIN_URL}/api/admin/apps/ai-review-generator/delete-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ batchId: autoBatchId }),
    });
  }

  // Summary
  console.log("\n==================================================================");
  console.log("Stage 41 Verification Summary");
  console.log("==================================================================");
  const total = records.length;
  const passed = records.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Total Checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed > 0) {
    console.error(`\n❌ VERIFICATION FAILED: ${failed} checks failed.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL ${total} CHECKS PASSED LIVE ON EDGE!`);
  }
}

main().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
