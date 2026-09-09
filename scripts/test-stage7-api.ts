import { NextRequest } from "next/server";
import { GET as getPublicSettings } from "../app/api/settings/route";
import { GET as getPublicSections } from "../app/api/homepage/sections/route";
import { GET as getAdminSettings, POST as postAdminSettings } from "../app/api/admin/settings/route";
import { GET as getAdminSections, POST as postAdminSections } from "../app/api/admin/homepage/sections/route";

async function runApiTests() {
  console.log("===============================================================================");
  console.log("STAGE 7: API ROUTES & AUTH GUARD VERIFICATION");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  try {
    // 1. Public Settings Route
    console.log("Test 1: Public GET /api/settings...");
    const pubSettingsRes = await getPublicSettings();
    const pubSettingsJson = await pubSettingsRes.json();
    assert(pubSettingsRes.status === 200, "Public settings endpoint returns 200 OK");
    assert(pubSettingsJson.success === true, "Public settings payload success is true");
    assert(Boolean(pubSettingsJson.data?.storeName), `Store name present in public settings: '${pubSettingsJson.data?.storeName}'`);

    // 2. Public Homepage Sections Route
    console.log("\nTest 2: Public GET /api/homepage/sections...");
    const pubSectionsRes = await getPublicSections();
    const pubSectionsJson = await pubSectionsRes.json();
    assert(pubSectionsRes.status === 200, "Public sections endpoint returns 200 OK");
    assert(pubSectionsJson.success === true, "Public sections payload success is true");
    assert(Array.isArray(pubSectionsJson.data) && pubSectionsJson.data.length >= 5, `Public sections returns ${pubSectionsJson.data?.length} sections`);

    // 3. Admin Settings Route Auth Guard
    console.log("\nTest 3: Admin GET /api/admin/settings (Unauthorized)...");
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/settings");
    const adminGetRes = await getAdminSettings(unauthReq);
    assert(adminGetRes.status === 401, "Admin GET settings rejects unauthenticated request with 401");

    console.log("\nTest 4: Admin POST /api/admin/settings (Unauthorized)...");
    const unauthPostReq = new NextRequest("http://localhost:3000/api/admin/settings", {
      method: "POST",
      body: JSON.stringify({ storeName: "Hacked" }),
    });
    const adminPostRes = await postAdminSettings(unauthPostReq);
    assert(adminPostRes.status === 401, "Admin POST settings rejects unauthenticated request with 401");

    // 4. Admin Homepage Sections Route Auth Guard
    console.log("\nTest 5: Admin GET /api/admin/homepage/sections (Unauthorized)...");
    const unauthSecReq = new NextRequest("http://localhost:3000/api/admin/homepage/sections");
    const adminSecGetRes = await getAdminSections(unauthSecReq);
    assert(adminSecGetRes.status === 401, "Admin GET homepage sections rejects unauthenticated request with 401");

    console.log("\nTest 6: Admin POST /api/admin/homepage/sections (Unauthorized)...");
    const unauthSecPostReq = new NextRequest("http://localhost:3000/api/admin/homepage/sections", {
      method: "POST",
      body: JSON.stringify({ title: "Injected Section", type: "custom" }),
    });
    const adminSecPostRes = await postAdminSections(unauthSecPostReq);
    assert(adminSecPostRes.status === 401, "Admin POST homepage sections rejects unauthenticated request with 401");

    console.log("\n===============================================================================");
    console.log(`API TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log("===============================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("API Test Fatal Error:", err);
    process.exit(1);
  }
}

runApiTests();
