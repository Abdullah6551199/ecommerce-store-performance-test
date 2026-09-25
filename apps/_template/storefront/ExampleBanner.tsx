"use client";

import React from "react";
import type { StorefrontProductBelowProps } from "@/types/apps";

/**
 * Example Storefront Component
 * Injected into storefront product page via "storefront.product.below" extension point.
 */
export default function ExampleBanner({ productId }: StorefrontProductBelowProps): React.JSX.Element {
  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-5 text-center space-y-1 my-4">
      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
        Template Storefront Banner
      </h4>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        TODO: Customize this component for product {productId || "current"}.
      </p>
    </div>
  );
}
