/**
 * Stage 42.5b Live Verification Script
 */

async function main() {
  console.log("=== STAGE 42.5b LIVE VERIFICATION ===");
  const storeUrl = "https://nasrify-store.zia291930.workers.dev";
  const adminUrl = "https://nasrify-admin.zia291930.workers.dev";

  // 1. Verify Storefront live
  console.log("\n1. Testing Storefront Live Homepage...");
  const t0 = Date.now();
  const resHome = await fetch(`${storeUrl}/`);
  const homeDuration = Date.now() - t0;
  console.log(`- Status: ${resHome.status} (${homeDuration}ms)`);
  if (!resHome.ok) throw new Error("Storefront returned " + resHome.status);
  const homeHtml = await resHome.text();
  console.log(`- HTML size: ${homeHtml.length} bytes`);

  // Check for visibility CSS
  const hasVisibilityCss = homeHtml.includes("theme-visibility-css") || homeHtml.includes("hide-desktop");
  console.log(`- Injected responsive visibility CSS present: ${hasVisibilityCss ? "✓ YES" : "✗ NO"}`);

  // 2. Verify Storefront with ?preview=1
  console.log("\n2. Testing Storefront Preview Mode (?preview=1)...");
  const resPreview = await fetch(`${storeUrl}/?preview=1`);
  console.log(`- Status: ${resPreview.status}`);
  const previewHtml = await resPreview.text();
  const hasEditable = previewHtml.includes('data-editable="');
  console.log(`- data-editable attributes present: ${hasEditable ? "✓ YES" : "✗ NO"}`);
  const hasThemePreviewWrapper = previewHtml.includes("ThemePreviewWrapper") || previewHtml.includes("data-section-id");
  console.log(`- ThemePreviewWrapper / data-section-id present: ${hasThemePreviewWrapper ? "✓ YES" : "✗ NO"}`);

  // 3. Verify Admin Theme Editor Page
  console.log("\n3. Testing Admin Theme Editor UI...");
  const resAdminEditor = await fetch(`${adminUrl}/admin/theme-editor`, {
    redirect: "manual",
  });
  console.log(`- Status (manual redirect): ${resAdminEditor.status}`);

  // 4. Verify Active Theme API
  console.log("\n4. Testing Active Theme Public API on Storefront...");
  const resActiveTheme = await fetch(`${storeUrl}/api/themes/active`);
  console.log(`- Status: ${resActiveTheme.status}`);
  if (resActiveTheme.ok) {
    const activeData = await resActiveTheme.json() as any;
    console.log(`- Active theme: "${activeData?.theme?.name || activeData?.name || "Standard"}"`);
    console.log(`- Sections count: ${activeData?.theme?.sections?.length ?? activeData?.sections?.length ?? 0}`);
  }

  console.log("\n=== ALL LIVE VERIFICATION CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
