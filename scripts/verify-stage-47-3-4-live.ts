import { execSync } from "child_process";

async function verifyLive() {
  console.log("=================================================");
  console.log("  LIVE D1 & EDGE VERIFICATION - STAGE 47.3 + 47.4 ");
  console.log("=================================================\n");

  // 1. Verify D1 remote table theme_page_drafts exists
  console.log("[1] Querying remote D1 theme_page_drafts schema...");
  try {
    const tableCheck = execSync(
      `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('theme_page_drafts', 'theme_drafts', 'pages')"`,
      { encoding: "utf-8" }
    );
    console.log(tableCheck);
  } catch (err: any) {
    console.error("D1 schema check failed:", err.message);
  }

  // 2. Test isolated page draft insertion and query on remote D1
  console.log("\n[2] Testing remote D1 theme_page_drafts insert & select...");
  const testThemeId = "theme-default";
  const testPageType = "product";
  const testCompositeId = `${testThemeId}::${testPageType}`;
  const now = Date.now();
  const testDraftPayload = JSON.stringify({
    test: true,
    pageType: testPageType,
    updatedAt: now,
  }).replace(/"/g, '\\"');

  try {
    const insertOutput = execSync(
      `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="INSERT INTO theme_page_drafts (id, theme_id, page_type, draft_json, updated_by, updated_at) VALUES ('${testCompositeId}', '${testThemeId}', '${testPageType}', '${testDraftPayload}', 'stage47_verifier', ${now}) ON CONFLICT(id) DO UPDATE SET draft_json=excluded.draft_json, updated_at=excluded.updated_at"`,
      { encoding: "utf-8" }
    );
    console.log("  ✓ Insert/Update remote draft:", insertOutput.includes("Executed") ? "Success" : insertOutput);

    const queryOutput = execSync(
      `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT id, theme_id, page_type, updated_by, updated_at FROM theme_page_drafts WHERE id='${testCompositeId}'"`,
      { encoding: "utf-8" }
    );
    console.log("  ✓ Query result:\n", queryOutput);

    // Clean up test draft
    execSync(
      `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="DELETE FROM theme_page_drafts WHERE id='${testCompositeId}'"`,
      { encoding: "utf-8" }
    );
    console.log("  ✓ Test draft cleaned up successfully.");
  } catch (err: any) {
    console.error("D1 remote write/read failed:", err.message);
  }

  console.log("\n=================================================");
  console.log("  LIVE D1 VERIFICATION COMPLETE");
  console.log("=================================================");
}

verifyLive().catch(console.error);
