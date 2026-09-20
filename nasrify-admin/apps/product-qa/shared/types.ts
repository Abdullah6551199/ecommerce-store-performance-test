export type QuestionStatus = "pending" | "published" | "hidden";
export type AnswerAuthorType = "admin" | "customer" | "nasrify_team";
export type AnswerStatus = "published" | "hidden";
export type UpvoteTargetType = "question" | "answer";

export interface ProductQuestion {
  id: string;
  productId: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  question: string;
  status: QuestionStatus;
  answerCount: number;
  upvoteCount: number;
  isPinned: boolean | number;
  createdAt: number;
  updatedAt: number;
}

export interface ProductAnswer {
  id: string;
  questionId: string;
  authorType: AnswerAuthorType;
  authorId: string | null;
  authorName: string;
  answer: string;
  status: AnswerStatus;
  upvoteCount: number;
  isAccepted: boolean | number;
  userHasUpvoted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface QuestionWithAnswers extends ProductQuestion {
  answers: ProductAnswer[];
  hasUpvoted?: boolean;
  userHasUpvoted?: boolean;
}

export interface ProductQaUpvote {
  id: string;
  targetType: UpvoteTargetType;
  targetId: string;
  customerId: string | null;
  customerEmail: string | null;
  createdAt: number;
}

export interface ProductQASettings {
  enabled: boolean;
  requireLogin: boolean;
  autoPublish: boolean;
  allowGuestQuestions: boolean;
  showUpvotes: boolean;
  maxQuestionsPerProduct: number;
  questionsPerPage: number;
  notifyAdminOnNewQuestion: boolean;
}

export const DEFAULT_PRODUCT_QA_SETTINGS: ProductQASettings = {
  enabled: true,
  requireLogin: false,
  autoPublish: false,
  allowGuestQuestions: true,
  showUpvotes: true,
  maxQuestionsPerProduct: 50,
  questionsPerPage: 10,
  notifyAdminOnNewQuestion: true,
};

export interface CreateQuestionInput {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerId?: string | null;
  question: string;
  status?: QuestionStatus;
}

export interface CreateAnswerInput {
  questionId: string;
  authorType: AnswerAuthorType;
  authorName: string;
  authorId?: string | null;
  answer: string;
}

export interface QAStats {
  totalQuestions: number;
  pendingQuestions: number;
  publishedQuestions: number;
  totalAnswers: number;
  topUpvotedQuestions: Array<{
    id: string;
    question: string;
    productName?: string;
    upvoteCount: number;
    answerCount: number;
  }>;
}
