"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppErrorBoundary } from "./AppErrorBoundary";

const CartOrderButton = dynamic(
  () => import("@/apps/whatsapp-order/storefront/CartOrderButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Extension Point Container: storefront.cart.below
 * Renders third-party actions directly below the Cart Checkout button.
 */
export default function StorefrontCartBelow(): React.JSX.Element | null {
  return (
    <div
      id="storefront-cart-below-container"
      data-extension-point="storefront.cart.below"
      className="w-full"
    >
      <AppErrorBoundary appId="whatsapp-order" extensionPoint="storefront.cart.below">
        <CartOrderButton />
      </AppErrorBoundary>
    </div>
  );
}
