"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const PHOTO_MARKER = "[사진 촬영 가이드]";

interface PostItem {
  id: string;
  title: string;
  body: string;
  exportText: string;
  keyword: string;
  createdAt: string;
}

function previewBody(body: string): string {
  return body
    .split("\n")
    .map((line) => {
      if (!line.includes(PHOTO_MARKER)) {
        return line;
      }

      const text = line.replace(PHOTO_MARKER, "").replace(/[:\-]/, "").trim();
      return `사진 가이드 : ${text}`;
    })
    .join("\n");
}

export default function ResultPage(): React.ReactNode {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [post, setPost] = useState<PostItem | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPost(id: string): Promise<void> {
      setLoading(true);

      try {
        const response = await fetch(`/api/posts/${id}`, { cache: "no-store" });

        if (!response.ok) {
          setStatus({ type: "error", message: "결과 글을 찾을 수 없습니다." });
          return;
        }

        const json = (await response.json()) as { post: PostItem };
        setPost(json.post);
        setTitle(json.post.title);
        setBody(json.post.body);
      } catch {
        setStatus({ type: "error", message: "결과를 불러오는 중 오류가 발생했습니다." });
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      loadPost(postId).catch(() => undefined);
    }
  }, [postId]);

  const preview = useMemo(() => previewBody(body), [body]);

  async function handleSave(): Promise<void> {
    if (!post) {
      return;
    }

    setStatus({ type: "info", message: "저장 중입니다..." });

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body })
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "저장에 실패했습니다." });
        return;
      }

      const json = (await response.json()) as { post: PostItem };
      setPost(json.post);
      setStatus({ type: "success", message: "수정 내용이 저장되었습니다." });
    } catch {
      setStatus({ type: "error", message: "저장 중 오류가 발생했습니다." });
    }
  }

  async function handleRewrite(mode: "rewrite" | "short" | "long"): Promise<void> {
    if (!post) {
      return;
    }

    setStatus({ type: "info", message: "본문을 다듬는 중입니다..." });

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, mode })
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "다듬기에 실패했습니다." });
        return;
      }

      const json = (await response.json()) as { post: PostItem };
      setPost(json.post);
      setTitle(json.post.title);
      setBody(json.post.body);
      setStatus({ type: "success", message: "본문 다듬기가 적용되었습니다." });
    } catch {
      setStatus({ type: "error", message: "다듬기 중 오류가 발생했습니다." });
    }
  }

  async function handleCopy(): Promise<void> {
    if (!post) {
      return;
    }

    try {
      await navigator.clipboard.writeText(post.exportText);
      setStatus({ type: "success", message: "네이버 복붙용 텍스트를 복사했습니다." });
    } catch {
      setStatus({ type: "error", message: "복사에 실패했습니다." });
    }
  }

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.4rem" }}>생성 결과</h1>
        <p className="help">보이는 결과와 복사 결과가 거의 같도록 구성되었습니다.</p>

        {!postId && <div className="status error">postId가 없어 결과를 불러올 수 없습니다.</div>}
        {loading && <div className="status">결과를 불러오는 중...</div>}

        {post && (
          <>
            <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
            <textarea className="textarea" value={body} onChange={(event) => setBody(event.target.value)} />

            <div className="row">
              <button className="btn btn-primary" onClick={() => void handleSave()} type="button">
                저장
              </button>
              <button className="btn btn-secondary" onClick={() => void handleCopy()} type="button">
                소스 없이 복사
              </button>
              <button className="btn btn-secondary" onClick={() => void handleRewrite("rewrite")} type="button">
                본문 다듬기
              </button>
              <button className="btn btn-secondary" onClick={() => void handleRewrite("short")} type="button">
                짧게
              </button>
              <button className="btn btn-secondary" onClick={() => void handleRewrite("long")} type="button">
                길게
              </button>
            </div>
          </>
        )}
      </section>

      {post && (
        <section className="card" style={{ display: "grid", gap: "0.75rem" }}>
          <h2 className="section-title">원고 미리보기</h2>
          <div className="pre">{preview}</div>
        </section>
      )}

      {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}

      <section className="row">
        <Link href="/dashboard" className="btn btn-secondary">
          다시 생성하기
        </Link>
        <Link href="/history" className="btn btn-secondary">
          히스토리 보기
        </Link>
      </section>
    </div>
  );
}
