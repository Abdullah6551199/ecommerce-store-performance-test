import { config } from "dotenv";
config({ path: ".env.local" });

const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";
const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";

async function main() {
  console.log("==================================================");
  console.log(" Stage 42.8a-2 — Dark Mode Removal & Cart Fix     ");
  console.log("==================================================");
  console.log(`Store URL: ${STORE_URL}`);
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

  // 1. Storefront HTML checks
  console.log("\n--- 1. Storefront HTML & Light Mode Forcing ---");
  const storeRes = await fetch(`${STORE_URL}/`);
  assert(storeRes.status === 200, "Storefront home returns 200 OK");
  const html = await storeRes.text();

  assert(html.includes('class="light'), "<html> tag explicitly contains 'light' class");
  assert(html.includes("color-scheme:light") || html.includes("colorScheme"), "<html> tag specifies light colorScheme");
  assert(
    html.includes("localStorage.removeItem(\"apex_theme\")") &&
    html.includes('document.documentElement.classList.remove("dark")'),
    "Bootstrap script actively purges apex_theme and ensures dark class is removed"
  );

  // 2. No Dark Mode Toggle in HTML
  console.log("\n--- 2. Verifying No Dark/Light Mode Toggle ---");
  assert(!html.includes('data-theme-key="apex_theme"'), "No ThemeToggle switch element rendered");
  assert(!html.includes('aria-label="Switch to'), "No theme toggle aria-label present");
  assert(!html.includes("apex_admin_theme") && !html.includes("ThemeToggle"), "No ThemeToggle component markers in HTML");

  // 3. Cart Button Formatting
  console.log("\n--- 3. Verifying Cart Button Styling ---");
  assert(html.includes('aria-label="Cart"'), "Cart button has proper aria-label='Cart'");
  assert(html.includes("rounded-full"), "Cart button has rounded-full circular styling");
  // Check ShoppingBag SVG path: M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z
  assert(html.includes("M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"), "Cart button contains ShoppingBag icon path");

  // 4. Cart Drawer / Cart Functionality Check
  console.log("\n--- 4. Checking Cart API & Cart Route ---");
  const cartRes = await fetch(`${STORE_URL}/cart`);
  assert(cartRes.status === 200, "Storefront /cart page returns 200 OK");

  const cartApiRes = await fetch(`${STORE_URL}/api/cart`);
  assert(cartApiRes.status === 200, "Storefront /api/cart endpoint returns 200 OK");

  // 5. Storefront Subpages Unaffected & Light Mode Maintained
  console.log("\n--- 5. Checking Storefront Subpages ---");
  const shopRes = await fetch(`${STORE_URL}/shop`);
  assert(shopRes.status === 200, "Storefront /shop returns 200 OK");
  const shopHtml = await shopRes.text();
  assert(shopHtml.includes('class="light'), "/shop page also contains light class");
  assert(!shopHtml.includes('data-theme-key="apex_theme"'), "/shop page has no theme toggle");

  // 6. Admin Panel Unaffected
  console.log("\n--- 6. Verifying Admin Panel Health ---");
  const adminRes = await fetch(`${ADMIN_URL}/admin/login`);
  assert(adminRes.status === 200, "Admin login page returns 200 OK");

  // 7. Storefront Performance / Latency
  console.log("\n--- 7. Storefront Edge Performance Check ---");
  const t0 = Date.now();
  const perfRes = await fetch(`${STORE_URL}/?_t=${Date.now()}`);
  const latency = Date.now() - t0;
  console.log(`Storefront HTML response time: ${latency}ms`);
  assert(perfRes.status === 200, "Storefront responds 200 OK");
  assert(latency < 2000, "Storefront response latency within expected bounds (<2000ms, edge CPU <10ms)");

  console.log("\n==================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
