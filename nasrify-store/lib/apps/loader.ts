import React from "react";
import dynamic from "next/dynamic";

/**
 * Component Loader Registry for Storefront Worker
 * Pre-registered dynamic imports for storefront extension components.
 */
export const APP_STOREFRONT_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  "hello-world": {
    HelloWorldBanner: dynamic(() => import("@/apps/hello-world/storefront/HelloWorldBanner")),
  },
  reviews: {
    ReviewsList: dynamic(() => import("@/apps/reviews/storefront/ReviewsList")),
  },
  "whatsapp-order": {
    WhatsAppFloatingButton: dynamic(() => import("@/apps/whatsapp-order/storefront/WhatsAppFloatingButton")),
    WhatsAppProductButton: dynamic(() => import("@/apps/whatsapp-order/storefront/WhatsAppProductButton")),
    CartOrderButton: dynamic(() => import("@/apps/whatsapp-order/storefront/CartOrderButton")),
    CheckoutOrderButton: dynamic(() => import("@/apps/whatsapp-order/storefront/CheckoutOrderButton")),
  },
  wishlist: {
    WishlistButton: dynamic(() => import("@/apps/wishlist/storefront/WishlistButton")),
    WishlistPage: dynamic(() => import("@/apps/wishlist/storefront/WishlistPage")),
    WishlistHeaderIcon: dynamic(() => import("@/apps/wishlist/storefront/WishlistHeaderIcon")),
  },
  compare: {
    CompareButton: dynamic(() => import("@/apps/compare/storefront/CompareButton")),
    CompareBar: dynamic(() => import("@/apps/compare/storefront/CompareBar")),
    ComparePage: dynamic(() => import("@/apps/compare/storefront/ComparePage")),
  },
  bundles: {
    BundleCard: dynamic(() => import("@/apps/bundles/storefront/BundleCard")),
    FeaturedBundles: dynamic(() => import("@/apps/bundles/storefront/FeaturedBundles")),
    BundleCrossSell: dynamic(() => import("@/apps/bundles/storefront/BundleCrossSell")),
  },
  "order-tracking": {
    TrackOrderPage: dynamic(() => import("@/apps/order-tracking/storefront/TrackOrderPage")),
    OrderTimeline: dynamic(() => import("@/apps/order-tracking/storefront/OrderTimeline")),
  },
  broadcast: {
    BroadcastPopup: dynamic(() => import("@/apps/broadcast/storefront/BroadcastPopup")),
  },
};

export function loadAdminAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  // Admin components are not included in the storefront worker
  return null;
}

export function loadStorefrontAppComponent(
  appId?: string,
  componentName?: string
): React.ComponentType<any> | null {
  if (!appId || !componentName) return null;
  return APP_STOREFRONT_COMPONENTS[appId]?.[componentName] || null;
}

// Backwards-compatibility aliases
export const loadAppAdminComponent = loadAdminAppComponent;
export const loadAppStorefrontComponent = loadStorefrontAppComponent;
