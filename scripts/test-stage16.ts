/**
 * Stage 16 Automated Test Suite
 * Validates:
 * 1. D1 Database schema for reviews, review_images, review_helpful, orders.has_review
 * 2. Verified purchase detection logic
 * 3. Review submission, moderation, voting, and analytics
 * 4. Schema.org JSON-LD aggregateRating & review integration
 * 5. Cart Drawer Bounce Fix v3 (React Portal + contain: layout style paint + CSS-only transform)
 * 6. Cart Page Coupon Card Size Fix (min-h-[80px], p-4, 2 clear rows with all details)
 * 7. Stage 15.5.1 Documentation completeness
 */

import fs from "fs";
import path from "path";
import {
  createReview,
  getProductReviews,
  getProductRatingSummary,
  voteReviewHelpful,
  adminGetReviewStats,
  adminListReviews,
  adminUpdateReview,
  adminDeleteReview,
  adminBulkReviewAction,
  getReviewSettings,
  updateReviewSettings,
  checkVerifiedPurchase,
} from "../lib/reviews";
import { generateProductJsonLd } from "../lib/seo";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASSED: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAILED: ${testName}`);
    throw new Error(`Assertion failed: ${testName}`);
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("Stage 16: Reviews & Ratings + Drawer Bounce Fix v3 + Coupon Card Size Fix Tests");
  console.log("================================================================================\n");

  // TEST SUITE 1: Review System Core Functionality
  console.log("--- 1. Review Submission, Moderation & Voting ---");
  const testProductId = "prod_stage16_test";
  const testEmail = "runner.tester@example.com";

  // 1.1 Check Review Settings
  const initialSettings = await getReviewSettings();
  assert(initialSettings !== null && typeof initialSettings.autoApprove === "boolean", "getReviewSettings returns valid settings");

  // 1.2 Create Review
  const newReview = await createReview({
    productId: testProductId,
    customerName: "Stage16 Tester",
    customerEmail: testEmail,
    rating: 5,
    title: "Unbelievable Performance",
    content: "Outstanding comfort and energy return. Best running shoes I have owned.",
    images: ["https://example.com/test-shoe-1.jpg"],
  });

  assert(newReview.review.rating === 5, "Review created with 5-star rating");
  assert(newReview.review.customerName === "Stage16 Tester", "Review customer name preserved");
  assert(newReview.review.status === "pending" || newReview.review.status === "approved", "Review assigned initial status");

  const reviewId = newReview.review.id;

  // 1.3 Approve Review via Admin
  const approvedReview = await adminUpdateReview(reviewId, {
    status: "approved",
    adminReply: "Thank you for the wonderful feedback! Happy running!",
  });
  assert(approvedReview !== null && approvedReview.status === "approved", "adminUpdateReview approves review");
  assert(approvedReview?.adminReply !== null && approvedReview?.adminReply?.includes("Happy running"), "adminUpdateReview sets store owner reply");

  // 1.4 Helpful Voting
  const vote1 = await voteReviewHelpful(reviewId, "192.168.1.100", "helpful");
  assert(vote1.helpfulCount >= 1, "voteReviewHelpful increments helpful count");

  // Duplicate vote from same IP should not double count
  const voteDuplicate = await voteReviewHelpful(reviewId, "192.168.1.100", "helpful");
  assert(voteDuplicate.helpfulCount === vote1.helpfulCount, "Duplicate vote from same IP does not increment count");

  // 1.5 Product Rating Summary
  const summary = await getProductRatingSummary(testProductId);
  assert(summary.totalReviews >= 1, "getProductRatingSummary counts approved review");
  assert(summary.averageRating >= 4.0, "getProductRatingSummary computes average rating");
  assert(summary.breakdown.length === 5, "getProductRatingSummary returns 5-star breakdown");

  // 1.6 Product Reviews Retrieval
  const { reviews: fetchedReviews, total } = await getProductReviews(testProductId, {
    status: "approved",
  });
  assert(total >= 1, "getProductReviews returns total count");
  assert(fetchedReviews.some((r) => r.id === reviewId), "getProductReviews includes approved review");

  // 1.7 Admin Review Statistics
  const stats = await adminGetReviewStats();
  assert(stats.total >= 1 && stats.approved >= 1, "adminGetReviewStats aggregates review counts");

  // 1.8 Admin Bulk Action & Deletion
  const bulkResult = await adminBulkReviewAction([reviewId], "approve");
  assert(bulkResult.success && bulkResult.affectedCount === 1, "adminBulkReviewAction approves reviews");

  const deleted = await adminDeleteReview(reviewId);
  assert(deleted === true, "adminDeleteReview deletes test review");

  // TEST SUITE 2: Verified Purchase Logic
  console.log("\n--- 2. Verified Purchase Detection ---");
  const verifiedCheckEmpty = await checkVerifiedPurchase("nonexistent@example.com", "any_prod");
  assert(verifiedCheckEmpty.isVerified === false, "checkVerifiedPurchase returns false for non-purchaser");

  // TEST SUITE 3: Schema.org JSON-LD AggregateRating & Review
  console.log("\n--- 3. Schema.org JSON-LD Structured Data ---");
  const mockProduct: any = {
    id: "prod_seo_1",
    name: "Apex HyperSpeed Shoe",
    slug: "apex-hyperspeed-shoe",
    sku: "APX-HS-01",
    price: 150.0,
    salePrice: 129.99,
    mainImage: "/images/shoe.jpg",
    images: [],
    stockStatus: "in_stock",
    stockQuantity: 25,
    trackInventory: true,
    allowBackorders: false,
    brand: "Apex Store",
  };

  const mockRatingSummary = {
    averageRating: 4.8,
    totalReviews: 42,
    breakdown: [],
  };

  const mockReviewList = [
    {
      customerName: "Ahmed Khan",
      rating: 5,
      content: "Excellent product!",
      createdAt: "2026-09-10T10:00:00Z",
    },
  ];

  const jsonLd = generateProductJsonLd(mockProduct, mockRatingSummary, mockReviewList);
  assert(jsonLd["@type"] === "Product", "JSON-LD @type is Product");
  assert(jsonLd.aggregateRating?.["@type"] === "AggregateRating", "JSON-LD includes AggregateRating");
  assert(jsonLd.aggregateRating?.ratingValue === "4.8", "JSON-LD ratingValue matches summary");
  assert(jsonLd.aggregateRating?.reviewCount === "42", "JSON-LD reviewCount matches summary");
  assert(Array.isArray(jsonLd.review) && jsonLd.review.length === 1, "JSON-LD includes review array");
  assert(jsonLd.review[0].author?.name === "Ahmed Khan", "JSON-LD review author name preserved");
  assert(jsonLd.review[0].reviewRating?.ratingValue === "5", "JSON-LD reviewRating matches");

  // TEST SUITE 4: Cart Drawer Bounce Fix v3 (CSS Portal + Containment)
  console.log("\n--- 4. Drawer Bounce Fix v3 (Portal + CSS Containment) ---");
  const globalsCss = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf-8");
  assert(globalsCss.includes(".cart-drawer-panel"), "app/globals.css defines .cart-drawer-panel");
  assert(globalsCss.includes("contain: layout style paint;"), "app/globals.css contains 'contain: layout style paint' isolation");
  assert(globalsCss.includes("transform: translateX(100%);"), "app/globals.css contains base closed transform: translateX(100%)");
  assert(globalsCss.includes("transform: translateX(0);"), "app/globals.css contains open transform: translateX(0)");

  const cartDrawerTsx = fs.readFileSync(path.join(process.cwd(), "components/CartDrawer.tsx"), "utf-8");
  assert(cartDrawerTsx.includes("createPortal"), "components/CartDrawer.tsx imports and uses createPortal");
  assert(cartDrawerTsx.includes("document.body"), "components/CartDrawer.tsx renders directly into document.body");
  assert(cartDrawerTsx.includes("cart-drawer-panel"), "components/CartDrawer.tsx applies cart-drawer-panel CSS class");
  assert(!cartDrawerTsx.includes("transition-transform"), "components/CartDrawer.tsx has zero Tailwind transition classes on panel");

  // TEST SUITE 5: Coupon Card Size Fix on Cart Page
  console.log("\n--- 5. Coupon Card Size Fix (/cart Page) ---");
  const couponsSectionTsx = fs.readFileSync(path.join(process.cwd(), "components/CouponsSection.tsx"), "utf-8");
  assert(couponsSectionTsx.includes("renderFullCard"), "components/CouponsSection.tsx defines renderFullCard");
  assert(couponsSectionTsx.includes("min-h-[80px]"), "renderFullCard sets min-h-[80px]");
  assert(couponsSectionTsx.includes("p-4"), "renderFullCard sets p-4 padding");
  assert(couponsSectionTsx.includes("renderApplyBestButton"), "CouponsSection provides Apply Best Coupon button");
  assert(couponsSectionTsx.includes("compact = false"), "CouponsSection supports compact and full view modes");

  // TEST SUITE 6: Stage 15.5.1 Documentation
  console.log("\n--- 6. Stage 15.5.1 Documentation ---");
  const docPath = path.join(process.cwd(), "docs/stages/stage-15.5.1.md");
  assert(fs.existsSync(docPath), "docs/stages/stage-15.5.1.md exists");
  const docContent = fs.readFileSync(docPath, "utf-8");
  assert(docContent.includes("Stage 15.5.1"), "Documentation has Stage 15.5.1 header");
  assert(docContent.includes("Slider Bounce Fix"), "Documentation details Slider Bounce Fix");
  assert(docContent.includes("Compact Product Cards"), "Documentation details Compact Product Cards");
  assert(docContent.includes("Simplified Drawer Coupon UI"), "Documentation details Simplified Drawer Coupon UI");
  assert(docContent.includes("Files Changed"), "Documentation lists Files Changed");
  assert(docContent.includes("Test & Verification Results"), "Documentation includes Test Results table");

  console.log("\n================================================================================");
  console.log(`ALL TESTS COMPLETED: ${passedTests}/${totalTests} PASSED (100% SUCCESS RATE)`);
  console.log("================================================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
