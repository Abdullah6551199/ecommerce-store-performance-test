import React from "react";
import BundleCrossSell from "@/apps/bundles/storefront/BundleCrossSell";
import type { BundleWithItems } from "@/apps/bundles/shared/types";

interface ProductBundleCrossSellProps {
  bundles: BundleWithItems[];
}

export default function ProductBundleCrossSell({
  bundles,
}: ProductBundleCrossSellProps): React.JSX.Element | null {
  return <BundleCrossSell bundles={bundles} />;
}
