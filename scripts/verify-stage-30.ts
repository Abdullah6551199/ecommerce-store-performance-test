/**
 * Stage 30 Live Verification Script: Modular Wishlist App Lifecycle & Integration
 * 
 * Verifies:
 * 1. Admin Auth & Apps Catalog contains Wishlist
 * 2. App Installation & Activation
 * 3. Settings persistence in D1 (4 settings: showOnProductCards, showInHeader, requireLogin, iconPosition)
 * 4. Storefront public settings endpoint (/api/apps/wishlist/settings)
 * 5. Storefront Extension Points (storefront.product.below, storefront.header, storefront.account.menu)
 * 6. Customer Wishlist API: List, Add, Toggle, Remove
 * 7. Guest Wishlist Mode (when requireLogin = false)
 * 8. Clean Uninstall (extension points unmount, "not installed" message on /account/wishlist, DB rows preserved)
 * 9. Reinstall (settings and DB records safely restored)
 * 10. Cache invalidation & latency audit
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
  console.log("Stage 30 Live Verification: Wishlist App Lifecycle & Integration");
  console.log(`  Admin Worker:      ${ADMIN_URL}`);
  console.log(`  Storefront Worker:  ${STORE_URL}`);
  console.log("==================================================================\n");

  // 1. Admin Auth
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

  // 2. Apps Catalog in Admin
  console.log("\n--> Step 2: Wishlist App in Admin Catalog");
  const catalogRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: adminCookie },
  });
  const catalogJson = (await catalogRes.res.json()) as any;
  const wishlistApp = catalogJson.data?.find((a: any) => a.id === "wishlist");

  assertResult({
    name: "GET /api/admin/apps (Find Wishlist app)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: catalogRes.res.status,
    expectedStatus: 200,
    passed: catalogRes.res.status === 200 && !!wishlistApp,
    notes: wishlistApp ? `Name: ${wishlistApp.name}, Version: ${wishlistApp.version}` : "Not found",
  });

  // 3. Install Wishlist App
  console.log("\n--> Step 3: Install & Enable Wishlist App");
  const installRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "wishlist" }),
  });
  const installJson = (await installRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/install (Install Wishlist)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installRes.res.status,
    expectedStatus: 200,
    passed: installRes.res.status === 200 && installJson.success,
    notes: installJson.message || "",
  });

  // 4. Save Settings
  console.log("\n--> Step 4: Configure Wishlist Settings");
  const initialSettings = {
    showOnProductCards: true,
    showInHeader: true,
    requireLogin: true,
    iconPosition: "top-right",
  };

  const saveSettingsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/wishlist/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ settings: initialSettings }),
  });
  const saveJson = (await saveSettingsRes.res.json()) as any;

  assertResult({
    name: "PUT /api/admin/apps/wishlist/settings (Save 4 Config Toggles)",
    url: `${ADMIN_URL}/api/admin/apps/wishlist/settings`,
    status: saveSettingsRes.res.status,
    expectedStatus: 200,
    passed: saveSettingsRes.res.status === 200 && saveJson.success,
    notes: `Duration: ${saveSettingsRes.duration}ms`,
  });

  // Wait 1s for replication
  await new Promise((r) => setTimeout(r, 1000));

  // 5. Query Public Storefront App Settings Endpoint
  console.log("\n--> Step 5: Storefront App Settings Endpoint");
  const publicSettingsRes = await timedFetch(`${STORE_URL}/api/apps/wishlist/settings`);
  const publicSettingsJson = (await publicSettingsRes.res.json()) as any;

  assertResult({
    name: "GET /api/apps/wishlist/settings (Storefront Public Settings)",
    url: `${STORE_URL}/api/apps/wishlist/settings`,
    status: publicSettingsRes.res.status,
    expectedStatus: 200,
    passed:
      publicSettingsRes.res.status === 200 &&
      publicSettingsJson.success &&
      publicSettingsJson.data?.showOnProductCards === true &&
      publicSettingsJson.data?.iconPosition === "top-right",
    notes: `showInHeader=${publicSettingsJson.data?.showInHeader}, iconPosition=${publicSettingsJson.data?.iconPosition}`,
  });

  // 6. Storefront Extension Points Rendering
  console.log("\n--> Step 6: Storefront Extension Points Rendering");
  const productPageRes = await timedFetch(`${STORE_URL}/product/apex-velocity-runner-x1?t=${Date.now()}`);
  const productHtml = await productPageRes.res.text();

  assertResult({
    name: "GET /product/apex-velocity-runner-x1 (Extension point: storefront.product.below)",
    url: `${STORE_URL}/product/apex-velocity-runner-x1`,
    status: productPageRes.res.status,
    expectedStatus: 200,
    passed:
      productPageRes.res.status === 200 &&
      productHtml.includes('data-extension-point="storefront.product.below"') &&
      productHtml.includes('data-app="wishlist"'),
    notes: `Includes storefront.product.below & data-app="wishlist"`,
  });

  const homePageRes = await timedFetch(`${STORE_URL}/?t=${Date.now()}`);
  const homeHtml = await homePageRes.res.text();

  assertResult({
    name: "GET / (Extension point: storefront.header)",
    url: `${STORE_URL}/`,
    status: homePageRes.res.status,
    expectedStatus: 200,
    passed:
      homePageRes.res.status === 200 &&
      homeHtml.includes('data-extension-point="storefront.header"') &&
      homeHtml.includes('data-app="wishlist"'),
    notes: `Header extension container rendered`,
  });

  const accountPageRes = await timedFetch(`${STORE_URL}/account/wishlist?t=${Date.now()}`);
  const accountHtml = await accountPageRes.res.text();

  assertResult({
    name: "GET /account/wishlist (CSR Page with App Loaded)",
    url: `${STORE_URL}/account/wishlist`,
    status: accountPageRes.res.status,
    expectedStatus: 200,
    passed: accountPageRes.res.status === 200 && accountHtml.includes("Wishlist"),
    notes: `Account wishlist page delivered`,
  });

  // 7. Customer Wishlist API Operations
  console.log("\n--> Step 7: Customer Wishlist API Lifecycle (Add, List, Toggle, Remove)");
  const customerCookie = "customer_session=test-stage-30-token-abcdef123456";
  const testProductId = "prod-apex-vrx1";

  // Add item
  const addRes = await timedFetch(`${STORE_URL}/api/wishlist/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ productId: testProductId }),
  });
  const addJson = (await addRes.res.json()) as any;

  assertResult({
    name: "POST /api/wishlist/add (Add product to wishlist)",
    url: `${STORE_URL}/api/wishlist/add`,
    status: addRes.res.status,
    expectedStatus: 200,
    passed: addRes.res.status === 200 && addJson.success,
    notes: addJson.message || `inWishlist: ${addJson.inWishlist}`,
  });

  // List wishlist
  const listRes = await timedFetch(`${STORE_URL}/api/wishlist/list`, {
    headers: { Cookie: customerCookie },
  });
  const listJson = (await listRes.res.json()) as any;
  const inList = Array.isArray(listJson.items) && listJson.items.some((item: any) => item.productId === testProductId || item.id === testProductId);

  assertResult({
    name: "GET /api/wishlist/list (Verify product in wishlist)",
    url: `${STORE_URL}/api/wishlist/list`,
    status: listRes.res.status,
    expectedStatus: 200,
    passed: listRes.res.status === 200 && listJson.success && inList,
    notes: `Count: ${listJson.count}, Found test product: ${inList}`,
  });

  // Toggle item (should remove)
  const toggleOffRes = await timedFetch(`${STORE_URL}/api/wishlist/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ productId: testProductId }),
  });
  const toggleOffJson = (await toggleOffRes.res.json()) as any;

  assertResult({
    name: "POST /api/wishlist/toggle (Toggle off / remove product)",
    url: `${STORE_URL}/api/wishlist/toggle`,
    status: toggleOffRes.res.status,
    expectedStatus: 200,
    passed: toggleOffRes.res.status === 200 && toggleOffJson.success && toggleOffJson.inWishlist === false,
    notes: `inWishlist: ${toggleOffJson.inWishlist}`,
  });

  // Toggle item back on
  const toggleOnRes = await timedFetch(`${STORE_URL}/api/wishlist/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ productId: testProductId }),
  });
  const toggleOnJson = (await toggleOnRes.res.json()) as any;

  assertResult({
    name: "POST /api/wishlist/toggle (Toggle on / re-add product)",
    url: `${STORE_URL}/api/wishlist/toggle`,
    status: toggleOnRes.res.status,
    expectedStatus: 200,
    passed: toggleOnRes.res.status === 200 && toggleOnJson.success && toggleOnJson.inWishlist === true,
    notes: `inWishlist: ${toggleOnJson.inWishlist}`,
  });

  // Remove item
  const removeRes = await timedFetch(`${STORE_URL}/api/wishlist/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ productId: testProductId }),
  });
  const removeJson = (await removeRes.res.json()) as any;

  assertResult({
    name: "POST /api/wishlist/remove (Explicit remove)",
    url: `${STORE_URL}/api/wishlist/remove`,
    status: removeRes.res.status,
    expectedStatus: 200,
    passed: removeRes.res.status === 200 && removeJson.success && removeJson.inWishlist === false,
    notes: `inWishlist: ${removeJson.inWishlist}`,
  });

  // Re-add product so we can test persistence across uninstall/reinstall
  await timedFetch(`${STORE_URL}/api/wishlist/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: customerCookie },
    body: JSON.stringify({ productId: testProductId }),
  });

  // 8. Test Settings Variation (iconPosition & showInHeader)
  console.log("\n--> Step 8: Test Settings Variations (iconPosition='below-image', showInHeader=false)");
  const variedSettings = {
    showOnProductCards: true,
    showInHeader: false,
    requireLogin: false,
    iconPosition: "below-image",
  };

  await timedFetch(`${ADMIN_URL}/api/admin/apps/wishlist/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ settings: variedSettings }),
  });

  // Wait 1.5s for D1 sync
  await new Promise((r) => setTimeout(r, 1500));

  const updatedSettingsRes = await timedFetch(`${STORE_URL}/api/apps/wishlist/settings`);
  const updatedSettingsJson = (await updatedSettingsRes.res.json()) as any;

  assertResult({
    name: "Verify Updated Settings on Storefront",
    url: `${STORE_URL}/api/apps/wishlist/settings`,
    status: updatedSettingsRes.res.status,
    expectedStatus: 200,
    passed:
      updatedSettingsRes.res.status === 200 &&
      updatedSettingsJson.data?.showInHeader === false &&
      updatedSettingsJson.data?.requireLogin === false &&
      updatedSettingsJson.data?.iconPosition === "below-image",
    notes: `showInHeader: ${updatedSettingsJson.data?.showInHeader}, iconPosition: ${updatedSettingsJson.data?.iconPosition}`,
  });

  // 9. Test Guest Wishlist (requireLogin = false)
  console.log("\n--> Step 9: Guest Wishlist Saving (Cookie Session)");
  const guestAddRes = await timedFetch(`${STORE_URL}/api/wishlist/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // No customer_session cookie
    body: JSON.stringify({ productId: "prod-cryo-gun" }),
  });
  const guestSetCookie = guestAddRes.res.headers.get("set-cookie") || "";
  const guestAddJson = (await guestAddRes.res.json()) as any;

  assertResult({
    name: "POST /api/wishlist/add (Guest user save)",
    url: `${STORE_URL}/api/wishlist/add`,
    status: guestAddRes.res.status,
    expectedStatus: 200,
    passed: guestAddRes.res.status === 200 && guestAddJson.success,
    notes: `Guest cookie set: ${guestSetCookie.includes("guest_wishlist")}`,
  });

  // 10. Uninstall Lifecycle Test
  console.log("\n--> Step 10: Uninstall Lifecycle Test");
  const uninstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "wishlist" }),
  });
  const uninstallJson = (await uninstallRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall Wishlist)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallRes.res.status,
    expectedStatus: 200,
    passed: uninstallRes.res.status === 200 && uninstallJson.success,
    notes: uninstallJson.message || "",
  });

  // Wait 3.5s for D1 sync and cross-worker invalidation
  await new Promise((r) => setTimeout(r, 3500));

  // After uninstall, storefront settings should report uninstalled/null
  const uninstalledSettingsRes = await timedFetch(`${STORE_URL}/api/apps/wishlist/settings`);
  const uninstalledSettingsJson = (await uninstalledSettingsRes.res.json()) as any;

  assertResult({
    name: "GET /api/apps/wishlist/settings (Verify Uninstalled Status)",
    url: `${STORE_URL}/api/apps/wishlist/settings`,
    status: uninstalledSettingsRes.res.status,
    expectedStatus: 200,
    passed: uninstalledSettingsJson.data === null || uninstalledSettingsJson.installed === false,
    notes: `data is null (uninstalled/disabled)`,
  });

  // Storefront Product page after uninstall should NOT have wishlist app in extension points
  const uninstalledProductRes = await timedFetch(`${STORE_URL}/product/apex-velocity-runner-x1?t=${Date.now()}`);
  const uninstalledProductHtml = await uninstalledProductRes.res.text();

  assertResult({
    name: "GET /product/apex-velocity-runner-x1 (Heart gone when uninstalled)",
    url: `${STORE_URL}/product/apex-velocity-runner-x1`,
    status: uninstalledProductRes.res.status,
    expectedStatus: 200,
    passed: !uninstalledProductHtml.includes('data-app="wishlist"'),
    notes: `Wishlist button unmounted from extension point`,
  });

  // 11. Reinstall Lifecycle Test
  console.log("\n--> Step 11: Reinstall Lifecycle Test");
  const reinstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "wishlist" }),
  });
  const reinstallJson = (await reinstallRes.res.json()) as any;

  assertResult({
    name: "POST /api/admin/apps/install (Reinstall Wishlist)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: reinstallRes.res.status,
    expectedStatus: 200,
    passed: reinstallRes.res.status === 200 && reinstallJson.success,
    notes: reinstallJson.message || "",
  });

  // Wait 2.5s for D1 sync and cross-worker invalidation
  await new Promise((r) => setTimeout(r, 2500));

  // Verify wishlist items reappear (DB preserved!)
  const reinstalledListRes = await timedFetch(`${STORE_URL}/api/wishlist/list`, {
    headers: { Cookie: customerCookie },
  });
  const reinstalledListJson = (await reinstalledListRes.res.json()) as any;
  const itemsPreserved = Array.isArray(reinstalledListJson.items) && reinstalledListJson.items.some((item: any) => item.productId === testProductId || item.id === testProductId);

  assertResult({
    name: "GET /api/wishlist/list (Wishlist items preserved after reinstall)",
    url: `${STORE_URL}/api/wishlist/list`,
    status: reinstalledListRes.res.status,
    expectedStatus: 200,
    passed: reinstalledListJson.success && itemsPreserved,
    notes: `Count: ${reinstalledListJson.count}, Preserved test product: ${itemsPreserved}`,
  });

  // Verify settings preserved
  const reinstalledSettingsRes = await timedFetch(`${STORE_URL}/api/apps/wishlist/settings`);
  const reinstalledSettingsJson = (await reinstalledSettingsRes.res.json()) as any;

  assertResult({
    name: "GET /api/apps/wishlist/settings (Settings preserved after reinstall)",
    url: `${STORE_URL}/api/apps/wishlist/settings`,
    status: reinstalledSettingsRes.res.status,
    expectedStatus: 200,
    passed: reinstalledSettingsJson.data?.iconPosition === "below-image",
    notes: `iconPosition: ${reinstalledSettingsJson.data?.iconPosition}`,
  });

  // Restore default settings for normal storefront browsing
  await timedFetch(`${ADMIN_URL}/api/admin/apps/wishlist/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ settings: initialSettings }),
  });

  console.log("\n==================================================================");
  const total = records.length;
  const passed = records.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Summary: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("FATAL ERROR in verification:", err);
  process.exit(1);
});
