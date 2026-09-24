"use client";

import React, { useState } from "react";
import { SectionProps } from "@/lib/themes/types";
import ProductCard from "../blocks/ProductCard";
import Button from "../blocks/Button";

export interface CategoryGridSettings {
  columns?: number;
  per_page?: number;
  show_pagination?: boolean;
  card_variant?: "standard" | "compact" | "minimal";
}

export default function CategoryGrid({
  settings = {},
  storeData,
}: SectionProps<CategoryGridSettings>) {
  const columns = settings.columns || 3;
  const perPage = settings.per_page || 9;
  const showPagination = settings.show_pagination !== false;
  const cardVariant = settings.card_variant || "standard";

  const [page, setPage] = useState(1);

  const fallbackProducts = [
    {
      id: "cg-1",
      name: "Aerodynamic Office Chair",
      price: 299.0,
      salePrice: 249.0,
      imageUrl: "https://images.unsplash.com/photo-1580481077195-c3f8ed458899?q=80&w=800&auto=format&fit=crop",
      rating: 4.8,
    },
    {
      id: "cg-2",
      name: "Minimalist Solid Oak Desk",
      price: 549.0,
      imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop",
      rating: 4.9,
    },
    {
      id: "cg-3",
      name: "Architectural Task Lamp",
      price: 119.0,
      salePrice: 99.0,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
      rating: 4.7,
    },
    {
      id: "cg-4",
      name: "Leather Desktop Organizer",
      price: 45.0,
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop",
      rating: 4.6,
    },
    {
      id: "cg-5",
      name: "Noise Isolating Acoustic Panels",
      price: 140.0,
      imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop",
      rating: 4.9,
    },
    {
      id: "cg-6",
      name: "Curved Ultrawide Monitor Stand",
      price: 85.0,
      salePrice: 69.0,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop",
      rating: 4.7,
    },
  ];

  const products = (storeData?.products && storeData.products.length > 0)
    ? storeData.products
    : fallbackProducts;

  const totalPages = Math.ceil(products.length / perPage) || 1;
  const paginated = products.slice((page - 1) * perPage, page * perPage);

  const colClasses: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  const gridClass = colClasses[columns] || colClasses[3];

  return (
    <div className="w-full font-[family-name:var(--theme-font-body)]">
      {/* Product Grid */}
      <div className={`grid gap-4 sm:gap-6 ${gridClass}`}>
        {paginated.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={cardVariant}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              type="button"
              onClick={() => setPage(i + 1)}
              style={{
                borderRadius: "var(--theme-radius, 8px)",
                backgroundColor:
                  page === i + 1
                    ? "var(--theme-primary, #25D366)"
                    : "var(--theme-surface, #F4F4F5)",
                color: page === i + 1 ? "#FFFFFF" : "var(--theme-text, #18181B)",
              }}
              className="w-8 h-8 text-xs font-semibold cursor-pointer transition-colors"
            >
              {i + 1}
            </button>
          ))}

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
