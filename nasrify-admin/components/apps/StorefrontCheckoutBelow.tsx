import React from "react";
import { getInstalledApps } from "@/lib/apps/installed";
import { getAllManifests } from "@/lib/apps/registry";
import { loadAppStorefrontComponent } from "@/lib/apps/loader";
import { AppErrorBoundary } from "./AppErrorBoundary";

export default async function StorefrontCheckoutBelow(): Promise<React.JSX.Element | null> {
  const manifests = getAllManifests();
  const installed = await getInstalledApps();
  const enabledAppIds = new Set(installed.filter((i) => i.enabled).map((i) => i.id));

  const matching = manifests.filter(
    (m) => enabledAppIds.has(m.id) && m.extensionPoints.includes("storefront.checkout.below")
  );

  if (matching.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4 mt-6">
      {matching.map((app) => {
        const Component = loadAppStorefrontComponent(app.id, "CheckoutBelowWidget");
        if (!Component) return null;
        return (
          <AppErrorBoundary key={app.id} appId={app.id} extensionPoint="storefront.checkout.below">
            <Component />
          </AppErrorBoundary>
        );
      })}
    </div>
  );
}
