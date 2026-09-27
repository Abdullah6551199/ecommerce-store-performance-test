import React from "react";
import { EditableComponent } from "../EditableComponent";

export interface ProductPriceProps {
  id?: string;
  sectionId?: string;
  settings?: {
    price?: number;
    compare_at_price?: number;
    currency?: string;
  };
}

export function ProductPrice({
  id = "product_price",
  sectionId,
  settings = {},
}: ProductPriceProps) {
  const price = settings.price ?? 129;
  const compareAt = settings.compare_at_price ?? 169;
  const currency = settings.currency || "$";

  const onSale = compareAt > price;
  const discountPercent = onSale ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  return (
    <EditableComponent
      id={id}
      type="product_price"
      sectionId={sectionId}
      className="flex items-center gap-3 my-2"
    >
      <span className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text,#18181B)] tracking-tight">
        {currency}
        {price.toFixed(2)}
      </span>
      {onSale && (
        <>
          <span className="text-base text-[var(--theme-text-muted,#71717A)] line-through">
            {currency}
            {compareAt.toFixed(2)}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold">
            Save {discountPercent}%
          </span>
        </>
      )}
    </EditableComponent>
  );
}

export default ProductPrice;
