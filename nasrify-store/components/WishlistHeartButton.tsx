"use client";

import React from "react";
import WishlistButton from "@/apps/wishlist/storefront/WishlistButton";

interface WishlistHeartButtonProps {
  product: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    salePrice?: number | null;
    imageUrl?: string | null;
  };
  className?: string;
}

export default function WishlistHeartButton({
  product,
  className = "",
}: WishlistHeartButtonProps): React.JSX.Element | null {
  return (
    <WishlistButton
      productId={product.productId}
      productSlug={product.slug}
      productName={product.name}
      price={product.price}
      salePrice={product.salePrice}
      imageUrl={product.imageUrl}
      className={className}
      variant="card"
    />
  );
}
