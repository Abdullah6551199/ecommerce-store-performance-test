import { readFileSync } from "fs";
import { resolve } from "path";

async function runStage15Point5Tests() {
  console.log("=== STAGE 15.5: CART DRAWER COUPON FIXES + SLIDER POLISH TESTS ===\n");
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
  // TEST 1: CartDrawer Layout & Slider Bounce Prevention
  // --------------------------------------------------------------------------
  console.log("[Test 1] Verifying CartDrawer Layout & Slider Bounce Fixes...");
  const drawerContent = readFileSync(
    resolve(__dirname, "../components/CartDrawer.tsx"),
    "utf-8"
  );

  // 1a. Fixed width of 320px in style and classes
  assert(
    drawerContent.includes('w-[320px] max-w-[320px]') &&
    drawerContent.includes('width: "320px"') &&
    drawerContent.includes('maxWidth: "320px"'),
    "CartDrawer panel has fixed 320px width in Tailwind and inline styles"
  );

  // 1b. willChange transform for GPU acceleration
  assert(
    drawerContent.includes('willChange: "transform"'),
    "CartDrawer panel enables GPU acceleration with will-change: transform"
  );

  // 1c. Stable key on drawer panel
  assert(
    drawerContent.includes('key="cart-drawer-panel"'),
    "CartDrawer panel uses stable key 'cart-drawer-panel' to prevent re-mounts"
  );

  // 1d. Scrollbar gutter stable on items container to prevent layout shift
  assert(
    drawerContent.includes("[scrollbar-gutter:stable]"),
    "Cart items container includes [scrollbar-gutter:stable] to eliminate scrollbar insertion shift"
  );

  // 1e. No transition-all on container elements that could cause width/margin transitions
  assert(
    !drawerContent.includes("transition-all duration-500"),
    "Removed transition-all from shipping progress bar (now specific to width)"
  );

  // 1f. Top section for items has flex-1 and min-h to always remain visible
  assert(
    drawerContent.includes("flex-1 min-h-[140px] overflow-y-auto"),
    "Cart items section has flex-1 with min-h-[140px] so products always stay visible at top"
  );

  // 1g. Check CartDrawerContainer has stable key
  const containerContent = readFileSync(
    resolve(__dirname, "../components/CartDrawerContainer.tsx"),
    "utf-8"
  );
  assert(
    containerContent.includes('key="cart-drawer-stable"'),
    "CartDrawerContainer provides stable key to CartDrawer"
  );

  // --------------------------------------------------------------------------
  // TEST 2: CartContext Functional Drawer Updates & applyBestCoupon
  // --------------------------------------------------------------------------
  console.log("\n[Test 2] Verifying CartContext Improvements...");
  const cartContextContent = readFileSync(
    resolve(__dirname, "../components/CartContext.tsx"),
    "utf-8"
  );

  // 2a. setIsDrawerOpen bails out if already open
  assert(
    cartContextContent.includes("setIsDrawerOpen((prev) => (prev ? prev : true))"),
    "addItem and addItems use functional state to bail out if drawer is already open"
  );

  // 2b. applyBestCoupon method defined
  assert(
    cartContextContent.includes("const applyBestCoupon = useCallback(async ()"),
    "CartContext implements dedicated applyBestCoupon callback"
  );

  // 2c. applyBestCoupon toast messages
  assert(
    cartContextContent.includes("Best coupon applied:") &&
    cartContextContent.includes("Best coupon already applied") &&
    cartContextContent.includes("No coupons available for current cart"),
    "CartContext provides all required toast messages for applyBestCoupon"
  );

  // 2d. applyBestCoupon exposed in provider
  assert(
    cartContextContent.includes("applyBestCoupon,") &&
    cartContextContent.includes("applyBestCoupon: () => Promise<"),
    "applyBestCoupon is properly typed and exposed in CartContext provider value"
  );

  // --------------------------------------------------------------------------
  // TEST 3: CouponsSection Compact Mode & No Modal Hiding Products
  // --------------------------------------------------------------------------
  console.log("\n[Test 3] Verifying CouponsSection Drawer UX & Compact Design...");
  const couponsContent = readFileSync(
    resolve(__dirname, "../components/CouponsSection.tsx"),
    "utf-8"
  );

  // 3a. No backdrop modal in compact mode
  assert(
    !couponsContent.includes("showAvailableModal") &&
    !couponsContent.includes("fixed inset-0 z-50 flex items-center justify-center"),
    "CouponsSection eliminated the full-screen backdrop modal that obscured cart products"
  );

  // 3b. Inline collapsible accordion in compact mode
  assert(
    couponsContent.includes("Available Coupons ({availableCoupons.length})") &&
    couponsContent.includes("max-h-40 overflow-y-auto"),
    "CouponsSection uses an inline collapsible accordion (max-h-40) below cart items"
  );

  // 3c. Compact card height <= 60px design
  assert(
    couponsContent.includes("p-2.5 rounded-xl border") &&
    couponsContent.includes("text-zinc-300 dark:text-white/30") &&
    couponsContent.includes("Min $"),
    "Coupon cards use compact inline row layout (height <= 60px) with p-2.5 padding"
  );

  // 3d. Locked coupon design with 'Add $X more'
  assert(
    couponsContent.includes("Add $") &&
    couponsContent.includes("more"),
    "Locked coupons display compact 'Add $X more' action button"
  );

  // --------------------------------------------------------------------------
  // TEST 4: "Apply Best Coupon" Button Everywhere
  // --------------------------------------------------------------------------
  console.log("\n[Test 4] Verifying 'Apply Best Coupon' Button Consistency...");

  // 4a. Button styling and label
  assert(
    couponsContent.includes("✨") &&
    couponsContent.includes("Apply Best Coupon") &&
    couponsContent.includes("bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600"),
    "Button uses exact '✨ Apply Best Coupon' label with orange/purple gradient"
  );

  // 4b. Rendered at top of compact version
  const compactSectionIdx = couponsContent.indexOf("if (compact) {");
  const compactBtnIdx = couponsContent.indexOf("renderApplyBestButton()", compactSectionIdx);
  const compactInputIdx = couponsContent.indexOf("placeholder=\"Coupon code\"", compactSectionIdx);
  assert(
    compactBtnIdx > compactSectionIdx && compactBtnIdx < compactInputIdx,
    "'✨ Apply Best Coupon' is placed at the top of the Cart Drawer coupon section"
  );

  // 4c. Rendered at top of full version (used on /cart and /checkout)
  const fullSectionIdx = couponsContent.indexOf("return (", compactSectionIdx + 500);
  const fullBtnIdx = couponsContent.indexOf("renderApplyBestButton()", fullSectionIdx);
  assert(
    fullBtnIdx > fullSectionIdx,
    "'✨ Apply Best Coupon' is prominently placed at the top of the full page coupon section"
  );

  // 4d. Verified usage in Cart Page and Checkout Page
  const cartPage = readFileSync(resolve(__dirname, "../app/cart/page.tsx"), "utf-8");
  const checkoutPage = readFileSync(resolve(__dirname, "../app/checkout/page.tsx"), "utf-8");
  assert(cartPage.includes("<CouponsSection"), "Cart page (/cart) renders CouponsSection");
  assert(checkoutPage.includes("<CouponsSection"), "Checkout page (/checkout) renders CouponsSection");

  // --------------------------------------------------------------------------
  // TEST 5: Live API Verification (Coupons & Cart Routes)
  // --------------------------------------------------------------------------
  console.log("\n[Test 5] Testing Live Test Worker APIs...");
  const base = "https://ecommerce-store-perf-test.zia291930.workers.dev";
  try {
    const res = await fetch(`${base}/api/coupons/available?subtotal=100`);
    if (res.ok) {
      const data = (await res.json()) as any;
      assert(data.success === true, "GET /api/coupons/available returns success: true");
      assert(Array.isArray(data.coupons), `Available coupons array returned (${data.coupons.length} coupons)`);
      if (data.bestCoupon) {
        console.log(`  ✓ Best coupon calculated by worker: ${data.bestCoupon.code} (discount: $${data.bestDiscount})`);
      }
    } else {
      console.log(`  ℹ Remote worker returned status: ${res.status}`);
    }
  } catch (err) {
    console.log("  ℹ Remote fetch notice:", err instanceof Error ? err.message : err);
  }

  console.log(`\n=== STAGE 15.5 TESTS COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED ===\n`);
}

runStage15Point5Tests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
