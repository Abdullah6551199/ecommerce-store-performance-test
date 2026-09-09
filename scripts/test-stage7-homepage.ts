import { getStoreSettings, updateStoreSettings, DEFAULT_STORE_SETTINGS } from "../lib/settings";
import {
  listHomepageSections,
  getHomepageSectionById,
  updateHomepageSection,
  reorderHomepageSections,
  createHomepageSection,
  deleteHomepageSection,
} from "../lib/homepage";

async function runTests() {
  console.log("===============================================================================");
  console.log("STAGE 7: STOREFRONT HOMEPAGE & DYNAMIC SECTIONS AUTOMATED TEST SUITE");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Retrieve Initial Store Settings
    // -------------------------------------------------------------------------
    console.log("Test 1: Global Store Settings Retrieval...");
    const initialSettings = await getStoreSettings();
    assert(typeof initialSettings.storeName === "string" && initialSettings.storeName.length > 0, "Store name is populated dynamically");
    assert(typeof initialSettings.contactEmail === "string" && initialSettings.contactEmail.includes("@"), "Contact email is valid");
    assert(Array.isArray(initialSettings.headerNav) && initialSettings.headerNav.length > 0, "Header nav links exist");
    assert(Array.isArray(initialSettings.footerLinks) && initialSettings.footerLinks.length > 0, "Footer links columns exist");
    assert(typeof initialSettings.socialLinks === "object", "Social links map exists");

    // -------------------------------------------------------------------------
    // TEST 2: Update Store Settings & Verify Persistence
    // -------------------------------------------------------------------------
    console.log("\nTest 2: Store Settings Update & Fallback/D1 Persistence...");
    const testTagline = `Velocity Gear Engineered For Edge Performance - Test ${Date.now()}`;
    await updateStoreSettings({ tagline: testTagline });
    const verifiedSettings = await getStoreSettings();
    assert(verifiedSettings.tagline === testTagline, `Tagline successfully updated: ${verifiedSettings.tagline}`);

    // -------------------------------------------------------------------------
    // TEST 3: Query Homepage Sections
    // -------------------------------------------------------------------------
    console.log("\nTest 3: Dynamic Homepage Sections Listing...");
    const allSections = await listHomepageSections({ activeOnly: false });
    assert(allSections.length >= 5, `Retrieved ${allSections.length} homepage sections (expected at least 5)`);

    const sectionTypes = allSections.map((s) => s.type);
    assert(sectionTypes.includes("hero"), "Includes 'hero' section");
    assert(sectionTypes.includes("categories"), "Includes 'categories' section");
    assert(sectionTypes.includes("featured_products"), "Includes 'featured_products' section");
    assert(sectionTypes.includes("promo_banner"), "Includes 'promo_banner' section");
    assert(sectionTypes.includes("brand_story"), "Includes 'brand_story' section");

    // Verify sort order is strictly ascending
    let isSorted = true;
    for (let i = 1; i < allSections.length; i++) {
      if (allSections[i].sortOrder < allSections[i - 1].sortOrder) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, "Homepage sections are properly sorted by sortOrder ascending");

    // -------------------------------------------------------------------------
    // TEST 4: Edit Section Content
    // -------------------------------------------------------------------------
    console.log("\nTest 4: Section Content Update...");
    const heroSec = allSections.find((s) => s.type === "hero");
    assert(Boolean(heroSec), "Hero section found for update test");

    if (heroSec) {
      const updatedHeading = "Apex Velocity Next-Gen Athletic Gear";
      const updated = await updateHomepageSection(heroSec.id, {
        content: { ...heroSec.content, heading: updatedHeading },
      });
      assert(updated?.content?.heading === updatedHeading, "Hero section heading successfully updated");

      const fetched = await getHomepageSectionById(heroSec.id);
      assert(fetched?.content?.heading === updatedHeading, "Updated heading verified via getHomepageSectionById");
    }

    // -------------------------------------------------------------------------
    // TEST 5: Active / Inactive Visibility Toggle
    // -------------------------------------------------------------------------
    console.log("\nTest 5: Section Visibility Toggle...");
    const promoSec = allSections.find((s) => s.type === "promo_banner");
    assert(Boolean(promoSec), "Promo banner section found");

    if (promoSec) {
      // Toggle to inactive
      await updateHomepageSection(promoSec.id, { isActive: false });
      const activeOnlyList = await listHomepageSections({ activeOnly: true });
      assert(!activeOnlyList.some((s) => s.id === promoSec.id), "Deactivated section is hidden from public active-only list");

      // Re-enable
      await updateHomepageSection(promoSec.id, { isActive: true });
      const reenabledList = await listHomepageSections({ activeOnly: true });
      assert(reenabledList.some((s) => s.id === promoSec.id), "Re-activated section is visible again on public active list");
    }

    // -------------------------------------------------------------------------
    // TEST 6: Reorder Sections
    // -------------------------------------------------------------------------
    console.log("\nTest 6: Section Sequence Reordering...");
    if (allSections.length >= 2) {
      const originalIds = allSections.map((s) => s.id);
      // Reverse order of the first two
      const swappedIds = [originalIds[1], originalIds[0], ...originalIds.slice(2)];
      await reorderHomepageSections(swappedIds);

      const reordered = await listHomepageSections({ activeOnly: false });
      assert(reordered[0].id === originalIds[1], `First section is now '${originalIds[1]}'`);
      assert(reordered[1].id === originalIds[0], `Second section is now '${originalIds[0]}'`);

      // Restore original order
      await reorderHomepageSections(originalIds);
      const restored = await listHomepageSections({ activeOnly: false });
      assert(restored[0].id === originalIds[0], "Original section sequence restored");
    }

    // -------------------------------------------------------------------------
    // TEST 7: Dynamic Creation and Deletion of a Section
    // -------------------------------------------------------------------------
    console.log("\nTest 7: Dynamic Section Creation & Deletion Lifecycle...");
    const tempSecId = `test-temp-${Date.now()}`;
    const newSec = await createHomepageSection({
      id: tempSecId,
      type: "promo_banner",
      title: "Temporary Test Promo Banner",
      sortOrder: 99,
      isActive: true,
      content: {
        heading: "Flash 24h Clearance",
        buttonText: "Shop Deals",
        buttonUrl: "/search?deal=1",
      },
    });
    assert(newSec.id === tempSecId, "New custom section created");

    const existsAfterCreate = await getHomepageSectionById(tempSecId);
    assert(Boolean(existsAfterCreate), "Created section is queryable");

    await deleteHomepageSection(tempSecId);
    const existsAfterDelete = await getHomepageSectionById(tempSecId);
    assert(!existsAfterDelete, "Deleted section is removed");

    console.log("\n===============================================================================");
    console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log("===============================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Fatal Test Suite Exception:", err);
    process.exit(1);
  }
}

runTests();
