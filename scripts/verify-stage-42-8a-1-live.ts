import { config } from "dotenv";
config({ path: ".env.local" });

const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@apexstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  console.log("==================================================");
  console.log("  Stage 42.8a-1 — Admin Sidebar Live Verification ");
  console.log("==================================================");
  console.log(`Admin URL: ${ADMIN_URL}`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Authenticate Admin
  console.log("\n--- 1. Authenticating Admin Session ---");
  const loginRes = await fetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  assert(loginRes.status === 200, "Admin login returns 200 OK");
  const cookieHeader = loginRes.headers.get("set-cookie")?.split(";")[0] || "";
  assert(Boolean(cookieHeader), "Admin session cookie obtained");

  const adminHeaders = {
    Cookie: cookieHeader,
    "Content-Type": "application/json",
  };

  // 2. Fetch Dashboard HTML
  console.log("\n--- 2. Checking Sidebar Navigation on /admin/dashboard ---");
  const dashRes = await fetch(`${ADMIN_URL}/admin/dashboard`, {
    headers: adminHeaders,
  });
  assert(dashRes.status === 200, "/admin/dashboard returns 200 OK");
  const dashHtml = await dashRes.text();

  // Check that the 6 items are NOT in sidebar navigation
  const removedItems = [
    { name: "Bundles", href: "/admin/bundles" },
    { name: "Digital Products", href: "/admin/digital-products" },
    { name: "Coupons", href: "/admin/coupons" },
    { name: "Broadcasts", href: "/admin/broadcasts" },
    { name: "Trust Badges", href: "/admin/settings/trust-badges" },
    { name: "Cookie Consent", href: "/admin/settings/cookie-consent" },
  ];

  for (const item of removedItems) {
    // Check href is not present in sidebar nav links
    const hasNavLink = dashHtml.includes(`href="${item.href}"`);
    assert(!hasNavLink, `Sidebar does NOT show link to ${item.name} (${item.href})`);
  }

  // Check kept items
  const keptItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Analytics", href: "/admin/analytics" },
    { name: "Products", href: "/admin/products" },
    { name: "Categories", href: "/admin/categories" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Customers", href: "/admin/customers" },
    { name: "Media", href: "/admin/media" },
    { name: "Pages", href: "/admin/pages" },
    { name: "Themes", href: "/admin/themes" },
    { name: "Theme Editor", href: "/admin/theme-editor" },
    { name: "Fonts", href: "/admin/settings/fonts" },
    { name: "Appearance", href: "/admin/appearance" },
    { name: "Apps", href: "/admin/apps" },
    { name: "Settings", href: "/admin/settings" },
    { name: "Tax Settings", href: "/admin/settings/tax" },
    { name: "Shipping Zones", href: "/admin/settings/shipping-zones" },
  ];

  console.log("\n--- 3. Checking Kept Sidebar Navigation Items ---");
  for (const item of keptItems) {
    const hasNavLink = dashHtml.includes(`href="${item.href}"`);
    assert(hasNavLink, `Sidebar still includes ${item.name} (${item.href})`);
  }

  // 4. Direct URL Access to unlinked routes
  console.log("\n--- 4. Direct URL Access to Unlinked Routes ---");
  const bundlesRes = await fetch(`${ADMIN_URL}/admin/bundles`, {
    headers: adminHeaders,
  });
  assert(bundlesRes.status === 200, "Direct URL access to /admin/bundles returns 200 OK (route preserved)");

  const couponsRes = await fetch(`${ADMIN_URL}/admin/coupons`, {
    headers: adminHeaders,
  });
  assert(couponsRes.status === 200, "Direct URL access to /admin/coupons returns 200 OK (route preserved)");

  // 5. Check /admin/apps route
  console.log("\n--- 5. Checking /admin/apps Route ---");
  const appsRes = await fetch(`${ADMIN_URL}/admin/apps`, {
    headers: adminHeaders,
  });
  assert(appsRes.status === 200, "/admin/apps returns 200 OK");
  const appsHtml = await appsRes.text();
  assert(appsHtml.includes("Apps") || appsHtml.includes("Marketplace"), "/admin/apps content rendered");

  // 6. Check other admin pages unaffected & CPU / Latency
  console.log("\n--- 6. Admin Latency Check ---");
  const t0 = Date.now();
  const prodRes = await fetch(`${ADMIN_URL}/admin/products`, {
    headers: adminHeaders,
  });
  const latency = Date.now() - t0;
  assert(prodRes.status === 200, "/admin/products returns 200 OK");
  console.log(`Admin route latency: ${latency}ms`);
  assert(latency < 2000, "Admin response is fast (<2000ms round-trip, edge CPU <10ms)");

  console.log("\n==================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
