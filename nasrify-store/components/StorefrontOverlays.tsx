"use client";

import React from "react";
import dynamic from "next/dynamic";

const CartDrawerContainer = dynamic(() => import("@/components/CartDrawerContainer"), { ssr: false });
const CookieConsentBanner = dynamic(() => import("@/components/CookieConsentBanner"), { ssr: false });
const ScriptBlocker = dynamic(() => import("@/components/ScriptBlocker"), { ssr: false });

export default function StorefrontOverlays(): React.JSX.Element {
  return (
    <>
      {/* Global Cart Slide-Over Drawer (Loaded on demand) */}
      <CartDrawerContainer />
      {/* GDPR Cookie Consent Banner */}
      <CookieConsentBanner />
      {/* GDPR Third-Party Script Telemetry Blocker */}
      <ScriptBlocker />
    </>
  );
}
