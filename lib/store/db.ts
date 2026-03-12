import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  AppDatabase,
  BusinessProfile,
  PostRecord,
  RecommendationRecord,
  UserPlan,
  UserRecord
} from "@/lib/domain/types";

const DB_PATH = path.join(process.cwd(), "data", "app-db.json");

const EMPTY_DB: AppDatabase = {
  users: [],
  businessProfiles: [],
  posts: [],
  recommendations: []
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
      users: parsed.users ?? [],
      businessProfiles: parsed.businessProfiles ?? [],
      posts: parsed.posts ?? [],
      recommendations: parsed.recommendations ?? []
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

export async function getPost(postId: string): Promise<PostRecord | null> {
  const db = await readDb();
  return db.posts.find((post) => post.id === postId) ?? null;
}

interface UpdatePostInput {
  title?: string;
  body?: string;
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

export async function getAdminStats(): Promise<{
  userCount: number;
  postCount: number;
  monthPostCount: number;
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
