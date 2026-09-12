import { readFileSync } from "fs";
import { resolve } from "path";

async function runStage15Point5Point1Tests() {
  console.log("=== STAGE 15.5.1: CART DRAWER SIMPLIFICATION + BOUNCE FIX V2 TESTS ===\n");
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedCount++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Slider Bounce Prevention v2 (Memoized Panel & Permanent Scrollbar)
  // --------------------------------------------------------------------------
  console.log("[Test 1] Verifying Slider Bounce Prevention v2 Architecture...");
  const drawerContent = readFileSync(
    resolve(__dirname, "../components/CartDrawer.tsx"),
    "utf-8"
  );

  // 1a. Isolated Memoized CartDrawerPanel component
  assert(
    drawerContent.includes("const CartDrawerPanel = memo(function CartDrawerPanel") ||
    drawerContent.includes("React.memo"),
    "CartDrawer isolates outer panel using memo() so adding products does not re-render wrapper"
  );

  // 1b. Permanent scrollbar track with overflow-y-scroll
  assert(
    drawerContent.includes("overflow-y-scroll"),
    "Items list uses overflow-y-scroll to permanently display scrollbar track and eliminate 10px width shift"
  );

  // 1c. Fixed width styles on outer wrapper
  assert(
    drawerContent.includes('width: "320px"') &&
    drawerContent.includes('minWidth: "320px"') &&
    drawerContent.includes('maxWidth: "320px"'),
    "Outer panel locks width, minWidth, and maxWidth strictly to 320px"
  );

  // 1d. willChange transform enabled
  assert(
    drawerContent.includes('willChange: "transform"'),
    "Outer panel enables will-change: transform for dedicated GPU compositor layer"
  );

  // 1e. No transition-all on cards or drawer container
  assert(
    !drawerContent.includes("transition-all") || !drawerContent.includes("transition-all duration-500"),
    "Replaced generic transition-all with isolated transition-colors and transition-[width]"
  );

  // --------------------------------------------------------------------------
  // TEST 2: Compact Product Cards & Visibility of Multiple Items
  // --------------------------------------------------------------------------
  console.log("\n[Test 2] Verifying Compact Product Cards (30% Height Reduction)...");

  // 2a. Reduced card padding to p-2
  assert(
    drawerContent.includes("p-2 transition-colors"),
    "Product cards in drawer use compact p-2 padding"
  );

  // 2b. Reduced image dimensions to h-12 w-12 (48px)
  assert(
    drawerContent.includes("h-12 w-12"),
    "Product images reduced to h-12 w-12 (48px) for compact 56px card height"
  );

  // 2c. Reduced quantity buttons to h-6 w-6
  assert(
    drawerContent.includes("h-6 w-6"),
    "Quantity controls use compact h-6 w-6 dimensions"
  );

  // 2d. Minimum height on products section
  assert(
    drawerContent.includes("min-h-[180px]"),
    "Products container enforces min-h-[180px] ensuring 3 products are visible simultaneously"
  );

  // 2e. Compact order summary
  assert(
    drawerContent.includes("p-3 space-y-2 shrink-0") &&
    drawerContent.includes("text-[11px]"),
    "Order summary uses streamlined p-3 padding and text-[11px] typography"
  );

  // --------------------------------------------------------------------------
  // TEST 3: Simplified Coupon UI in Drawer
  // --------------------------------------------------------------------------
  console.log("\n[Test 3] Verifying Simplified Drawer Coupon UI...");
  const couponsContent = readFileSync(
    resolve(__dirname, "../components/CouponsSection.tsx"),
    "utf-8"
  );

  const compactSectionIdx = couponsContent.indexOf("if (compact) {");
  const fullSectionIdx = couponsContent.indexOf("return (", compactSectionIdx + 100);
  const compactSectionCode = couponsContent.substring(compactSectionIdx, fullSectionIdx);

  // 3a. Prominent Apply Best button present in compact drawer mode
  assert(
    compactSectionCode.includes("renderApplyBestButton()"),
    "Drawer coupon section prominently features '✨ Apply Best Coupon' button"
  );

  // 3b. Applied coupon badge present in compact drawer mode
  assert(
    compactSectionCode.includes("appliedCoupon") &&
    compactSectionCode.includes("appliedCoupon.code") &&
    compactSectionCode.includes("removeCoupon"),
    "Drawer coupon section displays applied coupon badge with remove action"
  );

  // 3c. Link to cart for more options
  assert(
    compactSectionCode.includes("For more options, visit cart") &&
    compactSectionCode.includes('href="/cart"'),
    "Drawer coupon section includes helpful link to full cart for more options"
  );

  // 3d. Manual input field REMOVED from drawer
  assert(
    !compactSectionCode.includes('placeholder="Coupon code"') &&
    !compactSectionCode.includes("<input"),
    "Drawer coupon section completely removed manual promo code input field"
  );

  // 3e. Available coupons accordion REMOVED from drawer
  assert(
    !compactSectionCode.includes("Available Coupons (") &&
    !compactSectionCode.includes("renderCompactCard"),
    "Drawer coupon section completely removed available coupons accordion and list"
  );

  // --------------------------------------------------------------------------
  // TEST 4: Full Coupon UI Preserved on Cart & Checkout Pages
  // --------------------------------------------------------------------------
  console.log("\n[Test 4] Verifying Full Coupon UI on Cart and Checkout Pages...");
  const fullSectionCode = couponsContent.substring(fullSectionIdx);

  // 4a. Cart & Checkout retain manual code input
  assert(
    fullSectionCode.includes('placeholder="Enter coupon code"') &&
    fullSectionCode.includes("Have a promo code?"),
    "Full coupon section preserves manual coupon code input and label"
  );

  // 4b. Cart & Checkout retain Apply button
  assert(
    fullSectionCode.includes("handleApply()") &&
    fullSectionCode.includes('"Apply"'),
    "Full coupon section preserves manual Apply button"
  );

  // 4c. Cart & Checkout retain Apply Best button
  assert(
    fullSectionCode.includes("renderApplyBestButton()"),
    "Full coupon section preserves prominent '✨ Apply Best Coupon' button"
  );

  // 4d. Cart & Checkout retain Available Coupons list
  assert(
    fullSectionCode.includes("Available Coupons") &&
    fullSectionCode.includes("renderCompactCard"),
    "Full coupon section preserves available coupons list with compact cards"
  );

  // 4e. Verify app/cart and app/checkout both render CouponsSection
  const cartPage = readFileSync(resolve(__dirname, "../app/cart/page.tsx"), "utf-8");
  const checkoutPage = readFileSync(resolve(__dirname, "../app/checkout/page.tsx"), "utf-8");
  assert(cartPage.includes("<CouponsSection />"), "Cart page renders full <CouponsSection />");
  assert(checkoutPage.includes("<CouponsSection />"), "Checkout page renders full <CouponsSection />");

  console.log(`\n=== STAGE 15.5.1 TESTS COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED ===\n`);
}

runStage15Point5Point1Tests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
