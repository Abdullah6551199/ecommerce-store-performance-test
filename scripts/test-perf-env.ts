async function runPerfEnvVerification() {
  const perfBase = "https://ecommerce-store-perf-test.zia291930.workers.dev";
  const prodBase = "https://ecommerce-store-v2.zia291930.workers.dev";

  console.log("================================================================================");
  console.log("       ISOLATED ENVIRONMENT VERIFICATION: ecommerce-store-perf-test");
  console.log(`       Perf Test Target: ${perfBase}`);
  console.log(`       Production Target (Control): ${prodBase}`);
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

  // Phase 1: Isolated Worker Health & Database Integrity
  console.log("[Phase 1] Isolated Worker Database & Storage Integrity");
  try {
    const res = await fetch(`${perfBase}/api/health`);
    const json = (await res.json()) as any;
    const isHealthy = res.status === 200 && json.status === "healthy";
    const tablesCount = json.database?.tables?.length || 0;
    const r2Active = json.storage?.configured === true;

    record("Perf Worker /api/health responds 200 OK", isHealthy, `Status: ${json.status}`);
    record("Perf D1 Database (ecommerce-perf-db) connected with all tables", tablesCount >= 17, `Found ${tablesCount} tables`);
    record("Perf R2 Storage (ecommerce-perf-assets) binding active", r2Active, json.storage?.message);
  } catch (err: any) {
    record("Perf Worker Health Check", false, err.message);
  }

  // Phase 2: Public Storefront on Isolated Worker
  console.log("\n[Phase 2] Public Storefront & Discovery APIs");
  try {
    const res = await fetch(perfBase);
    const html = await res.text();
    record("Perf Homepage renders successfully", res.status === 200 && html.length > 1000, `${html.length} bytes loaded`);
  } catch (err: any) {
    record("Perf Homepage", false, err.message);
  }

  try {
    const res = await fetch(`${perfBase}/api/products/search?limit=10`);
    const json = (await res.json()) as any;
    const prods = json.data || [];
    record("Perf Search API returns products from ecommerce-perf-db", prods.length > 0, `Found ${prods.length} products`);
  } catch (err: any) {
    record("Perf Products Search", false, err.message);
  }

  try {
    const res = await fetch(`${perfBase}/api/categories`);
    const json = (await res.json()) as any;
    const cats = json.data?.categories || (Array.isArray(json.data) ? json.data : []);
    record("Perf Categories API returns categories", cats.length > 0, `Found ${cats.length} categories`);
  } catch (err: any) {
    record("Perf Categories API", false, err.message);
  }

  // Phase 3: Admin Authentication & Data on Isolated Worker
  console.log("\n[Phase 3] Admin Authentication & Isolated Management");
  let cookieHeader = "";
  try {
    const loginRes = await fetch(`${perfBase}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    const loginData = (await loginRes.json()) as any;
    const setCookie = loginRes.headers.get("set-cookie");
    if (setCookie) {
      cookieHeader = setCookie.split(";")[0];
    }
    record("Perf Admin Login successful", loginRes.status === 200 && loginData.success, `Role: ${loginData.admin?.role}`);
  } catch (err: any) {
    record("Perf Admin Login", false, err.message);
  }

  if (cookieHeader) {
    try {
      const custRes = await fetch(`${perfBase}/api/admin/customers`, {
        headers: { Cookie: cookieHeader },
      });
      const custData = (await custRes.json()) as any;
      record("Perf Admin Customers API responds 200 OK", custRes.status === 200 && custData.success, `Found ${custData.data?.customers?.length || 0} customers`);
    } catch (err: any) {
      record("Perf Admin Customers", false, err.message);
    }

    try {
      const mediaRes = await fetch(`${perfBase}/api/admin/media`, {
        headers: { Cookie: cookieHeader },
      });
      const mediaData = (await mediaRes.json()) as any;
      record("Perf Admin Media API responds 200 OK", mediaRes.status === 200 && mediaData.success, `Found ${mediaData.data?.items?.length || 0} media assets`);
    } catch (err: any) {
      record("Perf Admin Media", false, err.message);
    }
  }

  // Phase 4: Production Store Isolation & Non-Interference Check
  console.log("\n[Phase 4] Production Isolation Verification (ecommerce-store-v2)");
  try {
    const prodRes = await fetch(`${prodBase}/api/health`);
    const prodJson = (await prodRes.json()) as any;
    const prodHealthy = prodRes.status === 200 && prodJson.status === "healthy";
    record("Existing Production Store (ecommerce-store-v2) is unaffected and healthy", prodHealthy, `Tables: ${prodJson.database?.tables?.length}`);
  } catch (err: any) {
    record("Production Store Health", false, err.message);
  }

  console.log("\n================================================================================");
  console.log(`       SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPerfEnvVerification();
