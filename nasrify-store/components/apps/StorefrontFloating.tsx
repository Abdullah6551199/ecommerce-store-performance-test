import React from "react";
import { getInstalledApps } from "@/lib/apps/installed";
import { getAllManifests } from "@/lib/apps/registry";
import StorefrontFloatingClient from "./StorefrontFloatingClient";

/**
 * Server component for the storefront.floating extension point.
 * Checks installed & enabled apps with extensionPoint="storefront.floating"
 * and renders the client island container.
 */
export default async function StorefrontFloating(): Promise<React.JSX.Element | null> {
  try {
    const manifests = getAllManifests();
    const installed = await getInstalledApps();
    const enabledAppIds = installed.filter((i) => i.enabled).map((i) => i.id);
    const enabledAppSet = new Set(enabledAppIds);

    const matching = manifests.filter(
      (m) => enabledAppSet.has(m.id) && m.extensionPoints.includes("storefront.floating")
    );

    if (matching.length === 0) {
      return null;
    }

    return <StorefrontFloatingClient enabledAppIds={matching.map((m) => m.id)} />;
  } catch (err) {
    console.warn("[StorefrontFloating] Error checking installed apps:", err);
    return null;
  }
}
