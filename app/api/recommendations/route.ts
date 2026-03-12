import { NextRequest, NextResponse } from "next/server";

import { dedupeRecommendations } from "@/lib/domain/recommendations";
import { getUserIdFromRequest } from "@/lib/server-user";
import { listRecommendations } from "@/lib/store/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = Number(limitRaw ?? 6);
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 20) : 6;
  const recommendations = await listRecommendations(userId, safeLimit * 2);

  return NextResponse.json({ recommendations: dedupeRecommendations(recommendations, safeLimit) });
}
