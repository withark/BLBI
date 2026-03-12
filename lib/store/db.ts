import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  AppDatabase,
  BusinessProfile,
  PostRecord,
  RecommendationRecord,
  SeoLearnedSnapshot,
  SeoReferenceRecord,
  SeoReferenceSource,
  SeoReferenceStatus,
  UserPlan,
  UserRecord
} from "@/lib/domain/types";

function resolveDbPath(): string {
  if (process.env.BLBI_DB_PATH) {
    return process.env.BLBI_DB_PATH;
  }

  if (process.env.VERCEL === "1") {
    // Vercel Functions expose a read-only filesystem except for /tmp.
    return path.join("/tmp", "blbi", "app-db.json");
  }

  return path.join(process.cwd(), "data", "app-db.json");
}

const DB_PATH = resolveDbPath();

const EMPTY_DB: AppDatabase = {
  users: [],
  businessProfiles: [],
  posts: [],
  recommendations: [],
  seoReferences: [],
  seoLearnedSnapshots: []
};

let mutationQueue = Promise.resolve();

async function ensureDbFile(): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf8");
  }
}

async function readDb(): Promise<AppDatabase> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as AppDatabase;
    return {
      users: (parsed.users ?? []).map((user) => ({
        ...user,
        limitBypass: user.limitBypass ?? false
      })),
      businessProfiles: parsed.businessProfiles ?? [],
      posts: (parsed.posts ?? []).map((post) => ({
        ...post,
        faq: post.faq ?? "",
        cta: post.cta ?? ""
      })),
      recommendations: parsed.recommendations ?? [],
      seoReferences: parsed.seoReferences ?? [],
      seoLearnedSnapshots: parsed.seoLearnedSnapshots ?? []
    };
  } catch {
    return EMPTY_DB;
  }
}

async function writeDb(db: AppDatabase): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function mutateDb<T>(work: (db: AppDatabase) => T | Promise<T>): Promise<T> {
  const task = mutationQueue.then(async () => {
    const db = await readDb();
    const result = await work(db);
    await writeDb(db);
    return result;
  });

  mutationQueue = task.then(
    () => undefined,
    () => undefined
  );

  return task;
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function getOrCreateUser(userId: string): Promise<UserRecord> {
  return mutateDb((db) => {
    const current = db.users.find((user) => user.id === userId);

    if (current) {
      return current;
    }

    const now = nowIso();
    const created: UserRecord = {
      id: userId,
      plan: "FREE",
      limitBypass: false,
      createdAt: now,
      updatedAt: now
    };

    db.users.push(created);
    return created;
  });
}

export async function setUserPlan(userId: string, plan: UserPlan): Promise<UserRecord> {
  return mutateDb((db) => {
    const existing = db.users.find((user) => user.id === userId);
    const now = nowIso();

    if (!existing) {
      const created: UserRecord = {
        id: userId,
        plan,
        limitBypass: false,
        createdAt: now,
        updatedAt: now
      };

      db.users.push(created);
      return created;
    }

    existing.plan = plan;
    existing.updatedAt = now;
    return existing;
  });
}

export async function setUserLimitBypass(userId: string, limitBypass: boolean): Promise<UserRecord> {
  return mutateDb((db) => {
    const now = nowIso();
    const existing = db.users.find((user) => user.id === userId);

    if (!existing) {
      const created: UserRecord = {
        id: userId,
        plan: "FREE",
        limitBypass,
        createdAt: now,
        updatedAt: now
      };

      db.users.push(created);
      return created;
    }

    existing.limitBypass = limitBypass;
    existing.updatedAt = now;
    return existing;
  });
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
  const db = await readDb();
  return db.businessProfiles.find((profile) => profile.userId === userId) ?? null;
}

interface UpsertProfileInput {
  businessName: string;
  region: string;
  address: string;
  openingHours: string;
  representativeMenus: string[];
  storeDescription: string;
  facilities: string;
  toneGuide: string;
}

export async function upsertBusinessProfile(userId: string, input: UpsertProfileInput): Promise<BusinessProfile> {
  return mutateDb((db) => {
    const now = nowIso();
    const existing = db.businessProfiles.find((profile) => profile.userId === userId);

    if (!existing) {
      const created: BusinessProfile = {
        id: randomUUID(),
        userId,
        businessName: input.businessName,
        region: input.region,
        address: input.address,
        openingHours: input.openingHours,
        representativeMenus: input.representativeMenus,
        storeDescription: input.storeDescription,
        facilities: input.facilities,
        toneGuide: input.toneGuide,
        createdAt: now,
        updatedAt: now
      };

      db.businessProfiles.push(created);
      return created;
    }

    existing.businessName = input.businessName;
    existing.region = input.region;
    existing.address = input.address;
    existing.openingHours = input.openingHours;
    existing.representativeMenus = input.representativeMenus;
    existing.storeDescription = input.storeDescription;
    existing.facilities = input.facilities;
    existing.toneGuide = input.toneGuide;
    existing.updatedAt = now;

    return existing;
  });
}

interface CreatePostInput {
  keyword: string;
  title: string;
  body: string;
  faq: string;
  cta: string;
  exportText: string;
  nextSuggestions: string[];
  plan: UserPlan;
  businessProfileId?: string;
}

export async function createPost(userId: string, payload: CreatePostInput): Promise<PostRecord> {
  return mutateDb((db) => {
    const now = nowIso();
    const post: PostRecord = {
      id: randomUUID(),
      userId,
      businessProfileId: payload.businessProfileId,
      keyword: payload.keyword,
      title: payload.title,
      body: payload.body,
      faq: payload.faq,
      cta: payload.cta,
      exportText: payload.exportText,
      nextSuggestions: payload.nextSuggestions,
      plan: payload.plan,
      createdAt: now,
      updatedAt: now
    };

    db.posts.push(post);
    return post;
  });
}

export async function listPosts(userId: string): Promise<PostRecord[]> {
  const db = await readDb();
  return db.posts
    .filter((post) => post.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function listAllUsers(): Promise<UserRecord[]> {
  const db = await readDb();
  return db.users
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function listAllBusinessProfiles(): Promise<BusinessProfile[]> {
  const db = await readDb();
  return db.businessProfiles
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function listAllPosts(): Promise<PostRecord[]> {
  const db = await readDb();
  return db.posts
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPost(postId: string): Promise<PostRecord | null> {
  const db = await readDb();
  return db.posts.find((post) => post.id === postId) ?? null;
}

export async function getUserPost(userId: string, postId: string): Promise<PostRecord | null> {
  const db = await readDb();
  return db.posts.find((post) => post.id === postId && post.userId === userId) ?? null;
}

interface UpdatePostInput {
  title?: string;
  body?: string;
  faq?: string;
  cta?: string;
  exportText?: string;
}

export async function updatePost(userId: string, postId: string, input: UpdatePostInput): Promise<PostRecord | null> {
  return mutateDb((db) => {
    const post = db.posts.find((entry) => entry.id === postId && entry.userId === userId);

    if (!post) {
      return null;
    }

    if (input.title !== undefined) {
      post.title = input.title;
    }

    if (input.body !== undefined) {
      post.body = input.body;
    }

    if (input.faq !== undefined) {
      post.faq = input.faq;
    }

    if (input.cta !== undefined) {
      post.cta = input.cta;
    }

    if (input.exportText !== undefined) {
      post.exportText = input.exportText;
    }

    post.updatedAt = nowIso();
    return post;
  });
}

export async function saveRecommendations(
  userId: string,
  sourcePostId: string,
  keywords: string[]
): Promise<RecommendationRecord[]> {
  return mutateDb((db) => {
    const now = nowIso();
    const created: RecommendationRecord[] = [];

    for (const keyword of keywords) {
      const trimmed = keyword.trim();

      if (!trimmed) {
        continue;
      }

      const record: RecommendationRecord = {
        id: randomUUID(),
        userId,
        sourcePostId,
        keyword: trimmed,
        createdAt: now
      };

      db.recommendations.push(record);
      created.push(record);
    }

    return created;
  });
}

export async function listRecommendations(userId: string, limit = 6): Promise<RecommendationRecord[]> {
  const db = await readDb();
  return db.recommendations
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

interface CreateSeoReferenceInput {
  keyword: string;
  region: string;
  businessType: string;
  url: string;
  title: string;
  summary: string;
  sourceType: SeoReferenceSource;
  status?: SeoReferenceStatus;
}

export async function createSeoReference(input: CreateSeoReferenceInput): Promise<SeoReferenceRecord> {
  return mutateDb((db) => {
    const now = nowIso();
    const record: SeoReferenceRecord = {
      id: randomUUID(),
      keyword: input.keyword,
      region: input.region,
      businessType: input.businessType,
      url: input.url,
      title: input.title,
      summary: input.summary,
      sourceType: input.sourceType,
      status: input.status ?? "candidate",
      lastAnalyzedAt: null,
      createdAt: now,
      updatedAt: now
    };

    db.seoReferences.push(record);
    return record;
  });
}

export async function listSeoReferences(): Promise<SeoReferenceRecord[]> {
  const db = await readDb();
  return db.seoReferences
    .slice()
    .sort((a, b) => {
      const aTime = a.lastAnalyzedAt ? new Date(a.lastAnalyzedAt).getTime() : 0;
      const bTime = b.lastAnalyzedAt ? new Date(b.lastAnalyzedAt).getTime() : 0;
      return bTime - aTime || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function updateSeoReferenceStatus(referenceId: string, status: SeoReferenceStatus): Promise<SeoReferenceRecord | null> {
  return mutateDb((db) => {
    const record = db.seoReferences.find((item) => item.id === referenceId);

    if (!record) {
      return null;
    }

    record.status = status;
    record.updatedAt = nowIso();
    return record;
  });
}

export async function analyzeSeoReference(referenceId: string): Promise<SeoLearnedSnapshot | null> {
  return mutateDb((db) => {
    const record = db.seoReferences.find((item) => item.id === referenceId);

    if (!record) {
      return null;
    }

    const now = nowIso();
    const completenessScore = [record.keyword, record.region, record.businessType, record.title, record.summary]
      .filter((value) => value.trim().length > 0).length;

    const qualityScore = Math.min(100, 45 + completenessScore * 11);
    const freshnessScore = record.lastAnalyzedAt ? 72 : 88;
    const snapshot: SeoLearnedSnapshot = {
      id: randomUUID(),
      referenceId: record.id,
      fetchedAt: now,
      headingCount: 4,
      photoGuideCount: 3,
      faqExists: true,
      ctaExists: true,
      avgParagraphLength: 3,
      keywordPatterns: Array.from(
        new Set(
          [
            record.keyword,
            record.region ? `${record.region} ${record.keyword}` : "",
            record.businessType ? `${record.businessType} 추천` : "",
            record.region && record.businessType ? `${record.region} ${record.businessType}` : ""
          ].filter(Boolean)
        )
      ),
      sectionPatterns: [
        `${record.keyword}로 찾는 손님이 먼저 보는 정보`,
        "대표 메뉴 설명과 주문 흐름",
        "매장 분위기와 방문 상황 안내",
        "방문 전 체크와 마무리 CTA"
      ],
      ctaPatterns: [
        `${record.region || "매장 주변"} 방문 전에 위치와 영업시간을 확인해 주세요.`,
        `${record.businessType || "매장"} 강점을 마지막 문단에서 다시 강조합니다.`
      ],
      tonePatterns: ["지역 기반 안내형", "과장 없는 후기형", "사장님 운영 관점 설명형"],
      freshnessScore,
      qualityScore,
      notes: `${record.keyword} 기준으로 제목 구조, 소제목 흐름, CTA 문장을 요약 학습했습니다.`
    };

    record.lastAnalyzedAt = now;
    record.updatedAt = now;
    if (record.status === "candidate") {
      record.status = "approved";
    }
    db.seoLearnedSnapshots.push(snapshot);
    return snapshot;
  });
}

export async function listSeoSnapshots(): Promise<SeoLearnedSnapshot[]> {
  const db = await readDb();
  return db.seoLearnedSnapshots
    .slice()
    .sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime());
}

export async function getAdminStats(): Promise<{
  userCount: number;
  postCount: number;
  monthPostCount: number;
  businessProfileCount: number;
  recommendationCount: number;
  seoReferenceCount: number;
  seoSnapshotCount: number;
  planCounts: Record<UserPlan, number>;
  recentPosts: PostRecord[];
  users: UserRecord[];
}> {
  const db = await readDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return {
    userCount: db.users.length,
    postCount: db.posts.length,
    monthPostCount: db.posts.filter((post) => new Date(post.createdAt).getTime() >= monthStart.getTime()).length,
    businessProfileCount: db.businessProfiles.length,
    recommendationCount: db.recommendations.length,
    seoReferenceCount: db.seoReferences.length,
    seoSnapshotCount: db.seoLearnedSnapshots.length,
    planCounts: {
      FREE: db.users.filter((user) => user.plan === "FREE").length,
      BASIC: db.users.filter((user) => user.plan === "BASIC").length,
      PREMIUM: db.users.filter((user) => user.plan === "PREMIUM").length
    },
    recentPosts: db.posts
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
    users: db.users
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  };
}
