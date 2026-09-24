"use client";

import React, { useState, useMemo } from "react";
import ProductReviewsSection from "@/components/reviews/ProductReviewsSection";
import type { ProductWithImagesAndCategory } from "@/lib/products";

interface ProductTabsProps {
  product: ProductWithImagesAndCategory;
  reviewCount?: number;
  initialTab?: "description" | "specs" | "reviews" | "shipping";
}

export default function ProductTabs({
  product,
  reviewCount = 0,
  initialTab = "description",
}: ProductTabsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews" | "shipping">(initialTab);

  // Dynamic delivery date: 5 days from now
  const estimatedDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Specifications key-value pairs
  const specifications = useMemo(() => {
    const specs: Array<{ key: string; value: string }> = [
      { key: "SKU", value: product.sku },
      { key: "Product Name", value: product.name },
      { key: "Brand", value: product.brand || "Apex Athletics" },
      { key: "Category", value: product.categoryName || "Athletic Gear" },
      { key: "Stock Status", value: product.stockStatus === "in_stock" ? "In Stock" : "Limited Availability" },
    ];

    if (product.variants && product.variants.length > 0) {
      specs.push({ key: "Variant Options", value: `${product.variants.length} available configurations` });
    }

    specs.push(
      { key: "Warranty", value: "1-Year Full Manufacturer Guarantee" },
      { key: "Country of Origin", value: "Engineered & Assembled in EU / USA" },
      { key: "Returns Policy", value: "30-Day Hassle-Free Return Guarantee" }
    );

    return specs;
  }, [product]);

  return (
    <div
      id="product-tabs"
      className="rounded-3xl border border-[#E4E4E7] dark:border-zinc-700 bg-white dark:bg-[#18181B] shadow-lg shadow-[#25D366]/20 dark:shadow-[#25D366]/20 overflow-hidden"
    >
      {/* Tab Navigation Header */}
      <div className="flex border-b border-[#E4E4E7] dark:border-zinc-700 overflow-x-auto scrollbar-none bg-[#F4F4F5]/40 dark:bg-[#18181B]/20 px-4 sm:px-8">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`py-4 sm:py-5 px-4 sm:px-6 text-sm sm:text-base font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "description"
              ? "border-[#25D366] text-[#25D366] dark:text-[#DCFCE7]"
              : "border-transparent text-[#1EA855]/60 dark:text-zinc-300/60 hover:text-[#25D366] dark:hover:text-zinc-200"
          }`}
        >
          Description
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`py-4 sm:py-5 px-4 sm:px-6 text-sm sm:text-base font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "specs"
              ? "border-[#25D366] text-[#25D366] dark:text-[#DCFCE7]"
              : "border-transparent text-[#1EA855]/60 dark:text-zinc-300/60 hover:text-[#25D366] dark:hover:text-zinc-200"
          }`}
        >
          Specifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`py-4 sm:py-5 px-4 sm:px-6 text-sm sm:text-base font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "reviews"
              ? "border-[#25D366] text-[#25D366] dark:text-[#DCFCE7]"
              : "border-transparent text-[#1EA855]/60 dark:text-zinc-300/60 hover:text-[#25D366] dark:hover:text-zinc-200"
          }`}
        >
          <span>Reviews</span>
          <span className="rounded-full bg-[#DCFCE7] dark:bg-[#18181B]/60 px-2 py-0.5 text-xs font-bold text-[#1EA855] dark:text-zinc-300">
            {reviewCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("shipping")}
          className={`py-4 sm:py-5 px-4 sm:px-6 text-sm sm:text-base font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "shipping"
              ? "border-[#25D366] text-[#25D366] dark:text-[#DCFCE7]"
              : "border-transparent text-[#1EA855]/60 dark:text-zinc-300/60 hover:text-[#25D366] dark:hover:text-zinc-200"
          }`}
        >
          Shipping & Returns
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="p-6 sm:p-10">
        {/* TAB 1: DESCRIPTION */}
        {activeTab === "description" && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <h3 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#DCFCE7]">
              About {product.name}
            </h3>

            {product.description ? (
              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-[#15803D]/90 dark:text-zinc-200/90 whitespace-pre-line leading-relaxed">
                {product.description}
              </div>
            ) : product.shortDescription ? (
              <p className="text-sm sm:text-base text-[#15803D]/90 dark:text-zinc-200/90 leading-relaxed">
                {product.shortDescription}
              </p>
            ) : (
              <p className="text-sm text-zinc-400 italic">
                No extended description available for this item.
              </p>
            )}

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E4E4E7] dark:border-zinc-800/40">
              <div className="p-4 rounded-2xl bg-[#F4F4F5]/50 dark:bg-[#18181B]/30 border border-[#E4E4E7] dark:border-zinc-800/50 space-y-2">
                <span className="text-2xl">⚡</span>
                <h4 className="text-sm font-bold text-[#18181B] dark:text-white">Precision Engineering</h4>
                <p className="text-xs text-[#1EA855] dark:text-zinc-300 leading-relaxed">
                  Crafted using aerospace-grade composite matrices for high energy return and zero structural fatigue.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F4F5]/50 dark:bg-[#18181B]/30 border border-[#E4E4E7] dark:border-zinc-800/50 space-y-2">
                <span className="text-2xl">🌱</span>
                <h4 className="text-sm font-bold text-[#18181B] dark:text-white">Sustainable Materials</h4>
                <p className="text-xs text-[#1EA855] dark:text-zinc-300 leading-relaxed">
                  Engineered with 45% post-consumer recycled technical polymers and non-toxic dyes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F4F5]/50 dark:bg-[#18181B]/30 border border-[#E4E4E7] dark:border-zinc-800/50 space-y-2">
                <span className="text-2xl">🛡️</span>
                <h4 className="text-sm font-bold text-[#18181B] dark:text-white">Lab & Athlete Tested</h4>
                <p className="text-xs text-[#1EA855] dark:text-zinc-300 leading-relaxed">
                  Field validated across 1,000+ hours of endurance load testing in all weather conditions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPECIFICATIONS */}
        {activeTab === "specs" && (
          <div className="space-y-6 text-left animate-in fade-in duration-150 max-w-4xl">
            <h3 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#DCFCE7]">
              Technical Specifications
            </h3>

            <div className="rounded-2xl border border-[#E4E4E7] dark:border-zinc-700 overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {specifications.map((spec, idx) => (
                    <tr
                      key={idx}
                      className="even:bg-[#F4F4F5]/50 dark:even:bg-[#18181B]/20 border-b border-[#E4E4E7]/60 dark:border-zinc-800/30 last:border-b-0"
                    >
                      <td className="py-3.5 px-5 font-bold text-[#18181B] dark:text-[#DCFCE7] w-1/3 sm:w-1/4">
                        {spec.key}
                      </td>
                      <td className="py-3.5 px-5 text-[#15803D] dark:text-zinc-300">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === "reviews" && (
          <div id="customer-reviews" className="animate-in fade-in duration-150">
            <ProductReviewsSection productId={product.id} productName={product.name} />
          </div>
        )}

        {/* TAB 4: SHIPPING & RETURNS */}
        {activeTab === "shipping" && (
          <div className="space-y-8 text-left animate-in fade-in duration-150 max-w-3xl">
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#DCFCE7]">
                Shipping & Delivery
              </h3>
              <p className="text-sm text-[#1EA855] dark:text-zinc-300 leading-relaxed">
                All domestic orders are processed and dispatched within 24 hours of order placement.
              </p>

              <div className="p-4 rounded-2xl bg-[#F4F4F5]/60 dark:bg-[#18181B]/40 border border-[#E4E4E7] dark:border-zinc-800/60 flex items-center gap-4">
                <span className="text-3xl">📦</span>
                <div>
                  <h4 className="text-sm font-bold text-[#18181B] dark:text-white">Estimated Delivery</h4>
                  <p className="text-xs text-[#1EA855] dark:text-zinc-300">
                    Order today to get it by <span className="font-bold text-[#25D366] dark:text-zinc-400">{estimatedDeliveryDate}</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-[#18181B] dark:text-[#DCFCE7]">
                30-Day Hassle-Free Returns
              </h4>
              <p className="text-sm text-[#1EA855] dark:text-zinc-300 leading-relaxed">
                If you are not 100% satisfied with your fit or performance, return your unworn items in original packaging within 30 days for a full refund or exchange. Prepaid return shipping labels are included in every order.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#E4E4E7] dark:border-zinc-700/60 bg-[#F4F4F5]/30 dark:bg-[#18181B]/20 text-xs text-[#25D366] dark:text-zinc-400 flex items-center justify-between">
              <span>Need customized international shipping or freight?</span>
              <a href="/contact" className="font-bold hover:underline">
                Contact Support &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
