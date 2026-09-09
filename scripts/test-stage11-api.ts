import { GET as getHomepageHandler, POST as createHomepageHandler } from "../app/api/admin/homepage/route";
import { PUT as updateHomepageHandler, DELETE as deleteHomepageHandler } from "../app/api/admin/homepage/[id]/route";
import { PUT as reorderHomepageHandler } from "../app/api/admin/homepage/reorder/route";
import { GET as getAppearanceHandler, PUT as updateAppearanceHandler } from "../app/api/admin/appearance/route";
import { GET as getPublicAppearanceHandler } from "../app/api/appearance/route";
import { createSession } from "../lib/auth";
import { NextRequest } from "next/server";

async function runStage11Tests() {
  console.log("=================================================");
  console.log(" Stage 11: Dynamic Homepage & Appearance API Tests ");
  console.log("=================================================\n");

  // Generate Admin Session
  const adminToken = await createSession("admin-stage11-tester");
  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: `admin_session=${adminToken}`,
  };

  // --------------------------------------------------------------------------
  // TEST 1: Unauthenticated Requests are Rejected with 401
  // --------------------------------------------------------------------------
  console.log("[Test 1] Unauthenticated checks...");
  const unauthHomepageReq = new NextRequest("http://localhost:3000/api/admin/homepage");
  const unauthHomepageRes = await getHomepageHandler(unauthHomepageReq);
  if (unauthHomepageRes.status !== 401) {
    throw new Error(`Expected 401 for unauth GET homepage, got ${unauthHomepageRes.status}`);
  }

  const unauthAppearanceReq = new NextRequest("http://localhost:3000/api/admin/appearance");
  const unauthAppearanceRes = await getAppearanceHandler(unauthAppearanceReq);
  if (unauthAppearanceRes.status !== 401) {
    throw new Error(`Expected 401 for unauth GET appearance, got ${unauthAppearanceRes.status}`);
  }
  console.log("  [PASS] 401 Unauthorized enforced for homepage and appearance routes.\n");

  // --------------------------------------------------------------------------
  // TEST 2: GET /api/admin/homepage (Authenticated)
  // --------------------------------------------------------------------------
  console.log("[Test 2] GET /api/admin/homepage...");
  const getHomepageReq = new NextRequest("http://localhost:3000/api/admin/homepage", {
    headers: authHeaders,
  });
  const getHomepageRes = await getHomepageHandler(getHomepageReq);
  const getHomepageJson = (await getHomepageRes.json()) as any;
  if (!getHomepageJson.success || !Array.isArray(getHomepageJson.data)) {
    throw new Error("Failed to retrieve homepage sections");
  }
  console.log(`  [PASS] Retrieved ${getHomepageJson.data.length} homepage sections.\n`);

  // --------------------------------------------------------------------------
  // TEST 3: POST /api/admin/homepage (Zod Validation Rejection)
  // --------------------------------------------------------------------------
  console.log("[Test 3] POST /api/admin/homepage (Zod validation check)...");
  const invalidCreateReq = new NextRequest("http://localhost:3000/api/admin/homepage", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      // Missing title and type
      imageUrl: "https://example.com/img.jpg",
    }),
  });
  const invalidCreateRes = await createHomepageHandler(invalidCreateReq);
  if (invalidCreateRes.status !== 400) {
    throw new Error(`Expected 400 for invalid section data, got ${invalidCreateRes.status}`);
  }
  console.log("  [PASS] 400 Bad Request returned on invalid input.\n");

  // --------------------------------------------------------------------------
  // TEST 4: POST /api/admin/homepage (Create Testimonials Section)
  // --------------------------------------------------------------------------
  console.log("[Test 4] POST /api/admin/homepage (Create Section)...");
  const testSectionId = `sec-test-${Date.now()}`;
  const validCreateReq = new NextRequest("http://localhost:3000/api/admin/homepage", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      id: testSectionId,
      type: "testimonials",
      title: "Automated Testimonials Section",
      sortOrder: 99,
      isActive: true,
      content: {
        heading: "Champion Reviews",
        subheading: "Tested in high-altitude marathon trials.",
        testimonials: [
          { quote: "Superb responsiveness.", author: "Runner A", role: "Athlete", rating: 5 },
        ],
      },
    }),
  });
  const validCreateRes = await createHomepageHandler(validCreateReq);
  const validCreateJson = (await validCreateRes.json()) as any;
  if (!validCreateJson.success || validCreateJson.data.id !== testSectionId) {
    throw new Error(`Failed to create section: ${JSON.stringify(validCreateJson)}`);
  }
  console.log(`  [PASS] Created section with ID: ${testSectionId}\n`);

  // --------------------------------------------------------------------------
  // TEST 5: PUT /api/admin/homepage/[id] (Update Section)
  // --------------------------------------------------------------------------
  console.log("[Test 5] PUT /api/admin/homepage/[id] (Update Section)...");
  const updateReq = new NextRequest(`http://localhost:3000/api/admin/homepage/${testSectionId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Updated Champion Testimonials",
      isActive: false,
    }),
  });
  const updateRes = await updateHomepageHandler(updateReq, {
    params: Promise.resolve({ id: testSectionId }),
  });
  const updateJson = (await updateRes.json()) as any;
  if (!updateJson.success || updateJson.data.title !== "Updated Champion Testimonials" || updateJson.data.isActive !== false) {
    throw new Error(`Failed to update section: ${JSON.stringify(updateJson)}`);
  }
  console.log("  [PASS] Section title and status updated successfully.\n");

  // --------------------------------------------------------------------------
  // TEST 6: PUT /api/admin/homepage/reorder (Reorder Sections)
  // --------------------------------------------------------------------------
  console.log("[Test 6] PUT /api/admin/homepage/reorder...");
  const existingIds = getHomepageJson.data.map((s: any) => s.id);
  const reorderedIds = [testSectionId, ...existingIds.filter((id: string) => id !== testSectionId)];
  const reorderReq = new NextRequest("http://localhost:3000/api/admin/homepage/reorder", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ orderedIds: reorderedIds }),
  });
  const reorderRes = await reorderHomepageHandler(reorderReq);
  const reorderJson = (await reorderRes.json()) as any;
  if (!reorderJson.success) {
    throw new Error(`Failed to reorder sections: ${JSON.stringify(reorderJson)}`);
  }
  console.log(`  [PASS] Reordered ${reorderedIds.length} sections successfully.\n`);

  // --------------------------------------------------------------------------
  // TEST 7: DELETE /api/admin/homepage/[id] (Delete Section)
  // --------------------------------------------------------------------------
  console.log("[Test 7] DELETE /api/admin/homepage/[id]...");
  const deleteReq = new NextRequest(`http://localhost:3000/api/admin/homepage/${testSectionId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const deleteRes = await deleteHomepageHandler(deleteReq, {
    params: Promise.resolve({ id: testSectionId }),
  });
  const deleteJson = (await deleteRes.json()) as any;
  if (!deleteJson.success) {
    throw new Error(`Failed to delete section: ${JSON.stringify(deleteJson)}`);
  }
  console.log("  [PASS] Temporary section deleted successfully.\n");

  // --------------------------------------------------------------------------
  // TEST 8: GET /api/admin/appearance (Authenticated)
  // --------------------------------------------------------------------------
  console.log("[Test 8] GET /api/admin/appearance...");
  const getThemeReq = new NextRequest("http://localhost:3000/api/admin/appearance", {
    headers: authHeaders,
  });
  const getThemeRes = await getAppearanceHandler(getThemeReq);
  const getThemeJson = (await getThemeRes.json()) as any;
  if (!getThemeJson.success || !getThemeJson.data?.colors?.primary) {
    throw new Error(`Failed to fetch theme settings: ${JSON.stringify(getThemeJson)}`);
  }
  console.log(`  [PASS] Theme loaded. Current primary color: ${getThemeJson.data.colors.primary}\n`);

  // --------------------------------------------------------------------------
  // TEST 9: PUT /api/admin/appearance (Update Theme Settings)
  // --------------------------------------------------------------------------
  console.log("[Test 9] PUT /api/admin/appearance (Update Theme)...");
  const updateThemeReq = new NextRequest("http://localhost:3000/api/admin/appearance", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      colors: {
        primary: "#18C729",
        secondary: "#12a822",
        accent: "#FEF500",
      },
      typography: {
        headingFont: "Inter, sans-serif",
      },
      design: {
        buttonRadius: "14px",
      },
      other: {
        announcementBarText: "⚡ FLASH SALE: Free Worldwide Edge Shipping Today!",
      },
    }),
  });
  const updateThemeRes = await updateAppearanceHandler(updateThemeReq);
  const updateThemeJson = (await updateThemeRes.json()) as any;
  if (!updateThemeJson.success || updateThemeJson.data.design.buttonRadius !== "14px") {
    throw new Error(`Failed to update theme: ${JSON.stringify(updateThemeJson)}`);
  }
  console.log("  [PASS] Appearance settings updated successfully.\n");

  // --------------------------------------------------------------------------
  // TEST 10: GET /api/appearance (Public Endpoint)
  // --------------------------------------------------------------------------
  console.log("[Test 10] GET /api/appearance (Public endpoint)...");
  const publicThemeRes = await getPublicAppearanceHandler();
  const publicThemeJson = (await publicThemeRes.json()) as any;
  if (!publicThemeJson.success || !publicThemeJson.data?.other?.announcementBarText) {
    throw new Error(`Failed to fetch public appearance: ${JSON.stringify(publicThemeJson)}`);
  }
  console.log(`  [PASS] Public theme verified. Announcement: "${publicThemeJson.data.other.announcementBarText}"\n`);

  console.log("=================================================");
  console.log(" ALL STAGE 11 INTEGRATION TESTS PASSED (10/10)   ");
  console.log("=================================================");
}

runStage11Tests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
