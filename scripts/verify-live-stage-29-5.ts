import {
  buildProductMessage,
  buildCartMessage,
  formatWhatsAppUrl,
  sanitizePhoneNumber,
} from "../apps/whatsapp-order/lib/whatsapp";

const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";

async function verifyLive() {
  console.log("==================================================");
  console.log("   Stage 29.5 Live Verification Suite            ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      if (detail) console.error(`    Detail: ${detail}`);
      failed++;
    }
  }

  // 1. Check Storefront Pages
  console.log("\n[1] Checking Storefront Live Pages:");
  try {
    const homeRes = await fetch(`${STORE_URL}/`);
    assert(homeRes.status === 200, "Storefront Homepage loads (200 OK)");

    const prodRes = await fetch(`${STORE_URL}/product/apex-velocity-runner-x1`);
    assert(prodRes.status === 200, "Storefront Product Page loads (200 OK)");

    const cartRes = await fetch(`${STORE_URL}/cart`);
    assert(cartRes.status === 200, "Storefront Cart Page loads (200 OK)");

    const checkoutRes = await fetch(`${STORE_URL}/checkout`);
    assert(checkoutRes.status === 200, "Storefront Checkout Page loads (200 OK)");
  } catch (err) {
    assert(false, "Storefront pages fetch exception", String(err));
  }

  // 2. Check Storefront App Settings Route and Headers
  console.log("\n[2] Checking Storefront Settings Route & Cache Headers:");
  try {
    const settingsRes = await fetch(`${STORE_URL}/api/apps/whatsapp-order/settings`, {
      cache: "no-store",
    });
    assert(settingsRes.status === 200, "GET /api/apps/whatsapp-order/settings returns 200");
    const cacheControl = settingsRes.headers.get("cache-control") || "";
    assert(
      cacheControl.includes("no-cache") || cacheControl.includes("no-store"),
      `Settings response Cache-Control has no-cache/no-store: ${cacheControl}`
    );
    const settingsJson = (await settingsRes.json()) as any;
    assert(settingsJson.success === true, "Settings JSON success === true");
  } catch (err) {
    assert(false, "Settings route fetch exception", String(err));
  }

  // 3. Admin Authentication & Phone Number Reflection Test
  console.log("\n[3] Testing Admin Settings Save & Instant Storefront Reflection:");
  try {
    const loginRes = await fetch(`${ADMIN_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    assert(loginRes.status === 200, "Admin login succeeds (200 OK)");
    const cookie = loginRes.headers.get("set-cookie") || "";
    const sessionMatch = cookie.match(/admin_session=([^;]+)/);
    const sessionToken = sessionMatch ? sessionMatch[1] : "";

    // Fetch original settings first
    const originalSettingsRes = await fetch(`${STORE_URL}/api/apps/whatsapp-order/settings`, { cache: "no-store" });
    const originalJson = (await originalSettingsRes.json()) as any;
    const originalSettings = originalJson.data || {};

    const testNumber = "1555" + Math.floor(1000000 + Math.random() * 9000000);

    // Save new phone number via Admin API
    const putRes = await fetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_session=${sessionToken}`,
      },
      body: JSON.stringify({
        ...originalSettings,
        phoneNumber: testNumber,
        enableFloating: true,
        enableProductButton: true,
        buttonText: "Order on WhatsApp",
      }),
    });
    assert(putRes.status === 200, `Admin saves new phone number (${testNumber})`);

    // Fetch immediately on Storefront without waiting 60s
    const updatedSettingsRes = await fetch(`${STORE_URL}/api/apps/whatsapp-order/settings`, {
      cache: "no-store",
    });
    const updatedJson = (await updatedSettingsRes.json()) as any;
    assert(
      updatedJson.data?.phoneNumber === testNumber,
      `Storefront immediately reflects updated number: ${updatedJson.data?.phoneNumber}`
    );

    // Restore original settings
    await fetch(`${ADMIN_URL}/api/admin/apps/whatsapp-order/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_session=${sessionToken}`,
      },
      body: JSON.stringify(originalSettings),
    });
    console.log("  ✓ Restored original settings after verification");
  } catch (err) {
    assert(false, "Admin settings save and reflection test exception", String(err));
  }

  // 4. Message Templates Verification (1 item vs 3 items)
  console.log("\n[4] WhatsApp Message Generation & wa.me URLs:");
  const singleMsg = buildProductMessage({
    name: "Apex Velocity Runner X1",
    price: 180,
    quantity: 1,
    url: `${STORE_URL}/product/apex-velocity-runner-x1`,
  });
  const singleUrl = formatWhatsAppUrl("15551234567", singleMsg);
  assert(
    singleUrl.startsWith("https://wa.me/15551234567?text="),
    "Single product wa.me URL formatted correctly"
  );
  assert(singleMsg.includes("*Product:* Apex Velocity Runner X1"), "Single item name included");
  assert(singleMsg.includes("*Price:* $180.00"), "Single item price formatted");
  assert(singleMsg.includes("Please confirm availability."), "Single item availability prompt");

  const multiMsg = buildCartMessage(
    [
      { name: "Apex Velocity Runner X1", price: 180, quantity: 1, lineTotal: 180, url: `${STORE_URL}/product/runner` },
      { name: "Apex Carbon Insoles", price: 40, quantity: 2, lineTotal: 80, url: `${STORE_URL}/product/insoles` },
      { name: "Performance Hydration Bottle", price: 25, quantity: 1, lineTotal: 25, url: `${STORE_URL}/product/bottle` },
    ],
    { subtotal: 285, total: 285 }
  );
  const multiUrl = formatWhatsAppUrl("15551234567", multiMsg);
  assert(
    multiUrl.startsWith("https://wa.me/15551234567?text="),
    "3-item cart wa.me URL formatted correctly"
  );
  assert(multiMsg.includes("1. Apex Velocity Runner X1"), "Multi-item item 1 formatted");
  assert(multiMsg.includes("2. Apex Carbon Insoles"), "Multi-item item 2 formatted");
  assert(multiMsg.includes("Price: $40.00 x 2 = $80.00"), "Multi-item line total computed");
  assert(multiMsg.includes("3. Performance Hydration Bottle"), "Multi-item item 3 formatted");
  assert(multiMsg.includes("*Subtotal:* $285.00"), "Multi-item subtotal formatted");
  assert(multiMsg.includes("*Total:* $285.00"), "Multi-item total formatted");

  console.log("\n==================================================");
  console.log(`Live Verification: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyLive().catch((err) => {
  console.error("Live verification failed:", err);
  process.exit(1);
});
