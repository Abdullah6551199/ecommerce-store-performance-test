import { APP_PERMISSIONS, type AppPermission } from "@/types/apps";
import { getInstalledApp } from "./installed";

export const ALL_APP_PERMISSIONS: readonly AppPermission[] = APP_PERMISSIONS;

/**
 * Validate that an array of permission strings only contains known permissions
 */
export function validatePermissions(permissions: unknown): permissions is AppPermission[] {
  if (!Array.isArray(permissions)) return false;
  return permissions.every(
    (p) => typeof p === "string" && (APP_PERMISSIONS as readonly string[]).includes(p)
  );
}

/**
 * Verify that an installed, enabled app holds a specific permission
 */
export async function checkPermission(appId: string, permission: AppPermission): Promise<boolean> {
  const app = await getInstalledApp(appId);
  if (!app || !app.enabled) return false;

  if (!app.permissions) return false;

  try {
    const granted: string[] = JSON.parse(app.permissions);
    return Array.isArray(granted) && granted.includes(permission);
  } catch {
    return false;
  }
}
