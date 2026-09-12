async function verifyStage16Live() {
  const base = "https://ecommerce-store-perf-test.zia291930.workers.dev";
  console.log("=== VERIFYING STAGE 16 LIVE WORKER ===");
  console.log("Target:", base);

  // 1. Check Product Rating API
  const ratingRes = await fetch(`${base}/api/products/prod_1/rating`);
  console.log("1. GET /api/products/prod_1/rating -> Status:", ratingRes.status);
  const ratingJson = await ratingRes.json();
  console.log("   Rating summary:", ratingJson.data);

  // 2. Check Product Reviews API
  const reviewsRes = await fetch(`${base}/api/products/prod_1/reviews`);
  console.log("2. GET /api/products/prod_1/reviews -> Status:", reviewsRes.status);
  const reviewsJson = await reviewsRes.json();
  console.log("   Reviews count:", reviewsJson.data?.total);

  // 3. Check Cart Page
  const cartRes = await fetch(`${base}/cart`);
  console.log("3. GET /cart -> Status:", cartRes.status);

  // 4. Check Product Page
  const productRes = await fetch(`${base}/product/apex-flow-running-shoe`);
  console.log("4. GET /product/apex-flow-running-shoe -> Status:", productRes.status);
  const html = await productRes.text();
  console.log("   Contains aggregateRating:", html.includes("aggregateRating"));
  console.log("   Contains Customer Reviews:", html.includes("Customer Reviews"));

  // 5. Check Admin Reviews Page
  const adminRes = await fetch(`${base}/admin/reviews`);
  console.log("5. GET /admin/reviews -> Status:", adminRes.status);

  console.log("\n=== LIVE VERIFICATION FINISHED ===");
}

verifyStage16Live().catch(console.error);
