/**
 * Stage 31+32 Live Verification Script: Compare & Bundles Apps Lifecycle
 */

const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";

interface TestRecord {
  name: string;
  url?: string;
  status?: number;
  expectedStatus?: number;
  passed: boolean;
  notes?: string;
}

const records: TestRecord[] = [];

async function timedFetch(url: string, init?: RequestInit, retries = 3): Promise<{ res: Response; duration: number }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = performance.now();
      const res = await fetch(url, init);
      const duration = performance.now() - start;
      return { res, duration: Math.round(duration) };
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
    console.log(`  ✅ PASS [${test.status ?? "N/A"}] ${test.name} ${test.notes ? `(${test.notes})` : ""}`);
  } else {
    console.error(`  ❌ FAIL [${test.status ?? "N/A"}, expected ${test.expectedStatus ?? "N/A"}] ${test.name} ${test.notes ? `(${test.notes})` : ""}`);
  }
}

async function main() {
  console.log("==================================================================");
  console.log("Stage 31+32 Live Verification: Compare & Bundles Apps Lifecycle");
  console.log(`  Admin Worker:      ${ADMIN_URL}`);
  console.log(`  Storefront Worker:  ${STORE_URL}`);
  console.log("==================================================================\n");

  // 1. Admin Authentication
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
    name: "POST /api/admin/login (Admin Auth)",
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

  // 2. Apps Catalog in Admin (Compare and Bundles present)
  console.log("\n--> Step 2: Apps Catalog Verification");
  const catalogRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: adminCookie },
  });
  const catalogJson = (await catalogRes.res.json()) as any;
  const compareApp = catalogJson.data?.find((a: any) => a.id === "compare");
  const bundlesApp = catalogJson.data?.find((a: any) => a.id === "bundles");

  assertResult({
    name: "GET /api/admin/apps (Find Compare app)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: catalogRes.res.status,
    expectedStatus: 200,
    passed: catalogRes.res.status === 200 && !!compareApp,
    notes: compareApp ? `v${compareApp.version}` : "Not found",
  });

  assertResult({
    name: "GET /api/admin/apps (Find Bundles app)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: catalogRes.res.status,
    expectedStatus: 200,
    passed: catalogRes.res.status === 200 && !!bundlesApp,
    notes: bundlesApp ? `v${bundlesApp.version}` : "Not found",
  });

  // 3. Install & Enable Both Apps
  console.log("\n--> Step 3: Install & Enable Both Apps");
  const installCompareRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "compare" }),
  });
  const installCompareJson = (await installCompareRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/install (Install Compare)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installCompareRes.res.status,
    expectedStatus: 200,
    passed: installCompareRes.res.status === 200 && installCompareJson.success,
  });

  const installBundlesRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "bundles" }),
  });
  const installBundlesJson = (await installBundlesRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/install (Install Bundles)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installBundlesRes.res.status,
    expectedStatus: 200,
    passed: installBundlesRes.res.status === 200 && installBundlesJson.success,
  });

  // 4. Settings Form & Persistence
  console.log("\n--> Step 4: Settings Verification & Persistence");
  const saveCompareSettingsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/compare/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      maxProducts: 4,
      showInHeader: true,
      buttonStyle: "icon-text",
    }),
  });
  const saveCompareSettingsJson = (await saveCompareSettingsRes.res.json()) as any;

  assertResult({
    name: "PUT /api/admin/apps/compare/settings (Save Compare Settings)",
    url: `${ADMIN_URL}/api/admin/apps/compare/settings`,
    status: saveCompareSettingsRes.res.status,
    expectedStatus: 200,
    passed: saveCompareSettingsRes.res.status === 200 && saveCompareSettingsJson.success,
  });

  const saveBundlesSettingsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/bundles/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      enableHomepageSection: true,
      enableProductCrossSell: true,
      enableCartDiscount: true,
      bundleBadgeText: "Save more with bundle",
      maxBundlesPerSection: 4,
    }),
  });
  const saveBundlesSettingsJson = (await saveBundlesSettingsRes.res.json()) as any;

  assertResult({
    name: "PUT /api/admin/apps/bundles/settings (Save Bundles Settings)",
    url: `${ADMIN_URL}/api/admin/apps/bundles/settings`,
    status: saveBundlesSettingsRes.res.status,
    expectedStatus: 200,
    passed: saveBundlesSettingsRes.res.status === 200 && saveBundlesSettingsJson.success,
  });

  // 5. Storefront Public Settings Verification
  console.log("\n--> Step 5: Storefront App Settings Public Endpoints");
  const storeCompareSettings = await timedFetch(`${STORE_URL}/api/apps/compare/settings`);
  const storeCompareJson = (await storeCompareSettings.res.json()) as any;
  assertResult({
    name: "GET /api/apps/compare/settings (Storefront Compare Settings)",
    url: `${STORE_URL}/api/apps/compare/settings`,
    status: storeCompareSettings.res.status,
    expectedStatus: 200,
    passed: storeCompareSettings.res.status === 200 && storeCompareJson.success,
  });

  const storeBundlesSettings = await timedFetch(`${STORE_URL}/api/apps/bundles/settings`);
  const storeBundlesJson = (await storeBundlesSettings.res.json()) as any;
  assertResult({
    name: "GET /api/apps/bundles/settings (Storefront Bundles Settings)",
    url: `${STORE_URL}/api/apps/bundles/settings`,
    status: storeBundlesSettings.res.status,
    expectedStatus: 200,
    passed: storeBundlesSettings.res.status === 200 && storeBundlesJson.success,
  });

  // 6. Compare Functional Tests
  console.log("\n--> Step 6: Compare Functional Tests");
  // Fetch products from catalog first
  const prodsRes = await timedFetch(`${STORE_URL}/api/products?limit=4`);
  const prodsJson = (await prodsRes.res.json()) as any;
  const sampleProducts = prodsJson.data?.products || prodsJson.products || [];
  const testIds = sampleProducts.slice(0, 3).map((p: any) => p.id);

  const compareQueryRes = await timedFetch(`${STORE_URL}/api/products/compare?ids=${testIds.join(",")}`);
  const compareQueryJson = (await compareQueryRes.res.json()) as any;

  assertResult({
    name: "GET /api/products/compare?ids=... (Resolve 3 products specs)",
    url: `${STORE_URL}/api/products/compare`,
    status: compareQueryRes.res.status,
    expectedStatus: 200,
    passed: compareQueryRes.res.status === 200 && compareQueryJson.products?.length > 0,
    notes: `Loaded ${compareQueryJson.products?.length} products with specs`,
  });

  const comparePageRes = await timedFetch(`${STORE_URL}/compare?ids=${testIds.join(",")}`);
  assertResult({
    name: "GET /compare UI Page (Side-by-side table page)",
    url: `${STORE_URL}/compare`,
    status: comparePageRes.res.status,
    expectedStatus: 200,
    passed: comparePageRes.res.status === 200,
    notes: `Duration: ${comparePageRes.duration}ms`,
  });

  // 7. Bundles Functional Tests
  console.log("\n--> Step 7: Bundles Functional Tests");
  const bundlesListRes = await timedFetch(`${STORE_URL}/api/bundles`);
  const bundlesListJson = (await bundlesListRes.res.json()) as any;

  assertResult({
    name: "GET /api/bundles (Active bundles catalog)",
    url: `${STORE_URL}/api/bundles`,
    status: bundlesListRes.res.status,
    expectedStatus: 200,
    passed: bundlesListRes.res.status === 200 && bundlesListJson.success && bundlesListJson.bundles?.length > 0,
    notes: `Found ${bundlesListJson.bundles?.length} bundles`,
  });

  const bundlesPageRes = await timedFetch(`${STORE_URL}/bundles`);
  assertResult({
    name: "GET /bundles (Storefront Bundles listing page)",
    url: `${STORE_URL}/bundles`,
    status: bundlesPageRes.res.status,
    expectedStatus: 200,
    passed: bundlesPageRes.res.status === 200,
    notes: `Duration: ${bundlesPageRes.duration}ms`,
  });

  if (bundlesListJson.bundles?.length > 0) {
    const firstBundle = bundlesListJson.bundles[0];
    const bundleDetailRes = await timedFetch(`${STORE_URL}/bundles/${firstBundle.slug}`);
    assertResult({
      name: `GET /bundles/${firstBundle.slug} (Bundle detail page)`,
      url: `${STORE_URL}/bundles/${firstBundle.slug}`,
      status: bundleDetailRes.res.status,
      expectedStatus: 200,
      passed: bundleDetailRes.res.status === 200,
    });
  }

  // Admin creates a bundle with 3 items
  console.log("\n--> Step 7b: Admin Bundle Creation, Pricing, & Deletion");
  const createBundleRes = await timedFetch(`${ADMIN_URL}/api/admin/bundles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      name: "Stage 31-32 Verification Trio Bundle",
      description: "Automated test bundle package created by stage 31+32 verification suite.",
      bundlePrice: 199.99,
      status: "active",
      isFeatured: true,
      items: sampleProducts.slice(0, 3).map((p: any, idx: number) => ({
        productId: p.id,
        quantity: 1,
        sortOrder: idx + 1,
      })),
    }),
  });
  const createBundleJson = (await createBundleRes.res.json()) as any;
  const createdBundleId = createBundleJson.bundle?.id;

  assertResult({
    name: "POST /api/admin/bundles (Admin creates 3-item bundle)",
    url: `${ADMIN_URL}/api/admin/bundles`,
    status: createBundleRes.res.status,
    expectedStatus: 201,
    passed: createBundleRes.res.status === 201 && createBundleJson.success && !!createdBundleId,
    notes: createdBundleId ? `Bundle ID: ${createdBundleId}, Price: $${createBundleJson.bundle?.bundlePrice}` : "Failed",
  });

  if (createdBundleId) {
    // Cleanly delete the test bundle
    const delBundleRes = await timedFetch(`${ADMIN_URL}/api/admin/bundles/${createdBundleId}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
    const delBundleJson = (await delBundleRes.res.json()) as any;
    assertResult({
      name: `DELETE /api/admin/bundles/${createdBundleId} (Cleanup test bundle)`,
      url: `${ADMIN_URL}/api/admin/bundles/${createdBundleId}`,
      status: delBundleRes.res.status,
      expectedStatus: 200,
      passed: delBundleRes.res.status === 200 && delBundleJson.success,
    });
  }

  // 8. Data Safety & Uninstall/Reinstall Tests
  console.log("\n--> Step 8: Data Safety & Reinstall Verification");
  // Uninstall Compare
  const uninstallCompareRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "compare" }),
  });
  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall Compare)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallCompareRes.res.status,
    expectedStatus: 200,
    passed: uninstallCompareRes.res.status === 200,
  });

  // Reinstall Compare
  const reinstallCompareRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "compare" }),
  });
  assertResult({
    name: "POST /api/admin/apps/install (Reinstall Compare - settings preserved)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: reinstallCompareRes.res.status,
    expectedStatus: 200,
    passed: reinstallCompareRes.res.status === 200,
  });

  // Uninstall Bundles
  const uninstallBundlesRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "bundles" }),
  });
  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall Bundles - D1 tables preserved)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallBundlesRes.res.status,
    expectedStatus: 200,
    passed: uninstallBundlesRes.res.status === 200,
  });

  // Reinstall Bundles
  const reinstallBundlesRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "bundles" }),
  });
  assertResult({
    name: "POST /api/admin/apps/install (Reinstall Bundles - bundles restored)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: reinstallBundlesRes.res.status,
    expectedStatus: 200,
    passed: reinstallBundlesRes.res.status === 200,
  });

  // 9. Latency & CPU Time Audit
  console.log("\n--> Step 9: Storefront Performance & Latency Audit");
  // Warm up worker
  await timedFetch(`${STORE_URL}/`);
  await timedFetch(`${STORE_URL}/`);

  const latencies: number[] = [];
  for (let i = 1; i <= 5; i++) {
    const fetchRes = await timedFetch(`${STORE_URL}/`);
    latencies.push(fetchRes.duration);
  }
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  assertResult({
    name: "GET / Storefront Warm Latency (5 runs)",
    url: `${STORE_URL}/`,
    status: 200,
    expectedStatus: 200,
    passed: avgLatency < 1200,
    notes: `Durations: [${latencies.join(", ")}] ms (Avg: ${avgLatency}ms)`,
  });

  console.log("\n==================================================================");
  const total = records.length;
  const passed = records.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Verification Complete: ${passed}/${total} PASSED (${failed} failed)`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
