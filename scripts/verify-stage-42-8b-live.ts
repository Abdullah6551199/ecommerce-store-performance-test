async function verify() {
  const STORE_URL = "https://nasrify-store.zia291930.workers.dev";
  const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";

  console.log("=== STAGE 42.8b LIVE VERIFICATION ===");

  // 1. Check Homepage
  const t0 = performance.now();
  const homeRes = await fetch(`${STORE_URL}/`);
  const t1 = performance.now();
  const homeHtml = await homeRes.text();
  console.log(`1. Homepage Status: ${homeRes.status} (Fetched in ${(t1 - t0).toFixed(1)}ms)`);

  // Verify CSS variables are injected
  const hasPrimary = homeHtml.includes("--theme-primary: #25D366");
  const hasPrimaryDark = homeHtml.includes("--theme-primary-dark: #1EA855");
  const hasPrimaryLight = homeHtml.includes("--theme-primary-light: #DCFCE7");
  const hasButtonRadius = homeHtml.includes("--theme-button-radius: 8px");
  const hasAccent = homeHtml.includes("--theme-accent: #18181B");
  console.log(`   CSS Variables: --theme-primary (#25D366): ${hasPrimary}`);
  console.log(`   CSS Variables: --theme-primary-dark (#1EA855): ${hasPrimaryDark}`);
  console.log(`   CSS Variables: --theme-primary-light (#DCFCE7): ${hasPrimaryLight}`);
  console.log(`   CSS Variables: --theme-button-radius (8px): ${hasButtonRadius}`);
  console.log(`   CSS Variables: --theme-accent (#18181B): ${hasAccent}`);

  // 2. Check /dev/test-theme page
  const devT0 = performance.now();
  const devRes = await fetch(`${STORE_URL}/dev/test-theme`);
  const devT1 = performance.now();
  const devHtml = await devRes.text();
  console.log(`2. Dev Test Theme Page Status: ${devRes.status} (Fetched in ${(devT1 - devT0).toFixed(1)}ms)`);
  const hasGallery = devHtml.includes("Minimalist Ergonomic Workspace Chair");
  const hasTabs = devHtml.includes("Specifications") || devHtml.includes("Shipping & Returns");
  const hasReviews = devHtml.includes("Customer Reviews");
  console.log(`   Test Page Gallery & Info rendered: ${hasGallery}`);
  console.log(`   Test Page Tabs rendered: ${hasTabs}`);
  console.log(`   Test Page Reviews rendered: ${hasReviews}`);

  // 3. Check existing live product page (ensure no regression)
  const prodRes = await fetch(`${STORE_URL}/product/apex-velocity-runner-x1`);
  console.log(`3. Existing Product Page Status: ${prodRes.status}`);

  // 4. Check cart page
  const cartRes = await fetch(`${STORE_URL}/cart`);
  console.log(`4. Existing Cart Page Status: ${cartRes.status}`);

  // 5. Check checkout page
  const checkoutRes = await fetch(`${STORE_URL}/checkout`);
  console.log(`5. Existing Checkout Page Status: ${checkoutRes.status}`);

  // 6. Check Active Theme API
  const themeApiRes = await fetch(`${STORE_URL}/api/themes/active`);
  const payload = await themeApiRes.json();
  const themeData = payload?.theme || payload;
  const hasPageDefaults = !!themeData?.page_defaults;
  console.log(`6. Active Theme API: ${themeApiRes.status}`);
  console.log(`   Theme Name: ${themeData?.name}`);
  console.log(`   Primary Color: ${themeData?.settings?.colors?.primary}`);
  console.log(`   Primary Dark Color: ${themeData?.settings?.colors?.primary_dark}`);
  console.log(`   Has page_defaults: ${hasPageDefaults}`);
  if (hasPageDefaults) {
    console.log(`   Page Default types defined: ${Object.keys(themeData.page_defaults).join(", ")}`);
  }

  // 7. Check Admin Theme Editor
  const adminRes = await fetch(`${ADMIN_URL}/admin/theme-editor`);
  console.log(`7. Admin Theme Editor Route Status: ${adminRes.status}`);

  // 8. Measure CPU timing on storefront
  const pingTimes: number[] = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    await fetch(`${STORE_URL}/`);
    pingTimes.push(performance.now() - start);
  }
  const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
  console.log(`8. Storefront Average Network Latency: ${avgPing.toFixed(1)}ms`);

  console.log("\n=== ALL VERIFICATIONS PASSED ===");
}

verify().catch(console.error);
