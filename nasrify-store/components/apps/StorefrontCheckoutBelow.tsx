"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppErrorBoundary } from "./AppErrorBoundary";

const CheckoutOrderButton = dynamic(
  () => import("@/apps/whatsapp-order/storefront/CheckoutOrderButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Extension Point Container: storefront.checkout.below
 * Renders third-party actions directly below the final Place Order button.
 */
export default function StorefrontCheckoutBelow(): React.JSX.Element | null {
  return (
    <div
      id="storefront-checkout-below-container"
      data-extension-point="storefront.checkout.below"
      className="w-full"
    >
      <AppErrorBoundary appId="whatsapp-order" extensionPoint="storefront.checkout.below">
        <CheckoutOrderButton />
      </AppErrorBoundary>
    </div>
  );
}
