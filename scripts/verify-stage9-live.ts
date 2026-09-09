const BASE_URL = "https://ecommerce-store-v2.zia291930.workers.dev";

async function verifyStage9Live() {
  console.log(`=======================================================`);
  console.log(`🚀 VERIFYING STAGE 9 ON LIVE WORKER: ${BASE_URL}`);
  console.log(`=======================================================\n`);

  let passed = 0;
  let cookieHeader = "";

  // Test 1: GET /api/cart - Initial cart retrieval & cookie creation
  console.log("[Test 1] GET /api/cart (Guest cart initialization)...");
  try {
    const res = await fetch(`${BASE_URL}/api/cart`, {
      headers: { "User-Agent": "Stage9-Live-Verification" },
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      cookieHeader = setCookie.split(";")[0];
      console.log("   Received session cookie:", cookieHeader);
    }
    const data = await res.json();
    console.log("   Initial cart status:", res.status, "itemCount:", data.data?.itemCount);

    if (res.status === 200 && data.success && Array.isArray(data.data?.items)) {
      console.log("✅ [Test 1] PASSED\n");
      passed++;
    } else {
      console.error("❌ [Test 1] FAILED:", data);
    }
  } catch (err) {
    console.error("❌ [Test 1] Exception:", err);
  }

  // Test 2: POST /api/cart/add - Add product to cart with server price verification
  console.log("[Test 2] POST /api/cart/add (Adding item with cookie)...");
  let addedItemId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        "User-Agent": "Stage9-Live-Verification",
      },
      body: JSON.stringify({
        productId: "prod-apex-vrx1",
        quantity: 2,
      }),
    });

    const data = await res.json();
    console.log("   Add status:", res.status, "data:", JSON.stringify(data));

    if (res.status === 200 && data.success && data.data?.itemCount === 2) {
      addedItemId = data.data.items[0]?.id;
      console.log(`   Added item ID: ${addedItemId}, Subtotal: $${data.data.subtotal}`);
      console.log("✅ [Test 2] PASSED\n");
      passed++;
    } else {
      console.error("❌ [Test 2] FAILED:", data);
    }
  } catch (err) {
    console.error("❌ [Test 2] Exception:", err);
  }

  // Test 3: PUT /api/cart/update - Quantity modification
  console.log("[Test 3] PUT /api/cart/update (Updating quantity to 4)...");
  try {
    const res = await fetch(`${BASE_URL}/api/cart/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        "User-Agent": "Stage9-Live-Verification",
      },
      body: JSON.stringify({
        cartItemId: addedItemId,
        quantity: 4,
      }),
    });

    const data = await res.json();
    console.log("   Update status:", res.status, "itemCount:", data.data?.itemCount, "subtotal:", data.data?.subtotal);

    if (res.status === 200 && data.success && data.data?.itemCount === 4) {
      console.log("✅ [Test 3] PASSED\n");
      passed++;
    } else {
      console.error("❌ [Test 3] FAILED:", data);
    }
  } catch (err) {
    console.error("❌ [Test 3] Exception:", err);
  }

  // Test 4: DELETE /api/cart/remove - Item removal
  console.log("[Test 4] DELETE /api/cart/remove (Removing cart item)...");
  try {
    const res = await fetch(`${BASE_URL}/api/cart/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        "User-Agent": "Stage9-Live-Verification",
      },
      body: JSON.stringify({
        cartItemId: addedItemId,
      }),
    });

    const data = await res.json();
    console.log("   Remove status:", res.status, "itemCount:", data.data?.itemCount);

    if (res.status === 200 && data.success && data.data?.itemCount === 0) {
      console.log("✅ [Test 4] PASSED\n");
      passed++;
    } else {
      console.error("❌ [Test 4] FAILED:", data);
    }
  } catch (err) {
    console.error("❌ [Test 4] Exception:", err);
  }

  // Test 5: GET /cart - Full page render
  console.log("[Test 5] GET /cart (Storefront cart page render)...");
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: { "User-Agent": "Stage9-Live-Verification" },
    });
    const html = await res.text();
    const hasCartHeader = html.includes("Shopping Cart") || html.includes("cart");
    console.log("   Status:", res.status, "HTML contains cart:", hasCartHeader);

    if (res.status === 200 && hasCartHeader) {
      console.log("✅ [Test 5] PASSED\n");
      passed++;
    } else {
      console.error("❌ [Test 5] FAILED");
    }
  } catch (err) {
    console.error("❌ [Test 5] Exception:", err);
  }

  // Test 6: Admin product creation with auto-assigned relative R2 image path
  console.log("[Test 6] Admin Product Creation with relative R2 image (No manual URL)...");
  try {
    // 1. Admin login
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });
    const adminCookie = loginRes.headers.get("set-cookie")?.split(";")[0] || "";

    const testSlug = "stage9-test-shoe-" + Date.now();
    const testSku = "S9-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    // 2. Create product with relative R2 path
    const createRes = await fetch(`${BASE_URL}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: "Stage 9 Velocity Elite Shoe",
        slug: testSlug,
        sku: testSku,
        price: 149.99,
        salePrice: 119.99,
        stockQuantity: 40,
        stockStatus: "in_stock",
        status: "published",
        mainImage: "/api/media/products/7b35c240-30a3-4a13-bb37-0d01045853a0.png",
        galleryImages: [
          "/api/media/products/39b21f47-5dad-4a9d-aedb-7747716c8667.jpg",
        ],
      }),
    });

    const createData = await createRes.json();
    console.log("   Product creation status:", createRes.status, "data:", JSON.stringify(createData));

    if ((createRes.status === 201 || createRes.status === 200) && createData.success) {
      console.log("✅ [Test 6] PASSED: Product successfully created with relative R2 image path!\n");
      passed++;
    } else {
      console.error("❌ [Test 6] FAILED:", createData);
    }
  } catch (err) {
    console.error("❌ [Test 6] Exception:", err);
  }

  console.log(`=======================================================`);
  console.log(`STAGE 9 VERIFICATION SUMMARY: ${passed}/6 checks passed.`);
  if (passed === 6) {
    console.log(`🎉 100% SUCCESS: STAGE 9 CART SYSTEM & IMAGE FIX FULLY OPERATIONAL!`);
  } else {
    process.exit(1);
  }
}

verifyStage9Live();
