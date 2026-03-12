import { NextRequest, NextResponse } from "next/server";

import { rewriteBody } from "@/lib/domain/generate";
import { sanitizeExportText } from "@/lib/domain/export";
import { getUserIdFromRequest } from "@/lib/server-user";
import { getPost, updatePost } from "@/lib/store/db";

export const dynamic = "force-dynamic";

type RewriteMode = "rewrite" | "short" | "long";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const payload = (await request.json()) as { postId?: string; mode?: RewriteMode };

  if (!payload.postId || !payload.mode) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "postId와 mode가 필요합니다." }, { status: 400 });
  }

  const post = await getPost(payload.postId);

  if (!post || post.userId !== userId) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const nextBody = rewriteBody(post.body, payload.mode);
  const updated = await updatePost(userId, post.id, {
    body: nextBody,
    exportText: sanitizeExportText([post.title, nextBody].join("\n\n"))
  });

  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ post: updated });
}
