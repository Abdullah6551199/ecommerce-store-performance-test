import fs from "fs";
import path from "path";

/**
 * ==============================================================================
 * Nasrify Apps Framework - Build-Time App Synchronizer (Stage E)
 * ==============================================================================
 * Copies modular apps from /apps into their respective worker workspaces:
 * - nasrify-admin: receives admin/, shared/, lib/, manifest.json, icon.svg
 * - nasrify-store: receives storefront/, shared/, lib/, manifest.json, icon.svg
 * Excludes admin-only code from storefront, and storefront-only code from admin.
 */

const ROOT_DIR = path.resolve(__dirname, "..");
const APPS_DIR = path.join(ROOT_DIR, "apps");

function getArg(flag: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  if (arg) return arg.split("=")[1];
  const idx = process.argv.indexOf(`--${flag}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

const targetArg = getArg("target") || "all";

if (targetArg !== "admin" && targetArg !== "storefront" && targetArg !== "all") {
  console.error("Usage: tsx scripts/sync-apps.ts --target=admin|storefront|all");
  process.exit(1);
}

function copyRecursive(src: string, dest: string, excludeDirs: Set<string>) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    const base = path.basename(src);
    if (excludeDirs.has(base)) {
      return;
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const children = fs.readdirSync(src);
    for (const child of children) {
      copyRecursive(path.join(src, child), path.join(dest, child), excludeDirs);
    }
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function generateAdminLoader(): string {
  return `import React from "react";
import dynamic from "next/dynamic";

/**
 * Component Loader Registry for Admin Worker
 * Pre-registered dynamic imports for admin extension components.
 */
export const APP_ADMIN_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  "hello-world": {
    HelloWorldWidget: dynamic(() => import("@/apps/hello-world/admin/HelloWorldWidget")),
  },
  reviews: {
    ReviewsManager: dynamic(() => import("@/apps/reviews/admin/ReviewsManager")),
  },
  "whatsapp-order": {
    WhatsAppSettings: dynamic(() => import("@/apps/whatsapp-order/admin/WhatsAppSettings")),
  },
};

export function loadAdminAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  if (!appId || !componentName) return null;
  return APP_ADMIN_COMPONENTS[appId]?.[componentName] || null;
}

export function loadStorefrontAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  // Storefront components are not included in the admin worker
  return null;
}

// Backwards-compatibility aliases
export const loadAppAdminComponent = loadAdminAppComponent;
export const loadAppStorefrontComponent = loadStorefrontAppComponent;
`;
}

function generateStorefrontLoader(): string {
  return `import React from "react";
import dynamic from "next/dynamic";

/**
 * Component Loader Registry for Storefront Worker
 * Pre-registered dynamic imports for storefront extension components.
 */
export const APP_STOREFRONT_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  "hello-world": {
    HelloWorldBanner: dynamic(() => import("@/apps/hello-world/storefront/HelloWorldBanner")),
  },
  reviews: {
    ReviewsList: dynamic(() => import("@/apps/reviews/storefront/ReviewsList")),
  },
  "whatsapp-order": {
    WhatsAppFloatingButton: dynamic(() => import("@/apps/whatsapp-order/storefront/WhatsAppFloatingButton")),
    WhatsAppProductButton: dynamic(() => import("@/apps/whatsapp-order/storefront/WhatsAppProductButton")),
  },
  wishlist: {
    WishlistButton: dynamic(() => import("@/apps/wishlist/storefront/WishlistButton")),
    WishlistPage: dynamic(() => import("@/apps/wishlist/storefront/WishlistPage")),
    WishlistHeaderIcon: dynamic(() => import("@/apps/wishlist/storefront/WishlistHeaderIcon")),
  },
};

export function loadAdminAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  // Admin components are not included in the storefront worker
  return null;
}

export function loadStorefrontAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  if (!appId || !componentName) return null;
  return APP_STOREFRONT_COMPONENTS[appId]?.[componentName] || null;
}

// Backwards-compatibility aliases
export const loadAppAdminComponent = loadAdminAppComponent;
export const loadAppStorefrontComponent = loadStorefrontAppComponent;
`;
}

function syncWorkerApps(target: "admin" | "storefront") {
  const targetWorkerDir = path.join(ROOT_DIR, target === "admin" ? "nasrify-admin" : "nasrify-store");
  const targetAppsDir = path.join(targetWorkerDir, "apps");

  if (!fs.existsSync(targetAppsDir)) {
    fs.mkdirSync(targetAppsDir, { recursive: true });
  }

  const appFolders = fs.readdirSync(APPS_DIR).filter((f) => {
    const p = path.join(APPS_DIR, f);
    return fs.statSync(p).isDirectory() && !f.startsWith("_");
  });

  const excludedDirName = target === "admin" ? "storefront" : "admin";
  const excludeSet = new Set<string>([excludedDirName]);

  console.log(`[SyncApps] Syncing apps to ${target === "admin" ? "nasrify-admin" : "nasrify-store"} (Excluding: ${excludedDirName}/)...`);

  for (const appId of appFolders) {
    const srcAppDir = path.join(APPS_DIR, appId);
    const destAppDir = path.join(targetAppsDir, appId);

    // Clean destination app folder
    if (fs.existsSync(destAppDir)) {
      fs.rmSync(destAppDir, { recursive: true, force: true });
    }
    fs.mkdirSync(destAppDir, { recursive: true });

    // Copy with directory exclusion
    copyRecursive(srcAppDir, destAppDir, excludeSet);
    console.log(`  ✓ Synced ${appId} -> ${target} (isolated scope)`);
  }

  // Synchronize core lib/apps and components/apps
  const srcLibApps = path.join(ROOT_DIR, "lib", "apps");
  const destLibApps = path.join(targetWorkerDir, "lib", "apps");
  copyRecursive(srcLibApps, destLibApps, new Set());

  const srcComponentsApps = path.join(ROOT_DIR, "components", "apps");
  const destComponentsApps = path.join(targetWorkerDir, "components", "apps");
  if (fs.existsSync(destComponentsApps)) {
    fs.rmSync(destComponentsApps, { recursive: true, force: true });
  }
  fs.mkdirSync(destComponentsApps, { recursive: true });

  const compFiles = fs.readdirSync(srcComponentsApps);
  for (const compFile of compFiles) {
    if (target === "admin" && compFile.startsWith("Storefront")) {
      continue; // Exclude storefront components from admin worker
    }
    if (target === "storefront" && compFile.startsWith("Admin")) {
      continue; // Exclude admin components from storefront worker
    }
    fs.copyFileSync(
      path.join(srcComponentsApps, compFile),
      path.join(destComponentsApps, compFile)
    );
  }
  console.log(`  ✓ Synced components/apps -> ${target} (isolated scope)`);

  // Write worker-scoped loader.ts
  const destLoaderFile = path.join(destLibApps, "loader.ts");
  if (target === "admin") {
    fs.writeFileSync(destLoaderFile, generateAdminLoader(), "utf-8");
  } else {
    fs.writeFileSync(destLoaderFile, generateStorefrontLoader(), "utf-8");
  }
  console.log(`  ✓ Generated worker-scoped lib/apps/loader.ts for ${target}`);
}

if (targetArg === "all" || targetArg === "admin") {
  syncWorkerApps("admin");
}

if (targetArg === "all" || targetArg === "storefront") {
  syncWorkerApps("storefront");
}

console.log("[SyncApps] App synchronization complete!");
