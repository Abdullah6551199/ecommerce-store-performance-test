import { DEFAULT_THEME as STORE_DEFAULT_THEME } from "../nasrify-store/lib/themes/default-theme";
import { DEFAULT_THEME as ADMIN_DEFAULT_THEME } from "../nasrify-admin/lib/themes/default-theme";
import { BUILT_IN_PAGES } from "../nasrify-admin/components/theme-editor/PageSwitcher";

async function verifyStage47() {
  console.log("=================================================");
  console.log("  VERIFYING STAGE 47.3 + 47.4 (MULTI-PAGE & BUGS) ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ ${desc}`);
      failed++;
    }
  }

  // 1. Verify Built-in Page Types
  console.log("[1] Checking Built-in Page Types in PageSwitcher...");
  const expectedPages = [
    "homepage",
    "shop",
    "product",
    "category",
    "cart",
    "checkout",
    "order_success",
    "bundles",
    "wishlist",
    "compare",
    "track_order",
    "account",
    "custom_page",
  ];

  for (const pageId of expectedPages) {
    const found = BUILT_IN_PAGES.some((p) => p.id === pageId);
    assert(found, `PageSwitcher includes built-in page: ${pageId}`);
  }

  // 2. Verify Theme Page Defaults in both Admin and Store
  console.log("\n[2] Checking page_defaults definitions...");
  const nonHomepagePages = expectedPages.filter((p) => p !== "homepage");

  for (const pageId of nonHomepagePages) {
    const adminDefaults = ADMIN_DEFAULT_THEME.page_defaults?.[pageId];
    assert(
      Array.isArray(adminDefaults) && adminDefaults.length > 0,
      `Admin DEFAULT_THEME has page_defaults['${pageId}'] (${adminDefaults?.length || 0} sections)`
    );

    const storeDefaults = STORE_DEFAULT_THEME.page_defaults?.[pageId];
    assert(
      Array.isArray(storeDefaults) && storeDefaults.length > 0,
      `Store DEFAULT_THEME has page_defaults['${pageId}'] (${storeDefaults?.length || 0} sections)`
    );
  }

  // 3. Verify Groupings in PageSwitcher
  console.log("\n[3] Checking PageSwitcher Grouping Structure...");
  const coreGroup = BUILT_IN_PAGES.filter((p) => p.group === "Core");
  const commerceGroup = BUILT_IN_PAGES.filter((p) => p.group === "Commerce");
  const contentGroup = BUILT_IN_PAGES.filter((p) => p.group === "Content");

  assert(coreGroup.length === 1 && coreGroup[0].id === "homepage", "Core group has 'homepage'");
  assert(commerceGroup.length >= 10, `Commerce group has ${commerceGroup.length} pages (>=10)`);
  assert(contentGroup.length >= 2, `Content group has ${contentGroup.length} pages (>=2)`);

  console.log("\n=================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyStage47().catch((e) => {
  console.error("Verification error:", e);
  process.exit(1);
});
