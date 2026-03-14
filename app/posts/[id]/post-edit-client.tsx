"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { toExportText } from "@/lib/domain/export";

interface PostItem {
  id: string;
  title: string;
  body: string;
  faq: string;
  cta: string;
  exportText: string;
  keyword: string;
  nextSuggestions: string[];
  createdAt: string;
}

interface PostEditClientProps {
  postId: string;
}

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function PostEditClient({ postId }: PostEditClientProps): React.ReactNode {
  const router = useRouter();
  const [post, setPost] = useState<PostItem | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [faq, setFaq] = useState("");
  const [cta, setCta] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
  const draftStorageKey = `blbi:post-editor:${postId}`;

  useEffect(() => {
    async function loadPost(): Promise<void> {
      setLoading(true);

      try {
        const response = await fetch(`/api/posts/${postId}`, { cache: "no-store" });

        if (!response.ok) {
          setStatus({ type: "error", message: "편집할 글을 찾을 수 없습니다." });
          return;
        }

        const json = (await response.json()) as { post: PostItem };
        let nextTitle = json.post.title;
        let nextBody = json.post.body;
        let nextFaq = json.post.faq;
        let nextCta = json.post.cta;

        if (typeof window !== "undefined") {
          try {
            const rawDraft = window.localStorage.getItem(draftStorageKey);

            if (rawDraft) {
              const draft = JSON.parse(rawDraft) as {
                title?: string;
                body?: string;
                faq?: string;
                cta?: string;
              };

              nextTitle = draft.title ?? nextTitle;
              nextBody = draft.body ?? nextBody;
              nextFaq = draft.faq ?? nextFaq;
              nextCta = draft.cta ?? nextCta;
            }
          } catch {
            window.localStorage.removeItem(draftStorageKey);
          }
        }

        setPost(json.post);
        setTitle(nextTitle);
        setBody(nextBody);
        setFaq(nextFaq);
        setCta(nextCta);
      } catch {
        setStatus({ type: "error", message: "편집 화면을 불러오는 중 오류가 발생했습니다." });
      } finally {
        setLoading(false);
      }
    }

    loadPost().catch(() => undefined);
  }, [draftStorageKey, postId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        title,
        body,
        faq,
        cta
      })
    );
  }, [body, cta, draftStorageKey, faq, title]);

  const exportText = useMemo(
    () =>
      toExportText({
        title,
        body,
        faq,
        cta
      }),
    [body, cta, faq, title]
  );

  const completionItems = useMemo(
    () => [
      { label: "제목", ready: Boolean(title.trim()) },
      { label: "본문", ready: Boolean(body.trim()) },
      { label: "FAQ", ready: Boolean(faq.trim()) },
      { label: "마무리 안내", ready: Boolean(cta.trim()) }
    ],
    [body, cta, faq, title]
  );
  const readyCount = completionItems.filter((item) => item.ready).length;

  async function handleSave(): Promise<void> {
    setStatus({ type: "info", message: "편집 내용을 저장하고 있습니다..." });

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          faq,
          cta
        })
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "저장에 실패했습니다." });
        return;
      }

      const json = (await response.json()) as { post: PostItem };
      setPost(json.post);
      setTitle(json.post.title);
      setBody(json.post.body);
      setFaq(json.post.faq);
      setCta(json.post.cta);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftStorageKey);
      }
      setStatus({ type: "success", message: "편집 내용을 저장했습니다." });
    } catch {
      setStatus({ type: "error", message: "저장 중 오류가 발생했습니다." });
    }
  }

  async function handleRewrite(mode: "rewrite" | "short" | "long"): Promise<void> {
    setStatus({ type: "info", message: "본문을 다듬는 중입니다..." });

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, mode })
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "본문 다듬기에 실패했습니다." });
        return;
      }

      const json = (await response.json()) as { post: PostItem };
      setPost(json.post);
      setTitle(json.post.title);
      setBody(json.post.body);
      setFaq(json.post.faq);
      setCta(json.post.cta);
      setStatus({ type: "success", message: "본문을 다시 정리했습니다." });
    } catch {
      setStatus({ type: "error", message: "본문 다듬기 중 오류가 발생했습니다." });
    }
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(exportText);
      setStatus({ type: "success", message: "복사했습니다. 네이버 블로그에 바로 붙여넣을 수 있습니다." });
    } catch {
      setStatus({ type: "error", message: "복사에 실패했습니다." });
    }
  }

  async function handleDelete(): Promise<void> {
    const confirmed = window.confirm("이 글을 완전히 삭제할까요?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });

      if (!response.ok) {
        setStatus({ type: "error", message: "삭제에 실패했습니다." });
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(draftStorageKey);
      }

      router.push("/history");
    } catch {
      setStatus({ type: "error", message: "삭제 중 오류가 발생했습니다." });
    }
  }

  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="chips" aria-label="편집 안내">
          <span className="pill">전용 편집 화면</span>
          <span className="pill">임시 저장 복원</span>
          <span className="pill">복붙 결과 동기화</span>
        </div>

        <div className="section-stack">
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
            결과를 길게 손봐야 할 때는 여기서 집중해서 편집하면 됩니다
          </h1>
          <p className="help">결과 화면보다 더 집중해서 제목, 본문, FAQ, 마무리 안내를 다듬는 전용 화면입니다.</p>
        </div>

        {loading && <div className="status">편집 화면을 불러오는 중...</div>}
        {post && (
          <div className="info-grid">
            <div className="compact-card">
              <strong>키워드</strong>
              <div>{post.keyword}</div>
              <div className="meta-line">원본 생성 시각 {formatCreatedAt(post.createdAt)}</div>
            </div>
            <div className="compact-card">
              <strong>편집 준비도</strong>
              <div>
                {readyCount} / {completionItems.length}
              </div>
              <div className="meta-line">비어 있는 항목만 채우면 바로 저장 후 복사할 수 있습니다.</div>
            </div>
          </div>
        )}
      </section>

      <section className="result-grid-primary">
        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <h2 className="section-title">원고 편집</h2>
            <p className="help">수정 중인 내용은 이 브라우저에 임시 저장됩니다.</p>
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="editor-title">
              제목
            </label>
            <input id="editor-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="editor-body">
              본문
            </label>
            <textarea id="editor-body" className="textarea" value={body} onChange={(event) => setBody(event.target.value)} />
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="editor-faq">
              FAQ
            </label>
            <textarea id="editor-faq" className="textarea" value={faq} onChange={(event) => setFaq(event.target.value)} />
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="editor-cta">
              마무리 안내
            </label>
            <textarea id="editor-cta" className="textarea" value={cta} onChange={(event) => setCta(event.target.value)} />
          </div>

          <div className="inline-actions">
            <button type="button" className="btn btn-primary" onClick={() => void handleSave()}>
              저장
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => void handleRewrite("rewrite")}>
              본문 다듬기
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => void handleRewrite("short")}>
              더 짧게
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => void handleRewrite("long")}>
              더 길게
            </button>
          </div>
        </section>

        <aside className="page-stack">
          <section className="copy-panel">
            <div className="section-stack">
              <h2 className="section-title">복붙 결과</h2>
              <p className="help">저장하지 않아도 현재 편집 상태를 기준으로 미리 봅니다.</p>
            </div>
            <div className="pre">{exportText}</div>
            <div className="inline-actions">
              <button type="button" className="btn btn-primary" onClick={() => void handleCopy()}>
                복사
              </button>
              <Link href={`/result?postId=${postId}`} className="btn btn-secondary">
                결과 화면
              </Link>
            </div>
          </section>

          <section className="card section-stack tone-surface">
            <div className="section-stack">
              <h2 className="section-title">편집 체크</h2>
              <p className="help">네 항목이 채워질수록 바로 발행하기 편합니다.</p>
            </div>
            <div className="check-list">
              {completionItems.map((item) => (
                <div key={item.label} className="check-item">
                  <span className={`check-badge ${item.ready ? "is-ready" : "is-pending"}`}>{item.ready ? "완료" : "확인"}</span>
                  <div className="section-stack" style={{ gap: "0.2rem" }}>
                    <strong>{item.label}</strong>
                    <span className="small-note">{item.ready ? "현재 내용이 들어 있습니다." : "비어 있으면 발행 전에 한 번 더 확인해 주세요."}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}

      <section className="inline-actions">
        <Link href="/history" className="btn btn-secondary">
          히스토리로
        </Link>
        <Link href={`/result?postId=${postId}`} className="btn btn-secondary">
          결과 화면으로
        </Link>
        <button type="button" className="btn btn-danger" onClick={() => void handleDelete()}>
          삭제
        </button>
      </section>
    </div>
  );
}
