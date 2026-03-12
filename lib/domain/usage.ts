import { PLAN_LIMITS } from "@/lib/domain/plan";
import type { PostRecord, UserPlan } from "@/lib/domain/types";

export interface UsageSnapshot {
  plan: UserPlan;
  used: number;
  limit: number | null;
  remaining: number | null;
  window: "daily" | "monthly" | "unlimited";
}

function getDayStart(now: Date): Date {
  const value = new Date(now);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getMonthStart(now: Date): Date {
  const value = new Date(now);
  value.setDate(1);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function countUsedPostsByPlan(posts: PostRecord[], plan: UserPlan, now = new Date()): number {
  const policy = PLAN_LIMITS[plan];

  if (policy.window === "unlimited") {
    return posts.length;
  }

  if (policy.window === "daily") {
    const dayStart = getDayStart(now).getTime();
    return posts.filter((post) => new Date(post.createdAt).getTime() >= dayStart).length;
  }

  const monthStart = getMonthStart(now).getTime();
  return posts.filter((post) => new Date(post.createdAt).getTime() >= monthStart).length;
}

export function getUsageSnapshot(posts: PostRecord[], plan: UserPlan, now = new Date()): UsageSnapshot {
  const policy = PLAN_LIMITS[plan];
  const used = countUsedPostsByPlan(posts, plan, now);

  if (policy.limit === null) {
    return {
      plan,
      used,
      limit: null,
      remaining: null,
      window: policy.window
    };
  }

  const remaining = Math.max(policy.limit - used, 0);

  return {
    plan,
    used,
    limit: policy.limit,
    remaining,
    window: policy.window
  };
}

export function isLimitExceeded(snapshot: UsageSnapshot): boolean {
  return snapshot.limit !== null && snapshot.used >= snapshot.limit;
}
