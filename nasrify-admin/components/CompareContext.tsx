"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export const LOCAL_STORAGE_COMPARE_KEY = "compare_products_v1";
export const MAX_COMPARE_LIMIT = 4;

export interface CompareToastState {
  id: number;
  message: string;
  type: "success" | "info" | "warning";
}

interface CompareContextType {
  compareList: string[];
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  toggleCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  toast: CompareToastState | null;
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toast, setToast] = useState<CompareToastState | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_COMPARE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCompareList(parsed.slice(0, MAX_COMPARE_LIMIT));
        }
      }
    } catch (err) {
      console.warn("Failed to read compare list from localStorage:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_COMPARE_KEY, JSON.stringify(compareList));
    } catch (err) {
      console.warn("Failed to save compare list to localStorage:", err);
    }
  }, [compareList, isInitialized]);

  const showToast = useCallback((message: string, type: "success" | "info" | "warning" = "info") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3000);
  }, []);

  const isInCompare = useCallback(
    (productId: string) => compareList.includes(productId),
    [compareList]
  );

  const addToCompare = useCallback(
    (productId: string): boolean => {
      if (compareList.includes(productId)) {
        showToast("Product is already in comparison", "info");
        return false;
      }

      if (compareList.length >= MAX_COMPARE_LIMIT) {
        showToast(`Compare list full (max ${MAX_COMPARE_LIMIT} products)`, "warning");
        return false;
      }

      const next = [...compareList, productId];
      setCompareList(next);
      showToast(`Added to compare (${next.length}/${MAX_COMPARE_LIMIT})`, "success");
      return true;
    },
    [compareList, showToast]
  );

  const removeFromCompare = useCallback(
    (productId: string) => {
      setCompareList((prev) => {
        const next = prev.filter((id) => id !== productId);
        showToast("Removed from compare", "info");
        return next;
      });
    },
    [showToast]
  );

  const toggleCompare = useCallback(
    (productId: string): boolean => {
      if (compareList.includes(productId)) {
        removeFromCompare(productId);
        return false;
      } else {
        return addToCompare(productId);
      }
    },
    [compareList, addToCompare, removeFromCompare]
  );

  const clearCompare = useCallback(() => {
    setCompareList([]);
    showToast("Comparison list cleared", "info");
  }, [showToast]);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
        toast,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-purple-300 dark:border-purple-600 bg-white/95 dark:bg-[#3C0561]/95 px-4 py-3 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 text-xs font-semibold text-zinc-900 dark:text-white"
        >
          {toast.type === "success" && (
            <svg className="h-4 w-4 text-[#960DF2] dark:text-[#C06EF7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "warning" && (
            <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {toast.type === "info" && (
            <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
