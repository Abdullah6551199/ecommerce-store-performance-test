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

export type ReviewStatus = "published" | "hidden" | "flagged";
export type ReviewVoteType = "helpful" | "not_helpful";

export interface MarketplaceReview {
  id: string;
  listingType: "app" | "theme";
  listingId: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  rating: number; // 1-5
  title: string | null;
  body: string | null;
  helpfulCount: number;
  status: ReviewStatus;
  teamResponse: string | null;
  teamResponseAt: number | null;
  createdAt: number;
  updatedAt: number;
  isVerified?: boolean;
  userVote?: ReviewVoteType | null;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  distributionPercentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
