"use client";

import React from "react";
import CouponInput from "@/apps/coupons/storefront/CouponInput";

interface CouponsSectionProps {
  compact?: boolean;
}

/**
 * Root CouponsSection delegating directly to Coupons App storefront component (Stage 39)
 */
export default function CouponsSection({
  compact = false,
}: CouponsSectionProps): React.JSX.Element | null {
  return <CouponInput compact={compact} />;
}
