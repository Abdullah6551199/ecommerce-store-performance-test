"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppErrorBoundary } from "./AppErrorBoundary";

const WhatsAppFloatingButton = dynamic(
  () => import("@/apps/whatsapp-order/storefront/WhatsAppFloatingButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

const CompareBar = dynamic(
  () => import("@/apps/compare/storefront/CompareBar"),
  {
    ssr: false,
    loading: () => null,
  }
);

const BroadcastPopup = dynamic(
  () => import("@/apps/broadcast/storefront/BroadcastPopup"),
  {
    ssr: false,
    loading: () => null,
  }
);

const CookieConsentBanner = dynamic(
  () => import("@/apps/cookie-consent/storefront/CookieConsentBanner"),
  {
    ssr: false,
    loading: () => null,
  }
);

const ScriptBlocker = dynamic(
  () => import("@/apps/cookie-consent/storefront/ScriptBlocker"),
  {
    ssr: false,
    loading: () => null,
  }
);

const ChatWidget = dynamic(
  () => import("@/apps/chatbot/storefront/ChatWidget"),
  {
    ssr: false,
    loading: () => null,
  }
);

interface Props {
  enabledAppIds: string[];
}

export default function StorefrontFloatingClient({
  enabledAppIds,
}: Props): React.JSX.Element | null {
  if (!enabledAppIds || enabledAppIds.length === 0) {
    return null;
  }

  const hasWhatsApp = enabledAppIds.includes("whatsapp-order");
  const hasCompare = enabledAppIds.includes("compare");
  const hasBroadcast = enabledAppIds.includes("broadcast");
  const hasCookieConsent = enabledAppIds.includes("cookie-consent");
  const hasChatbot = enabledAppIds.includes("chatbot");

  if (!hasWhatsApp && !hasCompare && !hasBroadcast && !hasCookieConsent && !hasChatbot) {
    return null;
  }

  return (
    <>
      {hasCompare && (
        <AppErrorBoundary appId="compare" extensionPoint="storefront.floating">
          <CompareBar />
        </AppErrorBoundary>
      )}
      {hasBroadcast && (
        <AppErrorBoundary appId="broadcast" extensionPoint="storefront.floating">
          <BroadcastPopup />
        </AppErrorBoundary>
      )}
      {hasCookieConsent && (
        <AppErrorBoundary appId="cookie-consent" extensionPoint="storefront.floating">
          <CookieConsentBanner />
          <ScriptBlocker />
        </AppErrorBoundary>
      )}
      {hasChatbot && (
        <AppErrorBoundary appId="chatbot" extensionPoint="storefront.floating">
          <ChatWidget />
        </AppErrorBoundary>
      )}
      {hasWhatsApp && (
        <div
          id="storefront-floating-container"
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto"
          aria-label="Floating actions"
        >
          <AppErrorBoundary appId="whatsapp-order" extensionPoint="storefront.floating">
            <WhatsAppFloatingButton />
          </AppErrorBoundary>
        </div>
      )}
    </>
  );
}
