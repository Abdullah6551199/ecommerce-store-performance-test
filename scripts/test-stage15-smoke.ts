async function runStage15SmokeTest() {
  const base = process.env.TEST_BASE_URL || "https://ecommerce-store-v2.zia291930.workers.dev";
  console.log("================================================================================");
  console.log("       STAGE 15: FINAL QUALITY STANDARD COMPREHENSIVE SMOKE TEST");
  console.log(`       Target URL: ${base}`);
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function record(label: string, success: boolean, detail = "") {
    if (success) {
      console.log(`  [PASS] ${label}${detail ? ` -> ${detail}` : ""}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${label}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // 1. Health & Database Integrity Check
  // --------------------------------------------------------------------------
  console.log("[Phase 1] Database & Storage Health Integrity");
  try {
    const res = await fetch(`${base}/api/health`);
    const json = (await res.json()) as any;
    const isHealthy = res.status === 200 && json.status === "healthy";
    const tablesCount = json.database?.tables?.length || 0;
    const r2Active = json.storage?.configured === true;

    record("Health check responds with 200 OK", isHealthy, `Status: ${json.status}`);
    record("D1 Database connected with all 17 tables", tablesCount >= 17, `Found ${tablesCount} tables`);
    record("Cloudflare R2 storage binding active", r2Active, json.storage?.message);
  } catch (err: any) {
    record("Health check endpoint", false, err.message);
  }

  // --------------------------------------------------------------------------
  // 2. Public Storefront Navigation & Discovery
  // --------------------------------------------------------------------------
  console.log("\n[Phase 2] Public Storefront & Dynamic Discovery");
  let sampleProductSlug = "";
  let sampleProductId = "";

  try {
    const res = await fetch(base);
    const html = await res.text();
    record("Homepage loads successfully", res.status === 200 && html.length > 1000, `${html.length} bytes loaded`);
  } catch (err: any) {
    record("Homepage loads", false, err.message);
  }

  try {
    const res = await fetch(`${base}/api/products/search?limit=10`);
    const json = (await res.json()) as any;
    const prods = json.data || [];
    if (prods.length > 0) {
      sampleProductSlug = prods[0].slug;
      sampleProductId = prods[0].id;
    }
    record("Search API returns active products", res.status === 200 && prods.length > 0, `${prods.length} products found`);
  } catch (err: any) {
    record("Search API", false, err.message);
  }

  if (sampleProductSlug) {
    try {
      const res = await fetch(`${base}/product/${sampleProductSlug}`);
      record(`Product detail page (/product/${sampleProductSlug})`, res.status === 200, `HTTP ${res.status}`);
    } catch (err: any) {
      record("Product detail page", false, err.message);
    }
  }

  try {
    const res = await fetch(`${base}/cart`);
    record("Cart page (/cart)", res.status === 200, `HTTP ${res.status}`);
  } catch (err: any) {
    record("Cart page", false, err.message);
  }

  try {
    const res = await fetch(`${base}/checkout`);
    record("Checkout page (/checkout)", res.status === 200, `HTTP ${res.status}`);
  } catch (err: any) {
    record("Checkout page", false, err.message);
  }

  // --------------------------------------------------------------------------
  // 3. Dynamic SEO & Crawler Routes
  // --------------------------------------------------------------------------
  console.log("\n[Phase 3] SEO Architecture & Search Indexing");
  try {
    const res = await fetch(`${base}/sitemap.xml`);
    const xml = await res.text();
    record("Dynamic Sitemap (/sitemap.xml)", res.status === 200 && xml.includes("<urlset"), `HTTP ${res.status}, valid XML`);
  } catch (err: any) {
    record("Sitemap endpoint", false, err.message);
  }

  try {
    const res = await fetch(`${base}/robots.txt`);
    const txt = await res.text();
    record("Dynamic Robots (/robots.txt)", res.status === 200 && txt.includes("Disallow: /admin"), `HTTP ${res.status}`);
  } catch (err: any) {
    record("Robots endpoint", false, err.message);
  }

  // --------------------------------------------------------------------------
  // 4. Security Boundaries & Authorization Guards
  // --------------------------------------------------------------------------
  console.log("\n[Phase 4] Security Boundaries & Admin Session Guards");
  try {
    const res = await fetch(`${base}/api/admin/orders`);
    record("Unauthorized API access blocked (/api/admin/orders)", res.status === 401, `HTTP 401 received`);
  } catch (err: any) {
    record("Unauthorized API access check", false, err.message);
  }

  try {
    const res = await fetch(`${base}/api/admin/categories`);
    record("Unauthorized API access blocked (/api/admin/categories)", res.status === 401, `HTTP 401 received`);
  } catch (err: any) {
    record("Unauthorized API access check", false, err.message);
  }

  try {
    const res = await fetch(`${base}/api/media/upload`, { method: "POST" });
    record("Unauthorized Media Upload blocked", res.status === 401, `HTTP 401 received`);
  } catch (err: any) {
    record("Unauthorized Media Upload check", false, err.message);
  }

  try {
    const res = await fetch(`${base}/admin/dashboard`, { redirect: "manual" });
    const isRedirect = res.status === 307 || res.status === 302 || res.status === 401;
    record("Unauthenticated Admin Page redirects to login", isRedirect, `HTTP ${res.status} redirect`);
  } catch (err: any) {
    record("Admin Page redirect", false, err.message);
  }

  // --------------------------------------------------------------------------
  // 5. Admin Authentication & Theme Customization Flow
  // --------------------------------------------------------------------------
  console.log("\n[Phase 5] Admin Authentication & Theme / Appearance Engine");
  let adminCookie = "";
  try {
    const res = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      adminCookie = setCookie.split(";")[0];
    }
    record("Admin authentication with credentials", res.status === 200 && Boolean(adminCookie), `Session cookie received`);
  } catch (err: any) {
    record("Admin login", false, err.message);
  }

  if (adminCookie) {
    try {
      const res = await fetch(`${base}/api/admin/appearance`, {
        headers: { Cookie: adminCookie },
      });
      const json = (await res.json()) as any;
      record("Get Theme Settings (/api/admin/appearance)", res.status === 200 && json.success === true, `Primary color: ${json.data?.colors?.primary}`);
    } catch (err: any) {
      record("Get Theme Settings", false, err.message);
    }
  }

  // --------------------------------------------------------------------------
  // 6. End-to-End Shopping Cart & Checkout Order
  // --------------------------------------------------------------------------
  console.log("\n[Phase 6] Full E-Commerce Transaction Cycle (Add to Cart -> Checkout)");
  if (sampleProductId) {
    const sessionToken = "smoke-test-" + Date.now();
    let orderId = "";

    try {
      const res = await fetch(`${base}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cart_session_id=${sessionToken}`,
        },
        body: JSON.stringify({
          productId: sampleProductId,
          quantity: 1,
          cartSessionId: sessionToken,
        }),
      });
      const json = (await res.json()) as any;
      record("Add Product to Cart", res.status === 200 && json.success === true, `Item count: 1`);
    } catch (err: any) {
      record("Add Product to Cart", false, err.message);
    }

    try {
      const res = await fetch(`${base}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cart_session_id=${sessionToken}`,
        },
        body: JSON.stringify({
          cartSessionId: sessionToken,
          customerName: "Stage 15 Smoke Buyer",
          phone: "+15551112233",
          email: "smoketest@example.com",
          address: "100 Production Quality Boulevard",
          city: "San Francisco",
          paymentMethod: "cod",
        }),
      });
      const json = (await res.json()) as any;
      orderId = json.data?.orderId || json.data?.order?.id || "";
      record("Place Checkout Order via COD", res.status === 200 && Boolean(orderId), `Order ID: ${orderId}`);
    } catch (err: any) {
      record("Place Checkout Order", false, err.message);
    }

    if (orderId) {
      try {
        const res = await fetch(`${base}/order-success/${orderId}`);
        record("Order Success Confirmation Page", res.status === 200, `HTTP ${res.status} rendered`);
      } catch (err: any) {
        record("Order Success Page", false, err.message);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Final Scorecard
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`  FINAL SMOKE TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStage15SmokeTest().catch((err) => {
  console.error("Smoke test failed with error:", err);
  process.exit(1);
});
