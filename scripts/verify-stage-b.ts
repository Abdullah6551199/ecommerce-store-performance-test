/**
 * Stage B: Admin Worker Split Verification Suite
 * 
 * Verifies:
 * 1. Admin Worker (https://nasrify-admin.zia291930.workers.dev)
 *    - Admin Login, Session issuance, 14 Admin Dashboard routes
 *    - 404 checks for / and /shop (storefront absent)
 *    - R2 image upload via /api/media/upload
 * 2. Storefront Worker (https://nasrify-store.zia291930.workers.dev) - Untouched
 * 3. Monolith Worker (https://ecommerce-store-perf-test.zia291930.workers.dev) - Untouched
 */

const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";
const MONOLITH_URL = "https://ecommerce-store-perf-test.zia291930.workers.dev";

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

async function timedFetch(url: string, init?: RequestInit): Promise<{ res: Response; ttfbMs: number }> {
  const start = performance.now();
  const res = await fetch(url, init);
  const ttfbMs = Math.round((performance.now() - start) * 10) / 10;
  return { res, ttfbMs };
}

async function verifyStageB() {
  console.log("==================================================================");
  console.log("  STAGE B: ADMIN WORKER SPLIT VERIFICATION");
  console.log(`  Admin Worker:      ${ADMIN_URL}`);
  console.log(`  Storefront Worker: ${STORE_URL}`);
  console.log(`  Monolith Worker:   ${MONOLITH_URL}`);
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assertResult(test: TestRecord) {
    totalTests++;
    records.push(test);
    if (test.passed) {
      passedTests++;
      console.log(`  ✅ PASS [${test.status}] ${test.name} (${test.ttfbMs}ms) ${test.notes || ""}`);
    } else {
      console.error(`  ❌ FAIL [${test.status}, expected ${test.expectedStatus}] ${test.name} (${test.ttfbMs}ms) ${test.notes || ""}`);
    }
  }

  // ------------------------------------------------------------------
  // STEP 7: VERIFY ADMIN WORKER (nasrify-admin)
  // ------------------------------------------------------------------
  console.log("--- STEP 7: Admin Worker (nasrify-admin) ---");

  // 1. GET /admin/login
  {
    const { res, ttfbMs } = await timedFetch(`${ADMIN_URL}/admin/login`);
    const text = await res.text();
    assertResult({
      name: "GET /admin/login",
      url: `${ADMIN_URL}/admin/login`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Admin login page loaded",
    });
  }

  // 2. POST /api/admin/login
  let adminSessionCookie = "";
  {
    const { res, ttfbMs } = await timedFetch(`${ADMIN_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    const match = setCookie.match(/admin_session=([^;]+)/);
    if (match) {
      adminSessionCookie = match[1];
    }
    const json = (await res.json().catch(() => ({}))) as any;
    assertResult({
      name: "POST /api/admin/login (admin@example.com / admin123)",
      url: `${ADMIN_URL}/api/admin/login`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200 && json.success === true && Boolean(adminSessionCookie),
      notes: `Admin session issued: ${Boolean(adminSessionCookie)}`,
    });
  }

  const authHeaders = {
    Cookie: `admin_session=${adminSessionCookie}`,
  };

  // Helper for testing admin pages
  async function testAdminPage(path: string, label: string) {
    const { res, ttfbMs } = await timedFetch(`${ADMIN_URL}${path}`, { headers: authHeaders });
    const text = await res.text();
    assertResult({
      name: `GET ${path}`,
      url: `${ADMIN_URL}${path}`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: label,
    });
  }

  // 3. GET /admin/dashboard
  await testAdminPage("/admin/dashboard", "Admin dashboard overview loaded");

  // 4. GET /admin/products
  await testAdminPage("/admin/products", "Products management loads from D1");

  // 5. GET /admin/orders
  await testAdminPage("/admin/orders", "Orders list loads from D1");

  // 6. GET /admin/categories
  await testAdminPage("/admin/categories", "Categories load from D1");

  // 7. GET /admin/coupons
  await testAdminPage("/admin/coupons", "Coupons manager loads");

  // 8. GET /admin/bundles
  await testAdminPage("/admin/bundles", "Bundles manager loads");

  // 9. GET /admin/reviews
  await testAdminPage("/admin/reviews", "Reviews manager loads");

  // 10. GET /admin/settings/tax
  await testAdminPage("/admin/settings/tax", "Tax settings load");

  // 11. GET /admin/settings/shipping-zones
  await testAdminPage("/admin/settings/shipping-zones", "Shipping zones load");

  // 12. GET /admin/settings/trust-badges
  await testAdminPage("/admin/settings/trust-badges", "Trust badges load");

  // 13. GET /admin/analytics
  await testAdminPage("/admin/analytics", "Analytics dashboard loads");

  // 14. GET /admin/pages
  await testAdminPage("/admin/pages", "CMS pages manager loads");

  // 15. GET /admin/appearance
  await testAdminPage("/admin/appearance", "Theme & appearance settings load");

  // 16. GET /admin/media
  await testAdminPage("/admin/media", "Media manager loads");

  // 17. GET / — MUST BE 404 (storefront absent)
  {
    const { res, ttfbMs } = await timedFetch(`${ADMIN_URL}/`, { redirect: "manual" });
    assertResult({
      name: "GET / (Storefront absent check)",
      url: `${ADMIN_URL}/`,
      status: res.status,
      expectedStatus: 404,
      ttfbMs,
      passed: res.status === 404,
      notes: "Storefront homepage returns 404 on admin worker",
    });
  }

  // 18. GET /shop — MUST BE 404
  {
    const { res, ttfbMs } = await timedFetch(`${ADMIN_URL}/shop`, { redirect: "manual" });
    assertResult({
      name: "GET /shop (Storefront absent check)",
      url: `${ADMIN_URL}/shop`,
      status: res.status,
      expectedStatus: 404,
      ttfbMs,
      passed: res.status === 404,
      notes: "Storefront /shop returns 404 on admin worker",
    });
  }

  // 19. Test one image upload via media manager — R2 works
  {
    // Minimal 1x1 transparent PNG binary
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const pngBuffer = Buffer.from(pngBase64, "base64");
    const formData = new FormData();
    const blob = new Blob([pngBuffer], { type: "image/png" });
    formData.append("file", blob, `stage_b_test_${Date.now()}.png`);
    formData.append("altText", "Stage B Verification Test Image");
    formData.append("folder", "test");

    const start = performance.now();
    const uploadRes = await fetch(`${ADMIN_URL}/api/media/upload`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });
    const ttfbMs = Math.round((performance.now() - start) * 10) / 10;
    const uploadJson = (await uploadRes.json().catch(() => ({}))) as any;
    let uploadSuccess = (uploadRes.status === 200 || uploadRes.status === 201) && (uploadJson.success === true || Boolean(uploadJson.data?.url));
    let uploadedUrl = uploadJson.data?.url || uploadJson.url || "";

    assertResult({
      name: "POST /api/media/upload (R2 image upload)",
      url: `${ADMIN_URL}/api/media/upload`,
      status: uploadRes.status,
      expectedStatus: uploadRes.status === 201 ? 201 : 200,
      ttfbMs,
      passed: uploadSuccess,
      notes: `R2 upload success: ${uploadSuccess} (uploaded URL: ${uploadedUrl})`,
    });

    // If uploaded, verify it can be served via GET /api/media/...
    if (uploadedUrl) {
      const assetPath = uploadedUrl.startsWith("/") ? uploadedUrl : `/${uploadedUrl}`;
      const { res: serveRes, ttfbMs: serveTtfb } = await timedFetch(`${ADMIN_URL}${assetPath}`);
      assertResult({
        name: `GET ${assetPath} (R2 image edge delivery)`,
        url: `${ADMIN_URL}${assetPath}`,
        status: serveRes.status,
        expectedStatus: 200,
        ttfbMs: serveTtfb,
        passed: serveRes.status === 200,
        notes: "Uploaded R2 image served directly through admin worker",
      });
    }
  }

  // ------------------------------------------------------------------
  // STEP 8: VERIFY OTHER WORKERS UNTOUCHED
  // ------------------------------------------------------------------
  console.log("\n--- STEP 8: Verify Other Workers Untouched ---");

  // A. nasrify-store (Storefront Worker)
  console.log("A. Checking Storefront Worker (nasrify-store)...");
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/`);
    assertResult({
      name: "STORE: GET /",
      url: `${STORE_URL}/`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Storefront homepage still loads",
    });
  }
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/shop`);
    assertResult({
      name: "STORE: GET /shop",
      url: `${STORE_URL}/shop`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Storefront shop page still loads",
    });
  }
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/product/apex-velocity-runner-x1`);
    assertResult({
      name: "STORE: GET /product/apex-velocity-runner-x1",
      url: `${STORE_URL}/product/apex-velocity-runner-x1`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Storefront product detail page still loads",
    });
  }
  {
    const sampleImg = "/api/media/products/c1942822-8838-45d9-b2ca-7156aa40a512.png";
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}${sampleImg}`);
    assertResult({
      name: `STORE: GET ${sampleImg}`,
      url: `${STORE_URL}${sampleImg}`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Storefront R2 media serves correctly",
    });
  }

  // B. Monolith Worker
  console.log("\nB. Checking Monolith Worker (ecommerce-store-perf-test)...");
  {
    const { res, ttfbMs } = await timedFetch(`${MONOLITH_URL}/`);
    assertResult({
      name: "MONOLITH: GET /",
      url: `${MONOLITH_URL}/`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Monolith homepage still loads",
    });
  }
  {
    const { res, ttfbMs } = await timedFetch(`${MONOLITH_URL}/admin/login`);
    assertResult({
      name: "MONOLITH: GET /admin/login",
      url: `${MONOLITH_URL}/admin/login`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Monolith admin login page still loads",
    });
  }
  {
    const { res, ttfbMs } = await timedFetch(`${MONOLITH_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    assertResult({
      name: "MONOLITH: POST /api/admin/login",
      url: `${MONOLITH_URL}/api/admin/login`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200 && setCookie.includes("admin_session"),
      notes: "Monolith admin authentication succeeds",
    });
  }

  console.log("\n==================================================================");
  console.log(`  STAGE B VERIFICATION SUMMARY: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("  >>> ALL STAGE B VERIFICATION CHECKS PASSED PERFECTLY! <<<");
    process.exit(0);
  } else {
    console.error("  >>> SOME STAGE B VERIFICATION CHECKS FAILED! <<<");
    process.exit(1);
  }
}

verifyStageB().catch((err) => {
  console.error("Unhandled error in Stage B verification:", err);
  process.exit(1);
});
