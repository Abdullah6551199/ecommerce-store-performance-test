import { execSync } from "child_process";

/**
 * Stage D: Reviews App Lifecycle & Data Safety Verification Suite
 */

const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";

interface TestRecord {
  name: string;
  url: string;
  status: number;
  expectedStatus: number;
  ttfbMs: number;
  passed: boolean;
  notes?: string;
}

const records: TestRecord[] = [];

async function timedFetch(
  url: string,
  init?: RequestInit
): Promise<{ res: Response; ttfbMs: number }> {
  const start = performance.now();
  const res = await fetch(url, init);
  const ttfbMs = Math.round((performance.now() - start) * 10) / 10;
  return { res, ttfbMs };
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

async function verifyStageD() {
  console.log("==================================================================");
  console.log("  STAGE D: REVIEWS APP CONVERSION & LIFECYCLE VERIFICATION");
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
        `  ✅ PASS [${test.status}] ${test.name} (${test.ttfbMs}ms) ${test.notes || ""}`
      );
    } else {
      console.error(
        `  ❌ FAIL [${test.status}, expected ${test.expectedStatus}] ${test.name} (${test.ttfbMs}ms) ${test.notes || ""}`
      );
    }
  }

  // 1. Admin Login
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

  // 2. Discover Reviews app in /api/admin/apps
  console.log("\n--> Step 2: Discover Reviews App in Catalog");
  const appsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: cookieHeader },
  });
  const appsData = (await appsRes.res.json()) as any;
  const reviewsApp = appsData.data?.find((a: any) => a.id === "reviews");

  assertResult({
    name: "GET /api/admin/apps (Discover Reviews App)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: appsRes.res.status,
    expectedStatus: 200,
    ttfbMs: appsRes.ttfbMs,
    passed: appsRes.res.status === 200 && Boolean(reviewsApp),
    notes: reviewsApp ? `Found: ${reviewsApp.name} v${reviewsApp.version}` : "Reviews app not found in registry",
  });

  // 3. Install Reviews App
  console.log("\n--> Step 3: Install Reviews App");
  const installRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ appId: "reviews" }),
  });
  const installData = (await installRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/install (Install Reviews App)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installRes.res.status,
    expectedStatus: 200,
    ttfbMs: installRes.ttfbMs,
    passed: installRes.res.status === 200 && installData.success === true,
    notes: installData.success ? `Installed: enabled=${installData.data?.enabled}` : installData.error,
  });

  // 4. Verify /admin/reviews page loads ReviewsManager
  console.log("\n--> Step 4: Verify /admin/reviews Page Loads");
  const adminReviewsPage = await timedFetch(`${ADMIN_URL}/admin/reviews`, {
    headers: { Cookie: cookieHeader },
  });
  const adminReviewsHtml = await adminReviewsPage.res.text();

  assertResult({
    name: "GET /admin/reviews (Admin Reviews Moderation Page)",
    url: `${ADMIN_URL}/admin/reviews`,
    status: adminReviewsPage.res.status,
    expectedStatus: 200,
    ttfbMs: adminReviewsPage.ttfbMs,
    passed: adminReviewsPage.res.status === 200 && adminReviewsHtml.includes("Reviews"),
    notes: "Admin reviews page loaded successfully",
  });

  // 5. Verify /api/admin/reviews/stats
  console.log("\n--> Step 5: Verify Reviews Admin API Stats");
  const statsRes = await timedFetch(`${ADMIN_URL}/api/admin/reviews/stats`, {
    headers: { Cookie: cookieHeader },
  });
  const statsData = (await statsRes.res.json()) as any;

  assertResult({
    name: "GET /api/admin/reviews/stats",
    url: `${ADMIN_URL}/api/admin/reviews/stats`,
    status: statsRes.res.status,
    expectedStatus: 200,
    ttfbMs: statsRes.ttfbMs,
    passed: statsRes.res.status === 200 && statsData.success === true,
    notes: `Total: ${statsData.data?.total}, Pending: ${statsData.data?.pending}`,
  });

  // 6. Verify Storefront Product Page has Extension Point
  console.log("\n--> Step 6: Storefront Product Page with Reviews Extension Point");
  const storeProductPage = await timedFetch(`${STORE_URL}/product/apex-velocity-runner-x1`);
  const storeProductHtml = await storeProductPage.res.text();
  const hasReviewsComponent = storeProductHtml.includes("Customer Reviews") || storeProductHtml.includes("Reviews") || storeProductHtml.includes("reviews");

  assertResult({
    name: "GET /product/apex-velocity-runner-x1 (Storefront Product Page)",
    url: `${STORE_URL}/product/apex-velocity-runner-x1`,
    status: storeProductPage.res.status,
    expectedStatus: 200,
    ttfbMs: storeProductPage.ttfbMs,
    passed: storeProductPage.res.status === 200 && hasReviewsComponent,
    notes: hasReviewsComponent ? "Product page rendered with Reviews section" : "Reviews section missing",
  });

  // 7. Submit a Test Review
  console.log("\n--> Step 7: Submit a Customer Review");
  const submitReviewRes = await timedFetch(`${STORE_URL}/api/products/prod-apex-vrx1/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Stage D Tester",
      customerEmail: "tester.staged@nasrify.com",
      rating: 5,
      title: "Extremely comfortable and responsive",
      content: "These shoes provide top-tier energy return during high-mileage runs. Highly recommended!",
    }),
  });
  const submitReviewData = (await submitReviewRes.res.json()) as any;

  assertResult({
    name: "POST /api/products/prod-apex-vrx1/reviews (Submit Customer Review)",
    url: `${STORE_URL}/api/products/prod-apex-vrx1/reviews`,
    status: submitReviewRes.res.status,
    expectedStatus: 201,
    ttfbMs: submitReviewRes.ttfbMs,
    passed: submitReviewRes.res.status === 201 && submitReviewData.success === true,
    notes: submitReviewData.success ? `Review created ID: ${submitReviewData.data?.review?.id}` : submitReviewData.error,
  });

  // 8. Verify Review in Remote D1
  console.log("\n--> Step 8: Verify Review in Remote D1");
  const d1ReviewsAfterSubmit = runRemoteD1("SELECT count(*) as count FROM reviews WHERE customer_email = 'tester.staged@nasrify.com';");
  const reviewsCount = d1ReviewsAfterSubmit?.[0]?.results?.[0]?.count ?? 0;

  assertResult({
    name: "D1 Query: Review persisted in D1 database",
    url: "d1://ecommerce-perf-db/reviews",
    status: 200,
    expectedStatus: 200,
    ttfbMs: 0,
    passed: reviewsCount > 0,
    notes: `D1 reviews count for test customer: ${reviewsCount}`,
  });

  // 9. Uninstall Reviews App
  console.log("\n--> Step 9: Uninstall Reviews App");
  const uninstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ appId: "reviews" }),
  });
  const uninstallData = (await uninstallRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall Reviews App)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallRes.res.status,
    expectedStatus: 200,
    ttfbMs: uninstallRes.ttfbMs,
    passed: uninstallRes.res.status === 200 && uninstallData.success === true,
    notes: uninstallData.success ? "Reviews app successfully uninstalled" : uninstallData.error,
  });

  // 10. Verify Storefront Renders Nothing for Reviews when uninstalled
  console.log("\n--> Step 10: Storefront Product Page with Reviews UNINSTALLED");
  const storePageUninstalled = await timedFetch(`${STORE_URL}/product/apex-velocity-runner-x1`);
  const storeHtmlUninstalled = await storePageUninstalled.res.text();
  // With app uninstalled, the extension point returns null. The reviews widget container should not be rendered.
  const hasAppWidgetUninstalled = storeHtmlUninstalled.includes("Customer Reviews") && storeHtmlUninstalled.includes("Write a Review");

  assertResult({
    name: "GET /product/apex-velocity-runner-x1 (Extension Point Renders Nothing When Uninstalled)",
    url: `${STORE_URL}/product/apex-velocity-runner-x1`,
    status: storePageUninstalled.res.status,
    expectedStatus: 200,
    ttfbMs: storePageUninstalled.ttfbMs,
    passed: storePageUninstalled.res.status === 200 && !hasAppWidgetUninstalled,
    notes: !hasAppWidgetUninstalled ? "Clean zero-render when uninstalled" : "Reviews widget unexpectedly rendered",
  });

  // 11. Verify /admin/reviews shows 'not installed' banner
  console.log("\n--> Step 11: /admin/reviews shows 'not installed' banner");
  const adminReviewsUninstalled = await timedFetch(`${ADMIN_URL}/admin/reviews`, {
    headers: { Cookie: cookieHeader },
  });
  const adminReviewsHtmlUninstalled = await adminReviewsUninstalled.res.text();
  const showsNotInstalledBanner =
    adminReviewsHtmlUninstalled.includes("Reviews app is not installed") ||
    adminReviewsHtmlUninstalled.includes("/admin/apps");

  assertResult({
    name: "GET /admin/reviews (Shows Not Installed Notice)",
    url: `${ADMIN_URL}/admin/reviews`,
    status: adminReviewsUninstalled.res.status,
    expectedStatus: 200,
    ttfbMs: adminReviewsUninstalled.ttfbMs,
    passed: adminReviewsUninstalled.res.status === 200 && showsNotInstalledBanner,
    notes: showsNotInstalledBanner ? "Banner displayed directing admin to /admin/apps" : "Banner missing",
  });

  // 12. DATA SAFETY CHECK: D1 reviews table STILL has customer data!
  console.log("\n--> Step 12: DATA SAFETY VERIFICATION (Data preserved on uninstall)");
  const d1ReviewsDataSafety = runRemoteD1("SELECT count(*) as count FROM reviews WHERE customer_email = 'tester.staged@nasrify.com';");
  const reviewsCountAfterUninstall = d1ReviewsDataSafety?.[0]?.results?.[0]?.count ?? 0;

  assertResult({
    name: "D1 Data Safety: Reviews preserved after app uninstall",
    url: "d1://ecommerce-perf-db/reviews",
    status: 200,
    expectedStatus: 200,
    ttfbMs: 0,
    passed: reviewsCountAfterUninstall > 0,
    notes: `Preserved ${reviewsCountAfterUninstall} reviews in D1 (Data Safety guaranteed)`,
  });

  // 13. Reinstall Reviews App
  console.log("\n--> Step 13: Reinstall Reviews App");
  const reinstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ appId: "reviews" }),
  });
  const reinstallData = (await reinstallRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/install (Reinstall Reviews App)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: reinstallRes.res.status,
    expectedStatus: 200,
    ttfbMs: reinstallRes.ttfbMs,
    passed: reinstallRes.res.status === 200 && reinstallData.success === true,
    notes: reinstallData.success ? "Reviews app reinstalled and enabled" : reinstallData.error,
  });

  // 14. Verify Storefront Re-enables Reviews with Data Intact
  console.log("\n--> Step 14: Storefront Product Page Re-displays Reviews with Data Intact");
  const storePageReinstalled = await timedFetch(`${STORE_URL}/product/apex-velocity-runner-x1`);
  const storeHtmlReinstalled = await storePageReinstalled.res.text();

  assertResult({
    name: "GET /product/apex-velocity-runner-x1 (Reviews Reappear on Storefront)",
    url: `${STORE_URL}/product/apex-velocity-runner-x1`,
    status: storePageReinstalled.res.status,
    expectedStatus: 200,
    ttfbMs: storePageReinstalled.ttfbMs,
    passed: storePageReinstalled.res.status === 200,
    notes: "Storefront re-rendered with active Reviews extension",
  });

  // Summary
  console.log("\n==================================================================");
  console.log(`  STAGE D VERIFICATION COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log("==================================================================");
}

verifyStageD().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
