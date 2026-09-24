"use client";

import React from "react";
import { SectionProps } from "@/lib/themes/types";
import ProductCard from "../blocks/ProductCard";

export interface ProductRelatedSettings {
  heading?: string;
  max_products?: number;
  columns?: number;
}

export default function ProductRelated({
  variant = "grid",
  settings = {},
  storeData,
}: SectionProps<ProductRelatedSettings>) {
  const heading = settings.heading || "Related Products";
  const maxProducts = settings.max_products || 4;
  const columns = settings.columns || 4;

  const currentProductId = storeData?.product?.id;
  const allProducts = storeData?.products || [
    {
      id: "rel-1",
      name: "Ergonomic Desk Mat",
      price: 49.0,
      salePrice: 39.0,
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop",
      rating: 4.9,
    },
    {
      id: "rel-2",
      name: "Wireless Charging Dock",
      price: 89.0,
      imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800&auto=format&fit=crop",
      rating: 4.7,
    },
    {
      id: "rel-3",
      name: "Minimalist Aluminum Laptop Stand",
      price: 65.0,
      salePrice: 55.0,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop",
      rating: 4.8,
    },
    {
      id: "rel-4",
      name: "Smart Ambient LED Lightbar",
      price: 79.0,
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      rating: 4.6,
    },
  ];

  const filtered = allProducts
    .filter((p: any) => p.id !== currentProductId)
    .slice(0, maxProducts);

  const colClasses: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  const gridClass = colClasses[columns] || colClasses[4];

  return (
    <div className="w-full my-12 pt-8 border-t border-[var(--theme-border,#E4E4E7)] font-[family-name:var(--theme-font-body)]">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--theme-text,#18181B)] font-[family-name:var(--theme-font-heading)]">
          {heading}
        </h2>
      </div>

      {variant === "carousel" ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {filtered.map((prod: any) => (
            <div key={prod.id} className="w-60 shrink-0">
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
          {filtered.map((prod: any) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
