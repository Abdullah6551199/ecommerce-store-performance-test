"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import QuickAddToCart from "@/components/QuickAddToCart";
import { normalizeImageUrl } from "@/lib/utils";
import type { ProductWithImagesAndCategory, SearchFacets, AdvancedSearchParams } from "@/lib/products";

interface SearchClientProps {
  initialProducts: ProductWithImagesAndCategory[];
  initialTotal: number;
  initialFacets: SearchFacets;
  initialParams: AdvancedSearchParams;
}

export default function SearchClient({
  initialProducts,
  initialTotal,
  initialFacets,
  initialParams,
}: SearchClientProps): React.JSX.Element {
  // Local state initialized from initialParams
  const [query, setQuery] = useState(initialParams.query || "");
  const [category, setCategory] = useState(initialParams.category || "");
  const [brand, setBrand] = useState(initialParams.brand || "");
  const [minPrice, setMinPrice] = useState<string>(
    initialParams.minPrice !== undefined ? String(initialParams.minPrice) : ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialParams.maxPrice !== undefined ? String(initialParams.maxPrice) : ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialParams.tags || []);
  const [inStock, setInStock] = useState<boolean>(Boolean(initialParams.inStock));
  const [sort, setSort] = useState<string>(initialParams.sort || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(
    initialParams.offset ? Math.floor(initialParams.offset / (initialParams.limit || 12)) + 1 : 1
  );
  const PAGE_SIZE = initialParams.limit || 12;

  // Products and facets state
  const [products, setProducts] = useState<ProductWithImagesAndCategory[]>(initialProducts);
  const [total, setTotal] = useState<number>(initialTotal);
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const [facets, setFacets] = useState<SearchFacets>(initialFacets);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Debounce ref for query typing
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to build query string
  const buildQueryString = useCallback(
    (overrides?: Partial<{
      query: string;
      category: string;
      brand: string;
      minPrice: string;
      maxPrice: string;
      tags: string[];
      inStock: boolean;
      sort: string;
      page: number;
    }>) => {
      const q = overrides?.query !== undefined ? overrides.query : query;
      const cat = overrides?.category !== undefined ? overrides.category : category;
      const b = overrides?.brand !== undefined ? overrides.brand : brand;
      const minP = overrides?.minPrice !== undefined ? overrides.minPrice : minPrice;
      const maxP = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
      const t = overrides?.tags !== undefined ? overrides.tags : selectedTags;
      const stk = overrides?.inStock !== undefined ? overrides.inStock : inStock;
      const s = overrides?.sort !== undefined ? overrides.sort : sort;
      const p = overrides?.page !== undefined ? overrides.page : currentPage;

      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (cat.trim()) sp.set("category", cat.trim());
      if (b.trim()) sp.set("brand", b.trim());
      if (minP && !isNaN(Number(minP))) sp.set("minPrice", minP);
      if (maxP && !isNaN(Number(maxP))) sp.set("maxPrice", maxP);
      if (t.length > 0) sp.set("tags", t.join(","));
      if (stk) sp.set("inStock", "true");
      if (s && s !== "newest") sp.set("sort", s);
      if (p > 1) sp.set("page", String(p));
      sp.set("limit", String(PAGE_SIZE));

      return sp.toString();
    },
    [query, category, brand, minPrice, maxPrice, selectedTags, inStock, sort, currentPage, PAGE_SIZE]
  );

  // Fetch filtered results from API
  const fetchResults = useCallback(async (queryString: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/search?${queryString}`);
      if (!res.ok) throw new Error("Search request failed");
      const json = (await res.json()) as {
        success: boolean;
        data?: ProductWithImagesAndCategory[];
        total?: number;
        facets?: SearchFacets;
      };
      if (json.success) {
        setProducts(json.data || []);
        setTotal(json.total || 0);
        if (json.facets) {
          setFacets(json.facets);
        }
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update URL & fetch on filter changes
  const applyFilters = useCallback(
    (overrides?: Partial<{
      query: string;
      category: string;
      brand: string;
      minPrice: string;
      maxPrice: string;
      tags: string[];
      inStock: boolean;
      sort: string;
      page: number;
    }>) => {
      const pageToUse = overrides?.page !== undefined ? overrides.page : 1;
      setCurrentPage(pageToUse);
      const qs = buildQueryString({ ...overrides, page: pageToUse });
      const newUrl = qs ? `/shop?${qs}` : "/shop";
      window.history.replaceState(null, "", newUrl);
      fetchResults(qs);
    },
    [buildQueryString, fetchResults]
  );

  // Handle query input with 300ms debounce
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      applyFilters({ query: val });
    }, 300);
  };

  // Filter handlers
  const handleCategorySelect = (newCat: string) => {
    const val = category === newCat ? "" : newCat;
    setCategory(val);
    applyFilters({ category: val });
  };

  const handleBrandSelect = (newBrand: string) => {
    const val = brand === newBrand ? "" : newBrand;
    setBrand(val);
    applyFilters({ brand: val });
  };

  const handlePriceApply = () => {
    applyFilters({ minPrice, maxPrice });
  };

  const handleTagToggle = (tag: string) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updated);
    applyFilters({ tags: updated });
  };

  const handleStockToggle = () => {
    const updated = !inStock;
    setInStock(updated);
    applyFilters({ inStock: updated });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    applyFilters({ sort: newSort });
  };

  const handleClearAll = () => {
    setQuery("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedTags([]);
    setInStock(false);
    setSort("newest");
    window.history.replaceState(null, "", "/shop");
    fetchResults("");
  };

  const activeFiltersCount =
    (query ? 1 : 0) +
    (category ? 1 : 0) +
    (brand ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    selectedTags.length +
    (inStock ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

  // Sidebar Filter Form Content
  const renderFilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-zinc-800 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#18181B] dark:text-zinc-200">
          Filters
        </h2>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-[#25D366] dark:text-zinc-400 hover:underline"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Availability Filter */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            id="in-stock-filter"
            checked={inStock}
            onChange={handleStockToggle}
            className="h-4 w-4 rounded border-[#E4E4E7] dark:border-zinc-700 text-[#25D366] focus:ring-[#25D366]"
          />
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 group-hover:text-[#25D366] transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-4 border-t border-[#E4E4E7] dark:border-zinc-800/60">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-zinc-300">
            Price Range
          </h3>
          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                applyFilters({ minPrice: "", maxPrice: "" });
              }}
              className="text-[10px] text-zinc-400 hover:text-[#25D366]"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-xs text-zinc-400">$</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B]/60 pl-6 pr-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:border-[#25D366] focus:outline-none"
            />
          </div>
          <span className="text-xs text-zinc-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-xs text-zinc-400">$</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B]/60 pl-6 pr-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:border-[#25D366] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handlePriceApply}
            className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-3 py-1.5 text-xs font-bold text-white transition-all shadow-sm shadow-[#25D366]/20"
          >
            Go
          </button>
        </div>
      </div>

      {/* Category Filter */}
      {facets.categories && facets.categories.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E4E4E7] dark:border-zinc-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-zinc-300">
              Categories
            </h3>
            {category && (
              <button
                type="button"
                onClick={() => handleCategorySelect("")}
                className="text-[10px] text-zinc-400 hover:text-[#25D366]"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {facets.categories.map((cat) => {
              const isSelected = category === cat.slug || category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? "bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#1EA855] dark:text-zinc-400 font-bold border border-[#E4E4E7] dark:border-zinc-700"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/30 hover:text-[#1EA855]"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-2 rounded-full bg-[#F4F4F5] dark:bg-[#18181B]/40 px-2 py-0.5 text-[10px] text-[#25D366] dark:text-zinc-400 font-mono">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      {facets.brands && facets.brands.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E4E4E7] dark:border-zinc-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-zinc-300">
              Brands
            </h3>
            {brand && (
              <button
                type="button"
                onClick={() => handleBrandSelect("")}
                className="text-[10px] text-zinc-400 hover:text-[#25D366]"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {facets.brands.map((b) => {
              const isSelected = brand.toLowerCase() === b.name.toLowerCase();
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => handleBrandSelect(isSelected ? "" : b.name)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? "bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#1EA855] dark:text-zinc-400 font-bold border border-[#E4E4E7] dark:border-zinc-700"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/30 hover:text-[#1EA855]"
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="ml-2 rounded-full bg-[#F4F4F5] dark:bg-[#18181B]/40 px-2 py-0.5 text-[10px] text-[#25D366] dark:text-zinc-400 font-mono">
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {facets.tags && facets.tags.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E4E4E7] dark:border-zinc-800/60">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-zinc-300">
              Tags
            </h3>
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTags([]);
                  applyFilters({ tags: [] });
                }}
                className="text-[10px] text-zinc-400 hover:text-[#25D366]"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {facets.tags.map((t) => {
              const isSelected = selectedTags.includes(t.name);
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => handleTagToggle(t.name)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all ${
                    isSelected
                      ? "bg-[#25D366] text-white font-bold shadow-sm shadow-[#25D366]/20"
                      : "border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 text-[#15803D] dark:text-zinc-300 hover:border-[#25D366]"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[9px] opacity-70">({t.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-white dark:bg-[#18181B]/40 p-3 sm:p-4 shadow-sm">
        {/* Search Input Field */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            id="search-input-field"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by product name, category, or SKU..."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B]/60 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-400 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366] transition-all"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                applyFilters({ query: "" });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#25D366] p-1"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Controls: Sort Dropdown + Grid/List Toggle + Mobile Filters Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]/40 px-3 py-2 text-xs font-semibold text-[#15803D] dark:text-zinc-300"
          >
            <svg className="h-4 w-4 text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400/70">Sort:</span>
            <select
              aria-label="Sort products by"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181B]/60 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-200 focus:border-[#25D366] focus:outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Popularity &amp; Stock</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5]/50 dark:bg-[#18181B]/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-[#25D366] text-white shadow-sm"
                  : "text-[#1EA855] dark:text-zinc-400 hover:bg-[#DCFCE7] dark:hover:bg-[#15803D]"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-[#25D366] text-white shadow-sm"
                  : "text-[#1EA855] dark:text-zinc-400 hover:bg-[#DCFCE7] dark:hover:bg-[#15803D]"
              }`}
              title="List View"
              aria-label="List View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-400/70">Active filters:</span>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                applyFilters({ query: "" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]/40 px-3 py-1 text-xs text-[#18181B] dark:text-zinc-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <span>Query: &quot;{query}&quot;</span>
              <span className="text-zinc-400 hover:text-red-500">&times;</span>
            </button>
          )}

          {category && (
            <button
              type="button"
              onClick={() => {
                setCategory("");
                applyFilters({ category: "" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]/40 px-3 py-1 text-xs text-[#18181B] dark:text-zinc-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <span>
                Category:{" "}
                {facets.categories?.find((c) => c.slug === category || c.id === category)?.name || category}
              </span>
              <span className="text-zinc-400 hover:text-red-500">&times;</span>
            </button>
          )}

          {brand && (
            <button
              type="button"
              onClick={() => {
                setBrand("");
                applyFilters({ brand: "" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]/40 px-3 py-1 text-xs text-[#18181B] dark:text-zinc-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <span>Brand: {brand}</span>
              <span className="text-zinc-400 hover:text-red-500">&times;</span>
            </button>
          )}

          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                applyFilters({ minPrice: "", maxPrice: "" });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]/40 px-3 py-1 text-xs text-[#18181B] dark:text-zinc-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <span>
                Price: {minPrice ? `$${minPrice}` : "$0"} – {maxPrice ? `$${maxPrice}` : "Any"}
              </span>
              <span className="text-zinc-400 hover:text-red-500">&times;</span>
            </button>
          )}

          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]/40 px-3 py-1 text-xs text-[#18181B] dark:text-zinc-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <span>Tag: {tag}</span>
              <span className="text-zinc-400 hover:text-red-500">&times;</span>
            </button>
          ))}

          {inStock && (
            <button
              type="button"
              onClick={handleStockToggle}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]/40 px-3 py-1 text-xs text-[#18181B] dark:text-zinc-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <span>In Stock Only</span>
              <span className="text-zinc-400 hover:text-red-500">&times;</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-semibold text-[#25D366] dark:text-zinc-400 hover:underline ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid Layout: Sidebar (Desktop) + Products Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar (Desktop Only) */}
        <aside className="hidden lg:block rounded-3xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-white dark:bg-[#18181B]/30 p-6 shadow-sm sticky top-28">
          {renderFilterSidebar()}
        </aside>

        {/* Mobile Slide-in Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm lg:hidden">
            <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-[#18181B] p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7] dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-[#18181B] dark:text-zinc-200">Filter Catalog</h3>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 text-zinc-400 hover:text-[#25D366]"
                  >
                    ✕
                  </button>
                </div>
                <div className="py-4">
                  {renderFilterSidebar()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full rounded-xl bg-[#25D366] hover:bg-[#1EA855] py-3 text-xs font-bold text-white shadow-lg shadow-[#25D366]/20"
              >
                Show {total} Results
              </button>
            </div>
          </div>
        )}

        {/* Products Results Area (3 cols) */}
        <section className="lg:col-span-3 space-y-6">
          {/* Header Count & Loading Indicator */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400/70">
              Showing {products.length} of {total} products
            </span>
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#25D366] dark:text-zinc-400 font-semibold animate-pulse">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Filtering...
              </span>
            )}
          </div>

          {/* Products View: Grid vs List */}
          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E4E4E7] dark:border-zinc-800/80 bg-[#F4F4F5]/30 dark:bg-[#18181B]/20 p-12 sm:p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCFCE7] dark:bg-[#18181B]/60 text-[#25D366] dark:text-zinc-400">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#18181B] dark:text-zinc-200">
                No Matching Products Found
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400/70 max-w-sm mx-auto">
                No items match your active filters or search terms. Try adjusting your parameters.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-xl bg-[#25D366] hover:bg-[#1EA855] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#25D366]/20 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View (3 columns on lg, 4 on xl) */
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-200 ${
                isLoading ? "opacity-60" : "opacity-100"
              }`}
            >
              {products.map((prod, idx) => (
                <ProductCard key={prod.id} product={prod} isPriority={idx === 0} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className={`space-y-4 transition-opacity duration-200 ${isLoading ? "opacity-60" : "opacity-100"}`}>
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#E4E4E7] dark:border-zinc-800/80 bg-white dark:bg-[#18181B]/30 p-4 hover:border-[#E4E4E7] transition-all shadow-sm"
                >
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-[#F4F4F5] dark:bg-[#18181B]">
                    <Image
                      src={normalizeImageUrl(prod.mainImage, { width: 220, quality: 75 })}
                      alt={prod.name}
                      fill
                      sizes="112px"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase text-[#25D366] dark:text-zinc-400">
                      {prod.categoryName || "Athletic Collection"}
                    </span>
                    <Link
                      href={`/product/${prod.slug}`}
                      className="block text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-200 hover:text-[#25D366] transition-colors truncate"
                    >
                      {prod.name}
                    </Link>
                    {prod.shortDescription && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400/70 line-clamp-2">
                        {prod.shortDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4E4E7] dark:border-zinc-800">
                    <div className="text-right">
                      <span className="text-base font-black text-[#18181B] dark:text-zinc-200">
                        ${Number(prod.price).toFixed(2)}
                      </span>
                    </div>
                    <QuickAddToCart
                      productId={prod.id}
                      productSlug={prod.slug}
                      productName={prod.name}
                      price={Number(prod.price)}
                      imageUrl={prod.mainImage}
                      isOutOfStock={prod.stockQuantity <= 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#E4E4E7] dark:border-zinc-800/60 mt-8">
              <p className="text-xs text-zinc-500 dark:text-zinc-400/70">
                Showing <span className="text-[#18181B] dark:text-zinc-200 font-bold">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
                <span className="text-[#18181B] dark:text-zinc-200 font-bold">{Math.min(currentPage * PAGE_SIZE, total)}</span> of{" "}
                <span className="text-[#18181B] dark:text-zinc-200 font-bold">{total}</span> items
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => {
                    const prev = currentPage - 1;
                    applyFilters({ page: prev });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#18181B]/60 px-3.5 py-2 text-xs font-semibold text-[#15803D] dark:text-zinc-300 hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        applyFilters({ page: pNum });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        pNum === currentPage
                          ? "bg-[#25D366] text-white shadow-md shadow-[#25D366]/20"
                          : "border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#18181B]/60 text-[#15803D] dark:text-zinc-300 hover:bg-[#F4F4F5]"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => {
                    const next = currentPage + 1;
                    applyFilters({ page: next });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl border border-[#E4E4E7] dark:border-zinc-800 bg-white dark:bg-[#18181B]/60 px-3.5 py-2 text-xs font-semibold text-[#15803D] dark:text-zinc-300 hover:bg-[#F4F4F5] dark:hover:bg-[#18181B]/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
