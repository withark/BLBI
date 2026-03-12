import { NextRequest, NextResponse } from "next/server";

import { applyLimitBypass, getUsageSnapshot } from "@/lib/domain/usage";
import { getUserIdFromRequest } from "@/lib/server-user";
import { getOrCreateUser, listPosts } from "@/lib/store/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const user = await getOrCreateUser(userId);
  const posts = await listPosts(userId);
  const usage = applyLimitBypass(getUsageSnapshot(posts, user.plan), user.limitBypass);
  return NextResponse.json({ usage, plan: user.plan });
}
