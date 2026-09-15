import { execSync } from "child_process";

/**
 * Stage C: Apps Framework Part 1 Verification Suite
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

async function verifyStageC() {
  console.log("==================================================================");
  console.log("  STAGE C: APPS FRAMEWORK PART 1 VERIFICATION");
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
    passed: loginRes.res.status === 200 && !!sessionToken,
    notes: sessionToken ? "Session cookie acquired" : "FAILED to get session cookie",
  });

  const adminHeaders = {
    Cookie: cookieHeader,
    "Content-Type": "application/json",
  };

  // 2. GET /admin/apps UI page
  console.log("\n--> Step 2: Admin Apps UI & Listing API");
  const pageRes = await timedFetch(`${ADMIN_URL}/admin/apps`, {
    headers: { Cookie: cookieHeader },
  });
  assertResult({
    name: "GET /admin/apps (UI Page loads)",
    url: `${ADMIN_URL}/admin/apps`,
    status: pageRes.res.status,
    expectedStatus: 200,
    ttfbMs: pageRes.ttfbMs,
    passed: pageRes.res.status === 200,
  });

  // 3. GET /api/admin/apps (API returns Hello World)
  const listRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: adminHeaders,
  });
  const listJson = (await listRes.res.json().catch(() => null)) as any;
  const helloWorldFound =
    listJson?.success &&
    Array.isArray(listJson?.data) &&
    listJson.data.some((a: any) => a.id === "hello-world");

  assertResult({
    name: "GET /api/admin/apps (Lists registered apps)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: listRes.res.status,
    expectedStatus: 200,
    ttfbMs: listRes.ttfbMs,
    passed: listRes.res.status === 200 && helloWorldFound,
    notes: helloWorldFound ? "hello-world app found in registry" : "hello-world not found",
  });

  // 4. Data safety setup: Create dummy table app_hello-world_test in D1
  console.log("\n--> Step 3: Data Safety Setup & Pre-Install State");
  try {
    runRemoteD1(
      "CREATE TABLE IF NOT EXISTS \\\"app_hello-world_test\\\" (id TEXT PRIMARY KEY, test_val TEXT); INSERT OR REPLACE INTO \\\"app_hello-world_test\\\" (id, test_val) VALUES ('test-1', 'preservation_data');"
    );
    console.log("  Prepared test table \"app_hello-world_test\" with sample record.");
  } catch (err) {
    console.warn("  Failed to create dummy table:", err);
  }

  // 5. POST /api/admin/apps/install
  console.log("\n--> Step 4: Install App Lifecycle");
  const installRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ appId: "hello-world" }),
  });
  const installJson = (await installRes.res.json().catch(() => null)) as any;
  assertResult({
    name: "POST /api/admin/apps/install (Install hello-world)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: installRes.res.status,
    expectedStatus: 200,
    ttfbMs: installRes.ttfbMs,
    passed: installRes.res.status === 200 && installJson?.data?.status === "installed",
    notes: installJson?.data?.status,
  });

  // Verify installed in D1
  const d1Installed = runRemoteD1(
    "SELECT id, version, enabled FROM installed_apps WHERE id = 'hello-world'"
  );
  const installedRow = d1Installed?.[0]?.results?.[0];
  const isInstalledInDb = installedRow && installedRow.id === "hello-world" && (installedRow.enabled === 1 || installedRow.enabled === true);
  assertResult({
    name: "D1 Verification: installed_apps (installed & enabled = 1)",
    url: "D1: ecommerce-perf-db",
    status: isInstalledInDb ? 200 : 500,
    expectedStatus: 200,
    ttfbMs: 0,
    passed: Boolean(isInstalledInDb),
    notes: `Row: ${JSON.stringify(installedRow || {})}`,
  });

  // 6. POST /api/admin/apps/toggle (Disable)
  console.log("\n--> Step 5: Toggle Disable Lifecycle");
  const disableRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/toggle`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ appId: "hello-world", enabled: false }),
  });
  const disableJson = (await disableRes.res.json().catch(() => null)) as any;
  assertResult({
    name: "POST /api/admin/apps/toggle (Disable hello-world)",
    url: `${ADMIN_URL}/api/admin/apps/toggle`,
    status: disableRes.res.status,
    expectedStatus: 200,
    ttfbMs: disableRes.ttfbMs,
    passed: disableRes.res.status === 200 && disableJson?.data?.enabled === false,
    notes: `enabled: ${disableJson?.data?.enabled}`,
  });

  const d1Disabled = runRemoteD1(
    "SELECT id, enabled FROM installed_apps WHERE id = 'hello-world'"
  );
  const disabledRow = d1Disabled?.[0]?.results?.[0];
  const isDisabledInDb = disabledRow && (disabledRow.enabled === 0 || disabledRow.enabled === false);
  assertResult({
    name: "D1 Verification: installed_apps (enabled = 0)",
    url: "D1: ecommerce-perf-db",
    status: isDisabledInDb ? 200 : 500,
    expectedStatus: 200,
    ttfbMs: 0,
    passed: Boolean(isDisabledInDb),
    notes: `Row: ${JSON.stringify(disabledRow || {})}`,
  });

  // 7. POST /api/admin/apps/toggle (Enable)
  console.log("\n--> Step 6: Toggle Enable Lifecycle");
  const enableRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/toggle`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ appId: "hello-world", enabled: true }),
  });
  const enableJson = (await enableRes.res.json().catch(() => null)) as any;
  assertResult({
    name: "POST /api/admin/apps/toggle (Enable hello-world)",
    url: `${ADMIN_URL}/api/admin/apps/toggle`,
    status: enableRes.res.status,
    expectedStatus: 200,
    ttfbMs: enableRes.ttfbMs,
    passed: enableRes.res.status === 200 && enableJson?.data?.enabled === true,
    notes: `enabled: ${enableJson?.data?.enabled}`,
  });

  // 8. POST /api/admin/apps/uninstall (Data Safety Test)
  console.log("\n--> Step 7: Uninstall Lifecycle & Data Safety Test");
  const uninstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ appId: "hello-world" }),
  });
  const uninstallJson = (await uninstallRes.res.json().catch(() => null)) as any;
  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall hello-world)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallRes.res.status,
    expectedStatus: 200,
    ttfbMs: uninstallRes.ttfbMs,
    passed: uninstallRes.res.status === 200 && uninstallJson?.data?.status === "uninstalled",
    notes: uninstallJson?.data?.status,
  });

  // Check uninstalled from installed_apps
  const d1Uninstalled = runRemoteD1(
    "SELECT count(*) as cnt FROM installed_apps WHERE id = 'hello-world'"
  );
  const uninstalledCount = d1Uninstalled?.[0]?.results?.[0]?.cnt;
  assertResult({
    name: "D1 Verification: installed_apps (Record removed)",
    url: "D1: ecommerce-perf-db",
    status: uninstalledCount === 0 ? 200 : 500,
    expectedStatus: 200,
    ttfbMs: 0,
    passed: uninstalledCount === 0,
    notes: `count: ${uninstalledCount}`,
  });

  // DATA SAFETY TEST: Verify dummy table still exists and data preserved!
  const d1SafetyCheck = runRemoteD1(
    "SELECT test_val FROM \\\"app_hello-world_test\\\" WHERE id = 'test-1'"
  );
  const safetyRecord = d1SafetyCheck?.[0]?.results?.[0];
  const isDataPreserved = safetyRecord && safetyRecord.test_val === "preservation_data";
  assertResult({
    name: "DATA SAFETY VERIFICATION: app_hello-world_test table and rows preserved!",
    url: "D1: ecommerce-perf-db",
    status: isDataPreserved ? 200 : 500,
    expectedStatus: 200,
    ttfbMs: 0,
    passed: Boolean(isDataPreserved),
    notes: `Preserved record: ${JSON.stringify(safetyRecord || {})}`,
  });

  // 9. Verify app_install_log contains 4 actions
  console.log("\n--> Step 8: Audit Log Verification");
  const d1Logs = runRemoteD1(
    "SELECT action, notes FROM app_install_log WHERE app_id = 'hello-world' ORDER BY id ASC"
  );
  const logRows = d1Logs?.[0]?.results || [];
  const actionsLogged = logRows.map((r: any) => r.action);
  const hasExpectedActions =
    actionsLogged.includes("install") &&
    actionsLogged.includes("disable") &&
    actionsLogged.includes("enable") &&
    actionsLogged.includes("uninstall");

  assertResult({
    name: "D1 Verification: app_install_log (Audit trail records all 4 actions)",
    url: "D1: ecommerce-perf-db",
    status: hasExpectedActions ? 200 : 500,
    expectedStatus: 200,
    ttfbMs: 0,
    passed: hasExpectedActions,
    notes: `Recorded actions: ${actionsLogged.join(" -> ")} (total: ${logRows.length})`,
  });

  // 10. Verify Storefront Worker Untouched & Operational
  console.log("\n--> Step 9: Verify Storefront Worker");
  const storeHomeRes = await timedFetch(`${STORE_URL}/`);
  assertResult({
    name: "Storefront Worker: GET / (Homepage loads)",
    url: `${STORE_URL}/`,
    status: storeHomeRes.res.status,
    expectedStatus: 200,
    ttfbMs: storeHomeRes.ttfbMs,
    passed: storeHomeRes.res.status === 200,
  });

  const storeShopRes = await timedFetch(`${STORE_URL}/shop`);
  assertResult({
    name: "Storefront Worker: GET /shop (Shop loads)",
    url: `${STORE_URL}/shop`,
    status: storeShopRes.res.status,
    expectedStatus: 200,
    ttfbMs: storeShopRes.ttfbMs,
    passed: storeShopRes.res.status === 200,
  });

  // 11. Verify Monolith Worker Untouched & Operational
  console.log("\n--> Step 10: Verify Monolith Worker");
  const monolithRes = await timedFetch(`${MONOLITH_URL}/`);
  assertResult({
    name: "Monolith Worker: GET / (Loads successfully)",
    url: `${MONOLITH_URL}/`,
    status: monolithRes.res.status,
    expectedStatus: 200,
    ttfbMs: monolithRes.ttfbMs,
    passed: monolithRes.res.status === 200,
  });

  console.log("\n==================================================================");
  console.log(`  VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==================================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

verifyStageC().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
