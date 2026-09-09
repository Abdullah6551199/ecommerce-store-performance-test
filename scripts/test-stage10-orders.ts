import {
  createOrderSchema,
  updateOrderStatusSchema,
  createOrderFromCart,
  getStorefrontOrder,
  getAllAdminOrders,
  updateAdminOrderStatus,
} from "../lib/orders";
import { addItemToCart, getCartWithItems } from "../lib/cart";

async function runStage10Tests() {
  console.log("=========================================");
  console.log("   STAGE 10: ORDERS & CHECKOUT TEST SUITE");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details ? "- " + details : ""}`);
      failed++;
    }
  }

  // TEST 1: Order Validation Schema
  console.log("--- Test 1: Zod Validation Schemas ---");
  const validData = {
    customerName: "Abdullah Tariq",
    phone: "+1 555-0199",
    email: "abdullah@example.com",
    address: "450 Industrial Parkway, Suite 12",
    city: "San Francisco",
    notes: "Please ring the bell on delivery",
    paymentMethod: "cod" as const,
  };

  const parseSuccess = createOrderSchema.safeParse(validData);
  assert("Valid customer order payload parses successfully", parseSuccess.success);

  const invalidPhone = { ...validData, phone: "123" };
  const parsePhoneFail = createOrderSchema.safeParse(invalidPhone);
  assert("Short/invalid phone number is rejected", !parsePhoneFail.success);

  const missingAddress = { ...validData, address: "Hi" };
  const parseAddressFail = createOrderSchema.safeParse(missingAddress);
  assert("Short address is rejected", !parseAddressFail.success);

  // Status schema test
  const validStatus = updateOrderStatusSchema.safeParse({ status: "shipped" });
  assert("Valid order status parses successfully", validStatus.success);

  const invalidStatus = updateOrderStatusSchema.safeParse({ status: "flying_drone" });
  assert("Invalid status enum is rejected", !invalidStatus.success);

  // TEST 2: Cart to Order Creation Flow
  console.log("\n--- Test 2: Cart to Order Creation & Price Integrity ---");
  const testSessionId = `test-stage10-session-${Date.now()}`;

  // Add items to cart
  await addItemToCart(testSessionId, "prod_synthetic_1", null, 2);
  const cartBefore = await getCartWithItems(testSessionId);
  assert("Cart contains items before checkout", cartBefore.itemCount > 0);

  // Place order
  const createdOrder = await createOrderFromCart(validData, testSessionId);
  assert("Order successfully created", !!createdOrder && !!createdOrder.id);
  assert("Order has correct customer name", createdOrder.customerName === "Abdullah Tariq");
  assert("Order status is 'pending'", createdOrder.status === "pending");
  assert("Order payment method is 'cod'", createdOrder.paymentMethod === "cod");
  assert("Order items were populated", createdOrder.items.length > 0);
  assert("Order total is positive number", createdOrder.total > 0);

  // Verify Cart is cleared
  const cartAfter = await getCartWithItems(testSessionId);
  assert("Cart is cleared/converted after successful order", cartAfter.items.length === 0);

  // TEST 3: Order Retrieval
  console.log("\n--- Test 3: Storefront & Admin Order Retrieval ---");
  const fetchedOrder = await getStorefrontOrder(createdOrder.id);
  assert("Storefront can retrieve order by ID", !!fetchedOrder && fetchedOrder.id === createdOrder.id);
  assert("Retrieved order contains line items", (fetchedOrder?.items.length || 0) > 0);

  // TEST 4: Admin Orders Listing and Filtering
  console.log("\n--- Test 4: Admin Orders Listing & Filtering ---");
  const allOrders = await getAllAdminOrders();
  assert("Admin list returns orders", allOrders.orders.length > 0);

  const pendingOrders = await getAllAdminOrders({ status: "pending" });
  assert(
    "Status filter returns pending orders",
    pendingOrders.orders.every((o) => o.status === "pending")
  );

  const searchOrders = await getAllAdminOrders({ search: "Abdullah" });
  assert("Search by customer name works", searchOrders.orders.length > 0);

  // TEST 5: Status Updating
  console.log("\n--- Test 5: Status Transition Mutation ---");
  const updatedOrder = await updateAdminOrderStatus(createdOrder.id, "confirmed");
  assert("Order status transitioned to 'confirmed'", updatedOrder.status === "confirmed");

  const shippedOrder = await updateAdminOrderStatus(createdOrder.id, "shipped");
  assert("Order status transitioned to 'shipped'", shippedOrder.status === "shipped");

  console.log("\n=========================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStage10Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
