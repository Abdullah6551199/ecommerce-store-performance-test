import { productSchema } from "../lib/products";
import {
  getOrCreateCart,
  addItemToCart,
  getCartWithItems,
  updateCartItemQuantity,
  removeCartItem,
  generateCartId,
} from "../lib/cart";

async function runStage9Tests() {
  console.log("==================================================");
  console.log("  Running Stage 9 Cart & Image Fix Unit Tests");
  console.log("==================================================\n");

  // 1. Test Product Schema Image URL validation with relative paths
  console.log("[Test 1] Testing productSchema with relative /api/media/ URL...");
  const validProductPayload = {
    name: "Stage 9 Performance Runner",
    slug: "stage-9-performance-runner",
    sku: "STG9-RUNNER-01",
    price: 129.99,
    salePrice: 99.99,
    stockQuantity: 25,
    stockStatus: "in_stock",
    status: "published",
    mainImage: "/api/media/products/auto-uploaded-photo.png", // Relative R2 path
    galleryImages: [
      "/api/media/products/gallery-angle-1.jpg",
      "/api/media/products/gallery-angle-2.jpg",
    ],
  };

  const parseResult = productSchema.safeParse(validProductPayload);
  if (!parseResult.success) {
    console.error("❌ Schema rejected relative image path:", parseResult.error.format());
    process.exit(1);
  }
  console.log("✅ [Test 1] Passed: productSchema accepts relative /api/media/ paths seamlessly!\n");

  // 2. Test Cart Creation & Retrieval
  console.log("[Test 2] Testing cart creation and retrieval...");
  const testSessionId = "test-session-" + generateCartId();
  const cart = await getOrCreateCart(testSessionId);
  console.log(" - Created cart ID:", cart.id);

  if (!cart.id || cart.status !== "active") {
    console.error("❌ Failed to create active cart.");
    process.exit(1);
  }
  console.log("✅ [Test 2] Passed: Active cart initialized.\n");

  // 3. Test Adding Item to Cart (Simulated Product)
  console.log("[Test 3] Testing addItemToCart...");
  const testProductId = "prod-apex-vrx1"; // Existing product in D1
  const addedItem = await addItemToCart(cart.id, testProductId, null, 2);
  console.log(" - Added cart item:", addedItem.id, "Qty:", addedItem.quantity, "Unit Price:", addedItem.unitPrice);

  if (!addedItem.id || addedItem.quantity !== 2) {
    console.error("❌ Failed to add item to cart with correct quantity.");
    process.exit(1);
  }
  console.log("✅ [Test 3] Passed: Item added to cart.\n");

  // 4. Test Cart Summary & Pricing Calculation
  console.log("[Test 4] Testing getCartWithItems summary calculations...");
  const summary = await getCartWithItems(cart.id);
  console.log(" - Summary Item Count:", summary.itemCount);
  console.log(" - Summary Subtotal:", summary.subtotal);
  console.log(" - Summary Shipping:", summary.shipping);
  console.log(" - Summary Total:", summary.total);

  if (summary.itemCount !== 2 || summary.subtotal <= 0) {
    console.error("❌ Invalid cart summary calculations:", summary);
    process.exit(1);
  }
  console.log("✅ [Test 4] Passed: Server-side totals calculated accurately.\n");

  // 5. Test Quantity Update
  console.log("[Test 5] Testing updateCartItemQuantity (increment to 5)...");
  await updateCartItemQuantity(cart.id, addedItem.id, 5);
  const updatedSummary = await getCartWithItems(cart.id);
  console.log(" - Updated Item Count:", updatedSummary.itemCount);
  if (updatedSummary.itemCount !== 5) {
    console.error("❌ Expected item count 5, got:", updatedSummary.itemCount);
    process.exit(1);
  }
  console.log("✅ [Test 5] Passed: Cart item quantity updated.\n");

  // 6. Test Item Removal
  console.log("[Test 6] Testing removeCartItem...");
  await removeCartItem(cart.id, addedItem.id);
  const emptySummary = await getCartWithItems(cart.id);
  console.log(" - Post-removal Item Count:", emptySummary.itemCount);
  if (emptySummary.itemCount !== 0) {
    console.error("❌ Item was not removed from cart.");
    process.exit(1);
  }
  console.log("✅ [Test 6] Passed: Cart item removed cleanly.\n");

  console.log("🎉 ALL STAGE 9 UNIT & INTEGRATION TESTS PASSED!");
}

runStage9Tests().catch((err) => {
  console.error("❌ Stage 9 test execution error:", err);
  process.exit(1);
});
