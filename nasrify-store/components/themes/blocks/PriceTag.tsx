import React from "react";

export interface PriceTagProps {
  price: number;
  salePrice?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function PriceTag({
  price,
  salePrice,
  currency = "$",
  size = "md",
  className = "",
}: PriceTagProps) {
  const isOnSale = typeof salePrice === "number" && salePrice < price;
  const currentPrice = isOnSale ? salePrice : price;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm sm:text-base font-semibold",
    lg: "text-lg sm:text-xl font-bold",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span
        className={`${sizeClasses[size]} text-[var(--theme-text,#18181B)]`}
      >
        {currency}
        {currentPrice.toFixed(2)}
      </span>

      {isOnSale && (
        <span
          className={`line-through text-xs text-[var(--theme-text-muted,#71717A)]`}
        >
          {currency}
          {price.toFixed(2)}
        </span>
      )}
    </div>
  );
}
