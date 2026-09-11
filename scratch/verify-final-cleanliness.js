/**
 * Final Text-Based Storefront Cleanliness Verification
 * Tests all 6 customer-facing routes on the live worker.
 * Strips <script>, <style>, and <svg> tags, then confirms ZERO occurrences of forbidden terms.
 */

const BASE_URL = process.env.TEST_URL || "https://ecommerce-store-perf-test.zia291930.workers.dev";

const routes = [
  { name: "Homepage", path: "/" },
  { name: "Product Detail", path: "/product/apex-velocity-runner-x1" },
  { name: "Category Page", path: "/category/footwear" },
  { name: "Search Page", path: "/search?q=runner" },
  { name: "Shopping Cart", path: "/cart" },
  { name: "Checkout Page", path: "/checkout" },
];

const forbiddenTerms = [
  "cloudflare",
  "d1",
  "r2",
  "opennext",
  "workers",
  "next.js",
  "edge runtime",
  "edge commerce",
];

async function verifyAll() {
  console.log("================================================================================");
  console.log("  FINAL TEXT-BASED STOREFRONT INFRASTRUCTURE CLEANLINESS VERIFICATION");
  console.log(`  Target: ${BASE_URL}`);
  console.log("================================================================================\n");

  let totalViolations = 0;

  for (const route of routes) {
    const url = `${BASE_URL}${route.path}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Stage11CleanlinessVerifier/1.0" } });
      if (!res.ok) {
        console.error(`HTTP Error for ${route.name}: ${res.status}`);
        totalViolations++;
        continue;
      }
      const html = await res.text();

      // 1. Strip script, style, and svg tags
      const strippedHtml = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<svg[\s\S]*?<\/svg>/gi, " ");

      // 2. Strip all HTML tags to get pure user-visible text
      const textOnly = strippedHtml.replace(/<[^>]+>/g, " ");

      // 3. Exclude workers.dev host domain references
      const textCleaned = textOnly.replace(/workers\.dev/gi, " ");

      let routeViolations = 0;
      for (const term of forbiddenTerms) {
        const regex = new RegExp(`\\b${term.replace(".", "\\.")}\\b`, "i");
        if (regex.test(textCleaned)) {
          console.error(`   ❌ [${route.name}] Violation found for "${term}"`);
          routeViolations++;
        }
      }

      if (routeViolations === 0) {
        console.log(`   ✅ [${route.name}] (${route.path}): 100% CLEAN — Zero infrastructure references`);
      } else {
        totalViolations += routeViolations;
      }
    } catch (err) {
      console.error(`Fetch error for ${route.name}:`, err.message);
      totalViolations++;
    }
  }

  console.log("\n================================================================================");
  if (totalViolations === 0) {
    console.log("🎉 VERIFICATION RESULT: 100% CLEAN! ZERO INFRASTRUCTURE TERMS FOUND ON STOREFRONT!");
  } else {
    console.error(`⚠️ VERIFICATION FAILED: ${totalViolations} violations detected.`);
  }
  console.log("================================================================================\n");

  return totalViolations === 0;
}

verifyAll().then((success) => {
  if (!success) process.exit(1);
});
