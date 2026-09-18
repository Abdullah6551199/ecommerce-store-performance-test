import React from "react";
import { getInstalledApps } from "@/lib/apps/installed";
import { getAllManifests } from "@/lib/apps/registry";
import StorefrontProductBelowClient from "./StorefrontProductBelowClient";

interface Props {
  productId?: string;
}

export default async function StorefrontProductBelow({ productId }: Props): Promise<React.JSX.Element | null> {
  const manifests = getAllManifests();
  const installed = await getInstalledApps();
  const enabledAppIds = installed.filter((i) => i.enabled).map((i) => i.id);
  const enabledAppSet = new Set(enabledAppIds);

  const matching = manifests.filter(
    (m) => enabledAppSet.has(m.id) && m.extensionPoints.includes("storefront.product.below")
  );

  if (matching.length === 0) {
    return null;
  }

  return (
    <div
      id="storefront-product-below-container"
      data-extension-point="storefront.product.below"
      className="w-full"
    >
      <StorefrontProductBelowClient
        productId={productId}
        enabledAppIds={matching.map((m) => m.id)}
      />
    </div>
  );
}
