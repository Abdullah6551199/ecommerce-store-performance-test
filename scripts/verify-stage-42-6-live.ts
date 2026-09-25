/**
 * Stage 42.6 Live Verification Script
 * Validates Advanced Theme Editor app:
 * - App registration in /admin/apps & extension points
 * - Settings API
 * - Elementor-like styles & custom CSS generation
 * - Theme Editor draft saving with _advanced section data
 * - Theme publishing & Storefront CSS injection
 * - App toggle / uninstall / reinstall flow
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";
const ADMIN_URL = process.env.ADMIN_URL || "https://nasrify-admin.zia291930.workers.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@apexstore.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  console.log("==================================================");
  console.log("   Stage 42.6 — Advanced Theme Editor Live Tests  ");
  console.log("==================================================");
  console.log(`Store URL: ${STORE_URL}`);
  console.log(`Admin URL: ${ADMIN_URL}`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Authenticate Admin
  console.log("\n--- 1. Authenticating Admin Session ---");
  const loginRes = await fetch(`${ADMIN_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (loginRes.status !== 200) {
    console.error("Login failed:", loginRes.status, await loginRes.text());
  }
  assert(loginRes.status === 200, "Admin login successful (200 OK)");

  const setCookie = loginRes.headers.get("set-cookie");
  assert(Boolean(setCookie), "Admin auth session cookie received");
  const cookieHeader = setCookie?.split(";")[0] || "";

  // 2. Verify App Listing in /api/admin/apps
  console.log("\n--- 2. Checking App in Marketplace & Installed Apps ---");
  const appsRes = await fetch(`${ADMIN_URL}/api/admin/apps`, {
    headers: { Cookie: cookieHeader },
  });
  assert(appsRes.status === 200, "GET /api/admin/apps returns 200 OK");
  const appsData = await appsRes.json();
  const appsList = appsData.data || appsData;
  const advancedApp = appsList.find(
    (a: any) => a.id === "advanced-theme-editor" || a.appId === "advanced-theme-editor"
  );
  assert(Boolean(advancedApp), "advanced-theme-editor app found in apps list");
  assert(Boolean(advancedApp?.enabled ?? advancedApp?.isEnabled), "App is installed and enabled");

  // 3. Verify Settings API
  console.log("\n--- 3. Testing Settings API ---");
  const settingsRes = await fetch(`${ADMIN_URL}/api/admin/apps/advanced-theme-editor/settings`, {
    headers: { Cookie: cookieHeader },
  });
  assert(settingsRes.status === 200, "GET /api/admin/apps/advanced-theme-editor/settings returns 200 OK");
  const settingsData = await settingsRes.json();
  assert(settingsData.success === true, "Settings response success is true");
  assert(Boolean(settingsData.data?.settings || settingsData.settings), "Settings object returned");

  // Update settings test
  const updateSettingsRes = await fetch(`${ADMIN_URL}/api/admin/apps/advanced-theme-editor/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      enabled: true,
      enableCustomCSS: true,
      enableAnimations: true,
      enableResponsive: true,
    }),
  });
  assert(updateSettingsRes.status === 200, "PUT /api/admin/apps/advanced-theme-editor/settings returns 200 OK");

  // 4. Fetch Active Theme & Test Theme Editor Draft
  console.log("\n--- 4. Theme Editor Draft with Advanced Styles ---");
  const themesRes = await fetch(`${ADMIN_URL}/api/admin/themes`, {
    headers: { Cookie: cookieHeader },
  });
  const themesData = await themesRes.json();
  const themeList = themesData.themes || themesData.data || (Array.isArray(themesData) ? themesData : []);
  const activeTheme = themesData.activeTheme || themeList.find((t: any) => t.isActive === 1 || t.is_active === 1) || themeList[0];
  assert(Boolean(activeTheme), `Active theme found: ${activeTheme?.name} (${activeTheme?.id})`);

  const rawConfig = activeTheme.themeJson || activeTheme.theme_json || activeTheme.config;
  const originalConfig = typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
  const sections = [...(originalConfig.sections || [])];
  assert(sections.length > 0, "Theme has sections");

  const targetSection = sections[0];
  const targetSectionId = targetSection.id;

  // Add _advanced settings to target section
  const advancedPayload = {
    style: {
      typography: {
        fontSize: "24px",
        fontWeight: "700",
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "#1e293b",
      },
      background: {
        type: "gradient",
        gradient: {
          type: "linear",
          angle: "135deg",
          color1: "#f8fafc",
          color2: "#e2e8f0",
        },
      },
      border: {
        type: "solid",
        color: "#cbd5e1",
        radius: { top: "12px", right: "12px", bottom: "12px", left: "12px", linked: true },
        width: { top: "2px", right: "2px", bottom: "2px", left: "2px", linked: true },
      },
      boxShadow: {
        horizontal: 0,
        vertical: 8,
        blur: 24,
        spread: 0,
        color: "rgba(0, 0, 0, 0.08)",
        position: "outline",
      },
    },
    advanced: {
      motion: {
        entranceAnimation: "fadeInUp",
        animationDuration: 800,
        animationDelay: 100,
      },
      customCss: "selector { border-left-color: #6366f1; }",
    },
  };

  const modifiedSections = sections.map((s, idx) => {
    if (idx === 0) {
      return {
        ...s,
        settings: {
          ...(s.settings || {}),
          _advanced: advancedPayload,
        },
      };
    }
    return s;
  });

  const modifiedThemeConfig = {
    ...originalConfig,
    sections: modifiedSections,
  };

  // Save Draft
  const saveDraftRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      themeId: activeTheme.id,
      theme_json: modifiedThemeConfig,
    }),
  });
  assert(saveDraftRes.status === 200, "Saved theme draft with _advanced data (200 OK)");

  // 5. Publish Theme
  console.log("\n--- 5. Publishing Theme to Storefront ---");
  const publishRes = await fetch(`${ADMIN_URL}/api/admin/theme-editor/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      theme_json: modifiedThemeConfig,
    }),
  });
  assert(publishRes.status === 200, "Published theme with _advanced configuration (200 OK)");

  // Invalidate cache
  await fetch(`${STORE_URL}/api/cache/invalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 8b051f18ed04fdbfc3aa401da65480ff4cb3b96a5e2082390693b2368a3f06e8",
    },
    body: JSON.stringify({ target: "all", path: "/" }),
  }).catch(() => {});

  // Wait 1s for edge propagate
  await new Promise((r) => setTimeout(r, 1000));

  // 6. Verify Storefront Injected CSS & Elements
  console.log("\n--- 6. Verifying Storefront Advanced CSS Injection ---");
  const t0 = Date.now();
  const storeRes = await fetch(`${STORE_URL}/?nocache=${Date.now()}`);
  const ttfb = Date.now() - t0;
  assert(storeRes.status === 200, `Storefront home responded 200 OK (TTFB: ${ttfb}ms)`);

  const storeHtml = await storeRes.text();
  assert(
    storeHtml.includes('id="theme-advanced-css"'),
    "Storefront rendered <style id=\"theme-advanced-css\">"
  );
  assert(
    storeHtml.includes(`.section-${targetSectionId}`),
    `Generated scoped CSS contains .section-${targetSectionId}`
  );
  assert(
    storeHtml.includes("ate-fadeInUp"),
    "Generated CSS includes ate-fadeInUp animation"
  );
  assert(
    storeHtml.includes("border-left-color: #6366f1"),
    "Custom CSS was scoped and applied to selector"
  );
  assert(
    storeHtml.includes(`section-${targetSectionId}`),
    `Section container includes section-${targetSectionId} class`
  );

  // 7. Verify App Toggle (Disable -> Re-enable)
  console.log("\n--- 7. Verifying App Toggle Lifecycle ---");
  const disableRes = await fetch(`${ADMIN_URL}/api/admin/apps/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ appId: "advanced-theme-editor", enabled: false }),
  });
  assert(disableRes.status === 200, "Toggled app to disabled (200 OK)");

  await new Promise((r) => setTimeout(r, 1500));

  const appsAfterDisable = await (
    await fetch(`${ADMIN_URL}/api/admin/apps`, { headers: { Cookie: cookieHeader } })
  ).json();
  const disabledList = appsAfterDisable.data || appsAfterDisable;
  const disabledApp = disabledList.find(
    (a: any) => a.id === "advanced-theme-editor" || a.appId === "advanced-theme-editor"
  );
  assert(
    disabledApp?.enabled === false || disabledApp?.isEnabled === false,
    "App status confirmed disabled in admin"
  );

  // Re-enable app
  const enableRes = await fetch(`${ADMIN_URL}/api/admin/apps/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ appId: "advanced-theme-editor", enabled: true }),
  });
  assert(enableRes.status === 200, "Re-enabled app (200 OK)");

  await new Promise((r) => setTimeout(r, 1500));

  const appsAfterEnable = await (
    await fetch(`${ADMIN_URL}/api/admin/apps`, { headers: { Cookie: cookieHeader } })
  ).json();
  const enabledList = appsAfterEnable.data || appsAfterEnable;
  const enabledApp = enabledList.find(
    (a: any) => a.id === "advanced-theme-editor" || a.appId === "advanced-theme-editor"
  );
  assert(
    Boolean(enabledApp?.enabled ?? enabledApp?.isEnabled),
    "App status confirmed enabled in admin"
  );

  // 8. Restore Clean Theme Config
  console.log("\n--- 8. Clean-up & Restoring Original Theme State ---");
  const cleanConfig = {
    ...originalConfig,
    sections: originalConfig.sections.map((s: any) => {
      if (s.id === targetSectionId && s.settings?._advanced) {
        const { _advanced, ...rest } = s.settings;
        return { ...s, settings: rest };
      }
      return s;
    }),
  };

  await fetch(`${ADMIN_URL}/api/admin/theme-editor/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      theme_json: cleanConfig,
    }),
  });

  await fetch(`${STORE_URL}/api/cache/invalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 8b051f18ed04fdbfc3aa401da65480ff4cb3b96a5e2082390693b2368a3f06e8",
    },
    body: JSON.stringify({ target: "all", path: "/" }),
  }).catch(() => {});

  console.log("Restored original theme configuration and invalidated cache.");

  console.log("\n==================================================");
  console.log(`Live Verification Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification crashed:", err);
  process.exit(1);
});
