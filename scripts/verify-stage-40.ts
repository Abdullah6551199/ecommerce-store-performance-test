/**
 * Stage 40 Live Edge Verification Script: Product Q&A App
 */

const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";
const APPS_URL = process.env.APPS_URL || "https://nasrify-apps.zia291930.workers.dev";

interface TestRecord {
  name: string;
  url?: string;
  status?: number;
  expectedStatus?: number;
  passed: boolean;
  notes?: string;
}

const records: TestRecord[] = [];

async function timedFetch(
  url: string,
  init?: RequestInit,
  retries = 3
): Promise<{ res: Response; duration: number; text: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = performance.now();
      const res = await fetch(url, init);
      const text = await res.text();
      const duration = performance.now() - start;
      return { res, duration: Math.round(duration), text };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

function assertResult(test: TestRecord) {
  records.push(test);
  if (test.passed) {
    console.log(`  ✅ PASS [${test.status ?? "OK"}] ${test.name} ${test.notes ? `(${test.notes})` : ""}`);
  } else {
    console.error(
      `  ❌ FAIL [${test.status ?? "ERR"}, expected ${test.expectedStatus ?? "N/A"}] ${test.name} ${
        test.notes ? `(${test.notes})` : ""
      }`
    );
  }
}

async function main() {
  console.log("==================================================================");
  console.log("Stage 40 Live Verification: Product Q&A App Edge Lifecycle");
  console.log(`  Admin Worker:      ${ADMIN_URL}`);
  console.log(`  Storefront Worker:  ${STORE_URL}`);
  console.log(`  Apps Hub Worker:    ${APPS_URL}`);
  console.log("==================================================================\n");

  const sampleProductId = "prod-apex-vrx1";
  const sampleSlug = "apex-velocity-runner-x1";

  // 1. Admin Login
  console.log("--> Step 1: Admin Authentication");
  const loginRes = await timedFetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
  });

  const setCookie = loginRes.res.headers.get("set-cookie") || "";
  const sessionMatch = setCookie.match(/admin_session=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : "";
  const adminCookie = sessionToken ? `admin_session=${sessionToken}` : "";

  assertResult({
    name: "POST /api/admin/login (Admin Authentication)",
    url: `${ADMIN_URL}/api/admin/login`,
    status: loginRes.res.status,
    expectedStatus: 200,
    passed: loginRes.res.status === 200 && !!sessionToken,
    notes: `Duration: ${loginRes.duration}ms`,
  });

  if (!sessionToken) {
    console.error("FATAL: Admin authentication failed.");
    process.exit(1);
  }

  // 2. App Appears in /admin/apps
  console.log("\n--> Step 2: App Discovery in /admin/apps");
  const appsRes = await timedFetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: adminCookie },
  });
  let appsJson: any = {};
  try {
    appsJson = JSON.parse(appsRes.text);
  } catch {}

  const qaApp = Array.isArray(appsJson.data)
    ? appsJson.data.find((a: any) => a.id === "product-qa")
    : null;

  assertResult({
    name: "GET /api/admin/apps (Product Q&A appears in registry)",
    url: `${ADMIN_URL}/api/admin/apps`,
    status: appsRes.res.status,
    expectedStatus: 200,
    passed: appsRes.res.status === 200 && !!qaApp,
    notes: qaApp ? `Version: ${qaApp.version}, Installed: ${qaApp.installed}` : "Not found",
  });

  // 3. Install -> Enabled
  console.log("\n--> Step 3: Install & Enable App");
  if (!qaApp?.installed || !qaApp?.enabled) {
    const installRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ appId: "product-qa" }),
    });
    assertResult({
      name: "POST /api/admin/apps/install (Install Product Q&A)",
      url: `${ADMIN_URL}/api/admin/apps/install`,
      status: installRes.res.status,
      expectedStatus: 200,
      passed: installRes.res.status === 200,
      notes: `Duration: ${installRes.duration}ms`,
    });
  } else {
    assertResult({
      name: "Product Q&A Status (Already Installed & Enabled)",
      passed: true,
      notes: "Installed and enabled",
    });
  }

  // 4. Settings Form / Schema Verification
  console.log("\n--> Step 4: Settings Schema Verification");
  const settingsRes = await timedFetch(`${STORE_URL}/api/apps/product-qa/settings`);
  let settingsJson: any = {};
  try {
    settingsJson = JSON.parse(settingsRes.text);
  } catch {}

  assertResult({
    name: "GET /api/apps/product-qa/settings (Settings Schema & Storage)",
    url: `${STORE_URL}/api/apps/product-qa/settings`,
    status: settingsRes.res.status,
    expectedStatus: 200,
    passed: settingsRes.res.status === 200 && settingsJson.success && settingsJson.data,
    notes: settingsJson.data ? `RequireLogin: ${settingsJson.data.requireLogin}, MaxQuestions: ${settingsJson.data.maxQuestionsPerProduct}` : "",
  });

  // 5. Customer / Guest Posts Question
  console.log("\n--> Step 5: Customer / Guest Posts Question");
  const testQuestionText = `Will this item fit true to size? (Test-${Date.now()})`;
  const askRes = await timedFetch(`${STORE_URL}/api/product-qa/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: sampleProductId,
      question: testQuestionText,
      customerName: "Alex Shopper",
      customerEmail: "alex.shopper@example.com",
    }),
  });

  let askJson: any = {};
  try {
    askJson = JSON.parse(askRes.text);
  } catch {}

  const createdQuestionId = askJson.data?.id;

  assertResult({
    name: "POST /api/product-qa/ask (Guest asks question)",
    url: `${STORE_URL}/api/product-qa/ask`,
    status: askRes.res.status,
    expectedStatus: 200,
    passed: askRes.res.status === 200 && askJson.success && !!createdQuestionId,
    notes: `Question ID: ${createdQuestionId}, Status: ${askJson.data?.status}`,
  });

  // 6. Admin sees question in /admin/product-qa list
  console.log("\n--> Step 6: Admin Sees Question in List");
  const adminListRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/list`, {
    headers: { Cookie: adminCookie },
  });

  let adminListJson: any = {};
  try {
    adminListJson = JSON.parse(adminListRes.text);
  } catch {}

  const questionsList = Array.isArray(adminListJson.data)
    ? adminListJson.data
    : adminListJson.data?.questions || adminListJson.questions || [];
  const foundInAdmin = questionsList.find((q: any) => q.id === createdQuestionId);

  assertResult({
    name: "GET /api/admin/apps/product-qa/list (Admin discovers submitted question)",
    url: `${ADMIN_URL}/api/admin/apps/product-qa/list`,
    status: adminListRes.res.status,
    expectedStatus: 200,
    passed: adminListRes.res.status === 200 && !!foundInAdmin,
    notes: foundInAdmin ? `Found question in admin queue (status: ${foundInAdmin.status})` : "Not found in admin list",
  });

  // 7. Admin Answers Question
  console.log("\n--> Step 7: Admin Answers Question");
  const answerText = "Yes, this model fits true to size! If between sizes, choose half-size up.";
  const answerRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      questionId: createdQuestionId,
      answer: answerText,
      authorName: "Nasrify Team",
      authorType: "nasrify_team",
      isAccepted: true,
    }),
  });

  let answerJson: any = {};
  try {
    answerJson = JSON.parse(answerRes.text);
  } catch {}

  const createdAnswerId = answerJson.data?.id;

  assertResult({
    name: "POST /api/admin/apps/product-qa/answer (Admin posts official answer)",
    url: `${ADMIN_URL}/api/admin/apps/product-qa/answer`,
    status: answerRes.res.status,
    expectedStatus: 200,
    passed: (answerRes.res.status === 200 || answerRes.res.status === 201) && answerJson.success && !!createdAnswerId,
    notes: `Answer ID: ${createdAnswerId}`,
  });

  // Publish question so it displays on storefront
  await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ id: createdQuestionId, status: "published" }),
  });

  // 8. Storefront Shows Question and Answer
  console.log("\n--> Step 8: Storefront Questions & Answers Verification");
  const sfQuestionsRes = await timedFetch(`${STORE_URL}/api/product-qa/questions?productId=${sampleProductId}`);
  let sfQuestionsJson: any = {};
  try {
    sfQuestionsJson = JSON.parse(sfQuestionsRes.text);
  } catch {}

  const sfQ = sfQuestionsJson.data?.questions?.find((q: any) => q.id === createdQuestionId);
  const sfAns = sfQ?.answers?.find((a: any) => a.id === createdAnswerId);

  assertResult({
    name: "GET /api/product-qa/questions (Storefront renders published question & answers)",
    url: `${STORE_URL}/api/product-qa/questions`,
    status: sfQuestionsRes.res.status,
    expectedStatus: 200,
    passed: sfQuestionsRes.res.status === 200 && !!sfQ && !!sfAns,
    notes: sfAns ? `Answer by: ${sfAns.authorName}: "${sfAns.answer.slice(0, 30)}..."` : "Answer not found",
  });

  // 9. Customer Upvotes Question
  console.log("\n--> Step 9: Customer Upvotes Question");
  const upvoteQRes = await timedFetch(`${STORE_URL}/api/product-qa/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetType: "question",
      targetId: createdQuestionId,
      customerEmail: "voter1@example.com",
    }),
  });

  let upvoteQJson: any = {};
  try {
    upvoteQJson = JSON.parse(upvoteQRes.text);
  } catch {}

  assertResult({
    name: "POST /api/product-qa/upvote (Upvote Question)",
    url: `${STORE_URL}/api/product-qa/upvote`,
    status: upvoteQRes.res.status,
    expectedStatus: 200,
    passed: upvoteQRes.res.status === 200 && upvoteQJson.data?.upvoted === true && upvoteQJson.data?.upvoteCount >= 1,
    notes: `Upvoted: ${upvoteQJson.data?.upvoted}, Count: ${upvoteQJson.data?.upvoteCount}`,
  });

  // 10. Customer Upvotes Answer
  console.log("\n--> Step 10: Customer Upvotes Answer");
  const upvoteARes = await timedFetch(`${STORE_URL}/api/product-qa/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetType: "answer",
      targetId: createdAnswerId,
      customerEmail: "voter1@example.com",
    }),
  });

  let upvoteAJson: any = {};
  try {
    upvoteAJson = JSON.parse(upvoteARes.text);
  } catch {}

  assertResult({
    name: "POST /api/product-qa/upvote (Upvote Answer)",
    url: `${STORE_URL}/api/product-qa/upvote`,
    status: upvoteARes.res.status,
    expectedStatus: 200,
    passed: upvoteARes.res.status === 200 && upvoteAJson.data?.upvoted === true && upvoteAJson.data?.upvoteCount >= 1,
    notes: `Upvoted: ${upvoteAJson.data?.upvoted}, Count: ${upvoteAJson.data?.upvoteCount}`,
  });

  // 11. Pin Question -> appears at top
  console.log("\n--> Step 11: Pin Question");
  const pinRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ id: createdQuestionId, isPinned: true }),
  });

  assertResult({
    name: "POST /api/admin/apps/product-qa/update-status (Pin question to top)",
    url: `${ADMIN_URL}/api/admin/apps/product-qa/update-status`,
    status: pinRes.res.status,
    expectedStatus: 200,
    passed: pinRes.res.status === 200,
    notes: `Duration: ${pinRes.duration}ms`,
  });

  // 12. Hide Question -> Disappears from Storefront
  console.log("\n--> Step 12: Hide Question");
  const hideRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ id: createdQuestionId, status: "hidden" }),
  });

  const hiddenSfRes = await timedFetch(`${STORE_URL}/api/product-qa/questions?productId=${sampleProductId}`);
  let hiddenSfJson: any = {};
  try {
    hiddenSfJson = JSON.parse(hiddenSfRes.text);
  } catch {}

  const foundHidden = hiddenSfJson.data?.questions?.find((q: any) => q.id === createdQuestionId);

  assertResult({
    name: "Hide Question (Question disappears from storefront when hidden)",
    status: hideRes.res.status,
    expectedStatus: 200,
    passed: hideRes.res.status === 200 && !foundHidden,
    notes: !foundHidden ? "Question properly omitted from public query" : "Question still visible",
  });

  // Unhide Question for SEO test
  await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ id: createdQuestionId, status: "published" }),
  });

  // 13. Test requireLogin = true blocks guest questions
  console.log("\n--> Step 13: Test requireLogin setting constraint");
  // Set requireLogin: true
  const putRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ settings: { requireLogin: true } }),
  });

  // Short pause for edge D1 query propagation
  await new Promise((r) => setTimeout(r, 600));

  const blockedAskRes = await timedFetch(`${STORE_URL}/api/product-qa/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: sampleProductId,
      question: "Will this fail due to requireLogin?",
    }),
  });

  assertResult({
    name: "requireLogin=true Setting Enforcement (Guests blocked from asking)",
    url: `${STORE_URL}/api/product-qa/ask`,
    status: blockedAskRes.res.status,
    expectedStatus: 401,
    passed: blockedAskRes.res.status === 401,
    notes: `Status: ${blockedAskRes.res.status}`,
  });

  // Revert requireLogin back to false
  await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ settings: { requireLogin: false } }),
  });
  await new Promise((r) => setTimeout(r, 400));

  // 14. JSON-LD Schema Verification on Product Page
  console.log("\n--> Step 14: Storefront Product Page JSON-LD SEO Verification");
  const pageRes = await timedFetch(`${STORE_URL}/product/${sampleSlug}`);
  const hasJsonLd = pageRes.text.includes("application/ld+json");
  const hasQAPage = pageRes.text.includes('"@type":"QAPage"') || pageRes.text.includes('"@type": "QAPage"');
  const hasQuestionType = pageRes.text.includes('"@type":"Question"') || pageRes.text.includes('"@type": "Question"');

  assertResult({
    name: `GET /product/${sampleSlug} (JSON-LD Schema QAPage + Question)`,
    url: `${STORE_URL}/product/${sampleSlug}`,
    status: pageRes.res.status,
    expectedStatus: 200,
    passed: pageRes.res.status === 200 && hasJsonLd && (hasQAPage || hasQuestionType),
    notes: `Duration: ${pageRes.duration}ms, hasJsonLd: ${hasJsonLd}, hasQAPage: ${hasQAPage}, hasQuestionType: ${hasQuestionType}`,
  });

  // 15. Delete Question
  console.log("\n--> Step 15: Delete Question");
  const deleteRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ id: createdQuestionId }),
  });

  assertResult({
    name: "POST /api/admin/apps/product-qa/delete (Delete question and answers)",
    url: `${ADMIN_URL}/api/admin/apps/product-qa/delete`,
    status: deleteRes.res.status,
    expectedStatus: 200,
    passed: deleteRes.res.status === 200,
    notes: `Duration: ${deleteRes.duration}ms`,
  });

  // 16. Data Safety: Uninstall and Reinstall Test
  console.log("\n--> Step 16: Uninstall & Reinstall Data Safety");
  // First create a persistent question to test retention across uninstall/reinstall
  const safeQ = await timedFetch(`${STORE_URL}/api/product-qa/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: sampleProductId,
      question: "Will this question survive uninstall and reinstall? (DataSafety)",
      customerName: "Safety Tester",
      customerEmail: "safety@example.com",
    }),
  });
  const safeQJson = JSON.parse(safeQ.text || "{}");
  const safeQId = safeQJson.data?.id;

  // Publish safe question
  if (safeQId) {
    await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ id: safeQId, status: "published" }),
    });
  }

  // Uninstall App
  const uninstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "product-qa" }),
  });

  assertResult({
    name: "POST /api/admin/apps/uninstall (Uninstall App)",
    url: `${ADMIN_URL}/api/admin/apps/uninstall`,
    status: uninstallRes.res.status,
    expectedStatus: 200,
    passed: uninstallRes.res.status === 200,
    notes: `Duration: ${uninstallRes.duration}ms`,
  });

  // Verify storefront reflects uninstalled state
  const uninstalledSfRes = await timedFetch(`${STORE_URL}/api/product-qa/questions?productId=${sampleProductId}`);
  const uninstalledSfJson = JSON.parse(uninstalledSfRes.text || "{}");

  assertResult({
    name: "Storefront Gate on Uninstalled App (Returns disabled / empty)",
    url: `${STORE_URL}/api/product-qa/questions`,
    status: uninstalledSfRes.res.status,
    expectedStatus: 200,
    passed: uninstalledSfJson.disabled === true || uninstalledSfJson.data?.questions?.length === 0,
    notes: `Disabled: ${uninstalledSfJson.disabled}`,
  });

  // Reinstall App
  const reinstallRes = await timedFetch(`${ADMIN_URL}/api/admin/apps/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({ appId: "product-qa" }),
  });

  assertResult({
    name: "POST /api/admin/apps/install (Reinstall App)",
    url: `${ADMIN_URL}/api/admin/apps/install`,
    status: reinstallRes.res.status,
    expectedStatus: 200,
    passed: reinstallRes.res.status === 200,
    notes: `Duration: ${reinstallRes.duration}ms`,
  });

  // Verify safe question is fully restored
  const reinstalledSfRes = await timedFetch(`${STORE_URL}/api/product-qa/questions?productId=${sampleProductId}`);
  const reinstalledSfJson = JSON.parse(reinstalledSfRes.text || "{}");
  const restoredQ = reinstalledSfJson.data?.questions?.find((q: any) => q.id === safeQId);

  assertResult({
    name: "Data Safety: Tables and records preserved after uninstall/reinstall",
    url: `${STORE_URL}/api/product-qa/questions`,
    status: reinstalledSfRes.res.status,
    expectedStatus: 200,
    passed: !!restoredQ,
    notes: restoredQ ? `Preserved question "${restoredQ.question.slice(0, 35)}..."` : "Question lost",
  });

  // Cleanup safe question
  if (safeQId) {
    await timedFetch(`${ADMIN_URL}/api/admin/apps/product-qa/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({ id: safeQId }),
    });
  }

  // Summary
  console.log("\n==================================================================");
  console.log("Stage 40 Verification Summary");
  console.log("==================================================================");
  const total = records.length;
  const passed = records.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Total Checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed > 0) {
    console.error(`\n❌ VERIFICATION FAILED: ${failed} checks failed.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL ${total} CHECKS PASSED LIVE ON EDGE!`);
  }
}

main().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
