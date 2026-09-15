"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProductModal from "./ProductModal";
import type { ProductWithImagesAndCategory } from "@/lib/products";
import type { CategoryRecord } from "@/lib/categories";
import { normalizeImageUrl } from "@/lib/utils";

interface CategoryProductsManagerProps {
  categoryId: string;
}

export default function CategoryProductsManager({
  categoryId,
}: CategoryProductsManagerProps): React.JSX.Element {
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [categoriesList, setCategoriesList] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductWithImagesAndCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetCategory, setTargetCategory] = useState("");
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Modals & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductWithImagesAndCategory | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductWithImagesAndCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Category info & All categories (for move dropdown)
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const data = (await res.json()) as any;
        if (data.success && data.data?.categories) {
          setCategoriesList(data.data.categories);
          const current = data.data.categories.find((c: CategoryRecord) => c.id === categoryId);
          if (current) setCategory(current);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    loadCategories();
  }, [categoryId]);

  // Fetch products in this category
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search,
        status: statusFilter,
        stock: stockFilter,
      });

      const res = await fetch(`/api/admin/categories/${categoryId}/products?${params.toString()}`);
      const data = (await res.json()) as any;

      if (data.success && data.data) {
        if (data.data.category) {
          setCategory(data.data.category);
        }
        setProducts(data.data.products || []);
        setTotalCount(data.data.total || 0);
        setTotalPages(data.data.totalPages || 1);
      } else {
        throw new Error(data.error || "Failed to load category products");
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error fetching category products",
      });
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, currentPage, search, statusFilter, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk action handler
  const handleBulkAction = async (action: "change_category" | "publish" | "unpublish" | "delete") => {
    if (selectedIds.length === 0) return;

    if (action === "delete") {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected product(s)? This cannot be undone.`
      );
      if (!confirmDelete) return;
    }

    if (action === "change_category" && !targetCategory) {
      alert("Please select a target category from the dropdown first.");
      return;
    }

    try {
      setIsBulkOperating(true);
      const res = await fetch(`/api/admin/categories/${categoryId}/products/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          productIds: selectedIds,
          targetCategoryId: targetCategory || undefined,
        }),
      });

      const result = (await res.json()) as any;
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Bulk action failed");
      }

      setFeedback({ type: "success", message: result.message || "Bulk action applied successfully" });
      setSelectedIds([]);
      setTargetCategory("");
      fetchProducts();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Bulk action failed",
      });
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Single delete
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }
      setFeedback({ type: "success", message: `Deleted "${productToDelete.name}" successfully.` });
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete product",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Categories
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{category?.name || "Category Products"}</span>
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              {totalCount} {totalCount === 1 ? "product" : "products"}
            </span>
          </div>
          {category?.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setProductToEdit(null);
            setIsProductModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product to {category?.name || "Category"}
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products in category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Stock filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium text-indigo-900 dark:text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
            {selectedIds.length} {selectedIds.length === 1 ? "product" : "products"} selected
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Move to another category */}
            <div className="flex items-center gap-1.5">
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                disabled={isBulkOperating}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Move to Category...</option>
                {categoriesList
                  .filter((c) => c.id !== categoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => handleBulkAction("change_category")}
                disabled={isBulkOperating || !targetCategory}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
              >
                Move
              </button>
            </div>

            {/* Bulk Publish */}
            <button
              onClick={() => handleBulkAction("publish")}
              disabled={isBulkOperating}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
            >
              Publish
            </button>

            {/* Bulk Unpublish */}
            <button
              onClick={() => handleBulkAction("unpublish")}
              disabled={isBulkOperating}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition disabled:opacity-50"
            >
              Unpublish
            </button>

            {/* Bulk Delete */}
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={isBulkOperating}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
            >
              Delete
            </button>

            {/* Deselect All */}
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 text-xl">
                        📦
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        No products found in this category.
                      </p>
                      <p className="text-xs text-slate-500">
                        Try clearing filters or add a new product directly to this category.
                      </p>
                      <button
                        onClick={() => {
                          setProductToEdit(null);
                          setIsProductModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        + Add Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const mainImg = product.mainImage || (product.images && product.images[0]?.imageUrl);

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(product.id)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {mainImg ? (
                              <img
                                src={normalizeImageUrl(mainImg)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-slate-400">No img</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate max-w-xs">
                              {product.name}
                            </p>
                            {product.brand && (
                              <p className="text-xs text-slate-400">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">
                        ${Number(product.price).toFixed(2)}
                        {product.salePrice && (
                          <span className="ml-1.5 text-xs text-rose-500 line-through">
                            ${Number(product.salePrice).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            product.stockStatus === "in_stock"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                          }`}
                        >
                          {product.stockStatus === "in_stock" ? "In Stock" : "Out of Stock"} (
                          {product.stockQuantity})
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            product.status === "published"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : product.status === "draft"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setProductToEdit(product);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Product"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete Product"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {currentPage} of {totalPages} ({totalCount} items)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Create/Edit Modal with initialCategoryId prefilled */}
      {isProductModalOpen && (
        <ProductModal
          isOpen={isProductModalOpen}
          initialCategoryId={categoryId}
          productToEdit={productToEdit}
          categoriesList={categoriesList}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          onSuccess={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
            fetchProducts();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Product</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">{productToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
