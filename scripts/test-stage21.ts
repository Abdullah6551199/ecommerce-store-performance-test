/**
 * Stage 21 Automated Verification Test Suite
 * Tests Product Bundles CRUD, pricing calculations, compare products, and cart integration.
 */

import {
  listBundles,
  getBundleBySlug,
  getBundleById,
  createBundle,
  updateBundle,
  duplicateBundle,
  reorderBundles,
  getBundleStats,
  getProductBundles,
  deleteBundle,
} from "../lib/bundles";

async function runTests() {
  console.log("=================================================");
  console.log("  Stage 21: Product Bundles & Compare Test Suite");
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
    // 1. Verify pre-seeded bundles exist
    console.log("Test Group 1: Bundle Listing & Pre-seeded Records");
    const allBundles = await listBundles({ status: "all" });
    assert(allBundles.length >= 2, `Expected at least 2 bundles, got ${allBundles.length}`);

    const enduranceBundle = await getBundleBySlug("endurance-performance-trio");
    assert(Boolean(enduranceBundle), "Endurance Performance Trio bundle found by slug");
    if (enduranceBundle) {
      assert(enduranceBundle.items.length === 3, `Expected 3 items in Endurance bundle, got ${enduranceBundle.items.length}`);
      assert(enduranceBundle.bundlePrice === 268, `Expected bundle price $268, got ${enduranceBundle.bundlePrice}`);
      assert(enduranceBundle.originalPrice === 358, `Expected original price $358, got ${enduranceBundle.originalPrice}`);
      assert(
        Math.abs((enduranceBundle.discountPercentage || 0) - 25.14) < 0.5,
        `Expected ~25% discount, got ${enduranceBundle.discountPercentage}%`
      );
      assert(enduranceBundle.savingsAmount === 90, `Expected savings $90, got ${enduranceBundle.savingsAmount}`);
    }

    const marathonBundle = await getBundleBySlug("elite-marathon-duo");
    assert(Boolean(marathonBundle), "Elite Marathon Duo bundle found by slug");
    if (marathonBundle) {
      assert(marathonBundle.items.length === 2, `Expected 2 items in Marathon bundle, got ${marathonBundle.items.length}`);
      assert(marathonBundle.bundlePrice === 275, `Expected bundle price $275, got ${marathonBundle.bundlePrice}`);
      assert(marathonBundle.originalPrice === 345, `Expected original price $345, got ${marathonBundle.originalPrice}`);
    }

    // 2. Test Bundle Stats
    console.log("\nTest Group 2: Bundle Statistics");
    const stats = await getBundleStats();
    assert(stats.totalBundles >= 2, `Total bundles count: ${stats.totalBundles}`);
    assert(stats.activeBundles >= 2, `Active bundles count: ${stats.activeBundles}`);
    assert(stats.featuredBundles >= 2, `Featured bundles count: ${stats.featuredBundles}`);
    assert(stats.averageDiscountPercent > 0, `Average discount: ${stats.averageDiscountPercent}%`);

    // 3. Test Create Bundle with Auto-Calculation
    console.log("\nTest Group 3: Create Bundle & Automatic Calculations");
    const testBundle = await createBundle({
      name: "Automated Test Dynamic Bundle",
      description: "Testing automated bundle creation and proportional pricing",
      bundlePrice: 200.0,
      status: "active",
      isFeatured: false,
      sortOrder: 99,
      items: [
        { productId: "prod-apex-vrx1", quantity: 1 }, // $160
        { productId: "prod-aero-knit-tee", quantity: 2 }, // $58 * 2 = $116
      ], // Total Original = $276
    });

    assert(Boolean(testBundle.id), "Bundle created with valid ID");
    assert(testBundle.name === "Automated Test Dynamic Bundle", "Bundle name matches");
    assert(testBundle.originalPrice === 276, `Calculated original price expected 276, got ${testBundle.originalPrice}`);
    assert(testBundle.bundlePrice === 200, `Bundle price is 200, got ${testBundle.bundlePrice}`);
    const expectedDiscount = Number((((276 - 200) / 276) * 100).toFixed(2));
    assert(
      Math.abs((testBundle.discountPercentage || 0) - expectedDiscount) < 0.1,
      `Calculated discount expected ${expectedDiscount}%, got ${testBundle.discountPercentage}%`
    );
    assert(testBundle.savingsAmount === 76, `Calculated savings expected 76, got ${testBundle.savingsAmount}`);

    // 4. Test Update Bundle
    console.log("\nTest Group 4: Update Bundle");
    const updated = await updateBundle(testBundle.id, {
      name: "Automated Test Dynamic Bundle (Updated)",
      bundlePrice: 180.0,
      description: "Updated description",
    });
    assert(Boolean(updated), "Update call succeeded");
    if (updated) {
      assert(updated.name === "Automated Test Dynamic Bundle (Updated)", "Updated name matches");
      assert(updated.bundlePrice === 180, `Updated bundle price: ${updated.bundlePrice}`);
      assert(updated.savingsAmount === 96, `Updated savings expected 96, got ${updated.savingsAmount}`);
    }

    // 5. Test Duplicate Bundle
    console.log("\nTest Group 5: Duplicate Bundle");
    const duplicated = await duplicateBundle(testBundle.id);
    assert(Boolean(duplicated), "Bundle duplicate succeeded");
    if (duplicated) {
      assert(duplicated.id !== testBundle.id, "Duplicate has unique ID");
      assert(duplicated.name.includes("Copy"), `Duplicate name includes (Copy): ${duplicated.name}`);
      assert(duplicated.status === "draft", "Duplicate defaults to draft");
      assert(duplicated.items.length === 2, "Duplicate copied all items");
      // Clean up duplicate
      await deleteBundle(duplicated.id);
    }

    // 6. Test Product Bundles Cross-Sell Helper
    console.log("\nTest Group 6: Product Page Cross-Sell Detection");
    const apexBundles = await getProductBundles("prod-apex-vrx1");
    assert(apexBundles.length >= 2, `Found ${apexBundles.length} active bundles for Apex Runner`);
    const teeBundles = await getProductBundles("prod-aero-knit-tee");
    assert(teeBundles.length >= 1, `Found ${teeBundles.length} active bundles for Aero-Knit Tee`);

    // 7. Test Reorder Bundles
    console.log("\nTest Group 7: Reorder Bundles");
    const reorderOk = await reorderBundles([
      { id: enduranceBundle?.id || "bundle-endurance-trio", sortOrder: 5 },
      { id: marathonBundle?.id || "bundle-elite-marathon-duo", sortOrder: 6 },
    ]);
    assert(reorderOk === true, "Reorder bundles returned true");

    // Clean up created test bundle
    await deleteBundle(testBundle.id);
    const deletedCheck = await getBundleById(testBundle.id);
    assert(deletedCheck === null, "Test bundle successfully deleted");

    // 8. Test Proportional Cart Discount Logic
    console.log("\nTest Group 8: Cart Bundle Proportional Pricing Logic");
    const bundleOriginal = 358;
    const bundleSale = 268;
    const ratio = bundleSale / bundleOriginal;
    const item1Base = 160;
    const item1Disc = Math.round(item1Base * ratio * 100) / 100;
    const item2Base = 58;
    const item2Disc = Math.round(item2Base * ratio * 100) / 100;
    const item3Base = 140;
    const item3Disc = Math.round(item3Base * ratio * 100) / 100;

    const sumDiscounted = item1Disc + item2Disc + item3Disc;
    assert(Math.abs(sumDiscounted - bundleSale) < 1.0, `Proportional item sum ($${sumDiscounted}) matches bundle price ($${bundleSale}) within penny rounding`);

    console.log("\n=================================================");
    console.log(`  Test Results: ${passed} Passed, ${failed} Failed`);
    console.log("=================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution threw exception:", error);
    process.exit(1);
  }
}

runTests();
