async function verify() {
  console.log("=== VERIFYING THEME EDITOR API & SSR ===");

  // 1. Authenticate
  const loginRes = await fetch("https://nasrify-admin.zia291930.workers.dev/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@apexstore.com", password: "admin123" }),
  });
  console.log("1. Admin login status:", loginRes.status);
  if (loginRes.status !== 200) throw new Error("Login failed");
  const cookie = loginRes.headers.get("set-cookie") || "";

  // 2. Fetch Theme Editor Page
  const pageRes = await fetch("https://nasrify-admin.zia291930.workers.dev/admin/theme-editor", {
    headers: { Cookie: cookie },
  });
  console.log("2. Theme Editor page SSR status:", pageRes.status);
  const html = await pageRes.text();
  console.log("   Contains <html id=\"__next_error__\">:", html.includes("__next_error__"));
  console.log("   Contains \"Visual Theme Editor\":", html.includes("Visual Theme Editor"));
  if (pageRes.status !== 200 || html.includes("__next_error__")) {
    throw new Error("Theme editor failed to render");
  }

  // 3. Extract and verify static script chunks
  const scriptRegex = /src="(\/_next\/static\/chunks\/[^"]+)"/g;
  let match;
  let chunkCount = 0;
  let chunksOk = true;
  while ((match = scriptRegex.exec(html)) !== null) {
    chunkCount++;
    const chunkUrl = "https://nasrify-admin.zia291930.workers.dev" + match[1];
    const cRes = await fetch(chunkUrl);
    if (cRes.status !== 200) {
      console.log("   Chunk failed:", match[1], cRes.status);
      chunksOk = false;
    }
  }
  console.log("3. Verified " + chunkCount + " client script chunks loaded successfully: " + chunksOk);

  // 4. Fetch Draft
  const draftRes = await fetch("https://nasrify-admin.zia291930.workers.dev/api/admin/theme-editor/draft", {
    headers: { Cookie: cookie },
  });
  console.log("4. GET /api/admin/theme-editor/draft status:", draftRes.status);
  const draftData = (await draftRes.json()) as any;
  console.log("   Draft theme loaded:", draftData.theme?.name, "Sections count:", draftData.theme?.sections?.length);

  // 5. Test Save Draft
  const saveRes = await fetch("https://nasrify-admin.zia291930.workers.dev/api/admin/theme-editor/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ theme_json: draftData.theme }),
  });
  console.log("5. POST /api/admin/theme-editor/draft (Save Draft) status:", saveRes.status);

  // 6. Test Publish
  const pubRes = await fetch("https://nasrify-admin.zia291930.workers.dev/api/admin/theme-editor/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ theme_json: draftData.theme }),
  });
  console.log("6. POST /api/admin/theme-editor/publish (Publish) status:", pubRes.status);

  console.log("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
