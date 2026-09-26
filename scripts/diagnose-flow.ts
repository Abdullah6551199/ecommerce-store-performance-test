import { execSync } from "child_process";

const ADMIN_URL = "https://nasrify-admin.zia291930.workers.dev";
const STORE_URL = "https://nasrify-store.zia291930.workers.dev";
const ADMIN_EMAIL = "admin@apexstore.com";
const ADMIN_PASSWORD = "admin123";

async function main() {
  console.log("--- 1. Authenticating Admin Session ---");
  const loginRes = await fetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (loginRes.status !== 200) {
    console.error("Login failed:", loginRes.status, await loginRes.text());
    return;
  }
  const setCookie = loginRes.headers.get("set-cookie");
  const cookieHeader = setCookie?.split(";")[0] || "";
  console.log("Login OK, cookie obtained");

  console.log("\n--- 2. Fetching Current Draft ---");
  const draftRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft`, {
    headers: { Cookie: cookieHeader },
  });
  const draftData = await draftRes.json();
  console.log("Draft loaded. Sections:", draftData.theme?.sections?.map((s: any) => s.type));

  const currentTheme = draftData.theme;
  const heroIndex = currentTheme.sections.findIndex((s: any) => s.type === "hero");
  console.log("Current Hero heading:", currentTheme.sections[heroIndex]?.settings?.heading);

  console.log("\n--- 3. Updating Hero heading to 'TEST 123' and POST /draft ---");
  currentTheme.sections[heroIndex].settings.heading = "TEST 123";
  const saveRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ theme_json: currentTheme }),
  });
  console.log("Save draft status:", saveRes.status, await saveRes.json());

  console.log("\n--- 4. Checking D1 theme_drafts table ---");
  const d1DraftStr = execSync(
    `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT draft_json FROM theme_drafts WHERE id='active-draft';" --json`,
    { encoding: "utf-8" }
  );
  const d1DraftJson = JSON.parse(JSON.parse(d1DraftStr)[0].results[0].draft_json);
  const d1Hero = d1DraftJson.sections?.find((s: any) => s.type === "hero");
  console.log("D1 draft Hero heading is:", d1Hero?.settings?.heading);

  console.log("\n--- 5. Publishing theme via POST /publish ---");
  const pubRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ theme_json: currentTheme }),
  });
  console.log("Publish status:", pubRes.status, await pubRes.json());

  console.log("\n--- 6. Checking D1 active_theme table ---");
  const d1ActiveStr = execSync(
    `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT theme_json FROM active_theme WHERE id='default';" --json`,
    { encoding: "utf-8" }
  );
  const d1ActiveJson = JSON.parse(JSON.parse(d1ActiveStr)[0].results[0].theme_json);
  const d1ActiveHero = d1ActiveJson.sections?.find((s: any) => s.type === "hero");
  console.log("D1 active_theme Hero heading is:", d1ActiveHero?.settings?.heading);

  console.log("\n--- 7. Invalidate storefront cache ---");
  const invRes = await fetch(`${STORE_URL}/api/cache/invalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 8b051f18ed04fdbfc3aa401da65480ff4cb3b96a5e2082390693b2368a3f06e8",
    },
    body: JSON.stringify({ target: "all" }),
  });
  console.log("Invalidate status:", invRes.status, await invRes.json());

  console.log("\n--- 8. Fetching Storefront HTML ---");
  const sfRes = await fetch(`${STORE_URL}/`, { cache: "no-store" });
  const sfHtml = await sfRes.text();
  console.log("Contains 'TEST 123'?:", sfHtml.includes("TEST 123"));
  if (!sfHtml.includes("TEST 123")) {
    console.log("Search for 'Elevate Your Lifestyle':", sfHtml.includes("Elevate Your Lifestyle"));
    // Find what hero heading is in the HTML
    const match = sfHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    console.log("First <h1> in storefront HTML:", match ? match[0] : "none");
  }
}

main().catch(console.error);
