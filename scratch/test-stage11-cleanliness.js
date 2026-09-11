/**
 * Stage 11 Storefront Infrastructure Cleanliness Audit
 * Scans all customer-facing routes on the live worker and ensures
 * zero technical infrastructure or hosting terms are visible to shoppers.
 */

const BASE_URL = process.env.TEST_URL || "https://ecommerce-store-perf-test.zia291930.workers.dev";

const ROUTES_TO_AUDIT = [
  { name: "Homepage", path: "/" },
  { name: "Product Detail", path: "/product/apex-velocity-runner-x1" },
  { name: "Category Page", path: "/category/footwear" },
  { name: "Search Page", path: "/search?q=runner" },
  { name: "Shopping Cart", path: "/cart" },
  { name: "Checkout", path: "/checkout" },
];

const FORBIDDEN_PATTERNS = [
  { term: "cloudflare", regex: /\bcloudflare\b/gi },
  { term: "D1 database / D1 reference", regex: /\bD1\s*(database|catalog|availability|query|queries)?\b/gi },
  { term: "R2 storage / R2 reference", regex: /\bR2\s*(storage|bucket|cloud)?\b/gi },
  { term: "OpenNext", regex: /\bopennext\b/gi },
  { term: "Workers (except URL domain)", regex: /\bworkers\b(?!\.dev)/gi },
  { term: "Edge Commerce / Edge Architecture", regex: /\bedge\s*(commerce|architecture|delivery|powered|pipeline)\b/gi },
  { term: "Powered by [tech]", regex: /powered\s+by\s+(cloudflare|d1|r2|workers|opennext|next)/gi },
  { term: "Hosted on", regex: /hosted\s+on/gi },
];

async function runCleanlinessCheck() {
  console.log(`=== Scanning Live Storefront for Infrastructure References at ${BASE_URL} ===\n`);

  let totalViolations = 0;

  for (const route of ROUTES_TO_AUDIT) {
    const url = `${BASE_URL}${route.path}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Stage11AuditBot/1.0" } });
      if (!res.ok) {
        console.error(`❌ Route ${route.name} (${route.path}) returned HTTP ${res.status}`);
        totalViolations++;
        continue;
      }

      const html = await res.text();
      let routeViolations = 0;

      for (const pattern of FORBIDDEN_PATTERNS) {
        // Strip out SVG paths (e.g. d="...d1...") to avoid false positives
        const cleanedHtml = html.replace(/<svg[\s\S]*?<\/svg>/gi, "");
        const matches = cleanedHtml.match(pattern.regex);
        if (matches && matches.length > 0) {
          // Check if matches are just worker domain references
          const genuineMatches = matches.filter(m => !m.includes("workers.dev"));
          if (genuineMatches.length > 0) {
            console.error(`   ❌ [${route.name}] Found ${genuineMatches.length} violation(s) for "${pattern.term}": ${genuineMatches.slice(0, 3).join(", ")}`);
            routeViolations += genuineMatches.length;
          }
        }
      }

      if (routeViolations === 0) {
        console.log(`   ✅ ${route.name} (${route.path}): 100% CLEAN — Zero infrastructure terms found.`);
      } else {
        totalViolations += routeViolations;
      }
    } catch (err) {
      console.error(`   ❌ Failed to fetch ${route.name}:`, err.message);
      totalViolations++;
    }
  }

  console.log("\n=======================================================");
  if (totalViolations === 0) {
    console.log("🎉 CLEANLINESS AUDIT PASSED: ZERO INFRASTRUCTURE TERMS FOUND ON STOREFRONT!");
  } else {
    console.error(`⚠️ CLEANLINESS AUDIT FAILED: Found ${totalViolations} violations across storefront.`);
  }
}

runCleanlinessCheck();
