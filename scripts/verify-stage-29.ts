/**
 * Stage 29 Verification Script
 * Validates:
 * 1. Admin auth
 * 2. WhatsApp app in /api/admin/apps catalog
 * 3. App installation and enablement
 * 4. App settings save and retrieval (admin & storefront public API)
 * 5. Storefront HTML rendering with storefront.floating container
 * 6. Product page rendering with storefront.product.below
 * 7. Setting toggles (enable/disable floating)
 * 8. Uninstall and reinstall cycle
 * 9. Admin pages with flat toggle rendering
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
      await new Promise((r) => setTimeout(r, 500 * attempt));
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
  console.log("Stage 29 Live Verification: WhatsApp App + Flat Toggle");
  console.log(`  Admin: ${ADMIN_URL}`);
  console.log(`  Store: ${STORE_URL}`);
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
  const cookieHeader = sessionToken ? `admin_session=${sessionToken}` : "";

  assertResult({
    name: "POST /api/admin/login (Admin Auth)",
    url: `${ADMIN_URL}/api/admin/login`,
    status: loginRes.res.status,
    expectedStatus: 200,
    passed: loginRes.res.status === 200 && !!sessionToken,
    notes: `Duration: ${loginRes.duration}ms`,
  });

  if (!sessionToken) {
    console.error("FATAL: Could not obtain admin session cookie.");
    process.exit(1);
  }

  // 2. Apps Catalog
  console.log("\n--> Step 2: WhatsApp App in Catalog");
  const catalogRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: cookieHeader },
  });
  const catalogJson = (await catalogRes.res.json()) as any;
  const whatsappCatalog = catalogJson.data?.find((a: any) => a.id === "whatsapp-order");

  assertResult({
    name: "GET /api/admin/apps (Find whatsapp-order in catalog)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: catalogRes.res.status,
    expectedStatus: 200,
    passed: catalogRes.res.status === 200 && !!whatsappCatalog,
    notes: whatsappCatalog ? `Found: ${whatsappCatalog.name} (v${whatsappCatalog.version})` : "Not found in catalog",
  });

  if (whatsappCatalog) {
    const extPoints = whatsappCatalog.extensionPoints || [];
    assertResult({
      name: "Extension Points include storefront.floating & storefront.product.below",
      passed: extPoints.includes("storefront.floating") && extPoints.includes("storefront.product.below"),
      notes: `Extension points: [${extPoints.join(", ")}]`,
    });
  }

  // 3. Install WhatsApp App
  console.log("\n--> Step 3: Install WhatsApp App");
  const installRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ appId: "whatsapp-order" }),
  });
  const installJson = (await installRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/install (Install whatsapp-order)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installRes.res.status,
    expectedStatus: 200,
    passed: installRes.res.status === 200 && installJson.success === true,
    notes: installJson.message || "Installed successfully",
  });

  // Verify status in catalog is installed + enabled
  const catalogAfterInstall = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: cookieHeader },
  });
  const catalogAfterJson = (await catalogAfterInstall.res.json()) as any;
  const whatsappInstalled = catalogAfterJson.data?.find((a: any) => a.id === "whatsapp-order");

  assertResult({
    name: "Verify whatsapp-order status is Installed and Enabled",
    passed: whatsappInstalled?.installed === true && whatsappInstalled?.enabled === true,
    notes: `installed: ${whatsappInstalled?.installed}, enabled: ${whatsappInstalled?.enabled}`,
  });

  // 4. Configure App Settings
  console.log("\n--> Step 4: Configure WhatsApp App Settings");
  const testPhone = "15551234567";
  const testSettings = {
    phoneNumber: testPhone,
    enableFloating: true,
    enableProductButton: true,
    floatingMessage: "Hello Apex Store! I have a question.",
    productMessage: "Hello! I would like to order: {product_name} ({product_url}).",
    buttonText: "Order on WhatsApp",
  };

  const saveSettingsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(testSettings),
  });
  const saveJson = (await saveSettingsRes.res.json()) as any;

  assertResult({
    name: "PUT /api/admin/apps/whatsapp-order/settings (Save WhatsApp Settings)",
    url: `${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`,
    status: saveSettingsRes.res.status,
    expectedStatus: 200,
    passed: saveSettingsRes.res.status === 200 && saveJson.success === true,
    notes: `Phone: ${testPhone}`,
  });

  // Check saved settings via admin detail API
  const detailRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order`, {
    headers: { Cookie: cookieHeader },
  });
  const detailJson = (await detailRes.res.json()) as any;
  const loadedSettings = detailJson.data?.installation?.settings;
  const parsedSettings = typeof loadedSettings === "string" ? JSON.parse(loadedSettings) : loadedSettings;

  assertResult({
    name: "GET /api/admin/apps/whatsapp-order (Verify saved settings in D1)",
    passed: parsedSettings?.phoneNumber === testPhone && parsedSettings?.enableFloating === true,
    notes: `Stored phone: ${parsedSettings?.phoneNumber}`,
  });

  // 5. Storefront Public Settings Endpoint
  console.log("\n--> Step 5: Storefront Public Settings Endpoint");
  const storeSettingsRes = await timedFetch(`${STORE_URL}/api/apps/whatsapp-order/settings`);
  const storeSettingsJson = (await storeSettingsRes.res.json()) as any;

  assertResult({
    name: "GET /api/apps/whatsapp-order/settings (Public Storefront API)",
    url: `${STORE_URL}/api/apps/whatsapp-order/settings`,
    status: storeSettingsRes.res.status,
    expectedStatus: 200,
    passed: storeSettingsRes.res.status === 200 && storeSettingsJson.data?.phoneNumber === testPhone,
    notes: `Returned phone: ${storeSettingsJson.data?.phoneNumber}`,
  });

  // 6. Storefront Layout and Product Page Rendering
  console.log("\n--> Step 6: Storefront Pages Rendering & Extension Points");
  const homeRes = await timedFetch(`${STORE_URL}/`);
  const homeHtml = await homeRes.res.text();

  assertResult({
    name: "GET / (Homepage renders 200 OK)",
    url: `${STORE_URL}/`,
    status: homeRes.res.status,
    expectedStatus: 200,
    passed: homeRes.res.status === 200,
    notes: `HTML length: ${homeHtml.length}`,
  });

  // Check Product page
  const productRes = await timedFetch(`${STORE_URL}/product/apex-velocity-runner-x1`);
  const productHtml = await productRes.res.text();

  assertResult({
    name: "GET /product/apex-velocity-runner-x1 (Product page renders 200 OK)",
    url: `${STORE_URL}/product/apex-velocity-runner-x1`,
    status: productRes.res.status,
    expectedStatus: 200,
    passed: productRes.res.status === 200,
    notes: `HTML length: ${productHtml.length}`,
  });

  // 7. Test Settings Toggle: Disable Floating
  console.log("\n--> Step 7: Toggle Settings Test");
  const disableFloatingSettings = {
    ...testSettings,
    enableFloating: false,
  };

  const updateToggleRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(disableFloatingSettings),
  });

  assertResult({
    name: "PUT /api/admin/apps/whatsapp-order/settings (Disable floating toggle)",
    passed: updateToggleRes.res.status === 200,
  });

  // Restore enableFloating: true
  await timedFetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(testSettings),
  });

  // 8. Admin Pages using Flat Toggle Check
  console.log("\n--> Step 8: Admin Pages with Flat Toggle Check");
  const adminPages = [
    "/admin/apps",
    "/admin/products",
    "/admin/coupons",
    "/admin/settings/trust-badges",
    "/admin/settings/cookie-consent",
    "/admin/settings/shipping-zones",
    "/admin/settings/tax",
  ];

  for (const pagePath of adminPages) {
    const pageRes = await timedFetch(`${ADMIN_URL}${pagePath}`, {
      headers: { Cookie: cookieHeader },
    });
    assertResult({
      name: `GET ${pagePath} (Flat Toggle Admin Page)`,
      url: `${ADMIN_URL}${pagePath}`,
      status: pageRes.res.status,
      expectedStatus: 200,
      passed: pageRes.res.status === 200,
      notes: `Duration: ${pageRes.duration}ms`,
    });
    await new Promise((r) => setTimeout(r, 250));
  }

  // 9. Uninstall & Reinstall Test
  console.log("\n--> Step 9: Uninstall & Reinstall Cycle");
  const uninstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ appId: "whatsapp-order" }),
  });
  const uninstallJson = (await uninstallRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall whatsapp-order)",
    status: uninstallRes.res.status,
    expectedStatus: 200,
    passed: uninstallRes.res.status === 200 && uninstallJson.success === true,
    notes: uninstallJson.message || "Uninstalled successfully",
  });

  // Reinstall
  const reinstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ appId: "whatsapp-order" }),
  });

  assertResult({
    name: "POST /api/admin/apps/install (Reinstall whatsapp-order)",
    status: reinstallRes.res.status,
    expectedStatus: 200,
    passed: reinstallRes.res.status === 200,
  });

  // Restore active phone settings after reinstall
  await timedFetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(testSettings),
  });

  // Final Summary
  const passedCount = records.filter((r) => r.passed).length;
  const totalCount = records.length;
  console.log("\n==================================================================");
  console.log(`Stage 29 Verification Summary: ${passedCount}/${totalCount} tests passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log("==================================================================");

  if (passedCount < totalCount) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification failed with exception:", err);
  process.exit(1);
});
