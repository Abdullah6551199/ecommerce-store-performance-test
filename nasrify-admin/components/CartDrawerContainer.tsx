"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useCart } from "./CartContext";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });

/**
 * Isolated Client Island that conditionally loads CartDrawer on first open,
 * and maintains mounting across subsequent actions to eliminate flicker/remounting.
 */
export default function CartDrawerContainer(): React.JSX.Element | null {
  const { isDrawerOpen } = useCart();
  const [hasMountedOnce, setHasMountedOnce] = useState(false);

  useEffect(() => {
    if (isDrawerOpen) {
      setHasMountedOnce(true);
    }
  }, [isDrawerOpen]);

  // Keep unmounted until user first interacts with cart to preserve initial page load performance.
  // Once opened, keep mounted permanently so closing/re-opening/adding items never causes DOM re-mount flicker.
  if (!hasMountedOnce && !isDrawerOpen) {
    return null;
  }

  return <CartDrawer key="cart-drawer-stable" />;
}
