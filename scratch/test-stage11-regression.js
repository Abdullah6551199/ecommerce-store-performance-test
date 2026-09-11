/**
 * Stage 11 Full Functional Regression & Security Suite
 * Targets: https://ecommerce-store-perf-test.zia291930.workers.dev
 */

const BASE_URL = process.env.TEST_URL || "https://ecommerce-store-perf-test.zia291930.workers.dev";

async function runRegression() {
  console.log("================================================================================");
  console.log("  STAGE 11 FULL FUNCTIONAL REGRESSION & SECURITY AUDIT");
  console.log(`  Base URL: ${BASE_URL}`);
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = "") {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName} ${detail ? `(${detail})` : ""}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // --- PART A: Storefront Pages HTTP 200 & Render Verification ---
  console.log("--- PART A: Storefront Pages HTTP 200 ---");
  const pages = [
    { name: "Homepage", path: "/" },
    { name: "Product Detail", path: "/product/apex-velocity-runner-x1" },
    { name: "Category Page", path: "/category/footwear" },
    { name: "Search Page", path: "/search?q=runner" },
    { name: "Cart Page", path: "/cart" },
    { name: "Checkout Page", path: "/checkout" },
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`);
      assert(res.status === 200, `${page.name} returns HTTP 200`, `Status: ${res.status}`);
      const text = await res.text();
      assert(text.length > 500, `${page.name} has content body`, `${text.length} bytes`);
    } catch (err) {
      assert(false, `${page.name} load error`, err.message);
    }
  }

  // --- PART B: Public vs Protected API Endpoints ---
  console.log("\n--- PART B: API Endpoints (Public 200 vs Admin 401) ---");
  const publicApis = [
    "/api/health",
    "/api/products/search?q=runner",
    "/api/categories",
    "/api/appearance",
    "/api/settings",
    "/api/homepage/sections",
  ];

  for (const endpoint of publicApis) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      assert(res.status === 200, `Public API ${endpoint} returns 200`, `Status: ${res.status}`);
      const json = await res.json();
      assert(json !== null && typeof json === "object", `Public API ${endpoint} returns valid JSON`);
    } catch (err) {
      assert(false, `Public API ${endpoint}`, err.message);
    }
  }

  const protectedAdminApis = [
    "/api/admin/orders",
    "/api/admin/products",
    "/api/admin/categories",
    "/api/admin/customers",
    "/api/admin/homepage/sections",
    "/api/admin/appearance",
    "/api/admin/settings",
  ];

  for (const endpoint of protectedAdminApis) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      assert(res.status === 401, `Admin API without Auth ${endpoint} returns 401 Unauthorized`, `Status: ${res.status}`);
    } catch (err) {
      assert(false, `Admin API ${endpoint}`, err.message);
    }
  }

  // --- PART C: Security Tests & Server-Side Price Integrity ---
  console.log("\n--- PART C: Security & Integrity Tests ---");

  // 1. Empty cart checkout rejection
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fullName: "Security Tester",
          email: "security@apexstore.com",
          phone: "+15555555555",
          shippingAddress: "123 Security Blvd, Cyber City",
        },
        items: [],
      }),
    });
    assert(res.status === 400, "Empty cart checkout is rejected with 400", `Status: ${res.status}`);
  } catch (err) {
    assert(false, "Empty cart rejection test", err.message);
  }

  // 2. Invalid product ID rejection
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fullName: "Security Tester",
          email: "security@apexstore.com",
          phone: "+15555555555",
          shippingAddress: "123 Security Blvd, Cyber City",
        },
        items: [{ productId: "non-existent-uuid-99999", quantity: 1, price: 10 }],
      }),
    });
    assert(res.status === 400 || res.status === 404, "Invalid product ID order is rejected", `Status: ${res.status}`);
  } catch (err) {
    assert(false, "Invalid product rejection test", err.message);
  }

  // 3. Excess stock order rejection
  // First fetch active product to get real product ID
  let activeProduct = null;
  try {
    const searchRes = await fetch(`${BASE_URL}/api/products/search?q=runner`);
    const searchJson = await searchRes.json();
    if (searchJson.data && searchJson.data.length > 0) {
      activeProduct = searchJson.data[0];
    }
  } catch (e) {}

  if (activeProduct) {
    try {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: "Security Tester",
            email: "security@apexstore.com",
            phone: "+15555555555",
            shippingAddress: "123 Security Blvd, Cyber City",
          },
          items: [{ productId: activeProduct.id, quantity: 999999, price: activeProduct.price }],
        }),
      });
      assert(res.status === 400, "Excess stock order (>999999) is rejected with 400", `Status: ${res.status}`);
    } catch (err) {
      assert(false, "Excess stock rejection test", err.message);
    }

    // 4. Server recalculates price from D1 database (tampered client price ignored)
    try {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Integrity Tester",
          email: "integrity@apexstore.com",
          phone: "+15555555555",
          address: "456 Integrity Way",
          city: "San Francisco",
          items: [{ productId: activeProduct.id, quantity: 1, price: 0.01 }],
        }),
      });
      const orderJson = await res.json();
      const placedOrder = orderJson.data?.order;
      const serverPrice = activeProduct.salePrice || activeProduct.price;
      const expectedTotal = Number(serverPrice) >= 100 ? Number(serverPrice) : Number(serverPrice) + 15;
      assert(
        res.status === 200 && placedOrder && Math.abs(Number(placedOrder.total) - expectedTotal) < 0.01,
        "Server recalculates price from D1 database (tampered price ignored)",
        `Client submitted: $0.01 -> Server charged: $${placedOrder?.total}`
      );
    } catch (err) {
      assert(false, "Server-side price integrity test", err.message);
    }
  }

  // --- PART D: Admin Panel & CRUD Verification ---
  console.log("\n--- PART D: Admin Panel & CRUD Verification ---");
  let adminCookie = "";
  try {
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });
    const loginJson = await loginRes.json();
    adminCookie = loginRes.headers.get("set-cookie")?.split(";")[0] || "";
    assert(loginRes.status === 200 && loginJson.success, "Admin login succeeds with valid credentials");
    assert(Boolean(adminCookie), "Admin login returns session cookie");
  } catch (err) {
    assert(false, "Admin login request", err.message);
  }

  if (adminCookie) {
    const adminRoutes = [
      { name: "Admin Dashboard Page", path: "/admin/dashboard", isPage: true },
      { name: "Admin Products Page", path: "/admin/products", isPage: true },
      { name: "Admin Categories Page", path: "/admin/categories", isPage: true },
      { name: "Admin Orders Page", path: "/admin/orders", isPage: true },
      { name: "Admin Customers Page", path: "/admin/customers", isPage: true },
      { name: "Admin Media Page", path: "/admin/media", isPage: true },
      { name: "Admin Homepage Page", path: "/admin/homepage", isPage: true },
      { name: "Admin Appearance Page", path: "/admin/appearance", isPage: true },
      { name: "Admin Settings Page", path: "/admin/settings", isPage: true },
      { name: "Admin Products API", path: "/api/admin/products", isPage: false },
      { name: "Admin Categories API", path: "/api/admin/categories", isPage: false },
      { name: "Admin Orders API", path: "/api/admin/orders", isPage: false },
      { name: "Admin Customers API", path: "/api/admin/customers", isPage: false },
      { name: "Admin Homepage Sections API", path: "/api/admin/homepage/sections", isPage: false },
      { name: "Admin Appearance API", path: "/api/admin/appearance", isPage: false },
      { name: "Admin Settings API", path: "/api/admin/settings", isPage: false },
    ];

    for (const r of adminRoutes) {
      try {
        const res = await fetch(`${BASE_URL}${r.path}`, {
          headers: { Cookie: adminCookie },
        });
        assert(res.status === 200, `Authenticated ${r.name} (${r.path}) returns HTTP 200`, `Status: ${res.status}`);
      } catch (err) {
        assert(false, `Authenticated ${r.name}`, err.message);
      }
    }
  }

  // --- Summary ---
  console.log("\n================================================================================");
  console.log(`  REGRESSION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegression().catch((err) => {
  console.error(err);
  process.exit(1);
});
