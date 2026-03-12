import { NextRequest, NextResponse } from "next/server";

import { sanitizeExportText, toExportText } from "@/lib/domain/export";
import { getUserIdFromRequest } from "@/lib/server-user";
import { getPost, updatePost } from "@/lib/store/db";

export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: Context): Promise<NextResponse> {
  const { id } = await context.params;
  const post = await getPost(id);

  if (!post) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(request: NextRequest, context: Context): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const { id } = await context.params;
  const existing = await getPost(id);

  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const payload = (await request.json()) as {
    title?: string;
    body?: string;
    exportText?: string;
  };

  const nextTitle = payload.title ?? existing.title;
  const nextBody = payload.body ?? existing.body;
  const nextExportText =
    payload.exportText ??
    (payload.title !== undefined || payload.body !== undefined
      ? toExportText({
          title: nextTitle,
          body: nextBody
        })
      : sanitizeExportText(existing.exportText));

  const updated = await updatePost(userId, id, {
    title: payload.title,
    body: payload.body,
    exportText: nextExportText
  });

  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ post: updated });
}
