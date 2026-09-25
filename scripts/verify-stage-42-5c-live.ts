/**
 * Stage 42.5c Live Verification Script
 */

async function main() {
  console.log("=== STAGE 42.5c LIVE VERIFICATION ===");
  const adminUrl = "https://nasrify-admin.zia291930.workers.dev";

  // 1. Authenticate as admin to get session cookie
  console.log("\n1. Authenticating as admin...");
  const loginRes = await fetch(`${adminUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@apexstore.com", password: "admin123" }),
  });
  console.log(`- Login response status: ${loginRes.status}`);
  const cookieHeader = loginRes.headers.get("set-cookie") || "";
  console.log(`- Cookie received: ${cookieHeader ? "✓ YES" : "✗ NO"}`);

  // 2. Fetch /api/admin/apps with session cookie
  console.log("\n2. Fetching /api/admin/apps with admin session...");
  const appsRes = await fetch(`${adminUrl}/api/admin/apps`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  console.log(`- Status: ${appsRes.status}`);
  if (appsRes.ok) {
    const json = (await appsRes.json()) as any;
    console.log(`- Format check: success=${json.success}, isArray(data)=${Array.isArray(json.data)}`);
    const appList = Array.isArray(json) ? json : json.data || [];
    const advApp = appList.find((a: any) => a.id === "advanced-theme-editor");
    console.log(`- advanced-theme-editor found: ${advApp ? "✓ YES" : "✗ NO"}`);
    if (advApp) {
      console.log(`- installed: ${advApp.installed}, enabled: ${advApp.enabled}`);
    }
  }

  // 3. Fetch Theme Editor HTML with session cookie
  console.log("\n3. Inspecting Theme Editor HTML...");
  const editorRes = await fetch(`${adminUrl}/admin/theme-editor`, {
    headers: {
      Cookie: cookieHeader,
    },
  });
  console.log(`- Status: ${editorRes.status}`);
  const html = await editorRes.text();

  // Verify "Basic Editor" is NOT present
  const hasBasicEditor = html.includes("Basic Editor");
  console.log(`- Contains "Basic Editor": ${hasBasicEditor ? "✗ YES (FAIL)" : "✓ NO (CLEAN)"}`);

  // Verify "Editor Mode" or "Visual Theme Editor" is present
  const hasVisualThemeEditor = html.includes("Visual Theme Editor") || html.includes("Editor Mode");
  console.log(`- Contains "Visual Theme Editor" / "Editor Mode": ${hasVisualThemeEditor ? "✓ YES" : "✗ NO"}`);

  console.log("\n=== ALL STAGE 42.5c VERIFICATION CHECKS COMPLETED ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
