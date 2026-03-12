import { NextRequest, NextResponse } from "next/server";

import { generatePost } from "@/lib/domain/generate";
import { getLimitExceededMessage } from "@/lib/domain/plan";
import { getUsageSnapshot, isLimitExceeded } from "@/lib/domain/usage";
import { getUserIdFromRequest } from "@/lib/server-user";
import {
  createPost,
  getBusinessProfile,
  getOrCreateUser,
  listPosts,
  saveRecommendations
} from "@/lib/store/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = getUserIdFromRequest(request);
    const user = await getOrCreateUser(userId);
    const posts = await listPosts(userId);
    const usage = getUsageSnapshot(posts, user.plan);

    if (isLimitExceeded(usage)) {
      return NextResponse.json(
        {
          error: "LIMIT_EXCEEDED",
          message: getLimitExceededMessage(user.plan),
          usage
        },
        { status: 429 }
      );
    }

    const payload = (await request.json()) as {
      keyword?: string;
      details?: string;
      length?: "short" | "medium" | "long";
      tone?: "friendly" | "professional" | "warm";
      includeFaq?: boolean;
    };

    const keyword = payload.keyword?.trim();

    if (!keyword) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "키워드를 입력해 주세요." }, { status: 400 });
    }

    const businessProfile = await getBusinessProfile(userId);
    const generated = generatePost({
      keyword,
      details: payload.details,
      length: payload.length ?? "medium",
      tone: payload.tone ?? "friendly",
      includeFaq: payload.includeFaq ?? true,
      businessProfile
    });

    const post = await createPost(userId, {
      keyword,
      title: generated.title,
      body: generated.body,
      faq: generated.faq,
      cta: generated.cta,
      exportText: generated.exportText,
      nextSuggestions: generated.nextSuggestions,
      plan: user.plan,
      businessProfileId: businessProfile?.id
    });

    await saveRecommendations(userId, post.id, generated.nextSuggestions);

    const nextUsage = getUsageSnapshot(await listPosts(userId), user.plan);

    return NextResponse.json({ post, usage: nextUsage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: "INTERNAL_ERROR", message }, { status: 500 });
  }
}
