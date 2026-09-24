"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { normalizeImageUrl } from "@/lib/utils";
import { useCart } from "@/components/CartContext";

interface MobileStickyCartBarProps {
  productId: string;
  productName: string;
  price: number;
  salePrice: number | null;
  mainImage: string | null;
  stockStatus: string;
}

export default function MobileStickyCartBar({
  productId,
  productName,
  price,
  salePrice,
  mainImage,
  stockStatus,
}: MobileStickyCartBarProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const isOutOfStock = stockStatus === "out_of_stock";
  const effectivePrice = salePrice && salePrice < price ? salePrice : price;
  const imageUrl = normalizeImageUrl(mainImage, { width: 120, quality: 75 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      // Trigger when scrolled past 480px on small screens
      if (window.innerWidth < 640) {
        setIsVisible(window.scrollY > 420);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(productId, null, 1, {
        productName,
        price: Number(effectivePrice),
        openOnSuccess: true,
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Sticky Add to Cart Bar"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md border-t border-[#E4E4E7] dark:border-zinc-700 px-4 py-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {imageUrl ? (
          <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-[#E4E4E7] dark:border-zinc-700/60 bg-[#F4F4F5]">
            <Image src={imageUrl} alt={productName} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-xl bg-[#DCFCE7] dark:bg-[#18181B]/40 flex items-center justify-center text-xs font-bold text-[#25D366]">
            AP
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-[#18181B] dark:text-[#DCFCE7] truncate">
            {productName}
          </h3>
          <p className="text-sm font-black text-[#25D366] dark:text-zinc-400">
            ${effectivePrice.toFixed(2)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding}
        className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#25D366] disabled:opacity-40 transition-all shadow-md shadow-[#25D366]/20 active:scale-95 cursor-pointer"
      >
        {isAdding ? "Adding..." : isOutOfStock ? "Sold Out" : "Add to Cart"}
      </button>
    </div>
  );
}
