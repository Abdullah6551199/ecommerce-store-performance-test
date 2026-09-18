import {
  buildProductMessage,
  buildCartMessage,
  formatWhatsAppUrl,
  sanitizePhoneNumber,
} from "../apps/whatsapp-order/lib/whatsapp";
import * as fs from "fs";
import * as path from "path";

async function runTests() {
  console.log("==================================================");
  console.log("   Stage 29.5 Verification Test Suite            ");
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

  // TEST 1: Phone sanitization
  console.log("\n[1] Phone number sanitization:");
  const cleaned = sanitizePhoneNumber("+1 (555) 234-5678");
  assert(cleaned === "15552345678", "Sanitize removes +, spaces, parentheses, dashes");

  // TEST 2: Product Single Item Message
  console.log("\n[2] Product Single Item Message Generation:");
  const singleProductMsg = buildProductMessage({
    name: "Apex Runner Pro",
    price: 149.99,
    quantity: 2,
    url: "https://nasrify.com/product/apex-runner-pro",
    imageUrl: "https://nasrify.com/images/apex.jpg",
  });
  console.log("--- Generated Single Product Message ---");
  console.log(singleProductMsg);
  console.log("----------------------------------------");

  assert(singleProductMsg.includes("Hello! I want to order:"), "Contains single item greeting");
  assert(singleProductMsg.includes("*Product:* Apex Runner Pro"), "Contains product name formatted");
  assert(singleProductMsg.includes("*Price:* $149.99"), "Contains formatted price");
  assert(singleProductMsg.includes("*Quantity:* 2"), "Contains quantity");
  assert(singleProductMsg.includes("*Link:* https://nasrify.com/product/apex-runner-pro"), "Contains URL");
  assert(singleProductMsg.includes("*Image:* https://nasrify.com/images/apex.jpg"), "Contains image URL");
  assert(singleProductMsg.includes("Please confirm availability."), "Contains confirmation closing");

  // TEST 3: Multi-item Cart Message (1 Item)
  console.log("\n[3] Cart Message Generation (1 Item):");
  const cart1Msg = buildCartMessage(
    [
      {
        name: "Apex Runner Pro",
        price: 149.99,
        quantity: 1,
        lineTotal: 149.99,
        url: "https://nasrify.com/product/apex-runner-pro",
      },
    ],
    { subtotal: 149.99, total: 149.99 }
  );
  assert(cart1Msg.includes("Hello! I want to place this order:"), "Cart greeting is present");
  assert(cart1Msg.includes("1. Apex Runner Pro"), "Numbered item 1");
  assert(cart1Msg.includes("Price: $149.99 x 1 = $149.99"), "Price multiplication line");
  assert(cart1Msg.includes("*Subtotal:* $149.99"), "Cart subtotal");
  assert(cart1Msg.includes("*Total:* $149.99"), "Cart total");

  // TEST 4: Multi-item Cart Message (3 Items)
  console.log("\n[4] Cart Message Generation (3 Items):");
  const cart3Msg = buildCartMessage(
    [
      {
        name: "Apex Runner Pro",
        price: 149.99,
        quantity: 1,
        lineTotal: 149.99,
        url: "https://nasrify.com/product/apex-runner-pro",
      },
      {
        name: "Pro Carbon Insoles",
        price: 29.5,
        quantity: 2,
        lineTotal: 59.0,
        url: "https://nasrify.com/product/insoles",
      },
      {
        name: "Hydration Running Vest",
        price: 65.0,
        quantity: 1,
        lineTotal: 65.0,
        url: "https://nasrify.com/product/vest",
      },
    ],
    { subtotal: 273.99, total: 273.99 }
  );
  console.log("--- Generated 3-Item Cart Message ---");
  console.log(cart3Msg);
  console.log("-------------------------------------");

  assert(cart3Msg.includes("1. Apex Runner Pro"), "Item 1 present");
  assert(cart3Msg.includes("2. Pro Carbon Insoles"), "Item 2 present");
  assert(cart3Msg.includes("3. Hydration Running Vest"), "Item 3 present");
  assert(cart3Msg.includes("Price: $29.50 x 2 = $59.00"), "Item 2 math accurate");
  assert(cart3Msg.includes("*Subtotal:* $273.99"), "Subtotal matches");
  assert(cart3Msg.includes("*Total:* $273.99"), "Total matches");

  // TEST 5: wa.me URL generation
  console.log("\n[5] URL generation:");
  const waUrl = formatWhatsAppUrl("15552345678", singleProductMsg);
  assert(waUrl.startsWith("https://wa.me/15552345678?text="), "Proper wa.me URL with query");
  assert(waUrl.includes(encodeURIComponent("Apex Runner Pro")), "URL encoded message text");

  // TEST 6: Structural checks on Product page button
  console.log("\n[6] Structural Verification:");
  const productInfoContent = fs.readFileSync(
    path.join(__dirname, "../components/product/ProductInfoPanel.tsx"),
    "utf-8"
  );
  assert(
    productInfoContent.includes("<ProductOrderButton"),
    "ProductInfoPanel mounts ProductOrderButton"
  );
  assert(
    productInfoContent.indexOf("Buy Now") < productInfoContent.indexOf("<ProductOrderButton"),
    "ProductOrderButton is positioned directly after Buy Now button"
  );

  // TEST 7: Structural checks on Cart page button
  const cartContent = fs.readFileSync(path.join(__dirname, "../app/cart/page.tsx"), "utf-8");
  assert(
    cartContent.includes("<StorefrontCartBelow"),
    "Cart page mounts StorefrontCartBelow"
  );
  assert(
    cartContent.indexOf("Proceed to Checkout") < cartContent.indexOf("<StorefrontCartBelow"),
    "StorefrontCartBelow is placed directly below Proceed to Checkout"
  );

  // TEST 8: Structural checks on Checkout page button
  const checkoutContent = fs.readFileSync(path.join(__dirname, "../app/checkout/page.tsx"), "utf-8");
  assert(
    checkoutContent.includes("<StorefrontCheckoutBelow"),
    "Checkout page mounts StorefrontCheckoutBelow"
  );
  assert(
    checkoutContent.indexOf('type="submit"') < checkoutContent.indexOf("<StorefrontCheckoutBelow"),
    "StorefrontCheckoutBelow is placed directly below Place Order submit button"
  );

  // TEST 9: Manifest Extension Points
  const manifestContent = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../apps/whatsapp-order/manifest.json"), "utf-8")
  );
  assert(
    manifestContent.extensionPoints.includes("storefront.cart.below"),
    "Manifest contains storefront.cart.below"
  );
  assert(
    manifestContent.extensionPoints.includes("storefront.checkout.below"),
    "Manifest contains storefront.checkout.below"
  );
  assert(
    manifestContent.extensionPoints.includes("storefront.floating"),
    "Manifest contains storefront.floating"
  );

  // TEST 10: Cache headers in settings routes
  const settingsRouteContent = fs.readFileSync(
    path.join(__dirname, "../app/api/apps/[appId]/settings/route.ts"),
    "utf-8"
  );
  assert(
    settingsRouteContent.includes("no-cache, no-store, max-age=0, must-revalidate"),
    "Storefront settings route sends no-cache, no-store headers"
  );

  const adminSettingsRouteContent = fs.readFileSync(
    path.join(__dirname, "../nasrify-admin/app/api/admin/apps/[appId]/settings/route.ts"),
    "utf-8"
  );
  assert(
    adminSettingsRouteContent.includes("invalidateStorefront({ target: \"apps\" })"),
    "Admin settings PUT route invalidates storefront apps cache"
  );

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
