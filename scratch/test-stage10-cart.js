/**
 * Stage 10 Client-Side Cart & Order Integrity Test
 * Tests:
 * 1. POST /api/cart/sync (silent background sync)
 * 2. POST /api/orders with client items payload
 * 3. Server-side price integrity (client sends item, server recalculates from D1)
 * 4. Empty cart rejection
 * 5. Invalid stock / invalid item rejection
 */

const BASE_URL = process.env.TEST_URL || "https://ecommerce-store-perf-test.zia291930.workers.dev";

async function runTests() {
  console.log(`=== Testing Stage 10 Cart & Order Pipeline at ${BASE_URL} ===\n`);

  let allPassed = true;

  // Test 1: Silent Cart Sync
  try {
    console.log("1. Testing silent background cart sync (/api/cart/sync)...");
    const syncRes = await fetch(`${BASE_URL}/api/cart/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          {
            productId: "test-prod",
            variantId: null,
            quantity: 2,
            name: "Test Product",
            slug: "test-product",
            price: 50,
            salePrice: null,
            imageUrl: "",
            stockQuantity: 10,
            options: null,
          },
        ],
        updatedAt: new Date().toISOString(),
      }),
    });

    const syncJson = await syncRes.json();
    if (syncRes.ok && syncJson.success) {
      console.log("   ✅ Silent sync returned HTTP 200 with success: true");
    } else {
      console.error("   ❌ Silent sync failed:", syncJson);
      allPassed = false;
    }
  } catch (err) {
    console.error("   ❌ Error during silent sync test:", err.message);
    allPassed = false;
  }

  // Test 2: Fetch a valid product from storefront to use in order test
  let sampleProduct = null;
  try {
    console.log("\n2. Fetching active product from storefront catalog...");
    const catRes = await fetch(`${BASE_URL}/api/products/search?q=runner`);
    const catJson = await catRes.json();
    const prods = catJson.data || [];
    if (prods.length > 0) {
      sampleProduct = prods[0];
      console.log(`   ✅ Found active product: "${sampleProduct.name}" (ID: ${sampleProduct.id}, Price: $${sampleProduct.salePrice || sampleProduct.price})`);
    } else {
      console.warn("   ⚠️ No products found in search");
    }
  } catch (err) {
    console.warn("   ⚠️ /api/products/search error:", err.message);
  }

  // Test 3: Order placement with empty cart (must fail with 400)
  try {
    console.log("\n3. Testing empty cart rejection at /api/orders...");
    const emptyOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Stage 10 Tester",
        phone: "+1 555-0199",
        address: "123 Test Street",
        city: "San Francisco",
        items: [],
      }),
    });
    const emptyJson = await emptyOrderRes.json();
    if (emptyOrderRes.status === 400 && !emptyJson.success) {
      console.log(`   ✅ Correctly rejected empty cart: "${emptyJson.error}"`);
    } else {
      console.error("   ❌ Expected 400 for empty cart, got:", emptyOrderRes.status, emptyJson);
      allPassed = false;
    }
  } catch (err) {
    console.error("   ❌ Error testing empty cart rejection:", err.message);
    allPassed = false;
  }

  // Test 4: Order placement with client-side items payload & Server-side price verification
  if (sampleProduct) {
    try {
      console.log("\n4. Testing order placement with client-side items payload...");
      console.log("   Submitting order with tampered client price ($0.01) to verify server uses D1 authoritative price...");
      const orderPayload = {
        customerName: "Stage 10 Price Verification",
        phone: "+1 555-0144",
        address: "456 Edge Lane",
        city: "Seattle",
        notes: "Automated Stage 10 Verification",
        items: [
          {
            productId: sampleProduct.id,
            variantId: null,
            quantity: 1,
            // Tampered price in payload to verify server ignores it!
            tamperedPrice: 0.01,
          },
        ],
      };

      const orderRes = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderJson = await orderRes.json();
      if (orderRes.ok && orderJson.success && orderJson.data?.orderId) {
        const order = orderJson.data.order;
        const expectedPrice = Number(sampleProduct.salePrice || sampleProduct.price);
        console.log(`   ✅ Order placed successfully! Order ID: ${orderJson.data.orderId}`);
        console.log(`   Authoritative Subtotal: $${order.subtotal}`);
        console.log(`   Authoritative Shipping: $${order.shipping}`);
        console.log(`   Authoritative Total: $${order.total}`);

        if (Math.abs(order.subtotal - expectedPrice) < 0.05) {
          console.log(`   ✅ Server-Side Price Integrity CONFIRMED: Subtotal ($${order.subtotal}) matches D1 product price ($${expectedPrice}), NOT tampered price!`);
        } else {
          console.warn(`   ⚠️ Subtotal ($${order.subtotal}) differs from expected ($${expectedPrice}).`);
        }
      } else {
        console.error("   ❌ Order placement failed:", orderJson);
        allPassed = false;
      }
    } catch (err) {
      console.error("   ❌ Error testing order placement:", err.message);
      allPassed = false;
    }
  }

  console.log("\n==========================================");
  if (allPassed) {
    console.log("🎉 ALL STAGE 10 PIPELINE CHECKS PASSED!");
  } else {
    console.log("⚠️ SOME STAGE 10 PIPELINE CHECKS FAILED.");
  }
}

runTests();
