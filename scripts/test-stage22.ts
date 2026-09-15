/**
 * Stage 22 Automated Verification Test Suite
 * Tests Trust Badges, Payment Icons, Cookie Consent Settings, Script Blocker, and Regressions.
 */

import {
  listTrustBadges,
  getTrustBadgeById,
  createTrustBadge,
  updateTrustBadge,
  deleteTrustBadge,
  reorderTrustBadges,
  listPaymentIcons,
  getPaymentIconById,
  createPaymentIcon,
  updatePaymentIcon,
  deletePaymentIcon,
  reorderPaymentIcons,
} from "../lib/trust-badges";
import {
  getCookieConsentSettings,
  updateCookieConsentSettings,
  getDefaultCookiePolicyContent,
  logCookieConsent,
  memoryConsentLogs,
} from "../lib/cookie-consent";
import { shouldLoadScript, COOKIE_CONSENT_STORAGE_KEY } from "../lib/script-blocker";
import { calculateTax, detectTaxRate } from "../lib/tax";
import { calculateShipping } from "../lib/shipping";
import { listBundles, getBundleBySlug } from "../lib/bundles";

async function runTests() {
  console.log("=================================================");
  console.log("  Stage 22: Trust Badges, Cookies & GDPR Tests   ");
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
    // ----------------------------------------------------
    // TEST GROUP 1: Trust Badges CRUD & Location Filters
    // ----------------------------------------------------
    console.log("Test Group 1: Trust Badges Listing & Location Filters");
    const allBadges = await listTrustBadges();
    assert(allBadges.length >= 6, `Expected at least 6 initial badges, found ${allBadges.length}`);

    const productBadges = await listTrustBadges({ location: "product", isActiveOnly: true });
    assert(productBadges.length > 0, `Product location returned ${productBadges.length} badges`);

    const cartBadges = await listTrustBadges({ location: "cart", isActiveOnly: true });
    assert(cartBadges.length > 0, `Cart location returned ${cartBadges.length} badges`);

    const checkoutBadges = await listTrustBadges({ location: "checkout", isActiveOnly: true });
    assert(checkoutBadges.length > 0, `Checkout location returned ${checkoutBadges.length} badges`);

    // Create custom badge
    console.log("\nTest Group 2: Trust Badges Create, Update, Toggle & Delete");
    const testBadge = await createTrustBadge({
      icon: "award",
      title: "Best Value Guarantee",
      description: "Direct manufacturer pricing",
      location: "product",
      sortOrder: 99,
      isActive: true,
    });
    assert(Boolean(testBadge && testBadge.id), "Created custom trust badge");
    assert(testBadge.title === "Best Value Guarantee", "Badge title matches input");

    // Fetch by ID
    const fetchedBadge = await getTrustBadgeById(testBadge.id);
    assert(Boolean(fetchedBadge), "Retrieved custom badge by ID");

    // Update badge
    const updatedBadge = await updateTrustBadge(testBadge.id, {
      title: "Certified Value Guarantee",
      isActive: false,
    });
    assert(updatedBadge?.title === "Certified Value Guarantee", "Badge title updated");
    assert(updatedBadge?.isActive === false, "Badge active status toggled to false");

    // Reorder badges test
    const reorderSuccess = await reorderTrustBadges([testBadge.id, ...allBadges.map((b) => b.id)]);
    assert(reorderSuccess, "Reorder badges executed successfully");

    // Delete custom badge
    const deleteSuccess = await deleteTrustBadge(testBadge.id);
    assert(deleteSuccess, "Deleted custom test badge");

    // ----------------------------------------------------
    // TEST GROUP 3: Payment Icons CRUD & Reorder
    // ----------------------------------------------------
    console.log("\nTest Group 3: Payment Icons Operations");
    const initialPaymentIcons = await listPaymentIcons();
    assert(initialPaymentIcons.length >= 6, `Expected at least 6 payment icons, found ${initialPaymentIcons.length}`);

    const visaIcon = initialPaymentIcons.find((p) => p.name.toLowerCase().includes("visa"));
    assert(Boolean(visaIcon), "Found default Visa payment icon");

    // Add custom payment icon
    const customPay = await createPaymentIcon({
      name: "Klarna",
      iconSvg: "<svg>test</svg>",
      sortOrder: 10,
      isActive: true,
    });
    assert(Boolean(customPay && customPay.id), "Created custom payment icon");

    // Toggle custom payment icon
    const updatedPay = await updatePaymentIcon(customPay.id, { isActive: false });
    assert(updatedPay?.isActive === false, "Toggled custom payment icon to inactive");

    // Reorder payment icons
    const payReorderSuccess = await reorderPaymentIcons(initialPaymentIcons.map((i) => i.id));
    assert(payReorderSuccess, "Payment icons reorder executed successfully");

    // Delete custom payment icon
    const deletePaySuccess = await deletePaymentIcon(customPay.id);
    assert(deletePaySuccess, "Deleted custom payment icon");

    // ----------------------------------------------------
    // TEST GROUP 4: Cookie Consent Settings & Audit Log
    // ----------------------------------------------------
    console.log("\nTest Group 4: Cookie Consent Configuration & Policy");
    const cookieSettings = await getCookieConsentSettings();
    assert(Boolean(cookieSettings), "Retrieved cookie consent settings");
    assert(cookieSettings.isEnabled === true || cookieSettings.isEnabled === 1 as any, "Cookie banner enabled by default");
    assert(cookieSettings.position === "bottom" || cookieSettings.position === "top", "Valid banner position");
    assert(cookieSettings.theme === "light" || cookieSettings.theme === "dark", "Valid banner theme");

    const defaultPolicy = getDefaultCookiePolicyContent();
    assert(defaultPolicy.includes("What Are Cookies?"), "Default policy includes 'What Are Cookies?' section");
    assert(defaultPolicy.includes("Necessary Cookies"), "Default policy includes 'Necessary Cookies' category");
    assert(defaultPolicy.includes("GDPR"), "Default policy mentions GDPR compliance");

    // Update cookie settings
    const updatedCookie = await updateCookieConsentSettings({
      acceptText: "Agree to All",
      rejectText: "Decline Non-Essential",
    });
    assert(updatedCookie.acceptText === "Agree to All", "Updated accept button text");
    assert(updatedCookie.rejectText === "Decline Non-Essential", "Updated reject button text");

    // Restore standard defaults
    await updateCookieConsentSettings({
      acceptText: "Accept All",
      rejectText: "Reject All",
    });

    // Consent logging
    const logResult = await logCookieConsent({
      necessary: true,
      analytics: false,
      marketing: true,
      functional: false,
      timestamp: new Date().toISOString(),
      version: "v1",
      ip: "127.0.0.1",
      userAgent: "TestRunner/1.0",
    });
    assert(logResult, "Recorded cookie consent audit event");
    assert(memoryConsentLogs.length > 0, "Audit logs contain recorded consent event");

    // ----------------------------------------------------
    // TEST GROUP 5: GDPR Script Blocker Logic
    // ----------------------------------------------------
    console.log("\nTest Group 5: GDPR Script Blocker Execution Matrix");
    // Mock window and localStorage in Node environment
    const mockStorage: Record<string, string> = {};
    (global as any).window = {
      localStorage: {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, val: string) => { mockStorage[key] = val; },
        removeItem: (key: string) => { delete mockStorage[key]; },
      },
    };
    (global as any).localStorage = (global as any).window.localStorage;

    // Case 1: No consent given yet -> all non-essential scripts blocked
    delete mockStorage[COOKIE_CONSENT_STORAGE_KEY];
    assert(shouldLoadScript("analytics") === false, "Scripts blocked when no consent given (analytics: false)");
    assert(shouldLoadScript("marketing") === false, "Scripts blocked when no consent given (marketing: false)");
    assert(shouldLoadScript("functional") === false, "Scripts blocked when no consent given (functional: false)");

    // Case 2: Analytics consent only
    mockStorage[COOKIE_CONSENT_STORAGE_KEY] = JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: false,
      functional: false,
      version: "v1",
    });
    assert(shouldLoadScript("analytics") === true, "Analytics allowed when consented");
    assert(shouldLoadScript("marketing") === false, "Marketing remains blocked when not consented");

    // Case 3: All consented
    mockStorage[COOKIE_CONSENT_STORAGE_KEY] = JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      version: "v1",
    });
    assert(shouldLoadScript("analytics") === true, "Analytics allowed when all consented");
    assert(shouldLoadScript("marketing") === true, "Marketing allowed when all consented");
    assert(shouldLoadScript("functional") === true, "Functional allowed when all consented");

    // ----------------------------------------------------
    // TEST GROUP 6: Regression Checks (Tax, Shipping, Bundles)
    // ----------------------------------------------------
    console.log("\nTest Group 6: System Regressions (Tax, Shipping & Bundles)");
    // Tax regression check
    const taxRate = await detectTaxRate("PK");
    assert(Boolean(taxRate && taxRate.rate === 17.0), "Stage 20 Tax detection regression passed (PK GST 17%)");

    const taxMath = calculateTax(100, taxRate?.rate || 17, (taxRate?.taxType as any) || "exclusive");
    assert(taxMath.taxAmount === 17.0, "Stage 20 Exclusive Tax math regression passed ($17.00)");

    // Shipping regression check
    const shipping = await calculateShipping("US", "CA", 150);
    assert(shipping.shippingAvailable === true, "Stage 20 Shipping calculation regression passed");

    // Bundles regression check
    const bundles = await listBundles({ status: "all" });
    assert(bundles.length >= 2, `Stage 21 Bundles regression passed (${bundles.length} bundles found)`);

    const trioBundle = await getBundleBySlug("endurance-performance-trio");
    assert(Boolean(trioBundle), "Stage 21 Bundle slug resolution regression passed");

    console.log("\n=================================================");
    console.log(`  Tests Finished: ${passed} Passed, ${failed} Failed`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution encountered an error:", error);
    process.exit(1);
  }
}

runTests();
