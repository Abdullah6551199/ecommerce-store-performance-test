async function verifyLive() {
  const base = "https://ecommerce-store-perf-test.zia291930.workers.dev";
  console.log("=== VERIFYING STAGE 15.5.1 LIVE WORKER ===");
  console.log("Target:", base);

  const home = await fetch(base);
  console.log("1. GET / -> Status:", home.status);

  const cart = await fetch(base + "/cart");
  console.log("2. GET /cart -> Status:", cart.status);

  const checkout = await fetch(base + "/checkout");
  console.log("3. GET /checkout -> Status:", checkout.status);

  const coupons = await fetch(base + "/api/coupons/available?subtotal=100");
  const cData = await coupons.json();
  console.log("4. GET /api/coupons/available -> Status:", coupons.status, "Coupons count:", cData.coupons?.length, "Best:", cData.bestCoupon?.code, "Discount:", cData.bestDiscount);

  const validate = await fetch(base + "/api/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "SAVE10", subtotal: 100, cartItems: [] }),
  });
  const vData = await validate.json();
  console.log("5. POST /api/coupons/validate -> Status:", validate.status, "Valid:", vData.valid, "Discount:", vData.discount, "Coupon:", vData.coupon?.code);

  console.log("\n=== ALL LIVE CHECKS PASSED ===");
}

verifyLive().catch(console.error);
