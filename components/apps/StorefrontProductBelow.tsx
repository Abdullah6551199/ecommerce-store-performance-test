import React from "react";
import { getInstalledApps } from "@/lib/apps/installed";
import { getAllManifests } from "@/lib/apps/registry";
import { loadAppStorefrontComponent } from "@/lib/apps/loader";
import { AppErrorBoundary } from "./AppErrorBoundary";

interface Props {
  productId?: string;
}

export default async function StorefrontProductBelow({ productId }: Props): Promise<React.JSX.Element | null> {
  const manifests = getAllManifests();
  const installed = await getInstalledApps();
  const enabledAppIds = new Set(installed.filter((i) => i.enabled).map((i) => i.id));

  const matching = manifests.filter(
    (m) => enabledAppIds.has(m.id) && m.extensionPoints.includes("storefront.product.below")
  );

  if (matching.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6 mt-8">
      {matching.map((app) => {
        const Component = loadAppStorefrontComponent(app.id, "ProductBelowWidget");
        if (!Component) return null;
        return (
          <AppErrorBoundary key={app.id} appId={app.id} extensionPoint="storefront.product.below">
            <Component productId={productId} />
          </AppErrorBoundary>
        );
      })}
    </div>
  );
}
