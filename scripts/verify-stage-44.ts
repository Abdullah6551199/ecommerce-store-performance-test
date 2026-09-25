import { execSync } from "child_process";

async function run() {
  console.log("=================================================");
  console.log("         STAGE 44 LIVE VERIFICATION              ");
  console.log("=================================================");

  const STORE_URL = "https://nasrify-store.zia291930.workers.dev";
  const THEMES_URL = "https://nasrify-themes.zia291930.workers.dev";
  const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";

  const slugs = ["minimal", "bold", "luxury", "fashion", "tech", "organic", "sport", "kids"];

  // 1. Verify D1 themes table
  console.log("\n[1] Verifying 8 new themes in D1 themes table...");
  const themesQuery = execSync(
    `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT slug, name, category, preview_url FROM themes;" --json`,
    { encoding: "utf-8" }
  );
  const themesResult = JSON.parse(themesQuery)[0].results;
  const foundSlugs = themesResult.map((r: any) => r.slug);
  for (const slug of slugs) {
    const exists = foundSlugs.includes(slug);
    console.log(`  - Theme "${slug}": ${exists ? "✓ PRESENT" : "✗ MISSING"}`);
    if (!exists) throw new Error(`Missing theme ${slug}`);
  }

  // 2. Verify SVG preview mockups in R2
  console.log("\n[2] Verifying SVG preview mockups accessible via /api/media/...");
  for (const slug of slugs) {
    const url = `${STORE_URL}/api/media/themes/previews/${slug}.svg`;
    const res = await fetch(url);
    const text = await res.text();
    const isSvg = res.status === 200 && text.includes("<svg") && text.includes(slug.toUpperCase());
    console.log(`  - ${slug}.svg (${res.status}): ${isSvg ? "✓ VALID SVG" : "✗ INVALID"}`);
    if (!isSvg) throw new Error(`SVG check failed for ${slug}`);
  }

  // 3. Verify Themes Hub detail pages
  console.log("\n[3] Verifying Themes Hub detail pages /themes/<slug>...");
  for (const slug of slugs) {
    const res = await fetch(`${THEMES_URL}/themes/${slug}`);
    const html = await res.text();
    const hasLivePreview = html.includes("Live Preview") && html.includes("iframe");
    console.log(`  - Themes Hub /themes/${slug} (${res.status}): ${hasLivePreview ? "✓ DETAIL PAGE & IFRAME OK" : "✗ FAILED"}`);
    if (!hasLivePreview) throw new Error(`Themes Hub detail page check failed for ${slug}`);
  }

  // 4. Verify Live Preview rendering on Storefront for all 8 themes
  console.log("\n[4] Verifying Storefront Live Preview renders unique layouts & tokens...");
  const uniqueChecks: Record<string, string[]> = {
    minimal: ["Simplicity in Every Detail", "Curated Essentials", "#18181B"],
    bold: ["UNCOMPROMISING SPEED", "HEAVY HITTERS", "#F59E0B"],
    luxury: ["Timeless Elegance, Enduring Craft", "Private Collections", "#D4A574"],
    fashion: ["AUTUMN / WINTER LOOKBOOK", "The Capsule Wardrobe", "#E07A7A"],
    tech: ["NEXT-GEN HARDWARE ARCHITECTURE", "Flagship Gear", "#0EA5E9"],
    organic: ["Nurtured by Nature, Bottled for You", "Pantry &amp; Wellness", "#166534"],
    sport: ["FASTER. STRONGER. UNSTOPPABLE.", "THE PRO ATHLETE SERIES", "#DC2626"],
    kids: ["Where Big Imaginations Come to Play", "Little Explorer Favorites", "#EC4899"],
  };

  for (const [slug, expectations] of Object.entries(uniqueChecks)) {
    const res = await fetch(`${STORE_URL}/?preview_theme=${slug}`);
    const html = await res.text();
    const allPresent = expectations.every((exp) => html.includes(exp));
    console.log(`  - Storefront preview (?preview_theme=${slug}) (${res.status}): ${allPresent ? "✓ UNIQUE CONTENT & STYLES" : "✗ MISMATCH"}`);
    if (!allPresent) {
      console.warn(`    Failed expectations for ${slug}:`, expectations.filter((e) => !html.includes(e)));
      throw new Error(`Preview failed for ${slug}`);
    }
  }

  // 5. Verify live storefront default theme is untouched (read-only preview)
  console.log("\n[5] Verifying live storefront default theme is untouched...");
  const liveRes = await fetch(`${STORE_URL}/`);
  const liveHtml = await liveRes.text();
  const isDefaultTheme = liveHtml.includes("Elevate Your Lifestyle with Modern Essentials");
  console.log(`  - Main Storefront (no params): ${isDefaultTheme ? "✓ DEFAULT ACTIVE THEME PRESERVED" : "✗ MODIFIED"}`);
  if (!isDefaultTheme) throw new Error("Default theme was mutated!");

  console.log("\n=================================================");
  console.log("      ✓ ALL STAGE 44 VERIFICATIONS PASSED!       ");
  console.log("=================================================\n");
}

run().catch((err) => {
  console.error("Verification failed:", err.message);
  process.exit(1);
});
