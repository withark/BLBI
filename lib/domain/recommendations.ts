import type { RecommendationRecord } from "@/lib/domain/types";

export function dedupeRecommendations(list: RecommendationRecord[], limit = 6): RecommendationRecord[] {
  const seen = new Set<string>();
  const deduped: RecommendationRecord[] = [];

  for (const item of list) {
    const key = item.keyword.trim().toLowerCase();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(item);

    if (deduped.length >= limit) {
      break;
    }
  }

  return deduped;
}
