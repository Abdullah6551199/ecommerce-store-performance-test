import React from "react";
import { getInstalledApps } from "@/lib/apps/installed";
import { getAllManifests } from "@/lib/apps/registry";
import { loadAppStorefrontComponent } from "@/lib/apps/loader";
import { AppErrorBoundary } from "./AppErrorBoundary";

export default async function StorefrontHeaderExtension(): Promise<React.JSX.Element | null> {
  const manifests = getAllManifests();
  const installed = await getInstalledApps();
  const enabledAppIds = new Set(installed.filter((i) => i.enabled).map((i) => i.id));

  const matching = manifests.filter(
    (m) => enabledAppIds.has(m.id) && m.extensionPoints.includes("storefront.header")
  );

  if (matching.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {matching.map((app) => {
        const Component = loadAppStorefrontComponent(app.id, "HeaderWidget");
        if (!Component) return null;
        return (
          <AppErrorBoundary key={app.id} appId={app.id} extensionPoint="storefront.header">
            <Component />
          </AppErrorBoundary>
        );
      })}
    </div>
  );
}
