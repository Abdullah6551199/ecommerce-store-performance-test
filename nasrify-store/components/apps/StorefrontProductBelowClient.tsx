"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppErrorBoundary } from "./AppErrorBoundary";

const ReviewsList = dynamic(() => import("@/apps/reviews/storefront/ReviewsList"), {
  ssr: false,
  loading: () => (
    <div className="rounded-3xl border border-purple-100 dark:border-purple-800/40 p-8 text-center bg-white dark:bg-[#3C0561]/40">
      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent dark:border-purple-300" />
      <p className="mt-2 text-xs text-purple-600 dark:text-purple-300 font-medium">Loading reviews...</p>
    </div>
  ),
});

const WhatsAppProductButton = dynamic(
  () => import("@/apps/whatsapp-order/storefront/WhatsAppProductButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

const WishlistButton = dynamic(
  () => import("@/apps/wishlist/storefront/WishlistButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

interface Props {
  productId?: string;
  enabledAppIds: string[];
}

export default function StorefrontProductBelowClient({
  productId,
  enabledAppIds,
}: Props): React.JSX.Element | null {
  const hasReviews = Boolean(productId && enabledAppIds.includes("reviews"));
  const hasWishlist = Boolean(productId && enabledAppIds.includes("wishlist"));

  if (!hasReviews && !hasWishlist) {
    return null;
  }

  return (
    <div className="w-full space-y-6 mt-8">
      {hasWishlist && (
        <div data-app="wishlist" className="w-full">
          <AppErrorBoundary appId="wishlist" extensionPoint="storefront.product.below">
            <WishlistButton productId={productId!} variant="detail" />
          </AppErrorBoundary>
        </div>
      )}
      {hasReviews && (
        <AppErrorBoundary appId="reviews" extensionPoint="storefront.product.below">
          <ReviewsList productId={productId!} />
        </AppErrorBoundary>
      )}
    </div>
  );
}
