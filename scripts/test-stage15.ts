import { NextRequest } from "next/server";
import { GET as getPageHandler } from "../app/api/pages/[slug]/route";
import { GET as getFaqsHandler } from "../app/api/faqs/route";
import { POST as postContactHandler } from "../app/api/contact/route";
import { GET as getAdminPagesHandler } from "../app/api/admin/pages/route";
import { GET as getAdminFaqsHandler } from "../app/api/admin/faqs/route";
import { GET as getCategoryProductsHandler } from "../app/api/admin/categories/[id]/products/route";
import { POST as postCategoryProductsBulkHandler } from "../app/api/admin/categories/[id]/products/bulk/route";
import { getPageBySlug, DEFAULT_PAGE_TEMPLATES } from "../lib/cms";
import sitemap from "../app/sitemap";

async function runStage15Tests() {
  console.log("=================================================");
  console.log("  Stage 15: Separate Pages + CMS + Category Admin");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
      throw new Error(`Assertion failed: ${desc}`);
    }
  }

  // 1. Test Public API: GET /api/pages/[slug]
  console.log("--- 1. Testing Public Page Route (/api/pages/about) ---");
  const pageReq = new NextRequest("http://localhost:3000/api/pages/about");
  const pageRes = await getPageHandler(pageReq, { params: Promise.resolve({ slug: "about" }) });
  assert(pageRes.status === 200, "GET /api/pages/about returned status 200");
  const pageData = (await pageRes.json()) as any;
  assert(pageData.success === true, "Response reports success = true");
  assert(Boolean(pageData.data?.page?.title), "Page has title: " + pageData.data?.page?.title);
  assert(Boolean(pageData.data?.page?.content), "Page contains rich HTML content");

  // 2. Test Public API: GET /api/faqs
  console.log("\n--- 2. Testing Public FAQs Route (/api/faqs) ---");
  const faqsReq = new NextRequest("http://localhost:3000/api/faqs");
  const faqsRes = await getFaqsHandler(faqsReq);
  assert(faqsRes.status === 200, "GET /api/faqs returned status 200");
  const faqsData = (await faqsRes.json()) as any;
  assert(faqsData.success === true, "Response reports success = true");
  assert(Array.isArray(faqsData.data?.faqs), "Returns array of FAQs");
  assert(faqsData.data.faqs.length > 0, `Loaded ${faqsData.data.faqs.length} active FAQs`);

  // 3. Test Public API: POST /api/contact
  console.log("\n--- 3. Testing Public Contact Form Submission (/api/contact) ---");
  const contactReq = new NextRequest("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Stage 15 Automated Test Runner",
      email: "test-runner@apexstore.com",
      subject: "Automated Verification Check",
      message: "Testing contact message persistence in Cloudflare D1.",
    }),
  });
  const contactRes = await postContactHandler(contactReq);
  assert(contactRes.status === 200, "POST /api/contact returned status 200");
  const contactData = (await contactRes.json()) as any;
  assert(contactData.success === true, "Response reports success = true");
  assert(Boolean(contactData.data?.id), "Contact message persisted with ID: " + contactData.data?.id);

  // 4. Test Admin Route Security: 401 Without Session
  console.log("\n--- 4. Testing Admin Route Authentication Protection ---");
  const adminPagesReq = new NextRequest("http://localhost:3000/api/admin/pages");
  const adminPagesRes = await getAdminPagesHandler(adminPagesReq);
  assert(adminPagesRes.status === 401, "GET /api/admin/pages returns 401 Unauthorized without session");

  const adminFaqsReq = new NextRequest("http://localhost:3000/api/admin/faqs");
  const adminFaqsRes = await getAdminFaqsHandler(adminFaqsReq);
  assert(adminFaqsRes.status === 401, "GET /api/admin/faqs returns 401 Unauthorized without session");

  const catProdsReq = new NextRequest("http://localhost:3000/api/admin/categories/shoes/products");
  const catProdsRes = await getCategoryProductsHandler(catProdsReq, { params: Promise.resolve({ id: "shoes" }) });
  assert(catProdsRes.status === 401, "GET /api/admin/categories/[id]/products returns 401 Unauthorized without session");

  const bulkProdsReq = new NextRequest("http://localhost:3000/api/admin/categories/shoes/products/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "publish", productIds: ["prod-1"] }),
  });
  const bulkProdsRes = await postCategoryProductsBulkHandler(bulkProdsReq, { params: Promise.resolve({ id: "shoes" }) });
  assert(bulkProdsRes.status === 401, "POST /api/admin/categories/[id]/products/bulk returns 401 Unauthorized without session");

  // 5. Test Default Page Fallback Templates
  console.log("\n--- 5. Testing CMS Default Templates & Fallbacks ---");
  const privacy = await getPageBySlug("privacy-policy");
  assert(Boolean(privacy?.title), "Privacy policy loaded: " + privacy?.title);

  const terms = await getPageBySlug("terms");
  assert(Boolean(terms?.title), "Terms loaded: " + terms?.title);

  const returns = await getPageBySlug("returns");
  assert(Boolean(returns?.title), "Returns policy loaded: " + returns?.title);

  const shipping = await getPageBySlug("shipping");
  assert(Boolean(shipping?.title), "Shipping policy loaded: " + shipping?.title);

  // 6. Test Sitemap Generation
  console.log("\n--- 6. Testing Dynamic Sitemap Routes ---");
  const sitemapEntries = await sitemap();
  const urls = sitemapEntries.map((e) => e.url);
  assert(urls.some((u) => u.endsWith("/shop")), "Sitemap contains /shop");
  assert(urls.some((u) => u.endsWith("/about")), "Sitemap contains /about");
  assert(urls.some((u) => u.endsWith("/contact")), "Sitemap contains /contact");
  assert(urls.some((u) => u.endsWith("/faq")), "Sitemap contains /faq");
  assert(urls.some((u) => u.endsWith("/privacy-policy")), "Sitemap contains /privacy-policy");
  assert(urls.some((u) => u.endsWith("/terms")), "Sitemap contains /terms");
  assert(urls.some((u) => u.endsWith("/returns")), "Sitemap contains /returns");
  assert(urls.some((u) => u.endsWith("/shipping")), "Sitemap contains /shipping");

  console.log(`\n=================================================`);
  console.log(`  All Stage 15 Tests Passed! (${passed}/${total})`);
  console.log(`=================================================\n`);
}

runStage15Tests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
