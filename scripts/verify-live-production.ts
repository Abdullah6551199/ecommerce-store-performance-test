async function verifyLiveDeployment() {
  const base = "https://ecommerce-store-v2.zia291930.workers.dev";
  console.log(`=== RUNNING COMPREHENSIVE LIVE PRODUCTION VERIFICATION ===`);
  console.log(`Target: ${base}\n`);

  let passed = 0;
  let failed = 0;

  function check(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${name}${detail ? ` (${detail})` : ""}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${name}${detail ? ` (${detail})` : ""}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // 1. Health API
  // --------------------------------------------------------------------------
  console.log("Section 1: Core Health & APIs");
  try {
    const resHealth = await fetch(`${base}/api/health`);
    const jsonHealth = await resHealth.json();
    check("Health Check Endpoint (/api/health)", resHealth.status === 200 && jsonHealth.status === "healthy", JSON.stringify(jsonHealth));
  } catch (e: any) {
    check("Health Check Endpoint (/api/health)", false, e.message);
  }

  // --------------------------------------------------------------------------
  // 2. Public Storefront Routes
  // --------------------------------------------------------------------------
  console.log("\nSection 2: Public Storefront Routes");
  
  // 2a. Homepage (/)
  try {
    const resHome = await fetch(base);
    const textHome = await resHome.text();
    check("Homepage (GET /)", resHome.status === 200 && textHome.length > 500, `${resHome.status}, length: ${textHome.length} bytes`);
  } catch (e: any) {
    check("Homepage (GET /)", false, e.message);
  }

  // 2b. Search Page (/search)
  try {
    const resSearchPage = await fetch(`${base}/search`);
    check("Search Page (GET /search)", resSearchPage.status === 200, `Status: ${resSearchPage.status}`);
  } catch (e: any) {
    check("Search Page (GET /search)", false, e.message);
  }

  // 2c. Search API (/api/products/search)
  let sampleProduct: any = null;
  try {
    const resSearchApi = await fetch(`${base}/api/products/search?limit=5`);
    const jsonSearch = await resSearchApi.json();
    const productsList = jsonSearch.data || [];
    sampleProduct = productsList[0] || null;
    check("Search API (GET /api/products/search)", resSearchApi.status === 200 && productsList.length > 0, `Returned ${productsList.length} products`);
  } catch (e: any) {
    check("Search API (GET /api/products/search)", false, e.message);
  }

  // 2d. Product Detail Page (/product/[slug])
  if (sampleProduct?.slug) {
    try {
      const resProductPage = await fetch(`${base}/product/${sampleProduct.slug}`);
      check(`Product Page (GET /product/${sampleProduct.slug})`, resProductPage.status === 200, `Status: ${resProductPage.status}`);
    } catch (e: any) {
      check("Product Page", false, e.message);
    }
  }

  // 2e. Cart Page (/cart)
  try {
    const resCartPage = await fetch(`${base}/cart`);
    check("Cart Page (GET /cart)", resCartPage.status === 200, `Status: ${resCartPage.status}`);
  } catch (e: any) {
    check("Cart Page (GET /cart)", false, e.message);
  }

  // 2f. Checkout Page (/checkout)
  try {
    const resCheckoutPage = await fetch(`${base}/checkout`);
    check("Checkout Page (GET /checkout)", resCheckoutPage.status === 200, `Status: ${resCheckoutPage.status}`);
  } catch (e: any) {
    check("Checkout Page (GET /checkout)", false, e.message);
  }

  // 2g. Sitemap (/sitemap.xml) & Robots (/robots.txt)
  try {
    const resSitemap = await fetch(`${base}/sitemap.xml`);
    const textSitemap = await resSitemap.text();
    check("Sitemap (GET /sitemap.xml)", resSitemap.status === 200 && textSitemap.includes("<urlset"), `Status: ${resSitemap.status}`);
  } catch (e: any) {
    check("Sitemap (GET /sitemap.xml)", false, e.message);
  }

  try {
    const resRobots = await fetch(`${base}/robots.txt`);
    const textRobots = await resRobots.text();
    check("Robots (GET /robots.txt)", resRobots.status === 200 && textRobots.includes("Disallow: /admin"), `Status: ${resRobots.status}`);
  } catch (e: any) {
    check("Robots (GET /robots.txt)", false, e.message);
  }

  // --------------------------------------------------------------------------
  // 3. Security & Admin Route Boundaries
  // --------------------------------------------------------------------------
  console.log("\nSection 3: Security & Route Protection");
  
  // 3a. Admin Orders API (unauthenticated -> 401)
  try {
    const resAdminOrders = await fetch(`${base}/api/admin/orders`);
    const jsonAdminOrders = await resAdminOrders.json();
    check("Admin Orders API Protected", resAdminOrders.status === 401 && jsonAdminOrders.success === false, `Status: ${resAdminOrders.status}`);
  } catch (e: any) {
    check("Admin Orders API Protected", false, e.message);
  }

  // 3b. Admin Categories API (unauthenticated -> 401)
  try {
    const resAdminCats = await fetch(`${base}/api/admin/categories`);
    const jsonAdminCats = await resAdminCats.json();
    check("Admin Categories API Protected", resAdminCats.status === 401 && jsonAdminCats.success === false, `Status: ${resAdminCats.status}`);
  } catch (e: any) {
    check("Admin Categories API Protected", false, e.message);
  }

  // 3c. Media Upload API (unauthenticated -> 401)
  try {
    const resMediaUpload = await fetch(`${base}/api/media/upload`, { method: "POST" });
    check("Media Upload API Protected", resMediaUpload.status === 401, `Status: ${resMediaUpload.status}`);
  } catch (e: any) {
    check("Media Upload API Protected", false, e.message);
  }

  // 3d. Admin Dashboard Page (unauthenticated -> redirect to /admin/login)
  try {
    const resAdminDash = await fetch(`${base}/admin/dashboard`, { redirect: "manual" });
    check(
      "Admin Dashboard Page Redirects to Login",
      resAdminDash.status === 307 || resAdminDash.status === 302 || resAdminDash.status === 401,
      `Status: ${resAdminDash.status}`
    );
  } catch (e: any) {
    check("Admin Dashboard Page Redirects to Login", false, e.message);
  }

  // --------------------------------------------------------------------------
  // 4. Cart & Checkout End-to-End Flow
  // --------------------------------------------------------------------------
  console.log("\nSection 4: Live Cart & Order Placement End-to-End");
  if (sampleProduct) {
    const liveSession = "live-prod-session-" + Date.now();
    let orderId = "";

    // 4a. Add to cart
    try {
      const resAdd = await fetch(`${base}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `cart_session_id=${liveSession}`
        },
        body: JSON.stringify({
          productId: sampleProduct.id,
          quantity: 1,
          cartSessionId: liveSession
        })
      });
      const jsonAdd = await resAdd.json();
      check("Add Product to Cart", resAdd.status === 200 && jsonAdd.success === true, `Status: ${resAdd.status}`);
    } catch (e: any) {
      check("Add Product to Cart", false, e.message);
    }

    // 4b. Place Order
    try {
      const resOrder = await fetch(`${base}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `cart_session_id=${liveSession}`
        },
        body: JSON.stringify({
          cartSessionId: liveSession,
          customerName: "Production Verification Buyer",
          phone: "+15552345678",
          email: "prodcheck@example.com",
          address: "789 Cloudflare Boulevard",
          city: "Austin",
          paymentMethod: "cod"
        })
      });
      const jsonOrder = await resOrder.json();
      orderId = jsonOrder.data?.orderId || jsonOrder.data?.order?.id || "";
      check("Place Checkout Order", resOrder.status === 200 && jsonOrder.success === true, `Order ID: ${orderId}`);
    } catch (e: any) {
      check("Place Checkout Order", false, e.message);
    }

    // 4c. Order Success Confirmation Page
    if (orderId) {
      try {
        const resSuccessPage = await fetch(`${base}/order-success/${orderId}`);
        check(`Order Success Page (/order-success/${orderId})`, resSuccessPage.status === 200, `Status: ${resSuccessPage.status}`);
      } catch (e: any) {
        check("Order Success Page", false, e.message);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`LIVE VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyLiveDeployment().catch((err) => {
  console.error("Live test failed:", err);
  process.exit(1);
});
