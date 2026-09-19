/**
 * Shared types for Trust Badges App
 */

export interface TrustBadgesAppSettings {
  showOnProductPage: boolean;
  showOnCartPage: boolean;
  showOnCheckoutPage: boolean;
  showPaymentIcons: boolean;
  badgeAlignment: "left" | "center" | "right";
  badgeSize: "sm" | "md" | "lg";
}

export const DEFAULT_TRUST_BADGES_SETTINGS: TrustBadgesAppSettings = {
  showOnProductPage: true,
  showOnCartPage: true,
  showOnCheckoutPage: true,
  showPaymentIcons: true,
  badgeAlignment: "center",
  badgeSize: "md",
};

export type TrustBadgeLocation = "all" | "product" | "cart" | "checkout" | "footer";

export interface TrustBadgeItem {
  id: string;
  tenantId?: string | null;
  icon: string;
  title: string;
  description?: string | null;
  location: TrustBadgeLocation | string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIconItem {
  id: string;
  tenantId?: string | null;
  name: string;
  iconSvg?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrustBadgeInput {
  icon: string;
  title: string;
  description?: string | null;
  location?: TrustBadgeLocation | string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateTrustBadgeInput extends Partial<CreateTrustBadgeInput> {}

export interface CreatePaymentIconInput {
  name: string;
  iconSvg?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePaymentIconInput extends Partial<CreatePaymentIconInput> {}
