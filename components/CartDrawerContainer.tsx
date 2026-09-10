"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useCart } from "./CartContext";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });

/**
 * Isolated Client Island that conditionally loads CartDrawer ONLY when opened.
 * Keeps CartDrawer completely out of the initial page scripts and critical path.
 */
export default function CartDrawerContainer(): React.JSX.Element | null {
  const { isDrawerOpen } = useCart();

  if (!isDrawerOpen) {
    return null;
  }

  return <CartDrawer />;
}
