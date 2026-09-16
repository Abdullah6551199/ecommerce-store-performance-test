"use client";

import React from "react";
import type { StorefrontProductBelowProps } from "@/types/apps";

/**
 * Example Storefront Component
 * Injected into storefront product page via "storefront.product.below" extension point.
 */
export default function ExampleBanner({ productId }: StorefrontProductBelowProps): React.JSX.Element {
  return (
    <div className="w-full rounded-2xl border border-purple-100 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/20 p-5 text-center space-y-1 my-4">
      <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">
        Template Storefront Banner
      </h4>
      <p className="text-xs text-purple-700 dark:text-purple-300">
        TODO: Customize this component for product {productId || "current"}.
      </p>
    </div>
  );
}
