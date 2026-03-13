import { NextRequest, NextResponse } from "next/server";

import { sanitizeExportText, toExportText } from "@/lib/domain/export";
import { getUserIdFromRequest } from "@/lib/server-user";
import { deletePost, getUserPost, updatePost } from "@/lib/store/db";

export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Context): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const { id } = await context.params;
  const post = await getUserPost(userId, id);

  if (!post) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(request: NextRequest, context: Context): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const { id } = await context.params;
  const existing = await getUserPost(userId, id);

  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const payload = (await request.json()) as {
    title?: string;
    body?: string;
    faq?: string;
    cta?: string;
    exportText?: string;
  };

  const nextTitle = payload.title ?? existing.title;
  const nextBody = payload.body ?? existing.body;
  const nextFaq = payload.faq ?? existing.faq;
  const nextCta = payload.cta ?? existing.cta;
  const nextExportText =
    payload.exportText ??
    (payload.title !== undefined || payload.body !== undefined || payload.faq !== undefined || payload.cta !== undefined
      ? toExportText({
          title: nextTitle,
          body: nextBody,
          faq: nextFaq,
          cta: nextCta
        })
      : sanitizeExportText(existing.exportText));

  const updated = await updatePost(userId, id, {
    title: payload.title,
    body: payload.body,
    faq: payload.faq,
    cta: payload.cta,
    exportText: nextExportText
  });

  if (!updated) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ post: updated });
}

export async function DELETE(request: NextRequest, context: Context): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const { id } = await context.params;
  const deleted = await deletePost(userId, id);

  if (!deleted) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
