import type { CouponRecord, NewCouponRecord, CouponUsageRecord } from "@/lib/db";

export type { CouponRecord, NewCouponRecord, CouponUsageRecord };

export interface CouponsAppSettings {
  enabled: boolean;
  showInCart: boolean;
  showInCheckout: boolean;
  allowStacking: boolean;
  autoApplyBest: boolean;
  showBadgeOnProducts: boolean;
  badgeText: string;
}

export const DEFAULT_COUPONS_SETTINGS: CouponsAppSettings = {
  enabled: true,
  showInCart: true,
  showInCheckout: true,
  allowStacking: false,
  autoApplyBest: false,
  showBadgeOnProducts: false,
  badgeText: "Coupon Available",
};

export interface CartItemValidationInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice?: number;
  categoryId?: string | null;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  discountType: string;
  message: string;
  coupon: CouponRecord | null;
  freeShipping?: boolean;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalDiscountsGiven: number;
  mostUsedCoupon: { code: string; count: number };
}
