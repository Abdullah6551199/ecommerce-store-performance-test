export type MarketplaceListingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "delisted";

export type MarketplaceVersionStatus = "pending" | "approved" | "rejected";

export type MarketplaceInstallStatus = "active" | "uninstalled";

export interface MarketplaceListing {
  id: string;
  appId: string;
  version: string;
  name: string;
  description: string | null;
  author: string | null;
  authorUrl: string | null;
  iconUrl: string | null;
  category: string | null;
  pricing: "free" | "paid" | string | null;
  price: number | null;
  status: MarketplaceListingStatus;
  submittedBy: string | null;
  submittedAt: number | null;
  approvedBy: string | null;
  approvedAt: number | null;
  rejectionReason: string | null;
  downloadUrl: string | null;
  manifestJson: string | null;
  changelog: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface MarketplaceVersion {
  id: string;
  listingId: string;
  version: string;
  submittedAt: number | null;
  manifestJson: string | null;
  downloadUrl: string | null;
  status: MarketplaceVersionStatus;
  notes: string | null;
}

export interface MarketplaceInstall {
  id: string;
  listingId: string;
  storeId: string | null;
  installedAt: number | null;
  uninstalledAt: number | null;
  status: MarketplaceInstallStatus;
}
