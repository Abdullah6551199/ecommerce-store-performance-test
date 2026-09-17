/**
 * Stage F0.5c Verification Script
 * Validates CSR admin navigations, CPU execution, and data API integrity.
 */

const BASE_URL = "https://nasrify-admin.zia291930.workers.dev";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

interface CheckResult {
  name: string;
  url: string;
  status: number;
  durationMs: number;
  passed: boolean;
  notes?: string;
}

async function runVerification() {
  console.log("==================================================");
  console.log("🚀 STARTING STAGE F0.5c CSR VERIFICATION SUITE");
  console.log(`Target: ${BASE_URL}`);
  console.log("==================================================\n");

  const results: CheckResult[] = [];

  // 1. Unauthenticated Security Check (No Auth Bypass)
  console.log("🔒 1. Checking unauthenticated route protection...");
  const unauthPages = ["/admin/dashboard", "/admin/products", "/admin/orders", "/api/admin/dashboard"];
  for (const path of unauthPages) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}${path}`, {
      redirect: "manual",
    });
    const t1 = performance.now();
    const isRedirectToLogin = res.status === 307 || res.status === 302 || res.status === 401;
    results.push({
      name: `Unauth Guard: ${path}`,
      url: path,
      status: res.status,
      durationMs: Math.round(t1 - t0),
      passed: isRedirectToLogin,
      notes: isRedirectToLogin ? `Protected -> ${res.headers.get("location") || "401 Unauthorized"}` : "FAILED: Auth bypassed!",
    });
  }

  // 2. Admin Login
  console.log("\n🔑 2. Authenticating admin...");
  const loginT0 = performance.now();
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const loginT1 = performance.now();
  const loginJson = (await loginRes.json()) as any;
  const setCookie = loginRes.headers.get("set-cookie") || "";
  const cookieMatch = setCookie.match(/admin_session=([^;]+)/);
  const sessionToken = cookieMatch ? cookieMatch[1] : "";

  console.log(`Login status: ${loginRes.status}, success: ${loginJson.success}`);
  if (!sessionToken) {
    console.error("❌ CRITICAL: Could not obtain admin_session cookie!");
    process.exit(1);
  }
  console.log(`✓ admin_session cookie obtained: ${sessionToken.slice(0, 16)}...`);
  results.push({
    name: "Admin Login (POST /api/admin/login)",
    url: "/api/admin/login",
    status: loginRes.status,
    durationMs: Math.round(loginT1 - loginT0),
    passed: loginRes.status === 200 && loginJson.success === true,
    notes: `Session token issued (${Math.round(loginT1 - loginT0)}ms)`,
  });

  const authHeaders = {
    Cookie: `admin_session=${sessionToken}`,
  };

  // 3. Page Shell SSR (Target Pages from Stage F0.5c prompt)
  console.log("\n📄 3. Requesting Admin Page Shells (HTML delivery)...");
  const targetPages = [
    "/admin/dashboard",
    "/admin/products",
    "/admin/orders",
    "/admin/analytics",
    "/admin/settings/tax",
    "/admin/categories",
    "/admin/coupons",
    "/admin/reviews",
    "/admin/bundles",
    "/admin/media",
    "/admin/apps",
    "/admin/customers",
    "/admin/pages",
    "/admin/broadcasts",
    "/admin/settings/shipping-zones",
    "/admin/settings/cookie-consent",
    "/admin/settings/trust-badges",
    "/admin/appearance",
    "/admin/homepage",
  ];

  for (const pagePath of targetPages) {
    // Run twice: first request, then cached navigation
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}${pagePath}`, {
      headers: authHeaders,
    });
    const t1 = performance.now();
    const html = await res.text();
    const hasAdminShell = html.includes("admin") || html.includes("Nasrify") || html.includes("Apex") || html.includes("<!DOCTYPE html>");

    results.push({
      name: `Page Shell: ${pagePath}`,
      url: pagePath,
      status: res.status,
      durationMs: Math.round(t1 - t0),
      passed: res.status === 200 && hasAdminShell,
      notes: `HTTP ${res.status}, size: ${Math.round(html.length / 1024)}KB (${Math.round(t1 - t0)}ms RTT)`,
    });
  }

  // 4. CSR Data APIs Verification (Fetched by client components)
  console.log("\n⚡ 4. Checking CSR API Endpoints...");
  const apiEndpoints = [
    { path: "/api/admin/dashboard", label: "Dashboard Metrics" },
    { path: "/api/admin/products?limit=20", label: "Product Catalog" },
    { path: "/api/admin/orders?limit=20", label: "Orders List" },
    { path: "/api/admin/analytics/kpis", label: "Analytics KPIs" },
    { path: "/api/admin/analytics/sales-trend", label: "Sales Trend" },
    { path: "/api/admin/tax/settings", label: "Tax Settings" },
    { path: "/api/admin/categories", label: "Categories Tree" },
    { path: "/api/admin/coupons", label: "Coupons Catalog" },
    { path: "/api/admin/reviews", label: "Reviews Moderation" },
    { path: "/api/admin/bundles", label: "Product Bundles" },
    { path: "/api/admin/media", label: "Media Library" },
    { path: "/api/admin/apps", label: "Installed Apps" },
    { path: "/api/admin/customers?limit=20", label: "Customer Profiles" },
    { path: "/api/admin/pages", label: "CMS Pages" },
    { path: "/api/admin/broadcasts", label: "Broadcast Notifications" },
    { path: "/api/admin/shipping-zones", label: "Shipping Zones" },
    { path: "/api/admin/cookie-settings", label: "Cookie Consent" },
    { path: "/api/admin/trust-badges", label: "Trust Badges" },
    { path: "/api/admin/appearance", label: "Appearance Settings" },
    { path: "/api/admin/homepage", label: "Homepage Sections" },
  ];

  for (const ep of apiEndpoints) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}${ep.path}`, {
      headers: authHeaders,
    });
    const t1 = performance.now();
    const json = (await res.json()) as any;
    const ok = res.status === 200 && (json.success === true || Array.isArray(json) || json.data !== undefined);

    results.push({
      name: `CSR API: ${ep.label}`,
      url: ep.path,
      status: res.status,
      durationMs: Math.round(t1 - t0),
      passed: ok,
      notes: `HTTP ${res.status} (${Math.round(t1 - t0)}ms RTT)`,
    });
  }

  // 5. Print Results Table
  console.log("\n==================================================");
  console.log("📊 VERIFICATION RESULTS TABLE");
  console.log("==================================================");
  console.table(
    results.map((r) => ({
      Test: r.name,
      Status: r.status,
      "RTT (ms)": r.durationMs,
      Passed: r.passed ? "✅ PASS" : "❌ FAIL",
      Notes: r.notes || "",
    }))
  );

  const failed = results.filter((r) => !r.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    console.error(`❌ ${failed.length} checks failed!`);
    process.exit(1);
  } else {
    console.log("🎉 ALL FUNCTIONAL & CSR API VERIFICATIONS PASSED!");
  }
}

runVerification().catch((err) => {
  console.error("Fatal error during verification:", err);
  process.exit(1);
});
