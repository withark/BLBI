export type UserPlan = "FREE" | "BASIC" | "PREMIUM";

export type BlogLength = "short" | "medium" | "long";

export type BlogTone = "friendly" | "professional" | "warm";

export interface UserRecord {
  id: string;
  plan: UserPlan;
  limitBypass: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  region: string;
  address: string;
  openingHours: string;
  representativeMenus: string[];
  storeDescription: string;
  facilities: string;
  toneGuide: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostRecord {
  id: string;
  userId: string;
  businessProfileId?: string;
  keyword: string;
  title: string;
  body: string;
  faq: string;
  cta: string;
  exportText: string;
  nextSuggestions: string[];
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationRecord {
  id: string;
  userId: string;
  sourcePostId: string;
  keyword: string;
  createdAt: string;
}

export type SeoReferenceStatus = "candidate" | "approved" | "rejected" | "archived";

export type SeoReferenceSource = "manual" | "search_api" | "import";

export interface SeoReferenceRecord {
  id: string;
  keyword: string;
  region: string;
  businessType: string;
  url: string;
  title: string;
  summary: string;
  sourceType: SeoReferenceSource;
  status: SeoReferenceStatus;
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeoLearnedSnapshot {
  id: string;
  referenceId: string;
  fetchedAt: string;
  headingCount: number;
  photoGuideCount: number;
  faqExists: boolean;
  ctaExists: boolean;
  avgParagraphLength: number;
  keywordPatterns: string[];
  sectionPatterns: string[];
  ctaPatterns: string[];
  tonePatterns: string[];
  freshnessScore: number;
  qualityScore: number;
  notes: string;
}

export interface AppDatabase {
  users: UserRecord[];
  businessProfiles: BusinessProfile[];
  posts: PostRecord[];
  recommendations: RecommendationRecord[];
  seoReferences: SeoReferenceRecord[];
  seoLearnedSnapshots: SeoLearnedSnapshot[];
}

export interface GenerateInput {
  keyword: string;
  details?: string;
  length: BlogLength;
  tone: BlogTone;
  includeFaq: boolean;
  businessProfile?: BusinessProfile | null;
}

export interface GeneratedPost {
  title: string;
  body: string;
  faq: string;
  cta: string;
  exportText: string;
  nextSuggestions: string[];
}
