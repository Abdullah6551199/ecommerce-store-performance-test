"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
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

  // Products and facets state
  const [products, setProducts] = useState<ProductWithImagesAndCategory[]>(initialProducts);
  const [total, setTotal] = useState<number>(initialTotal);
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
    }>) => {
      const q = overrides?.query !== undefined ? overrides.query : query;
      const cat = overrides?.category !== undefined ? overrides.category : category;
      const b = overrides?.brand !== undefined ? overrides.brand : brand;
      const minP = overrides?.minPrice !== undefined ? overrides.minPrice : minPrice;
      const maxP = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
      const t = overrides?.tags !== undefined ? overrides.tags : selectedTags;
      const stk = overrides?.inStock !== undefined ? overrides.inStock : inStock;
      const s = overrides?.sort !== undefined ? overrides.sort : sort;

      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (cat.trim()) sp.set("category", cat.trim());
      if (b.trim()) sp.set("brand", b.trim());
      if (minP && !isNaN(Number(minP))) sp.set("minPrice", minP);
      if (maxP && !isNaN(Number(maxP))) sp.set("maxPrice", maxP);
      if (t.length > 0) sp.set("tags", t.join(","));
      if (stk) sp.set("inStock", "true");
      if (s && s !== "newest") sp.set("sort", s);

      return sp.toString();
    },
    [query, category, brand, minPrice, maxPrice, selectedTags, inStock, sort]
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

  // Update URL & fetch on filter changes (excluding first mount)
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
    }>) => {
      const qs = buildQueryString(overrides);
      const newUrl = qs ? `/search?${qs}` : "/search";
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

  // Immediate filter changes
  const handleCategorySelect = (newCat: string) => {
    const val = category === newCat ? "" : newCat;
    setCategory(val);
    applyFilters({ category: val });
  };

  const handleBrandSelect = (newBrand: string) => {
    setBrand(newBrand);
    applyFilters({ brand: newBrand });
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
    window.history.replaceState(null, "", "/search");
    fetchResults("");
  };

  // Active filters count
  const activeFiltersCount =
    (query ? 1 : 0) +
    (category ? 1 : 0) +
    (brand ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    selectedTags.length +
    (inStock ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1611]/80 to-[#080e0a]/90 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#18C729]/30 bg-[#18C729]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#18C729]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#18C729]" />
            <span>Storefront Search &amp; Discovery</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {query ? (
              <>
                Search Results for <span className="text-[#18C729]">&quot;{query}&quot;</span>
              </>
            ) : (
              "Explore Catalog"
            )}
          </h1>

          <p className="text-xs sm:text-sm text-white/60">
            Find items by keyword, price range, brand, category, or real-time warehouse availability.
          </p>

          {/* Search Input */}
          <div className="relative max-w-xl pt-2">
            <input
              type="text"
              id="search-input-field"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by product name, SKU, brand, or tag..."
              className="w-full rounded-2xl border border-white/15 bg-white/5 pl-11 pr-10 py-3.5 text-sm text-white placeholder-white/40 focus:border-[#18C729] focus:outline-none focus:ring-2 focus:ring-[#18C729]/30 transition-all shadow-inner"
            />
            <svg
              className="absolute left-4 top-5.5 h-5 w-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  applyFilters({ query: "" });
                }}
                className="absolute right-3.5 top-5 text-white/40 hover:text-white"
                title="Clear input"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between pb-2 border-b border-white/10">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            <svg className="h-4 w-4 text-[#18C729]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          <span className="text-xs text-white/50">{total} Results</span>
        </div>

        {/* Sidebar Filters */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? "block" : "hidden"
          } space-y-6 rounded-3xl border border-white/10 bg-[#0c140f]/90 p-6 backdrop-blur-md shadow-xl lg:sticky lg:top-24`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-medium text-[#FEF500] hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Sort Filter (also available in sidebar) */}
          <div className="space-y-2">
            <label htmlFor="sort-select" className="text-xs font-semibold text-white/70">
              Sort By
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-[#18C729] focus:outline-none"
            >
              <option value="newest" className="bg-[#0c140f] text-white">Newest Arrivals</option>
              <option value="price_asc" className="bg-[#0c140f] text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-[#0c140f] text-white">Price: High to Low</option>
              <option value="popular" className="bg-[#0c140f] text-white">Popularity &amp; Stock</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id="in-stock-filter"
                checked={inStock}
                onChange={handleStockToggle}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#18C729] focus:ring-[#18C729] focus:ring-offset-black"
              />
              <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
                In Stock Only
              </span>
            </label>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Price Range</h4>
              {(minPrice || maxPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    applyFilters({ minPrice: "", maxPrice: "" });
                  }}
                  className="text-[10px] text-white/40 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs text-white/40">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
                  className="w-full rounded-xl border border-white/15 bg-black/40 pl-6 pr-2 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
              </div>
              <span className="text-xs text-white/40">-</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs text-white/40">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
                  className="w-full rounded-xl border border-white/15 bg-black/40 pl-6 pr-2 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#18C729] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handlePriceApply}
                className="rounded-xl bg-[#18C729]/20 border border-[#18C729]/40 px-3 py-1.5 text-xs font-bold text-[#18C729] hover:bg-[#18C729] hover:text-black transition-all"
              >
                Go
              </button>
            </div>
            {facets.priceRange && (
              <p className="text-[11px] text-white/40">
                Range: ${facets.priceRange.min} – ${facets.priceRange.max}
              </p>
            )}
          </div>

          {/* Category Filter */}
          {facets.categories && facets.categories.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Category</h4>
                {category && (
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("")}
                    className="text-[10px] text-white/40 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {facets.categories.map((cat) => {
                  const isSelected = category === cat.slug || category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? "bg-[#18C729]/15 text-[#18C729] font-bold border border-[#18C729]/30"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
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
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Brand</h4>
                {brand && (
                  <button
                    type="button"
                    onClick={() => handleBrandSelect("")}
                    className="text-[10px] text-white/40 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {facets.brands.map((b) => {
                  const isSelected = brand.toLowerCase() === b.name.toLowerCase();
                  return (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => handleBrandSelect(isSelected ? "" : b.name)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? "bg-[#18C729]/15 text-[#18C729] font-bold border border-[#18C729]/30"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
                        {b.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag Filter */}
          {facets.tags && facets.tags.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">Tags</h4>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTags([]);
                      applyFilters({ tags: [] });
                    }}
                    className="text-[10px] text-white/40 hover:text-white"
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
                          ? "bg-[#18C729] text-black font-bold shadow-md shadow-[#18C729]/30"
                          : "border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span>{t.name}</span>
                      <span className="text-[9px] opacity-60">({t.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Results Section */}
        <section className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips & Results Count Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {total} {total === 1 ? "Product" : "Products"}
              </span>
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-xs text-[#18C729]">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Updating...
                </span>
              )}
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-white/50">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#0c140f] px-3 py-1.5 text-xs text-white focus:border-[#18C729] focus:outline-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Popularity &amp; Stock</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/50">Active filters:</span>

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    applyFilters({ query: "" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <span>Query: &quot;{query}&quot;</span>
                  <span className="text-white/50 hover:text-white">&times;</span>
                </button>
              )}

              {category && (
                <button
                  type="button"
                  onClick={() => {
                    setCategory("");
                    applyFilters({ category: "" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <span>
                    Category:{" "}
                    {facets.categories.find((c) => c.slug === category || c.id === category)?.name || category}
                  </span>
                  <span className="text-white/50 hover:text-white">&times;</span>
                </button>
              )}

              {brand && (
                <button
                  type="button"
                  onClick={() => {
                    setBrand("");
                    applyFilters({ brand: "" });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <span>Brand: {brand}</span>
                  <span className="text-white/50 hover:text-white">&times;</span>
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <span>
                    Price: {minPrice ? `$${minPrice}` : "$0"} – {maxPrice ? `$${maxPrice}` : "Any"}
                  </span>
                  <span className="text-white/50 hover:text-white">&times;</span>
                </button>
              )}

              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <span>Tag: {tag}</span>
                  <span className="text-white/50 hover:text-white">&times;</span>
                </button>
              ))}

              {inStock && (
                <button
                  type="button"
                  onClick={handleStockToggle}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <span>In Stock Only</span>
                  <span className="text-white/50 hover:text-white">&times;</span>
                </button>
              )}

              {sort !== "newest" && (
                <button
                  type="button"
                  onClick={() => handleSortChange("newest")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <span>Sort: {sort}</span>
                  <span className="text-white/50 hover:text-white">&times;</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-[#FEF500] hover:underline ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid / Empty State */}
          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-[#0c140f]/60 p-16 text-center backdrop-blur-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[#FEF500]">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-white">No Matching Products Found</h3>
              <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
                No items match your active filters and search query. Try removing filters or searching for something else.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Reset All Filters
                </button>
                <Link
                  href="/"
                  className="rounded-xl bg-[#18C729] px-4 py-2 text-xs font-semibold text-black hover:brightness-110 transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 transition-opacity duration-200 ${
                isLoading ? "opacity-60" : "opacity-100"
              }`}
            >
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
