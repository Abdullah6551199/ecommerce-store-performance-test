/**
 * Live verification script for Stage 42 (Themes Framework)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";
const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@apexstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  console.log("=== Stage 42 Live Verification ===");
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

  // 1. Check Storefront GET /api/themes/active
  console.log("\n--- 1. Testing Storefront Active Theme Public API ---");
  const activeRes = await fetch(`${STORE_URL}/api/themes/active`);
  assert(activeRes.status === 200, `GET ${STORE_URL}/api/themes/active returned 200`);
  const activeData = await activeRes.json();
  assert(activeData.success === true, "activeData.success is true");
  assert(activeData.theme?.slug === "nasrify-default", `Active theme slug is 'nasrify-default' (got: ${activeData.theme?.slug})`);
  assert(activeData.theme?.theme_json?.sections?.length === 10, `Active theme has 10 sections configured (got: ${activeData.theme?.theme_json?.sections?.length})`);

  // 2. Check Storefront Homepage HTML for Theme Engine rendering and CSS variables
  console.log("\n--- 2. Testing Storefront Homepage HTML Rendering ---");
  const t0 = performance.now();
  const homeRes = await fetch(STORE_URL, { headers: { "Cache-Control": "no-cache" } });
  const latency = Math.round(performance.now() - t0);
  assert(homeRes.status === 200, `GET ${STORE_URL} returned 200 (latency: ${latency}ms)`);
  const homeHtml = await homeRes.text();

  assert(homeHtml.includes('id="nasrify-theme-vars"'), "HTML contains injected theme CSS variables <style id=\"nasrify-theme-vars\">");
  assert(homeHtml.includes("--theme-primary:"), "CSS variables contain --theme-primary");
  assert(homeHtml.includes("--theme-font-heading:"), "CSS variables contain --theme-font-heading");
  assert(homeHtml.includes("Free shipping on orders over $50"), "AnnouncementBar section rendered with text");
  assert(homeHtml.includes("Curated Minimalism") || homeHtml.includes("Elevate Your Lifestyle"), "Hero section rendered with heading");
  assert(homeHtml.includes("Featured Products"), "ProductGrid section rendered with heading");
  assert(homeHtml.includes("Shop by Category"), "Categories section rendered with heading");
  assert(homeHtml.includes("Summer Sale — 30% Off"), "Banner section rendered with heading");
  assert(homeHtml.includes("What Our Customers Say"), "Testimonials section rendered with heading");
  assert(homeHtml.includes("New Arrivals"), "ProductCarousel section rendered with heading");
  assert(homeHtml.includes("Subscribe to our newsletter") || homeHtml.includes("Subscribe for updates"), "Newsletter section rendered");
  assert(homeHtml.includes("© 2026 Nasrify"), "Footer section rendered with copyright");

  // 3. Check other Storefront pages (cart, checkout, shop) are intact
  console.log("\n--- 3. Testing Non-Homepage Storefront Pages ---");
  const cartRes = await fetch(`${STORE_URL}/cart`);
  assert(cartRes.status === 200, `GET ${STORE_URL}/cart returned 200`);
  const cartHtml = await cartRes.text();
  assert(cartHtml.includes("Your Shopping Cart") || cartHtml.includes("cart") || cartHtml.includes("Cart"), "Cart page rendered properly");

  const shopRes = await fetch(`${STORE_URL}/shop`);
  assert(shopRes.status === 200, `GET ${STORE_URL}/shop returned 200`);

  // 4. Admin Authentication
  console.log("\n--- 4. Testing Admin Authentication & Themes API ---");
  const loginRes = await fetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  assert(loginRes.status === 200, `POST ${ADMIN_URL}/api/admin/login returned 200`);
  const loginCookie = loginRes.headers.get("set-cookie") || "";
  assert(loginCookie.length > 0, "Admin login set-cookie received");

  const adminHeaders = {
    Cookie: loginCookie.split(";")[0],
    "Content-Type": "application/json",
  };

  // 5. Admin Theme List API
  const listRes = await fetch(`${ADMIN_URL}/api/admin/themes`, { headers: adminHeaders });
  assert(listRes.status === 200, `GET ${ADMIN_URL}/api/admin/themes returned 200`);
  const listData = await listRes.json();
  assert(listData.success === true, "Themes list success is true");
  assert(Array.isArray(listData.themes), "Themes list is array");
  const defaultTheme = listData.themes.find((t: any) => t.slug === "nasrify-default");
  assert(!!defaultTheme, "Default theme exists in admin theme list");
  assert(defaultTheme?.isActive === true, "Default theme is marked isActive: true");
  assert(defaultTheme?.is_built_in === 1, "Default theme is marked is_built_in: 1");

  // 6. Test Duplicate Theme
  console.log("\n--- 6. Testing Duplicate Theme API ---");
  const dupRes = await fetch(`${ADMIN_URL}/api/admin/themes/${defaultTheme.id}/duplicate`, {
    method: "POST",
    headers: adminHeaders,
  });
  assert(dupRes.status === 200, `POST duplicate theme returned 200`);
  const dupData = await dupRes.json();
  assert(dupData.success === true, "Duplicate success is true");
  const customTheme = dupData.theme;
  assert(customTheme.is_built_in === 0, "Custom theme is NOT built in (is_built_in: 0)");
  assert(customTheme.status === "draft", "Custom theme status is draft");
  console.log(`Created custom theme ID: ${customTheme.id}, Slug: ${customTheme.slug}`);

  // 7. Test Activate Custom Theme
  console.log("\n--- 7. Testing Activate Theme & Storefront Invalidation ---");
  const actRes = await fetch(`${ADMIN_URL}/api/admin/themes/activate`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ themeId: customTheme.id }),
  });
  assert(actRes.status === 200, `POST activate theme returned 200`);
  const actData = await actRes.json();
  assert(actData.success === true, "Activation success is true");

  // Wait 1 second for propagation
  await new Promise((r) => setTimeout(r, 1000));

  // Check Storefront Active API
  const activeRes2 = await fetch(`${STORE_URL}/api/themes/active?t=${Date.now()}`);
  const activeData2 = await activeRes2.json();
  assert(activeData2.theme?.id === customTheme.id, `Storefront now reports custom theme active (got: ${activeData2.theme?.id})`);

  // 8. Re-activate Default Theme
  console.log("\n--- 8. Re-activating Default Theme ---");
  const reactRes = await fetch(`${ADMIN_URL}/api/admin/themes/activate`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ themeId: defaultTheme.id }),
  });
  assert(reactRes.status === 200, "Re-activation of default theme returned 200");

  // Wait 1 second
  await new Promise((r) => setTimeout(r, 1000));
  const activeRes3 = await fetch(`${STORE_URL}/api/themes/active?t=${Date.now()}`);
  const activeData3 = await activeRes3.json();
  assert(activeData3.theme?.id === defaultTheme.id, "Storefront restored to default theme");

  // 9. Built-in Theme Protection & Delete Custom Theme
  console.log("\n--- 9. Testing Built-in Protection & Custom Theme Deletion ---");
  // Try deleting built-in theme (MUST fail)
  const delBuiltinRes = await fetch(`${ADMIN_URL}/api/admin/themes/${defaultTheme.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert(delBuiltinRes.status === 400 || delBuiltinRes.status === 403, `Deleting built-in theme rejected (${delBuiltinRes.status})`);

  // Delete custom theme (MUST succeed)
  const delCustomRes = await fetch(`${ADMIN_URL}/api/admin/themes/${customTheme.id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert(delCustomRes.status === 200, `Deleting custom theme returned 200`);
  const delData = await delCustomRes.json();
  assert(delData.success === true, "Custom theme deletion confirmed");

  // 10. Summary
  console.log("\n=================================");
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("=================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
