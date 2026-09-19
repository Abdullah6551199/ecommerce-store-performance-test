import React from "react";
import FeaturedBundles from "@/apps/bundles/storefront/FeaturedBundles";
import type { BundleWithItems } from "@/apps/bundles/shared/types";

interface FeaturedBundlesSectionProps {
  bundles: BundleWithItems[];
}

export default function FeaturedBundlesSection({
  bundles,
}: FeaturedBundlesSectionProps): React.JSX.Element | null {
  return <FeaturedBundles bundles={bundles} />;
}
