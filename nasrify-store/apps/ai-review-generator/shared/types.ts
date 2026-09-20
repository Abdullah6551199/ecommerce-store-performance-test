export type ReviewTone = "positive" | "casual" | "detailed" | "brief" | "enthusiastic";
export type ReviewLanguage = "english" | "urdu" | "roman_urdu" | "mixed";
export type ReviewerStyle = "pakistani" | "international" | "mix";
export type ApprovalMode = "auto" | "pending";
export type GenerationStatus = "pending" | "running" | "completed" | "failed";

export interface AIGenerationOptions {
  productId: string;
  productTitle: string;
  productDescription?: string;
  productCategory?: string;
  count: number;
  ratingMin: number;
  ratingMax: number;
  tone: ReviewTone;
  language: ReviewLanguage;
  reviewerStyle: ReviewerStyle;
  dateRangeDays: number;
  approvalMode: ApprovalMode;
  createdBy?: string;
}

export interface AIGeneratedReview {
  rating: number;
  title: string;
  body: string;
  authorName: string;
}

export interface AIGenerationRecord {
  id: string;
  productId: string;
  requestedCount: number;
  generatedCount: number;
  ratingMin: number;
  ratingMax: number;
  tone: string | null;
  language: string | null;
  reviewerStyle: string | null;
  dateRangeDays: number | null;
  approvalMode: string | null;
  status: GenerationStatus;
  errorMessage: string | null;
  createdBy: string | null;
  createdAt: number | null;
  completedAt: number | null;
  productTitle?: string;
}

export interface AIReviewGeneratorSettings {
  enabled: boolean;
  defaultTone: ReviewTone;
  defaultLanguage: ReviewLanguage;
  defaultReviewerStyle: ReviewerStyle;
  defaultApprovalMode: ApprovalMode;
  maxReviewsPerBatch: number;
  spreadOverDays: number;
}

export interface AIStats {
  totalGenerated: number;
  totalThisMonth: number;
  batchesCount: number;
  estimatedNeuronsUsed: number;
}
