import { NextRequest, NextResponse } from "next/server";

import { generateSeriesTopics } from "@/lib/domain/generate";
import { isSeriesAllowed } from "@/lib/domain/plan";
import { getUserIdFromRequest } from "@/lib/server-user";
import { getBusinessProfile, getOrCreateUser } from "@/lib/store/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const user = await getOrCreateUser(userId);

  if (!isSeriesAllowed(user.plan)) {
    return NextResponse.json(
      {
        error: "PREMIUM_REQUIRED",
        message: "시리즈 주제 생성은 Premium 플랜에서 사용할 수 있습니다."
      },
      { status: 403 }
    );
  }

  const payload = (await request.json()) as { keyword?: string };
  const keyword = payload.keyword?.trim();

  if (!keyword) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "키워드를 입력해 주세요." }, { status: 400 });
  }

  const profile = await getBusinessProfile(userId);
  const topics = generateSeriesTopics(keyword, profile?.region || "우리 동네");

  return NextResponse.json({ topics });
}
