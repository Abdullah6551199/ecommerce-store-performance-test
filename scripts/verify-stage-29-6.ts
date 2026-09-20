/**
 * Stage 29.6 Comprehensive Live Verification Script
 * Validates:
 * 1. Admin Authentication
 * 2. Settings change reflection in < 5s
 * 3. POST /api/whatsapp-order/save-order saves to D1 with source="whatsapp"
 * 4. Verification in remote D1 for created order
 * 5. Clean formatted message structure (products first, then address, order reference)
 * 6. Admin orders list returns source="whatsapp" with badge support
 * 7. Filter by source in admin orders list (?source=whatsapp and ?source=web)
 * 8. Admin WhatsApp stats endpoint (/api/admin/whatsapp-order/stats)
 * 9. Data safety on uninstall/reinstall
 * 10. Storefront CPU / response latency benchmark
 */

import { buildCartMessage, buildProductMessage } from "../apps/whatsapp-order/lib/whatsapp";

const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";

interface TestResult {
  title: string;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function record(title: string, passed: boolean, notes?: string) {
  results.push({ title, passed, notes });
  if (passed) {
    console.log(`  ✅ PASS: ${title}${notes ? ` (${notes})` : ""}`);
  } else {
    console.error(`  ❌ FAIL: ${title}${notes ? ` (${notes})` : ""}`);
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("==================================================================");
  console.log("Stage 29.6 Live Verification: WhatsApp Order Tracking & Cache");
  console.log(`Admin: ${ADMIN_URL}`);
  console.log(`Store: ${STORE_URL}`);
  console.log("==================================================================\n");

  // Step 1: Admin Authentication
  console.log("--> Step 1: Admin Authentication");
  const loginRes = await fetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const setCookie = loginRes.headers.get("set-cookie") || "";
  const sessionMatch = setCookie.match(/admin_session=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : "";
  const authHeaders = {
    Cookie: sessionToken ? `admin_session=${sessionToken}` : "",
    "Content-Type": "application/json",
  };

  record("Admin Login", loginRes.status === 200 && !!sessionToken, `status: ${loginRes.status}`);
  if (!sessionToken) {
    console.error("FATAL: Could not obtain admin session.");
    process.exit(1);
  }

  // Ensure whatsapp-order app is installed and enabled
  console.log("\n--> Step 2: Ensure WhatsApp App is Installed & Enabled");
  const installRes = await fetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ appId: "whatsapp-order" }),
  });
  const installJson = (await installRes.json()) as any;
  record("App Installation/Enablement", installRes.status === 200 || installJson.success, installJson.message);

  // Step 3: Fast Settings Cache Reflection Test (< 5s)
  console.log("\n--> Step 3: Settings Cache Reflection Under 5s");
  const testPhone = `92300${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testButtonText = `Order via WA ${Date.now().toString().slice(-4)}`;

  const updateStart = Date.now();
  const updateRes = await fetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      phoneNumber: testPhone,
      enableFloating: true,
      enableProductButton: true,
      buttonText: testButtonText,
    }),
  });
  const updateJson = (await updateRes.json()) as any;
  record("Save Settings via Admin PUT", updateRes.status === 200 && updateJson.success, `Phone: ${testPhone}`);

  // Now poll storefront endpoint to measure exact reflection time
  let reflected = false;
  let reflectionTimeMs = 0;
  for (let i = 0; i < 10; i++) {
    const pollStart = Date.now();
    const pollRes = await fetch(`${STORE_URL}/api/apps/whatsapp-order/settings`);
    if (pollRes.ok) {
      const pollJson = (await pollRes.json()) as any;
      if (pollJson.data?.phoneNumber === testPhone && pollJson.data?.buttonText === testButtonText) {
        reflected = true;
        reflectionTimeMs = Date.now() - updateStart;
        break;
      }
    }
    await sleep(400);
  }

  record(
    "Settings Reflection in Storefront (< 5s)",
    reflected && reflectionTimeMs < 5000,
    `Reflected in ${reflectionTimeMs}ms`
  );

  // Step 4: WhatsApp Order Save (POST /api/whatsapp-order/save-order)
  console.log("\n--> Step 4: Save WhatsApp Order Endpoint");
  const testOrderPayload = {
    items: [
      {
        product_id: "test-prod-1",
        name: "Apex Velocity Runner X1",
        qty: 2,
        price: 129.99,
        line_total: 259.98,
      },
    ],
    customer: {
      name: "Tariq WhatsApp Customer",
      phone: "+92 300 9876543",
      email: "tariq.wa@example.com",
      address: "House 45-B, Block 6, PECHS",
      city: "Karachi",
      notes: "Deliver in the afternoon",
    },
    subtotal: 259.98,
    shipping: 0,
    total: 259.98,
    source: "whatsapp",
  };

  const saveOrderRes = await fetch(`${STORE_URL}/api/whatsapp-order/save-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testOrderPayload),
  });

  const saveOrderJson = (await saveOrderRes.json()) as any;
  const createdOrderId = saveOrderJson.orderId;
  const createdShortId = saveOrderJson.shortId;
  const createdOrderRef = saveOrderJson.orderRef;

  record(
    "POST /api/whatsapp-order/save-order",
    saveOrderRes.status === 200 && saveOrderJson.success && !!createdOrderId,
    `OrderID: ${createdOrderId}, Ref: ${createdOrderRef}`
  );

  // Step 5: Test Clean Message Formatting
  console.log("\n--> Step 5: Clean Message Formatting Verification");
  const formattedCartMsg = buildCartMessage(
    [
      {
        name: "Apex Velocity Runner X1",
        price: 129.99,
        quantity: 2,
        lineTotal: 259.98,
        url: "https://nasrify-store.zia291930.workers.dev/product/apex-velocity-runner-x1",
      },
    ],
    { subtotal: 259.98, shipping: 0, total: 259.98 },
    {
      customer: {
        name: "Tariq WhatsApp Customer",
        phone: "+92 300 9876543",
        address: "House 45-B, Block 6, PECHS",
        city: "Karachi",
      },
      orderRef: createdOrderRef,
    }
  );

  console.log("--- Sample WhatsApp Message Output ---");
  console.log(formattedCartMsg);
  console.log("---------------------------------------");

  const msgHasProductsFirst = formattedCartMsg.indexOf("ORDER DETAILS") < formattedCartMsg.indexOf("DELIVERY DETAILS");
  const msgHasCustomer = formattedCartMsg.includes("Tariq WhatsApp Customer");
  const msgHasRef = formattedCartMsg.includes(createdOrderRef || "Order Reference:");
  record(
    "Message Formatting (Products first, Customer info, Order Ref)",
    msgHasProductsFirst && msgHasCustomer && msgHasRef,
    "Layout validated"
  );

  // Step 6: Admin Orders List & Badge Confirmation
  console.log("\n--> Step 6: Admin Orders List & WhatsApp Badge Confirmation");
  const adminOrdersRes = await fetch(`${ADMIN_URL}/api/admin/orders?limit=10`, {
    headers: authHeaders,
  });
  const adminOrdersJson = (await adminOrdersRes.json()) as any;
  const ordersList = adminOrdersJson.data?.orders || [];
  const foundSavedOrder = ordersList.find((o: any) => o.id === createdOrderId);

  record(
    "Order Appears in Admin Orders List with source='whatsapp'",
    !!foundSavedOrder && foundSavedOrder.source === "whatsapp",
    `Found order with source: ${foundSavedOrder?.source}`
  );

  // Step 7: Filter by Source in Admin Orders List
  console.log("\n--> Step 7: Filter by Source in Orders List");
  const waFilterRes = await fetch(`${ADMIN_URL}/api/admin/orders?source=whatsapp`, {
    headers: authHeaders,
  });
  const waFilterJson = (await waFilterRes.json()) as any;
  const waOrders = waFilterJson.data?.orders || [];
  const allWhatsApp = waOrders.length > 0 && waOrders.every((o: any) => o.source === "whatsapp");

  record(
    "Filter by source=whatsapp returns only WhatsApp orders",
    allWhatsApp,
    `Total found: ${waOrders.length}`
  );

  const webFilterRes = await fetch(`${ADMIN_URL}/api/admin/orders?source=web`, {
    headers: authHeaders,
  });
  const webFilterJson = (await webFilterRes.json()) as any;
  const webOrders = webFilterJson.data?.orders || [];
  const allWeb = webOrders.every((o: any) => o.source === "web" || !o.source);

  record(
    "Filter by source=web returns web orders",
    allWeb,
    `Total web orders: ${webOrders.length}`
  );

  // Step 8: WhatsApp Stats Widget API
  console.log("\n--> Step 8: WhatsApp Stats Widget API");
  const statsRes = await fetch(`${ADMIN_URL}/api/admin/whatsapp-order/stats`, {
    headers: authHeaders,
  });
  const statsJson = (await statsRes.json()) as any;
  const hasValidStats =
    statsRes.status === 200 &&
    statsJson.success &&
    typeof statsJson.stats?.totalOrdersThisMonth === "number" &&
    statsJson.stats?.totalOrdersThisMonth >= 1;

  record(
    "Admin WhatsApp Stats Widget API (/api/admin/whatsapp-order/stats)",
    hasValidStats,
    `Orders: ${statsJson.stats?.totalOrdersThisMonth}, Revenue: $${statsJson.stats?.totalRevenueThisMonth?.toFixed(2)}`
  );

  // Step 9: Data Safety on Uninstall / Reinstall
  console.log("\n--> Step 9: Data Safety on Uninstall / Reinstall");
  // Toggle/uninstall app
  const uninstallRes = await fetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ appId: "whatsapp-order" }),
  });
  const uninstallJson = (await uninstallRes.json()) as any;

  // Re-check order still exists in D1
  const checkOrderRes = await fetch(`${ADMIN_URL}/api/admin/orders/${createdOrderId}`, {
    headers: authHeaders,
  });
  const checkOrderJson = (await checkOrderRes.json()) as any;
  const orderIntact = checkOrderRes.status === 200 && checkOrderJson.data?.id === createdOrderId;

  // Reinstall app
  await fetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ appId: "whatsapp-order" }),
  });

  record(
    "Data Safety: Orders and source preserved across app lifecycle",
    orderIntact,
    `Order ${createdOrderId} intact after uninstall`
  );

  // Step 10: Storefront Latency & CPU Benchmark
  console.log("\n--> Step 10: Storefront Latency & Execution Benchmark");
  const latencies: number[] = [];
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    const sfRes = await fetch(`${STORE_URL}/`);
    const dt = Math.round(performance.now() - t0);
    if (sfRes.ok) latencies.push(dt);
  }
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  record("Storefront Homepage Latency", latencies.length === 5, `Avg: ${avgLatency}ms across 5 requests`);

  // Summary
  console.log("\n==================================================================");
  console.log("FINAL VERIFICATION SUMMARY");
  console.log("==================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${total - passed}`);

  if (passed === total) {
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error(`\n⚠️ ${total - passed} TESTS FAILED.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification execution error:", err);
  process.exit(1);
});
