import { NextRequest, NextResponse } from "next/server";

import type { UserPlan } from "@/lib/domain/types";
import { getUserIdFromRequest } from "@/lib/server-user";
import { getOrCreateUser, setUserPlan } from "@/lib/store/db";

const PLAN_SET: UserPlan[] = ["FREE", "BASIC", "PREMIUM"];

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const user = await getOrCreateUser(userId);
  return NextResponse.json({ plan: user.plan });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const payload = (await request.json()) as { plan?: UserPlan };

  if (!payload.plan || !PLAN_SET.includes(payload.plan)) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "유효한 플랜을 선택해 주세요." }, { status: 400 });
  }

  const user = await setUserPlan(userId, payload.plan);
  return NextResponse.json({ plan: user.plan });
}
