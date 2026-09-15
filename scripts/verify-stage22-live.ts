/**
 * Stage 22 Live Deployment Verification Script
 * Validates Trust Badges, Payment Icons, Cookie Consent, and Cookie Policy on live Worker.
 */

const BASE_URL = "https://ecommerce-store-perf-test.zia291930.workers.dev";

async function verifyLive() {
  console.log("=================================================");
  console.log("  Stage 22: Live Production Verification         ");
  console.log("  Target: " + BASE_URL);
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Public Trust Badges API
    console.log("1. Testing /api/trust-badges on Live Worker:");
    const tbRes = await fetch(`${BASE_URL}/api/trust-badges?location=product`);
    assert(tbRes.status === 200, "GET /api/trust-badges returns HTTP 200");
    const tbJson = (await tbRes.json()) as any;
    assert(tbJson.success === true, "Response success is true");
    assert(Array.isArray(tbJson.data) && tbJson.data.length >= 6, `Returned ${tbJson.data?.length} badges (>= 6)`);
    const secureBadge = tbJson.data.find((b: any) => b.id === "tb_secure");
    assert(Boolean(secureBadge), "Found 'tb_secure' badge with title: " + secureBadge?.title);

    // 2. Public Payment Icons API
    console.log("\n2. Testing /api/payment-icons on Live Worker:");
    const piRes = await fetch(`${BASE_URL}/api/payment-icons`);
    assert(piRes.status === 200, "GET /api/payment-icons returns HTTP 200");
    const piJson = (await piRes.json()) as any;
    assert(piJson.success === true, "Response success is true");
    assert(Array.isArray(piJson.data) && piJson.data.length >= 6, `Returned ${piJson.data?.length} payment icons (>= 6)`);
    const visa = piJson.data.find((p: any) => p.name === "Visa");
    assert(Boolean(visa), "Found Visa payment icon in live D1");

    // 3. Public Cookie Settings API
    console.log("\n3. Testing /api/cookie-settings on Live Worker:");
    const csRes = await fetch(`${BASE_URL}/api/cookie-settings`);
    assert(csRes.status === 200, "GET /api/cookie-settings returns HTTP 200");
    const csJson = (await csRes.json()) as any;
    assert(csJson.success === true, "Response success is true");
    assert(csJson.data.isEnabled === true || csJson.data.isEnabled === 1, "Cookie consent is enabled");
    assert(csJson.data.bannerTitle === "We use cookies", "Banner title is 'We use cookies'");

    // 4. Live Cookie Policy Page HTML
    console.log("\n4. Testing /cookie-policy HTML Rendering on Live Worker:");
    const cpRes = await fetch(`${BASE_URL}/cookie-policy`);
    assert(cpRes.status === 200, "GET /cookie-policy returns HTTP 200");
    const cpHtml = await cpRes.text();
    assert(cpHtml.includes("Cookie Policy"), "Page HTML contains 'Cookie Policy' title");
    assert(cpHtml.includes("Necessary Cookies"), "Page HTML contains 'Necessary Cookies' category");
    assert(cpHtml.includes("Manage Cookie Preferences"), "Page HTML contains 'Manage Cookie Preferences' button");

    // 5. Live Storefront Pages (Product, Cart, Checkout, Home)
    console.log("\n5. Testing Live Storefront Pages HTML Rendering:");
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, "Home page returns HTTP 200");
    const homeHtml = await homeRes.text();
    assert(homeHtml.includes("Cookie Policy &amp; Settings") || homeHtml.includes("Cookie Policy"), "Footer includes link to Cookie Policy");

    const cartRes = await fetch(`${BASE_URL}/cart`);
    assert(cartRes.status === 200, "Cart page returns HTTP 200");

    const checkoutRes = await fetch(`${BASE_URL}/checkout`);
    assert(checkoutRes.status === 200, "Checkout page returns HTTP 200");
    const checkoutHtml = await checkoutRes.text();
    assert(
      checkoutHtml.includes("PREPARING SECURE CHECKOUT") ||
      checkoutHtml.includes("Checkout") ||
      checkoutHtml.includes("Complete Your Order"),
      "Checkout page renders successfully with secure checkout wrapper"
    );

    // 6. Admin Authentication & Protected Endpoints
    console.log("\n6. Testing Protected Admin Endpoints on Live Worker:");
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    assert(loginRes.status === 200, "Admin login returns HTTP 200");
    const cookie = loginRes.headers.get("set-cookie");
    assert(Boolean(cookie), "Admin session cookie returned");

    if (cookie) {
      const authHeader = { cookie: cookie.split(";")[0] };

      const adminTbRes = await fetch(`${BASE_URL}/api/admin/trust-badges`, { headers: authHeader });
      assert(adminTbRes.status === 200, "GET /api/admin/trust-badges returns HTTP 200");
      const adminTbJson = (await adminTbRes.json()) as any;
      assert(adminTbJson.count >= 6, `Admin retrieved ${adminTbJson.count} trust badges`);

      const adminPiRes = await fetch(`${BASE_URL}/api/admin/payment-icons`, { headers: authHeader });
      assert(adminPiRes.status === 200, "GET /api/admin/payment-icons returns HTTP 200");
      const adminPiJson = (await adminPiRes.json()) as any;
      assert(adminPiJson.count >= 6, `Admin retrieved ${adminPiJson.count} payment icons`);

      const adminCsRes = await fetch(`${BASE_URL}/api/admin/cookie-settings`, { headers: authHeader });
      assert(adminCsRes.status === 200, "GET /api/admin/cookie-settings returns HTTP 200");
      const adminCsJson = (await adminCsRes.json()) as any;
      assert(Boolean(adminCsJson.data?.bannerTitle), "Admin retrieved cookie consent settings payload");
    }

    console.log("\n=================================================");
    console.log(`  Live Verification Complete: ${passed} Passed, ${failed} Failed`);
    console.log("=================================================");

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error("Live verification encountered an error:", error);
    process.exit(1);
  }
}

verifyLive();
