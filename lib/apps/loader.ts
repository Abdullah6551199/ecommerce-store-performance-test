import React from "react";
import dynamic from "next/dynamic";

/**
 * Component Loader Registry for Apps
 * Pre-registered dynamic imports allow Next.js bundler to split app components
 * cleanly without relying on non-statically analyzable template strings.
 */
export const APP_ADMIN_COMPONENTS: Record<string, Record<string, React.ComponentType<any>>> = {
  "hello-world": {
    HelloWorldWidget: dynamic(() => import("@/apps/hello-world/admin/HelloWorldWidget")),
  },
  reviews: {
    ReviewsManager: dynamic(() => import("@/apps/reviews/admin/ReviewsManager")),
  },
  "whatsapp-order": {
    WhatsAppSettings: dynamic(() => import("@/apps/whatsapp-order/admin/WhatsAppSettings")),
    WhatsAppStatsWidget: dynamic(() => import("@/apps/whatsapp-order/admin/WhatsAppStatsWidget")),
  },
  compare: {
    CompareSettings: dynamic(() => import("@/apps/compare/admin/CompareSettings")),
  },
  bundles: {
    BundlesManager: dynamic(() => import("@/apps/bundles/admin/BundlesManager")),
  },
  "order-tracking": {
    OrderTrackingSettings: dynamic(() => import("@/apps/order-tracking/admin/OrderTrackingSettings")),
  },
  broadcast: {
    BroadcastManager: dynamic(() => import("@/apps/broadcast/admin/BroadcastManager")),
  },
  "trust-badges": {
    TrustBadgesManager: dynamic(() => import("@/apps/trust-badges/admin/TrustBadgesManager")),
  },
  "cookie-consent": {
    CookieConsentManager: dynamic(() => import("@/apps/cookie-consent/admin/CookieConsentManager")),
  },
  "digital-products": {
    DigitalProductsManager: dynamic(() => import("@/apps/digital-products/admin/DigitalProductsManager")),
    DigitalProductUploader: dynamic(() => import("@/apps/digital-products/admin/DigitalProductUploader")),
    DigitalStatsWidget: dynamic(() => import("@/apps/digital-products/admin/DigitalStatsWidget")),
  },
  coupons: {
    CouponsManager: dynamic(() => import("@/apps/coupons/admin/CouponsManager")),
    CouponsDashboardWidget: dynamic(() => import("@/apps/coupons/admin/CouponsDashboardWidget")),
    DashboardWidget: dynamic(() => import("@/apps/coupons/admin/CouponsDashboardWidget")),
  },
  "product-qa": {
    ProductQAManager: dynamic(() => import("@/apps/product-qa/admin/ProductQAManager")),
    QADashboardWidget: dynamic(() => import("@/apps/product-qa/admin/QADashboardWidget")),
    DashboardWidget: dynamic(() => import("@/apps/product-qa/admin/QADashboardWidget")),
  },
  "ai-review-generator": {
    AIGeneratorPanel: dynamic(() => import("@/apps/ai-review-generator/admin/AIGeneratorPanel").then((m) => m.AIGeneratorPanel)),
    AIDashboardWidget: dynamic(() => import("@/apps/ai-review-generator/admin/AIDashboardWidget").then((m) => m.AIDashboardWidget)),
    DashboardWidget: dynamic(() => import("@/apps/ai-review-generator/admin/AIDashboardWidget").then((m) => m.AIDashboardWidget)),
  },
  chatbot: {
    ChatbotSettings: dynamic(() => import("@/apps/chatbot/admin/ChatbotSettings")),
    ChatbotDashboardWidget: dynamic(() => import("@/apps/chatbot/admin/ChatbotDashboardWidget")),
    DashboardWidget: dynamic(() => import("@/apps/chatbot/admin/ChatbotDashboardWidget")),
  },
};

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
  "trust-badges": {
    TrustBadgesRow: dynamic(() => import("@/apps/trust-badges/storefront/TrustBadgesRow")),
    PaymentIconsRow: dynamic(() => import("@/apps/trust-badges/storefront/PaymentIconsRow")),
  },
  "cookie-consent": {
    CookieConsentBanner: dynamic(() => import("@/apps/cookie-consent/storefront/CookieConsentBanner")),
    CookieCustomizeModal: dynamic(() => import("@/apps/cookie-consent/storefront/CookieCustomizeModal")),
    ScriptBlocker: dynamic(() => import("@/apps/cookie-consent/storefront/ScriptBlocker")),
  },
  "digital-products": {
    DownloadButton: dynamic(() => import("@/apps/digital-products/storefront/DownloadButton")),
    MyDownloadsPage: dynamic(() => import("@/apps/digital-products/storefront/MyDownloadsPage")),
    DigitalProductBadge: dynamic(() => import("@/apps/digital-products/storefront/DigitalProductBadge")),
  },
  coupons: {
    CouponInput: dynamic(() => import("@/apps/coupons/storefront/CouponInput")),
    CouponBadge: dynamic(() => import("@/apps/coupons/storefront/CouponBadge")),
  },
  "product-qa": {
    ProductQASection: dynamic(() => import("@/apps/product-qa/storefront/ProductQASection")),
  },
  chatbot: {
    ChatWidget: dynamic(() => import("@/apps/chatbot/storefront/ChatWidget")),
    ChatWindow: dynamic(() => import("@/apps/chatbot/storefront/ChatWindow")),
  },
};

export function loadAppAdminComponent(
  appId: string,
  componentName: string
): React.ComponentType<any> | null {
  return APP_ADMIN_COMPONENTS[appId]?.[componentName] || null;
}

export function loadAppStorefrontComponent(
  appId: string,
  componentName: string
): React.ComponentType<any> | null {
  return APP_STOREFRONT_COMPONENTS[appId]?.[componentName] || null;
}
