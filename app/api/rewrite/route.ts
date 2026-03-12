import { NextRequest, NextResponse } from "next/server";

import { rewriteBody } from "@/lib/domain/generate";
import { toExportText } from "@/lib/domain/export";
import { getUserIdFromRequest } from "@/lib/server-user";
import { getUserPost, updatePost } from "@/lib/store/db";

export const dynamic = "force-dynamic";

type RewriteMode = "rewrite" | "short" | "long";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const payload = (await request.json()) as { postId?: string; mode?: RewriteMode };

  if (!payload.postId || !payload.mode) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "postId와 mode가 필요합니다." }, { status: 400 });
  }

  const post = await getUserPost(userId, payload.postId);

  if (!post) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const nextBody = rewriteBody(post.body, payload.mode);
  const updated = await updatePost(userId, post.id, {
    body: nextBody,
    exportText: toExportText({
      title: post.title,
      body: nextBody,
      faq: post.faq,
      cta: post.cta
    })
  });

  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ post: updated });
}
