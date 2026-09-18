"use client";

import React from "react";
import WishlistHeaderIcon from "@/apps/wishlist/storefront/WishlistHeaderIcon";

/**
 * Isolated Client Island for Wishlist trigger & badge in Header.
 * Gated by Wishlist app installation and configuration.
 */
export default function WishlistNavButton(): React.JSX.Element | null {
  return <WishlistHeaderIcon />;
}
