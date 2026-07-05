export interface CaseDetails {
  caseName: string;
  citation: string;
  bench: string;
  date: string;
  caseNumber: string;
}

export interface LegalArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  subcategory?: string;
  caseDetails?: CaseDetails;
  author: string;
  publishedAt: string;
  imageUrl: string;
  isBreaking?: boolean;
  tags: string[];
  views: number;
}

export interface Bookmark {
  articleId: string;
  savedAt: string;
}

export interface LawUpdateSubmission {
  id: string;
  title: string;
  court: string;
  caseNumber: string;
  bench: string;
  summary: string;
  submittedBy: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}
