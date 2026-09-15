import { z } from "zod";

/**
 * ==============================================================================
 * Apps Framework - Types and Schemas (Stage C)
 * ==============================================================================
 */

export const APP_PERMISSIONS = [
  "read:products",
  "write:products",
  "read:orders",
  "write:orders",
  "read:customers",
  "write:customers",
  "read:settings",
  "write:settings",
  "read:media",
  "write:media",
  "read:analytics",
] as const;

export type AppPermission = (typeof APP_PERMISSIONS)[number];

export const APP_EXTENSION_POINTS = [
  "admin.sidebar",
  "admin.dashboard.widget",
  "admin.route",
  "storefront.product.below",
  "storefront.homepage.section",
  "storefront.cart.below",
  "storefront.checkout.below",
  "storefront.header",
  "storefront.footer",
] as const;

export type AppExtensionPoint = (typeof APP_EXTENSION_POINTS)[number];

export interface AppManifest {
  id: string; // unique, kebab-case, e.g. "hello-world"
  name: string; // display name
  version: string; // semver
  description: string;
  author: string;
  authorUrl?: string;
  icon: string; // path to svg inside app folder
  pricing: "free" | "paid";
  price?: number; // only if paid
  category: string; // e.g. "marketing", "sales", "tools"
  permissions: AppPermission[];
  extensionPoints: AppExtensionPoint[];
  databaseTables?: string[]; // app-owned tables (prefix: app_<id>_)
  settingsSchema?: Record<string, unknown>; // optional JSON schema for app settings
  changelog?: string;
}

export const AppManifestSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "App ID must be lowercase alphanumeric with hyphens (kebab-case)",
    }),
  name: z.string().min(1).max(100),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?$/, {
      message: "Version must be a valid semver string (e.g. 1.0.0)",
    }),
  description: z.string().min(1).max(500),
  author: z.string().min(1).max(100),
  authorUrl: z.string().url().optional().or(z.literal("")),
  icon: z.string().min(1),
  pricing: z.enum(["free", "paid"]),
  price: z.number().nonnegative().optional(),
  category: z.string().min(1).max(50),
  permissions: z.array(z.enum(APP_PERMISSIONS)),
  extensionPoints: z.array(z.enum(APP_EXTENSION_POINTS)),
  databaseTables: z.array(z.string()).optional(),
  settingsSchema: z.record(z.string(), z.unknown()).optional(),
  changelog: z.string().optional(),
});

export interface InstalledAppRecord {
  id: string;
  version: string;
  enabled: boolean | number;
  installedAt: number;
  updatedAt: number;
  settings?: string | null;
  permissions?: string | null;
  installedBy?: string | null;
}

export type AppInstallAction = "install" | "uninstall" | "enable" | "disable" | "update";

export interface AppInstallLogRecord {
  id: number;
  appId: string;
  action: AppInstallAction;
  performedAt: number;
  performedBy?: string | null;
  notes?: string | null;
}

export interface AppSummary extends AppManifest {
  installed: boolean;
  enabled: boolean;
  installedVersion?: string;
  installedAt?: number;
  updatedAt?: number;
}
