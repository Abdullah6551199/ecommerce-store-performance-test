"use client";

import React from "react";
import dynamic from "next/dynamic";

const CartDrawerContainer = dynamic(() => import("@/components/CartDrawerContainer"), { ssr: false });

export default function StorefrontOverlays(): React.JSX.Element {
  return (
    <>
      {/* Global Cart Slide-Over Drawer (Loaded on demand) */}
      <CartDrawerContainer />
    </>
  );
}
