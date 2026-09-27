"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EditableComponent } from "../EditableComponent";

export interface BuyNowBtnProps {
  id?: string;
  sectionId?: string;
  variant?: "primary" | "dark" | string;
  settings?: {
    text?: string;
  };
  checkoutUrl?: string;
}

export function BuyNowBtn({
  id = "buy_now_btn",
  sectionId,
  variant = "primary",
  settings = {},
  checkoutUrl = "/checkout",
}: BuyNowBtnProps) {
  const router = useRouter();
  const text = settings.text || "Buy Now";

  const isPrimary = variant === "primary";

  return (
    <EditableComponent id={id} type="buy_now_btn" sectionId={sectionId} className="my-2">
      <button
        type="button"
        onClick={() => router.push(checkoutUrl)}
        className={`w-full py-3 px-6 rounded-[var(--theme-radius,8px)] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
          isPrimary
            ? "bg-[var(--theme-accent,#2563EB)] text-white hover:opacity-95"
            : "bg-black text-white hover:bg-slate-800"
        }`}
      >
        <span>⚡</span>
        <span>{text}</span>
      </button>
    </EditableComponent>
  );
}

export default BuyNowBtn;
