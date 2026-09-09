import { categorySchema, createCategory, updateCategory, getCategoryById, deleteCategory } from "../lib/categories";
import { getOrCreateCart, addItemToCart, getCartWithItems } from "../lib/cart";
import { createOrderFromCart as placeOrder } from "../lib/orders";
import { getDb, products } from "../lib/db";
import { searchProductsAdvanced, createProduct, deleteProduct } from "../lib/products";
import { checkRateLimit, recordLoginAttempt, clearFailedAttempts } from "../lib/auth";
import { eq } from "drizzle-orm";

async function runStage14Tests() {
  console.log("=== STARTING STAGE 14: PRODUCTION & CATEGORY VALIDATION TESTS ===\n");
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedCount++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Category Image Validation (Relative Paths, Full URLs, Empty/Null)
  // --------------------------------------------------------------------------
  console.log("[Test 1] Testing Category Image Validation Schema...");

  // 1a. Relative /api/media/... path
  const relativePayload = {
    name: "Streetwear & Hoodies",
    slug: "streetwear-hoodies-test-" + Date.now(),
    imageUrl: "/api/media/categories/streetwear-banner.png",
    status: "active" as const,
  };
  const parseRelative = categorySchema.safeParse(relativePayload);
  assert(parseRelative.success, "categorySchema accepts relative path /api/media/categories/...");

  // 1b. Full https URL
  const absolutePayload = {
    name: "Luxury Accessories",
    slug: "luxury-accessories-test-" + Date.now(),
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    status: "active" as const,
  };
  const parseAbsolute = categorySchema.safeParse(absolutePayload);
  assert(parseAbsolute.success, "categorySchema accepts full HTTPS URL");

  // 1c. Null or empty string image URL
  const emptyPayload = {
    name: "Minimalist Essentials",
    slug: "minimalist-essentials-test-" + Date.now(),
    imageUrl: "",
    status: "active" as const,
  };
  const parseEmpty = categorySchema.safeParse(emptyPayload);
  assert(parseEmpty.success, "categorySchema accepts empty string imageUrl");

  // 1d. Invalid non-URL string (not starting with / and not valid URL)
  const invalidPayload = {
    name: "Invalid Image Category",
    slug: "invalid-image-cat-" + Date.now(),
    imageUrl: "not-a-valid-url-or-path",
    status: "active" as const,
  };
  const parseInvalid = categorySchema.safeParse(invalidPayload);
  assert(!parseInvalid.success, "categorySchema rejects invalid image strings");

  // 1e. Create category in database with relative image URL
  const createdCategory = await createCategory({
    name: "Stage 14 Test Category",
    slug: "stage14-test-cat-" + Date.now(),
    imageUrl: "/api/media/categories/test-badge.png",
    description: "Automated test category with uploaded R2 relative path",
    status: "active",
    sortOrder: 1,
  });
  assert(
    Boolean(createdCategory && createdCategory.imageUrl === "/api/media/categories/test-badge.png"),
    `Category created with relative R2 path: ${createdCategory.imageUrl}`
  );

  // 1f. Update category with a new relative image URL
  const updatedCategory = await updateCategory(createdCategory.id, {
    imageUrl: "/api/media/categories/updated-banner.webp",
    name: "Stage 14 Test Category (Updated)",
  });
  assert(
    Boolean(updatedCategory && updatedCategory.imageUrl === "/api/media/categories/updated-banner.webp"),
    `Category updated with new relative R2 path: ${updatedCategory?.imageUrl}`
  );

  // Clean up created test category
  await deleteCategory(createdCategory.id);
  console.log("  ✓ Cleaned up test category\n");

  // --------------------------------------------------------------------------
  // TEST 2: Multi-Facet Search & Discovery
  // --------------------------------------------------------------------------
  console.log("[Test 2] Testing Search Engine & Faceting...");
  const searchResult = await searchProductsAdvanced({
    limit: 10,
    sort: "price_asc",
  });
  assert(searchResult.products !== undefined, "Search returns product list");
  assert(Array.isArray(searchResult.facets.brands), "Search returns brand facets");
  assert(Array.isArray(searchResult.facets.categories), "Search returns category facets");
  assert(typeof searchResult.facets.priceRange.min === "number", "Search returns min price bound");
  assert(typeof searchResult.facets.priceRange.max === "number", "Search returns max price bound");
  console.log(`  ✓ Search returned ${searchResult.total} products with full facet metadata\n`);

  // --------------------------------------------------------------------------
  // TEST 3: Cart Session, Inventory Decrement & Order Flow
  // --------------------------------------------------------------------------
  console.log("[Test 3] Testing Cart Session & Checkout Order Placement...");
  // Create a temporary product for end-to-end checkout test
  const testProduct = await createProduct({
    name: "Stage 14 Runner Pro",
    slug: "stage14-runner-pro-" + Date.now(),
    sku: "S14-" + Math.floor(1000 + Math.random() * 9000),
    price: 120,
    stockQuantity: 15,
    status: "published",
    mainImage: "/api/media/products/runner.png",
  });
  assert(Boolean(testProduct?.id), `Created test product: ${testProduct.name} (Stock: 15)`);

  const guestSessionId = "stage14-session-" + Date.now();
  const cart = await getOrCreateCart(guestSessionId);
  assert(Boolean(cart?.id), `Created guest cart: id=${cart.id}, sessionId=${cart.sessionId}`);

  // Add 3 units of testProduct to cart
  await addItemToCart(cart.id, testProduct.id, null, 3);
  const cartWithItems = await getCartWithItems(guestSessionId);
  assert(cartWithItems.itemCount === 3, `Cart retrieved by guestSessionId has ${cartWithItems.itemCount} items`);
  assert(cartWithItems.subtotal === 360, `Cart subtotal correctly computed: $${cartWithItems.subtotal}`);

  // Place order from cart
  const order = await placeOrder(
    {
      customerName: "Stage 14 Test Buyer",
      phone: "+15559876543",
      email: "stage14@example.com",
      address: "456 Market St",
      city: "San Francisco",
      paymentMethod: "cod",
    },
    guestSessionId
  );
  assert(Boolean(order?.id), `Order successfully placed: Order ID=${order.id}`);
  assert(order.total === 360, `Authoritative order total matches: $${order.total}`);

  // Verify atomic stock decrement (15 - 3 = 12)
  const db = getDb();
  if (db) {
    const updatedProd = await db.select().from(products).where(eq(products.id, testProduct.id)).limit(1);
    assert(updatedProd[0]?.stockQuantity === 12, `Atomic inventory decremented to ${updatedProd[0]?.stockQuantity} (expected 12)`);
  }

  // Verify cart items cleared post-order
  const postOrderCart = await getCartWithItems(guestSessionId);
  assert(postOrderCart.itemCount === 0, "Cart items cleared after order placement");

  // Clean up test product
  await deleteProduct(testProduct.id);
  console.log("  ✓ Cleaned up test product\n");

  // --------------------------------------------------------------------------
  // TEST 4: Admin Authentication & Rate Limiting
  // --------------------------------------------------------------------------
  console.log("[Test 4] Testing Admin Login Rate Limiting & Lockout...");
  const testEmail = "stage14-ratelimit@example.com";
  await clearFailedAttempts(testEmail);

  // 2 failed attempts -> not locked
  await recordLoginAttempt(testEmail, false);
  await recordLoginAttempt(testEmail, false);
  const check2 = await checkRateLimit(testEmail);
  assert(!check2.locked, "Not locked out after 2 failed attempts");

  // 3rd failed attempt -> locked for 300 seconds
  await recordLoginAttempt(testEmail, false);
  const check3 = await checkRateLimit(testEmail);
  assert(check3.locked, "Locked out after 3 failed attempts");
  assert(
    typeof check3.remainingSeconds === "number" && check3.remainingSeconds > 0 && check3.remainingSeconds <= 300,
    `Lockout remaining seconds: ${check3.remainingSeconds}s`
  );

  // Clear lockout
  await clearFailedAttempts(testEmail);
  const checkCleared = await checkRateLimit(testEmail);
  assert(!checkCleared.locked, "Lockout cleared successfully\n");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log(`=== ALL STAGE 14 AUTOMATED TESTS PASSED (${passedCount} passed, ${failedCount} failed) ===\n`);
}

runStage14Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
