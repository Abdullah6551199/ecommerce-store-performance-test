export interface ReviewImage {
  id: string;
  imageUrl: string;
  sortOrder?: number;
}

export interface ReviewItem {
  id: string;
  tenantId?: string | null;
  productId: string;
  orderId?: string | null;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string | null;
  content: string;
  isVerifiedPurchase: number;
  status: "pending" | "approved" | "rejected";
  helpfulCount: number;
  notHelpfulCount: number;
  adminReply: string | null;
  adminReplyAt: string | null;
  createdAt: string;
  updatedAt?: string;
  images: ReviewImage[];
}

export interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  breakdown: RatingBreakdown[];
}

export interface ReviewSettings {
  autoApprove: boolean;
  requireVerifiedPurchase: boolean;
  allowImages: boolean;
  maxImages: number;
}

export interface ReviewSubmissionInput {
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string | null;
  content: string;
  images?: string[];
  userIp?: string;
  orderId?: string | null;
}
