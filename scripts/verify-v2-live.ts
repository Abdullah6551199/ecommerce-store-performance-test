const BASE_URL = "https://ecommerce-store-v2.zia291930.workers.dev";

interface CheckItem {
  name: string;
  url: string;
  expectedStatus: number;
  test: (res: Response, text: string) => boolean | Promise<boolean>;
}

const checks: CheckItem[] = [
  {
    name: "API Health & D1/R2 Connectivity",
    url: `${BASE_URL}/api/health`,
    expectedStatus: 200,
    test: async (res, text) => {
      const data = JSON.parse(text);
      console.log("   Health payload:", JSON.stringify(data));
      const ok = data.status === "healthy" && data.database?.connected === true && data.storage?.configured === true;
      if (!ok) console.error("   ❌ Health check assertion failed");
      return ok;
    },
  },
  {
    name: "Homepage Sections API",
    url: `${BASE_URL}/api/homepage/sections`,
    expectedStatus: 200,
    test: async (res, text) => {
      const data = JSON.parse(text);
      console.log(`   Homepage API returned ${data.data?.length || 0} active sections.`);
      const ok = Array.isArray(data.data) && data.data.length > 0;
      if (!ok) console.error("   ❌ Expected data.data array with length > 0");
      return ok;
    },
  },
  {
    name: "Storefront Homepage HTML & Brand",
    url: `${BASE_URL}/`,
    expectedStatus: 200,
    test: (res, text) => {
      const hasApex = text.includes("ApexStore");
      const hasProducts = text.includes("/product/");
      console.log(`   Homepage contains 'ApexStore': ${hasApex}, contains '/product/': ${hasProducts}`);
      return hasApex && hasProducts;
    },
  },
  {
    name: "Product Details Page (/product/apex-velocity-runner-x1)",
    url: `${BASE_URL}/product/apex-velocity-runner-x1`,
    expectedStatus: 200,
    test: (res, text) => {
      const hasTitle = text.includes("Apex Velocity Runner");
      const hasImage = text.includes("/api/media/products/") || text.includes("7b35c240");
      console.log(`   Product page hasTitle: ${hasTitle}, hasImage: ${hasImage}`);
      return hasTitle;
    },
  },
  {
    name: "Product Details Page (/product/new-product)",
    url: `${BASE_URL}/product/new-product`,
    expectedStatus: 200,
    test: (res, text) => {
      const hasTitle = text.includes("new product") || text.includes("New Product");
      console.log(`   Product page hasTitle: ${hasTitle}`);
      return hasTitle;
    },
  },
  {
    name: "Admin Products Route (/admin/products)",
    url: `${BASE_URL}/admin/products`,
    expectedStatus: 200, // or 307 redirect to /admin/login if unauthenticated
    test: (res, text) => {
      console.log(`   Admin products status: ${res.status}, redirected: ${res.redirected}, url: ${res.url}`);
      return res.status === 200;
    },
  },
  {
    name: "R2 Media Asset Direct Edge Streaming",
    url: `${BASE_URL}/api/media/products/7b35c240-30a3-4a13-bb37-0d01045853a0.png`,
    expectedStatus: 200,
    test: (res) => {
      const contentType = res.headers.get("content-type");
      const cacheControl = res.headers.get("cache-control");
      console.log(`   R2 Asset Content-Type: ${contentType}`);
      console.log(`   R2 Asset Cache-Control: ${cacheControl}`);
      return contentType === "image/png" && !!cacheControl?.includes("immutable");
    },
  },
];

async function runVerification() {
  console.log(`=======================================================`);
  console.log(`🚀 VERIFYING NEW CLOUDFLARE WORKER: ${BASE_URL}`);
  console.log(`=======================================================\n`);

  let passed = 0;
  for (const check of checks) {
    try {
      console.log(`Checking [${check.name}] -> ${check.url}`);
      const res = await fetch(check.url, {
        headers: { "User-Agent": "Antigravity-Stage8-Verification" },
      });

      if (res.status !== check.expectedStatus) {
        console.error(`❌ Status mismatch: expected ${check.expectedStatus}, got ${res.status}`);
        continue;
      }

      const text = await res.text();
      const testPassed = await check.test(res, text);
      if (testPassed) {
        console.log(`✅ [${check.name}] PASSED\n`);
        passed++;
      } else {
        console.error(`❌ [${check.name}] FAILED assertion\n`);
      }
    } catch (err) {
      console.error(`❌ [${check.name}] Error:`, err, "\n");
    }
  }

  console.log(`=======================================================`);
  console.log(`VERIFICATION SUMMARY: ${passed}/${checks.length} checks passed.`);
  if (passed === checks.length) {
    console.log(`🎉 100% SUCCESS: ALL NEW WORKER ENDPOINTS ARE LIVE & VERIFIED!`);
  } else {
    process.exit(1);
  }
}

runVerification();
