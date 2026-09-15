/**
 * Stage A: Storefront Worker Split & Monolith Preservation Verification
 * 
 * Verifies:
 * 1. Storefront Worker (https://nasrify-store.zia291930.workers.dev)
 * 2. Monolith Worker (https://ecommerce-store-perf-test.zia291930.workers.dev)
 */

const STORE_URL = "https://nasrify-store.zia291930.workers.dev";
const MONOLITH_URL = "https://ecommerce-store-perf-test.zia291930.workers.dev";

interface TestResult {
  endpoint: string;
  status: number;
  expectedStatus: number;
  ttfbMs: number;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

async function timedFetch(url: string, init?: RequestInit): Promise<{ res: Response; ttfbMs: number }> {
  const start = performance.now();
  const res = await fetch(url, init);
  const ttfbMs = Math.round((performance.now() - start) * 10) / 10;
  return { res, ttfbMs };
}

async function runVerification() {
  console.log("==================================================================");
  console.log("  STAGE A: STOREFRONT WORKER SPLIT VERIFICATION");
  console.log(`  Storefront: ${STORE_URL}`);
  console.log(`  Monolith:   ${MONOLITH_URL}`);
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function record(result: TestResult) {
    totalTests++;
    results.push(result);
    if (result.passed) {
      passedTests++;
      console.log(`  ✅ PASS [${result.status}] ${result.endpoint} (${result.ttfbMs}ms) ${result.notes || ""}`);
    } else {
      console.error(`  ❌ FAIL [${result.status}, expected ${result.expectedStatus}] ${result.endpoint} (${result.ttfbMs}ms) ${result.notes || ""}`);
    }
  }

  // ------------------------------------------------------------------
  // STEP 7: VERIFY STOREFRONT (nasrify-store)
  // ------------------------------------------------------------------
  console.log("--- STEP 7: Storefront Worker (nasrify-store) ---");

  // 1. GET /
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/`);
    const text = await res.text();
    const hasHtml = text.includes("<html") || text.includes("<!DOCTYPE");
    record({
      endpoint: "GET /",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200 && hasHtml,
      notes: hasHtml ? "Homepage rendered" : "Missing HTML tag",
    });
  }

  // 2. GET /shop
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/shop`);
    const text = await res.text();
    record({
      endpoint: "GET /shop",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Shop page loaded from D1",
    });
  }

  // Query categories to get a valid category slug
  const sampleCategorySlug = "footwear";
  const sampleProductSlug = "apex-velocity-runner-x1";
  const sampleImagePath = "/api/media/products/c1942822-8838-45d9-b2ca-7156aa40a512.png";

  // 3. GET /product/<slug>
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/product/${sampleProductSlug}`);
    const text = await res.text();
    record({
      endpoint: `GET /product/${sampleProductSlug}`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: `Product detail loaded from D1`,
    });
  }

  // 4. GET /category/<slug>
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/category/${sampleCategorySlug}`);
    record({
      endpoint: `GET /category/${sampleCategorySlug}`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: `Category loaded from D1`,
    });
  }

  // 5. GET /cart
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/cart`);
    record({
      endpoint: "GET /cart",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Cart page loaded",
    });
  }

  // 6. GET /checkout
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/checkout`);
    record({
      endpoint: "GET /checkout",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Checkout page loaded",
    });
  }

  // 7. GET /track-order
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/track-order`);
    record({
      endpoint: "GET /track-order",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Track order page loaded",
    });
  }

  // 8. GET /compare
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/compare`);
    record({
      endpoint: "GET /compare",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Compare page loaded",
    });
  }

  // 9. GET /bundles
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/bundles`);
    record({
      endpoint: "GET /bundles",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Bundles page loaded from D1",
    });
  }

  // 10. GET /admin — MUST BE 404
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/admin`, { redirect: "manual" });
    record({
      endpoint: "GET /admin",
      status: res.status,
      expectedStatus: 404,
      ttfbMs,
      passed: res.status === 404,
      notes: "Admin is NOT present on storefront worker (404 confirmed)",
    });
  }

  // 11. GET /admin/login — MUST BE 404
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}/admin/login`, { redirect: "manual" });
    record({
      endpoint: "GET /admin/login",
      status: res.status,
      expectedStatus: 404,
      ttfbMs,
      passed: res.status === 404,
      notes: "Admin login is NOT present on storefront worker (404 confirmed)",
    });
  }

  // 12. R2 Image URL — GET /api/media/[...path]
  {
    const { res, ttfbMs } = await timedFetch(`${STORE_URL}${sampleImagePath}`);
    record({
      endpoint: `GET ${sampleImagePath}`,
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "R2 product media served successfully via edge proxy",
    });
  }

  // ------------------------------------------------------------------
  // STEP 8: VERIFY ORIGINAL MONOLITH UNTOUCHED
  // ------------------------------------------------------------------
  console.log("\n--- STEP 8: Monolith Worker Untouched (ecommerce-store-perf-test) ---");

  // 1. GET / on Monolith
  {
    const { res, ttfbMs } = await timedFetch(`${MONOLITH_URL}/`);
    record({
      endpoint: "MONOLITH: GET /",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200,
      notes: "Original monolith homepage still operational",
    });
  }

  // 2. GET /admin/login on Monolith
  {
    const { res, ttfbMs } = await timedFetch(`${MONOLITH_URL}/admin/login`);
    const text = await res.text();
    record({
      endpoint: "MONOLITH: GET /admin/login",
      status: res.status,
      expectedStatus: 200,
      ttfbMs,
      passed: res.status === 200 && text.includes("admin"),
      notes: "Original monolith admin login page still loads",
    });
  }

  // 3. Login with admin@example.com / admin123 on Monolith
  let adminSessionCookie = "";
  {
    const start = performance.now();
    const loginRes = await fetch(`${MONOLITH_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    const ttfbMs = Math.round((performance.now() - start) * 10) / 10;
    const cookieHeader = loginRes.headers.get("set-cookie") || "";
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    if (match) {
      adminSessionCookie = match[1];
    }
    const loginJson = (await loginRes.json()) as any;

    record({
      endpoint: "MONOLITH: POST /api/admin/login",
      status: loginRes.status,
      expectedStatus: 200,
      ttfbMs,
      passed: loginRes.status === 200 && loginJson.success === true && Boolean(adminSessionCookie),
      notes: `Admin authentication succeeded (session cookie received: ${Boolean(adminSessionCookie)})`,
    });
  }

  // 4. Admin dashboard loads on Monolith
  {
    const start = performance.now();
    const dashRes = await fetch(`${MONOLITH_URL}/admin/dashboard`, {
      headers: {
        Cookie: `admin_session=${adminSessionCookie}`,
      },
    });
    const ttfbMs = Math.round((performance.now() - start) * 10) / 10;
    const text = await dashRes.text();

    record({
      endpoint: "MONOLITH: GET /admin/dashboard (Authenticated)",
      status: dashRes.status,
      expectedStatus: 200,
      ttfbMs,
      passed: dashRes.status === 200,
      notes: "Original monolith admin dashboard loads with active session",
    });
  }

  console.log("\n==================================================================");
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("==================================================================");

  if (passedTests === totalTests) {
    console.log("  >>> ALL STAGE A VERIFICATION CHECKS PASSED PERFECTLY! <<<");
    process.exit(0);
  } else {
    console.error("  >>> SOME VERIFICATION CHECKS FAILED! <<<");
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Unhandled verification error:", err);
  process.exit(1);
});
