import {
  getOrCreateCart,
  addItemToCart,
  getCartWithItems,
  clearCart,
} from "../lib/cart";
import {
  createOrderFromCart,
  createOrderSchema,
  getAllAdminOrders,
} from "../lib/orders";
import {
  createProduct,
  deleteProduct,
  getProductById,
} from "../lib/products";
import {
  checkRateLimit,
  recordLoginAttempt,
  clearFailedAttempts,
  RATE_LIMIT_MAX_ATTEMPTS,
} from "../lib/auth";

async function runStage13Tests() {
  console.log("=== STARTING STAGE 13 COMPREHENSIVE TESTS ===");

  // 1. Setup: Create test product
  console.log("\n[Test 1] Setting up test product for checkout verification...");
  const initialStock = 20;
  const productPrice = 95.5;
  const testProduct = await createProduct({
    name: "Security Audit Sneaker",
    slug: `security-audit-sneaker-${Date.now()}`,
    sku: `SEC-SKU-${Date.now()}`,
    price: productPrice,
    stockQuantity: initialStock,
    stockStatus: "in_stock",
    status: "published",
    mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    description: "Test product for Stage 13 security and checkout audit.",
  });
  console.log(`- Created product: ${testProduct.name} (ID: ${testProduct.id}, Stock: ${initialStock}, Price: $${productPrice})`);

  try {
    // 2. Cart Session Resolution Test
    console.log("\n[Test 2] Testing cart creation and retrieval by sessionId & id...");
    const guestSessionId = `test-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    // Create cart with guest session ID
    const cartRecord = await getOrCreateCart(guestSessionId);
    console.log(`- Cart created: id=${cartRecord.id}, sessionId=${cartRecord.sessionId}`);
    if (!cartRecord.id || cartRecord.sessionId !== guestSessionId) {
      throw new Error("Cart creation failed or sessionId mismatch");
    }

    // Add item to cart
    await addItemToCart(cartRecord.id, testProduct.id, null, 2);
    console.log("- Added 2 items to cart.");

    // Retrieve by cart.id (primary key)
    const summaryById = await getCartWithItems(cartRecord.id);
    console.log(`- Retrieved by cart.id: itemCount=${summaryById.itemCount}, subtotal=$${summaryById.subtotal}`);
    if (summaryById.items.length !== 1 || summaryById.itemCount !== 2) {
      throw new Error(`Failed to retrieve items by cart.id: expected 2, got ${summaryById.itemCount}`);
    }

    // Retrieve by guestSessionId (cookie value) - THIS WAS THE PREVIOUS BUG!
    const summaryBySessionId = await getCartWithItems(guestSessionId);
    console.log(`- Retrieved by guestSessionId: itemCount=${summaryBySessionId.itemCount}, subtotal=$${summaryBySessionId.subtotal}`);
    if (summaryBySessionId.items.length !== 1 || summaryBySessionId.itemCount !== 2) {
      throw new Error(`CRITICAL BUG: Failed to retrieve cart by guestSessionId! Items length: ${summaryBySessionId.items.length}`);
    }
    console.log("- Cart session retrieval by sessionId SUCCESSFUL!");

    // 3. Order Placement Flow Test
    console.log("\n[Test 3] Testing order placement from cart using guestSessionId...");
    const orderInput = {
      customerName: "Alex Mercer",
      phone: "+1 555-0199",
      email: "alex@example.com",
      address: "123 Cyber Way, Suite 400",
      city: "Neo City",
      notes: "Leave package at front desk",
      paymentMethod: "cod" as const,
    };

    // Execute order creation using guestSessionId (exact flow triggered by checkout page)
    const createdOrder = await createOrderFromCart(orderInput, guestSessionId);
    console.log(`- Order placed successfully! Order ID: ${createdOrder.id}`);
    console.log(`- Order subtotal: $${createdOrder.subtotal}, total: $${createdOrder.total}`);
    console.log(`- Order items count: ${createdOrder.items.length}`);

    if (createdOrder.items.length !== 1 || createdOrder.items[0].quantity !== 2) {
      throw new Error("Order items count mismatch");
    }

    // Authoritative price check
    const expectedSubtotal = Math.round(productPrice * 2 * 100) / 100;
    if (createdOrder.subtotal !== expectedSubtotal) {
      throw new Error(`Subtotal mismatch: expected $${expectedSubtotal}, got $${createdOrder.subtotal}`);
    }

    // 4. Verify Inventory Decrement
    console.log("\n[Test 4] Verifying atomic inventory decrement...");
    const updatedProd = await getProductById(testProduct.id);
    console.log(`- Updated stock: ${updatedProd?.stockQuantity} (initial: ${initialStock}, ordered: 2)`);
    if (updatedProd && updatedProd.stockQuantity !== initialStock - 2) {
      throw new Error(`Stock not decremented properly: expected ${initialStock - 2}, got ${updatedProd.stockQuantity}`);
    }

    // 5. Verify Cart Cleared
    console.log("\n[Test 5] Verifying cart cleared and converted after order...");
    const postOrderCart = await getCartWithItems(guestSessionId);
    console.log(`- Post-order cart items count: ${postOrderCart.items.length}`);
    if (postOrderCart.items.length !== 0) {
      throw new Error("Cart items were not cleared after order creation");
    }

    // 6. Security: Schema Input Validation
    console.log("\n[Test 6] Testing Zod schema input validation...");
    const invalidInputs = [
      { ...orderInput, customerName: "A" }, // too short
      { ...orderInput, phone: "invalid-phone" }, // invalid phone regex
      { ...orderInput, address: "abc" }, // too short address
      { ...orderInput, city: "" }, // missing city
    ];

    for (const bad of invalidInputs) {
      const parse = createOrderSchema.safeParse(bad);
      if (parse.success) {
        throw new Error(`Zod validation failed to catch invalid input: ${JSON.stringify(bad)}`);
      }
    }
    console.log("- All invalid inputs correctly rejected by Zod schema!");

    // 7. Security: Rate Limiting
    console.log("\n[Test 7] Testing login rate limiting (3 failed attempts -> lockout)...");
    const testEmail = `audit-test-${Date.now()}@example.com`;
    await clearFailedAttempts(testEmail);

    let rateCheck = await checkRateLimit(testEmail);
    if (rateCheck.locked) throw new Error("Rate limit should not be locked initially");

    // Record 3 failed attempts
    await recordLoginAttempt(testEmail, false);
    await recordLoginAttempt(testEmail, false);
    await recordLoginAttempt(testEmail, false);

    rateCheck = await checkRateLimit(testEmail);
    console.log(`- Rate limit status after 3 failures: locked=${rateCheck.locked}, remainingSeconds=${rateCheck.remainingSeconds}`);
    if (!rateCheck.locked) {
      throw new Error("Expected rate limit to be locked after 3 failed attempts");
    }

    // Clear failed attempts
    await clearFailedAttempts(testEmail);
    rateCheck = await checkRateLimit(testEmail);
    if (rateCheck.locked) {
      throw new Error("Expected rate limit to be unlocked after clearing failed attempts");
    }
    console.log("- Rate limiting lockout verified and cleared successfully!");

    console.log("\n>>> ALL STAGE 13 TESTS PASSED SUCCESSFULLY! <<<");
  } finally {
    console.log("\n[Cleanup] Cleaning up test product...");
    await deleteProduct(testProduct.id);
    console.log("- Cleanup complete.");
  }
}

runStage13Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
