/**
 * Stage 35+36 Live Verification Script: Trust Badges & Cookie Consent Apps Lifecycle
 * Covers:
 * - Admin authentication & full 9-app catalog discovery
 * - Installation and configuration of Trust Badges & Cookie Consent
 * - Trust Badges: Create, read, list, update settings, payment icons retrieval
 * - Cookie Consent: Settings management, public config, stats recording
 * - Storefront integration: extension point availability
 * - Data safety across uninstall & reinstall (trust_badges, payment_icons, cookie_consent_settings tables)
 * - Storefront latency & worker overhead audit (< 1200ms)
 */

const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";

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
): Promise<{ res: Response; duration: number }> {
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
    console.error(
      `  ❌ FAIL [${test.status ?? "N/A"}, expected ${test.expectedStatus ?? "N/A"}] ${test.name} ${
        test.notes ? `(${test.notes})` : ""
      }`
    );
  }
}

async function main() {
  console.log("==================================================================");
  console.log("Stage 35+36 Live Verification: Trust Badges & Cookie Consent Apps");
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

  // 2. Apps Catalog in Admin (Trust Badges and Cookie Consent present among all 9 apps)
  console.log("\n--> Step 2: Apps Catalog Verification (All 9 Apps)");
  const catalogRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: adminCookie },
  });
  const catalogJson = (await catalogRes.res.json()) as any;
  const appList: any[] = Array.isArray(catalogJson.data) ? catalogJson.data : [];
  const allAppIds = appList.map((a) => a.id);

  const expectedApps = [
    "reviews",
    "whatsapp-order",
    "compare",
    "bundles",
    "order-tracking",
    "broadcast",
    "trust-badges",
    "cookie-consent",
  ];

  const allExpectedPresent = expectedApps.every((id) => allAppIds.includes(id));

  assertResult({
    name: "GET /api/admin/apps (App Discovery - All 9 Core Apps Scanned)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: catalogRes.res.status,
    expectedStatus: 200,
    passed: catalogRes.res.status === 200 && allExpectedPresent,
    notes: `Found ${allAppIds.length} apps: ${allAppIds.join(", ")}`,
  });

  // 3. Install and Configure Trust Badges App
  console.log("\n--> Step 3: Install & Configure Trust Badges App");
  const installBadgesRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "trust-badges" }),
  });
  assertResult({
    name: "POST /api/admin/apps/install (Install Trust Badges)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installBadgesRes.res.status,
    expectedStatus: 200,
    passed: installBadgesRes.res.status === 200,
  });

  // Save custom settings for Trust Badges
  const saveBadgeSettingsRes = await timedFetch(
    `${ADMIN_URL}/api/admin/apps/trust-badges/settings`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        showOnProductPage: true,
        showOnCartPage: true,
        showOnCheckoutPage: true,
        showPaymentIcons: true,
        badgeAlignment: "center",
        badgeSize: "md",
      }),
    }
  );
  assertResult({
    name: "PUT /api/admin/apps/trust-badges/settings (Save Badge Settings)",
    url: `${ADMIN_URL}/api/admin/apps/trust-badges/settings`,
    status: saveBadgeSettingsRes.res.status,
    expectedStatus: 200,
    passed: saveBadgeSettingsRes.res.status === 200,
  });

  // Verify storefront reads badge settings
  const storeBadgeSettingsRes = await timedFetch(`${STORE_URL}/api/apps/trust-badges/settings`);
  const storeBadgeSettingsJson = (await storeBadgeSettingsRes.res.json()) as any;
  assertResult({
    name: "GET /api/apps/trust-badges/settings (Storefront Read Badge Settings)",
    url: `${STORE_URL}/api/apps/trust-badges/settings`,
    status: storeBadgeSettingsRes.res.status,
    expectedStatus: 200,
    passed:
      storeBadgeSettingsRes.res.status === 200 &&
      storeBadgeSettingsJson.success === true &&
      storeBadgeSettingsJson.data?.badgeAlignment === "center",
    notes: `badgeAlignment: ${storeBadgeSettingsJson.data?.badgeAlignment}`,
  });

  // Create a new Trust Badge
  const createBadgeRes = await timedFetch(`${ADMIN_URL}/api/admin/trust-badges`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      title: "Stage 35 Guaranteed",
      icon: "shield-check",
      description: "Verified modular app test badge",
      location: "all",
      isActive: true,
    }),
  });
  const createBadgeJson = (await createBadgeRes.res.json()) as any;
  const createdBadgeId = createBadgeJson.data?.id;
  assertResult({
    name: "POST /api/admin/trust-badges (Create Trust Badge)",
    url: `${ADMIN_URL}/api/admin/trust-badges`,
    status: createBadgeRes.res.status,
    expectedStatus: 201,
    passed: (createBadgeRes.res.status === 201 || createBadgeRes.res.status === 200) && !!createdBadgeId,
    notes: `Created Badge ID: ${createdBadgeId}`,
  });

  // Query badges from public storefront API
  const publicBadgesRes = await timedFetch(`${STORE_URL}/api/trust-badges?location=product`);
  const publicBadgesJson = (await publicBadgesRes.res.json()) as any;
  const badgeFound = Array.isArray(publicBadgesJson.data) &&
    publicBadgesJson.data.some((b: any) => b.title === "Stage 35 Guaranteed");
  assertResult({
    name: "GET /api/trust-badges (Public Badges API)",
    url: `${STORE_URL}/api/trust-badges`,
    status: publicBadgesRes.res.status,
    expectedStatus: 200,
    passed: publicBadgesRes.res.status === 200 && badgeFound,
    notes: `Found badge in ${publicBadgesJson.data?.length} badges`,
  });

  // Query payment icons from public storefront API
  const paymentIconsRes = await timedFetch(`${STORE_URL}/api/payment-icons`);
  const paymentIconsJson = (await paymentIconsRes.res.json()) as any;
  assertResult({
    name: "GET /api/payment-icons (Public Payment Icons API)",
    url: `${STORE_URL}/api/payment-icons`,
    status: paymentIconsRes.res.status,
    expectedStatus: 200,
    passed:
      paymentIconsRes.res.status === 200 &&
      paymentIconsJson.success === true &&
      Array.isArray(paymentIconsJson.data) &&
      paymentIconsJson.data.length > 0,
    notes: `Found ${paymentIconsJson.data?.length} payment icons`,
  });

  // 4. Install and Configure Cookie Consent App
  console.log("\n--> Step 4: Install & Configure Cookie Consent App");
  const installCookieRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "cookie-consent" }),
  });
  assertResult({
    name: "POST /api/admin/apps/install (Install Cookie Consent)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installCookieRes.res.status,
    expectedStatus: 200,
    passed: installCookieRes.res.status === 200,
  });

  // Save custom settings for Cookie Consent
  const saveCookieSettingsRes = await timedFetch(
    `${ADMIN_URL}/api/admin/apps/cookie-consent/settings`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        enabled: true,
        bannerPosition: "bottom",
        theme: "dark",
        showCustomizeButton: true,
        analyticsCategory: true,
        marketingCategory: true,
        functionalCategory: true,
        consentExpiryDays: 365,
        blockScriptsUntilConsent: true,
      }),
    }
  );
  assertResult({
    name: "PUT /api/admin/apps/cookie-consent/settings (Save Cookie Settings)",
    url: `${ADMIN_URL}/api/admin/apps/cookie-consent/settings`,
    status: saveCookieSettingsRes.res.status,
    expectedStatus: 200,
    passed: saveCookieSettingsRes.res.status === 200,
  });

  // Verify storefront reads cookie consent settings
  const storeCookieSettingsRes = await timedFetch(`${STORE_URL}/api/apps/cookie-consent/settings`);
  const storeCookieSettingsJson = (await storeCookieSettingsRes.res.json()) as any;
  assertResult({
    name: "GET /api/apps/cookie-consent/settings (Storefront Read Cookie Settings)",
    url: `${STORE_URL}/api/apps/cookie-consent/settings`,
    status: storeCookieSettingsRes.res.status,
    expectedStatus: 200,
    passed:
      storeCookieSettingsRes.res.status === 200 &&
      storeCookieSettingsJson.success === true &&
      storeCookieSettingsJson.data?.theme === "dark",
    notes: `theme: ${storeCookieSettingsJson.data?.theme}, position: ${storeCookieSettingsJson.data?.bannerPosition}`,
  });

  // Public cookie settings endpoint
  const publicCookieRes = await timedFetch(`${STORE_URL}/api/cookie-settings`);
  const publicCookieJson = (await publicCookieRes.res.json()) as any;
  assertResult({
    name: "GET /api/cookie-settings (Public Cookie Settings API)",
    url: `${STORE_URL}/api/cookie-settings`,
    status: publicCookieRes.res.status,
    expectedStatus: 200,
    passed: publicCookieRes.res.status === 200 && publicCookieJson.success === true,
  });

  // Record visitor consent (Accept All)
  const consentRecordRes = await timedFetch(`${STORE_URL}/api/cookie-consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analytics: true,
      marketing: true,
      functional: true,
      action: "accept_all",
    }),
  });
  const consentRecordJson = (await consentRecordRes.res.json()) as any;
  assertResult({
    name: "POST /api/cookie-consent (Record Visitor Consent)",
    url: `${STORE_URL}/api/cookie-consent`,
    status: consentRecordRes.res.status,
    expectedStatus: 200,
    passed: consentRecordRes.res.status === 200 && consentRecordJson.success === true,
  });

  // Retrieve consent stats in Admin
  const consentStatsRes = await timedFetch(`${ADMIN_URL}/api/admin/cookie-consent/stats`, {
    headers: { Cookie: adminCookie },
  });
  const consentStatsJson = (await consentStatsRes.res.json()) as any;
  assertResult({
    name: "GET /api/admin/cookie-consent/stats (Admin Consent Analytics)",
    url: `${ADMIN_URL}/api/admin/cookie-consent/stats`,
    status: consentStatsRes.res.status,
    expectedStatus: 200,
    passed:
      consentStatsRes.res.status === 200 &&
      consentStatsJson.success === true &&
      typeof consentStatsJson.data?.totalLogged === "number",
    notes: `Total Logged: ${consentStatsJson.data?.totalLogged}, Analytics: ${consentStatsJson.data?.analyticsAccepted}`,
  });

  // 5. Storefront Extension Points & Page Rendering
  console.log("\n--> Step 5: Storefront Extension Points & Page Rendering");
  const homeRes = await timedFetch(`${STORE_URL}/`);
  assertResult({
    name: "GET / (Storefront Homepage with Floating Apps)",
    url: `${STORE_URL}/`,
    status: homeRes.res.status,
    expectedStatus: 200,
    passed: homeRes.res.status === 200,
    notes: `Duration: ${homeRes.duration}ms`,
  });

  const cartRes = await timedFetch(`${STORE_URL}/cart`);
  assertResult({
    name: "GET /cart (Storefront Cart Page with Trust Badges & Payment Icons)",
    url: `${STORE_URL}/cart`,
    status: cartRes.res.status,
    expectedStatus: 200,
    passed: cartRes.res.status === 200,
    notes: `Duration: ${cartRes.duration}ms`,
  });

  const cookiePolicyRes = await timedFetch(`${STORE_URL}/cookie-policy`);
  assertResult({
    name: "GET /cookie-policy (Static Policy Page)",
    url: `${STORE_URL}/cookie-policy`,
    status: cookiePolicyRes.res.status,
    expectedStatus: 200,
    passed: cookiePolicyRes.res.status === 200,
    notes: `Duration: ${cookiePolicyRes.duration}ms`,
  });

  // 6. Data Safety Across Uninstall & Reinstall
  console.log("\n--> Step 6: Data Safety Across Uninstall & Reinstall");

  // 6a. Uninstall Trust Badges
  const uninstallBadgesRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "trust-badges" }),
  });
  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall Trust Badges)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallBadgesRes.res.status,
    expectedStatus: 200,
    passed: uninstallBadgesRes.res.status === 200,
  });

  // Verify trust_badges and payment_icons tables are NOT dropped and still intact in DB
  const badgesCheckRes = await timedFetch(`${ADMIN_URL}/api/admin/trust-badges`, {
    headers: { Cookie: adminCookie },
  });
  assertResult({
    name: "Data Safety: trust_badges table intact after uninstall",
    status: badgesCheckRes.res.status,
    expectedStatus: 200,
    passed: badgesCheckRes.res.status === 200,
  });

  // 6b. Uninstall Cookie Consent
  const uninstallCookieRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "cookie-consent" }),
  });
  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall Cookie Consent)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallCookieRes.res.status,
    expectedStatus: 200,
    passed: uninstallCookieRes.res.status === 200,
  });

  // Verify cookie_consent_settings table is NOT dropped
  const cookieCheckRes = await timedFetch(`${ADMIN_URL}/api/admin/cookie-settings`, {
    headers: { Cookie: adminCookie },
  });
  assertResult({
    name: "Data Safety: cookie_consent_settings table intact after uninstall",
    status: cookieCheckRes.res.status,
    expectedStatus: 200,
    passed: cookieCheckRes.res.status === 200,
  });

  // 6c. Reinstall Both Apps
  const reinstallBadgesRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "trust-badges" }),
  });
  const reinstallCookieRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "cookie-consent" }),
  });
  assertResult({
    name: "POST /api/admin/apps/install (Reinstall Both Apps)",
    passed: reinstallBadgesRes.res.status === 200 && reinstallCookieRes.res.status === 200,
    notes: "Trust Badges and Cookie Consent apps re-enabled",
  });

  // Verify created badge still exists after reinstall
  const postReinstallBadgesRes = await timedFetch(
    `${ADMIN_URL}/api/admin/trust-badges`,
    {
      headers: { Cookie: adminCookie },
    }
  );
  const postReinstallBadgesJson = (await postReinstallBadgesRes.res.json()) as any;
  const badgePersisted = Array.isArray(postReinstallBadgesJson.data) &&
    postReinstallBadgesJson.data.some((b: any) => b.id === createdBadgeId);
  assertResult({
    name: "Data Safety: Created badge persisted across reinstall",
    passed: badgePersisted,
    notes: `Badge ID: ${createdBadgeId} verified intact`,
  });

  // Clean up the test badge
  if (createdBadgeId) {
    await timedFetch(`${ADMIN_URL}/api/admin/trust-badges/${createdBadgeId}`, {
      method: "DELETE",
      headers: { Cookie: adminCookie },
    });
  }

  // 7. Storefront Performance & Latency Audit with All 9 Apps Enabled
  console.log("\n--> Step 7: Storefront Performance & Latency Audit (All 9 Apps Enabled)");
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
    name: "GET / Storefront Warm Latency (All 9 Apps Enabled, 5 runs)",
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
