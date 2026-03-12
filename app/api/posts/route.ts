import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/server-user";
import { listPosts } from "@/lib/store/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const posts = await listPosts(userId);
  return NextResponse.json({ posts });
}
