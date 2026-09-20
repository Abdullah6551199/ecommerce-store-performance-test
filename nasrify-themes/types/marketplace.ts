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

export * from "./themes";
