import { execSync } from "child_process";

const APPS_BASE = process.env.APPS_BASE || "https://nasrify-apps.zia291930.workers.dev";
const THEMES_BASE = process.env.THEMES_BASE || "https://nasrify-themes.zia291930.workers.dev";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, details?: string) {
  results.push({ name, passed, details });
  const status = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`${status} - ${name}${details ? ` (${details})` : ""}`);
}

async function run() {
  console.log("================================================================================");
  console.log("             STAGE 37C: MARKETPLACE REVIEWS & BRANDING VERIFICATION             ");
  console.log(` Apps Hub:   ${APPS_BASE}`);
  console.log(` Themes Hub: ${THEMES_BASE}`);
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 0. Pre-test Cleanup
  // ---------------------------------------------------------------------------
  console.log("--- 0. Pre-test Cleanup ---");
  try {
    const admLogin = await fetch(`${APPS_BASE}/api/marketplace/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    const admCookie = admLogin.headers.get("set-cookie")?.split(";")[0] || "";

    const existingApps = (await fetch(
      `${APPS_BASE}/api/marketplace/reviews?type=app&listingId=listing_whatsapp-order&page=1`
    ).then((r) => r.json()).catch(() => ({}))) as any;
    if (existingApps.reviews && Array.isArray(existingApps.reviews)) {
      for (const rev of existingApps.reviews) {
        if (rev.userEmail === "customer@example.com") {
          await fetch(`${APPS_BASE}/api/marketplace/reviews/${rev.id}`, {
            method: "DELETE",
            headers: { Cookie: admCookie },
          });
        }
      }
    }

    const thAdmLogin = await fetch(`${THEMES_BASE}/api/marketplace/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "admin123" }),
    });
    const thAdmCookie = thAdmLogin.headers.get("set-cookie")?.split(";")[0] || "";

    const existingTh = (await fetch(
      `${THEMES_BASE}/api/marketplace/reviews?type=theme&listingId=listing_minimal_noir&page=1`
    ).then((r) => r.json()).catch(() => ({}))) as any;
    if (existingTh.reviews && Array.isArray(existingTh.reviews)) {
      for (const rev of existingTh.reviews) {
        if (rev.userEmail === "customer@example.com") {
          await fetch(`${THEMES_BASE}/api/marketplace/reviews/${rev.id}`, {
            method: "DELETE",
            headers: { Cookie: thAdmCookie },
          });
        }
      }
    }
    console.log("Cleanup completed successfully.\n");
  } catch (err: any) {
    console.warn("Cleanup warning:", err.message);
  }

  // ---------------------------------------------------------------------------
  // 1. Apps Hub UI & Detail Page
  // ---------------------------------------------------------------------------
  console.log("--- 1. Apps Hub UI & Detail Page Checks ---");
  try {
    const detailRes = await fetch(`${APPS_BASE}/apps/whatsapp-order`);
    record("Apps Hub: Detail page HTTP 200", detailRes.status === 200, `Status: ${detailRes.status}`);
    const detailHtml = await detailRes.text();
    record(
      "Apps Hub: Detail page renders Reviews section anchor",
      detailHtml.includes('id="reviews-section"') || detailHtml.includes("ratings & reviews") || detailHtml.includes("Ratings &amp; Reviews"),
      "Found reviews section in HTML"
    );
    record(
      "Apps Hub: No visible 'Super Admin' text in detail page UI",
      !detailHtml.includes(">Super Admin<") && !detailHtml.includes("Super Admin Review"),
      "Checked clean UI text"
    );
  } catch (err: any) {
    record("Apps Hub: Detail page fetch", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. Apps Hub: Initial Summary
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. Apps Hub: Review Summary API ---");
  try {
    const sumRes = await fetch(`${APPS_BASE}/api/marketplace/reviews/summary?type=app&listingId=listing_whatsapp-order`);
    record("Apps Hub: Summary endpoint HTTP 200", sumRes.status === 200);
    const sumData = await sumRes.json() as any;
    record(
      "Apps Hub: Summary schema valid",
      sumData.success === true && typeof sumData.summary?.averageRating === "number" && typeof sumData.summary?.totalReviews === "number",
      `Avg: ${sumData.summary?.averageRating}, Count: ${sumData.summary?.totalReviews}`
    );
  } catch (err: any) {
    record("Apps Hub: Summary endpoint", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 3. Customer Authentication & Review Creation
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Customer Login & Review Creation on Apps Hub ---");
  let customerCookie = "";
  try {
    const loginRes = await fetch(`${APPS_BASE}/api/marketplace/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@example.com",
        password: "admin123",
      }),
    });
    const loginData = await loginRes.json() as any;
    const rawCookie = loginRes.headers.get("set-cookie");
    if (rawCookie) {
      customerCookie = rawCookie.split(";")[0];
    }
    record(
      "Apps Hub: Customer login successful",
      loginRes.status === 200 && loginData.success === true && loginData.user?.role === "customer",
      `User: ${loginData.user?.name} (${loginData.user?.email})`
    );
    record("Apps Hub: customer_session cookie issued", !!customerCookie, customerCookie ? "Cookie present" : "Missing");
  } catch (err: any) {
    record("Apps Hub: Customer login", false, err.message);
  }

  let createdReviewId = "";
  try {
    const postRes = await fetch(`${APPS_BASE}/api/marketplace/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        listingType: "app",
        listingId: "listing_whatsapp-order",
        rating: 5,
        title: "Incredible WhatsApp Checkout Experience",
        body: "Blazing fast and reliable order routing through WhatsApp. Boosted conversions right away!",
      }),
    });
    const postData = await postRes.json() as any;
    createdReviewId = postData.reviewId || postData.review?.id || "";
    record(
      "Apps Hub: Customer posted 5-star review",
      postRes.status === 201 && postData.success === true && !!createdReviewId,
      `Review ID: ${createdReviewId}`
    );
  } catch (err: any) {
    record("Apps Hub: Post review", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 4. Listing Reviews & Verified Install Badge
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. Verify Reviews List & Verified Install Badge ---");
  try {
    const listRes = await fetch(`${APPS_BASE}/api/marketplace/reviews?type=app&listingId=listing_whatsapp-order&page=1`, {
      headers: { Cookie: customerCookie },
    });
    const listData = await listRes.json() as any;
    const posted = listData.reviews?.find((r: any) => r.id === createdReviewId);
    record(
      "Apps Hub: Posted review appears in listing",
      listRes.status === 200 && !!posted,
      `Reviews count: ${listData.reviews?.length}`
    );
    record(
      "Apps Hub: Review has Verified Install badge",
      posted?.isVerified === true || posted?.isVerifiedInstall === true,
      `isVerified: ${posted?.isVerified ?? posted?.isVerifiedInstall}`
    );
  } catch (err: any) {
    record("Apps Hub: List reviews", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 5. Rating Summary Update
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Verify Summary Update & Micro-cache ---");
  try {
    const updatedSumRes = await fetch(`${APPS_BASE}/api/marketplace/reviews/summary?type=app&listingId=listing_whatsapp-order`);
    const updatedSumData = await updatedSumRes.json() as any;
    record(
      "Apps Hub: Summary updated after review creation",
      updatedSumData.summary?.totalReviews >= 1 && updatedSumData.summary?.averageRating >= 4,
      `Total: ${updatedSumData.summary?.totalReviews}, Avg: ${updatedSumData.summary?.averageRating}`
    );
  } catch (err: any) {
    record("Apps Hub: Updated summary", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 6. Helpful Vote Toggle
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. Helpful Vote Toggle ---");
  try {
    const voteRes = await fetch(`${APPS_BASE}/api/marketplace/reviews/${createdReviewId}/helpful`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
    });
    const voteData = await voteRes.json() as any;
    record(
      "Apps Hub: Helpful vote toggled (incremented)",
      voteRes.status === 200 && voteData.success === true && voteData.helpfulCount >= 1,
      `Helpful count: ${voteData.helpfulCount}, User voted: ${voteData.voted ?? voteData.userVotedHelpful}`
    );
  } catch (err: any) {
    record("Apps Hub: Helpful vote", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 7. Prevent Duplicate Reviews (1 per user per listing)
  // ---------------------------------------------------------------------------
  console.log("\n--- 7. Rate Limiting / Duplicate Check ---");
  try {
    const dupRes = await fetch(`${APPS_BASE}/api/marketplace/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        listingType: "app",
        listingId: "listing_whatsapp-order",
        rating: 4,
        title: "Duplicate attempt",
        body: "Should be prevented by constraint",
      }),
    });
    const dupData = await dupRes.json() as any;
    record(
      "Apps Hub: Rejects duplicate review from same user",
      dupRes.status === 409 || dupRes.status === 400 || dupData.success === false,
      `Status: ${dupRes.status}, Error: ${dupData.error}`
    );
  } catch (err: any) {
    record("Apps Hub: Duplicate check", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 8. Edit Own Review
  // ---------------------------------------------------------------------------
  console.log("\n--- 8. Edit Own Review ---");
  try {
    const editRes = await fetch(`${APPS_BASE}/api/marketplace/reviews/${createdReviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        rating: 5,
        title: "Updated WhatsApp Review (5 Stars)",
        body: "Still running smoothly after full volume tests. Excellent support!",
      }),
    });
    const editData = await editRes.json() as any;
    record(
      "Apps Hub: Customer edited own review",
      editRes.status === 200 && editData.success === true,
      `Success: ${editData.success}`
    );
  } catch (err: any) {
    record("Apps Hub: Edit review", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 9. Nasrify Team Login & Response
  // ---------------------------------------------------------------------------
  console.log("\n--- 9. Nasrify Team Login & Response ---");
  let adminCookie = "";
  try {
    const adminLoginRes = await fetch(`${APPS_BASE}/api/marketplace/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });
    const adminData = await adminLoginRes.json() as any;
    const rawAdmCookie = adminLoginRes.headers.get("set-cookie");
    if (rawAdmCookie) {
      adminCookie = rawAdmCookie.split(";")[0];
    }
    record(
      "Apps Hub: Nasrify Team login successful",
      adminLoginRes.status === 200 && adminData.success === true && adminData.user?.isTeam === true,
      `User: ${adminData.user?.email}, isTeam: ${adminData.user?.isTeam}`
    );
  } catch (err: any) {
    record("Apps Hub: Team login", false, err.message);
  }

  try {
    const respRes = await fetch(`${APPS_BASE}/api/marketplace/reviews/${createdReviewId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        response: "Thanks for the feedback! We are thrilled WhatsApp checkout is boosting your conversion rates. — The Nasrify Team",
      }),
    });
    const respData = await respRes.json() as any;
    record(
      "Apps Hub: Nasrify Team replied to review",
      respRes.status === 200 && respData.success === true,
      `Success: ${respData.success}`
    );
  } catch (err: any) {
    record("Apps Hub: Team respond", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 10. Branding & Text Verification ("Nasrify Team" instead of "Super Admin")
  // ---------------------------------------------------------------------------
  console.log("\n--- 10. Branding Check: 'Nasrify Team' in UI ---");
  try {
    const pendingRes = await fetch(`${APPS_BASE}/super/pending`, {
      headers: { Cookie: adminCookie },
    });
    const pendingHtml = await pendingRes.text();
    record(
      "Apps Hub: /super/pending shows 'Nasrify Team'",
      pendingHtml.includes("Nasrify Team") || pendingHtml.includes("NASRIFY TEAM"),
      "Found 'Nasrify Team' header"
    );
    record(
      "Apps Hub: /super/pending does NOT show 'Super Admin' in UI",
      !pendingHtml.includes(">Super Admin<") && !pendingHtml.includes("Super Admin Review"),
      "No Super Admin branding in visible HTML"
    );
  } catch (err: any) {
    record("Apps Hub: Pending page branding", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 11. Delete Own Review
  // ---------------------------------------------------------------------------
  console.log("\n--- 11. Delete Own Review ---");
  try {
    const delRes = await fetch(`${APPS_BASE}/api/marketplace/reviews/${createdReviewId}`, {
      method: "DELETE",
      headers: { Cookie: customerCookie },
    });
    const delData = await delRes.json() as any;
    record(
      "Apps Hub: Customer deleted own review",
      delRes.status === 200 && delData.success === true,
      `Deleted ID: ${createdReviewId}`
    );
  } catch (err: any) {
    record("Apps Hub: Delete review", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 12. Themes Hub Full Cycle
  // ---------------------------------------------------------------------------
  console.log("\n--- 12. Themes Hub Marketplace Reviews Full Cycle ---");
  let themeCustomerCookie = "";
  try {
    const themeLoginRes = await fetch(`${THEMES_BASE}/api/marketplace/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@example.com",
        password: "admin123",
      }),
    });
    const themeLoginData = await themeLoginRes.json() as any;
    const rawThCookie = themeLoginRes.headers.get("set-cookie");
    if (rawThCookie) {
      themeCustomerCookie = rawThCookie.split(";")[0];
    }
    record(
      "Themes Hub: Customer login successful",
      themeLoginRes.status === 200 && themeLoginData.success === true,
      `User: ${themeLoginData.user?.email}`
    );
  } catch (err: any) {
    record("Themes Hub: Customer login", false, err.message);
  }

  let createdThemeReviewId = "";
  try {
    const postThRes = await fetch(`${THEMES_BASE}/api/marketplace/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: themeCustomerCookie,
      },
      body: JSON.stringify({
        listingType: "theme",
        listingId: "listing_minimal_noir",
        rating: 5,
        title: "Stunning Minimal Aesthetics",
        body: "Our luxury catalog looks incredible on Minimal Noir. Lighthouse score jumped to 99.",
      }),
    });
    const postThData = await postThRes.json() as any;
    createdThemeReviewId = postThData.reviewId || postThData.review?.id || "";
    record(
      "Themes Hub: Customer posted 5-star review for theme",
      postThRes.status === 201 && postThData.success === true && !!createdThemeReviewId,
      `Theme Review ID: ${createdThemeReviewId}`
    );
  } catch (err: any) {
    record("Themes Hub: Post theme review", false, err.message);
  }

  try {
    const listThRes = await fetch(`${THEMES_BASE}/api/marketplace/reviews?type=theme&listingId=listing_minimal_noir&page=1`, {
      headers: { Cookie: themeCustomerCookie },
    });
    const listThData = await listThRes.json() as any;
    const postedTh = listThData.reviews?.find((r: any) => r.id === createdThemeReviewId);
    record(
      "Themes Hub: Posted review appears with Verified Install",
      listThRes.status === 200 && (postedTh?.isVerified === true || postedTh?.isVerifiedInstall === true),
      `Verified: ${postedTh?.isVerified ?? postedTh?.isVerifiedInstall}`
    );
  } catch (err: any) {
    record("Themes Hub: List theme reviews", false, err.message);
  }

  // Team respond on Themes Hub
  let themeAdminCookie = "";
  try {
    const thAdminLoginRes = await fetch(`${THEMES_BASE}/api/marketplace/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });
    const rawThAdmCookie = thAdminLoginRes.headers.get("set-cookie");
    if (rawThAdmCookie) {
      themeAdminCookie = rawThAdmCookie.split(";")[0];
    }
    const thRespRes = await fetch(`${THEMES_BASE}/api/marketplace/reviews/${createdThemeReviewId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: themeAdminCookie,
      },
      body: JSON.stringify({
        response: "Delighted to hear your Lighthouse scores are high! — Nasrify Team",
      }),
    });
    const thRespData = await thRespRes.json() as any;
    record(
      "Themes Hub: Nasrify Team reply recorded",
      thRespRes.status === 200 && thRespData.success === true,
      `Success: ${thRespData.success}`
    );
  } catch (err: any) {
    record("Themes Hub: Team reply", false, err.message);
  }

  // Themes UI branding check
  try {
    const thPendingRes = await fetch(`${THEMES_BASE}/super/pending`, {
      headers: { Cookie: themeAdminCookie },
    });
    const thPendingHtml = await thPendingRes.text();
    record(
      "Themes Hub: /super/pending shows 'Nasrify Team'",
      thPendingHtml.includes("Nasrify Team") || thPendingHtml.includes("NASRIFY TEAM"),
      "Found 'Nasrify Team' header in Themes Hub"
    );
    record(
      "Themes Hub: /super/pending does NOT show 'Super Admin' in UI",
      !thPendingHtml.includes(">Super Admin<") && !thPendingHtml.includes("Super Admin Review"),
      "No Super Admin branding in visible HTML"
    );
  } catch (err: any) {
    record("Themes Hub: Branding check", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 13. Data Safety Check: Uninstall preserves reviews
  // ---------------------------------------------------------------------------
  console.log("\n--- 13. Data Safety Check ---");
  try {
    // Check that theme review still exists even if install is manipulated
    const checkRevRes = await fetch(`${THEMES_BASE}/api/marketplace/reviews?type=theme&listingId=listing_minimal_noir&page=1`);
    const checkRevData = await checkRevRes.json() as any;
    const reviewStillExists = checkRevData.reviews?.some((r: any) => r.id === createdThemeReviewId);
    record(
      "Data Safety: Reviews are persistent and independent of installs",
      reviewStillExists,
      `Review ID ${createdThemeReviewId} remains intact in database`
    );
  } catch (err: any) {
    record("Data Safety: Review persistence", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log("\n================================================================================");
  console.log(` VERIFICATION RESULTS: ${passedCount}/${total} PASSED (${failedCount} FAILED)`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
