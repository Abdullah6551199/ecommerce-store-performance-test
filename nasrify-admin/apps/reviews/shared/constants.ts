import type { ReviewSettings } from "./types";

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  autoApprove: false,
  requireVerifiedPurchase: false,
  allowImages: true,
  maxImages: 5,
};

export const REVIEW_SETTINGS_KEY = "review_settings";
