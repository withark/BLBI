export type UserPlan = "FREE" | "BASIC" | "PREMIUM";

export type BlogLength = "short" | "medium" | "long";

export type BlogTone = "friendly" | "professional" | "warm";

export interface UserRecord {
  id: string;
  plan: UserPlan;
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

export interface AppDatabase {
  users: UserRecord[];
  businessProfiles: BusinessProfile[];
  posts: PostRecord[];
  recommendations: RecommendationRecord[];
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
