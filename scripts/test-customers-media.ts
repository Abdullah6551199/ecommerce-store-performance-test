async function runTest() {
  const base = process.env.TEST_BASE_URL || "https://ecommerce-store-v2.zia291930.workers.dev";
  console.log("================================================================================");
  console.log("       TEST: ADMIN CUSTOMERS & MEDIA INTEGRATION");
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

  // 1. Security Check: Unauthenticated access to /api/admin/customers & /api/admin/media must fail with 401
  console.log("[Phase 1] Security & Auth Protection");
  try {
    const custRes = await fetch(`${base}/api/admin/customers`);
    record("Unauthenticated /api/admin/customers returns 401", custRes.status === 401, `Status: ${custRes.status}`);
  } catch (err: any) {
    record("Unauthenticated customers endpoint", false, err.message);
  }

  try {
    const mediaRes = await fetch(`${base}/api/admin/media`);
    record("Unauthenticated /api/admin/media returns 401", mediaRes.status === 401, `Status: ${mediaRes.status}`);
  } catch (err: any) {
    record("Unauthenticated media endpoint", false, err.message);
  }

  // 2. Admin Login
  console.log("\n[Phase 2] Admin Authentication");
  let cookieHeader = "";
  try {
    const loginRes = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });

    const loginData = (await loginRes.json()) as any;
    const setCookie = loginRes.headers.get("set-cookie");
    if (setCookie) {
      cookieHeader = setCookie.split(";")[0];
    }

    record("Admin login successful", loginRes.status === 200 && loginData.success, `Role: ${loginData.admin?.role}`);
    record("Admin session cookie issued", !!cookieHeader, cookieHeader ? "Session cookie present" : "None");
  } catch (err: any) {
    record("Admin login failed", false, err.message);
  }

  // 3. Authenticated Customers Query
  console.log("\n[Phase 3] Authenticated Customers API");
  if (cookieHeader) {
    try {
      const custRes = await fetch(`${base}/api/admin/customers`, {
        headers: { Cookie: cookieHeader },
      });
      const custData = (await custRes.json()) as any;
      record(
        "GET /api/admin/customers responds 200 OK",
        custRes.status === 200 && custData.success,
        `Found ${custData.data?.customers?.length || 0} customers`
      );

      const customers = custData.data?.customers || [];
      if (customers.length > 0) {
        const c0 = customers[0];
        console.log(`     Sample Customer: "${c0.name}" | Phone: "${c0.phone}" | Orders: ${c0.totalOrders} | Spent: $${c0.totalSpent}`);
        record("Customer record contains essential fields", !!(c0.name && c0.phone && typeof c0.totalOrders === "number"), `Last order: ${c0.lastOrderDate}`);
      }

      const summary = custData.data?.summary;
      if (summary) {
        record("Customers summary metrics calculated", summary.totalCustomers > 0 && summary.totalRevenue > 0, `Total Revenue: $${summary.totalRevenue}, AOV: $${summary.averageOrderValue}`);
      }
    } catch (err: any) {
      record("Authenticated customers endpoint", false, err.message);
    }
  }

  // 4. Authenticated Media Query
  console.log("\n[Phase 4] Authenticated Media API");
  if (cookieHeader) {
    try {
      const mediaRes = await fetch(`${base}/api/admin/media`, {
        headers: { Cookie: cookieHeader },
      });
      const mediaData = (await mediaRes.json()) as any;
      record(
        "GET /api/admin/media responds 200 OK",
        mediaRes.status === 200 && mediaData.success,
        `Found ${mediaData.data?.items?.length || 0} media assets`
      );

      const items = mediaData.data?.items || [];
      if (items.length > 0) {
        const m0 = items[0];
        console.log(`     Sample Media: "${m0.url}" | Type: ${m0.type} | Size: ${m0.size} bytes`);
        record("Media record contains valid URL and MIME type", !!(m0.url && m0.type), `ID: ${m0.id}`);
      }

      const summary = mediaData.data?.summary;
      if (summary) {
        record("Media storage metrics calculated", summary.totalFiles > 0, `Total Size: ${summary.totalSizeFormatted}`);
      }
    } catch (err: any) {
      record("Authenticated media endpoint", false, err.message);
    }
  }

  console.log("\n================================================================================");
  console.log(`       SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTest();
