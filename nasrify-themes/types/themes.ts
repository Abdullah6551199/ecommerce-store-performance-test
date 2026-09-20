export type ThemeListingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "delisted";

export interface ThemeConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    text?: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    scale?: string;
  };
  layout?: {
    headerStyle?: string;
    productCardStyle?: string;
    footerColumns?: number;
    borderRadius?: string;
  };
  features?: string[];
}

export interface ThemeMarketplaceListing {
  id: string;
  themeId: string;
  version: string;
  name: string;
  description: string | null;
  author: string | null;
  authorUrl: string | null;
  previewUrl: string | null;
  screenshotUrls: string | null; // JSON array of string URLs
  category: string | null;
  pricing: "free" | "paid";
  price: number | null;
  status: ThemeListingStatus;
  submittedBy: string | null;
  submittedAt: number | null;
  approvedBy: string | null;
  approvedAt: number | null;
  rejectionReason: string | null;
  downloadUrl: string | null;
  configJson: string | null;
  changelog: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ThemeMarketplaceVersion {
  id: string;
  listingId: string;
  version: string;
  submittedAt: number;
  configJson: string | null;
  downloadUrl: string | null;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
}

export interface ThemeMarketplaceInstall {
  id: string;
  listingId: string;
  storeId: string;
  installedAt: number;
  uninstalledAt: number | null;
  status: "active" | "uninstalled";
}
