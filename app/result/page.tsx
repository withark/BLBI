"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { toExportText } from "@/lib/domain/export";

const PHOTO_MARKER = "[사진 촬영 가이드]";

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

function extractPhotoGuides(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("사진 가이드 :"))
    .map((line) => line.replace("사진 가이드 :", "").trim())
    .filter(Boolean);
}

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function ResultContent(): React.ReactNode {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [post, setPost] = useState<PostItem | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [faq, setFaq] = useState("");
  const [cta, setCta] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPost(id: string): Promise<void> {
      setLoading(true);

      try {
        const response = await fetch(`/api/posts/${id}`, { cache: "no-store" });

        if (!response.ok) {
          setStatus({ type: "error", message: "결과 글을 찾을 수 없습니다. 다시 생성 화면으로 돌아가 주세요." });
          return;
        }

        const json = (await response.json()) as { post: PostItem };
        setPost(json.post);
        setTitle(json.post.title);
        setBody(json.post.body);
        setFaq(json.post.faq);
        setCta(json.post.cta);
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
  const previewExportText = useMemo(() => {
    if (!post) {
      return "";
    }

    return toExportText({
      title,
      body,
      faq,
      cta
    });
  }, [body, cta, faq, post, title]);
  const photoGuides = useMemo(() => extractPhotoGuides(previewExportText), [previewExportText]);

  async function handleSave(): Promise<void> {
    if (!post) {
      return;
    }

    setStatus({ type: "info", message: "수정 내용을 저장하고 있습니다..." });

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, faq, cta })
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "저장에 실패했습니다." });
        return;
      }

      const json = (await response.json()) as { post: PostItem };
      setPost(json.post);
      setFaq(json.post.faq);
      setCta(json.post.cta);
      setStatus({ type: "success", message: "수정 내용을 저장했습니다." });
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
      await navigator.clipboard.writeText(previewExportText);
      setStatus({ type: "success", message: "네이버 복붙용 텍스트를 복사했습니다." });
    } catch {
      setStatus({ type: "error", message: "복사에 실패했습니다." });
    }
  }

  return (
    <div className="result-grid">
      <section className="card hero-card">
        <div className="chips" aria-label="결과 요약">
          <span className="pill">순수 텍스트 복사</span>
          <span className="pill">사진 가이드 포함</span>
          <span className="pill">수정 후 저장 가능</span>
        </div>

        <div className="section-stack">
          <h1 className="hero-title" style={{ fontSize: "1.85rem" }}>
            생성 결과를 바로 복사하고, 필요하면 조금만 다듬으세요
          </h1>
          <p className="help">화면에서 보는 결과와 실제 복사되는 텍스트가 최대한 비슷하도록 구성했습니다.</p>
        </div>

        {!postId && <div className="status error">postId가 없어 결과를 불러올 수 없습니다.</div>}
        {loading && <div className="status">결과를 불러오는 중...</div>}

        {post && (
          <div className="step-grid">
            <div className="step-card">
              <div className="step-kicker">키워드</div>
              <div className="step-title">{post.keyword}</div>
              <div className="step-body">이번 글의 핵심 검색 키워드입니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">작성 시각</div>
              <div className="step-title">{formatCreatedAt(post.createdAt)}</div>
              <div className="step-body">저장 후 히스토리에서도 다시 확인할 수 있습니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">복사 포맷</div>
              <div className="step-title">HTML 없는 순수 텍스트</div>
              <div className="step-body">네이버 블로그에 붙여넣기 쉬운 형식으로 유지됩니다.</div>
            </div>
          </div>
        )}
      </section>

      {post && (
        <section className="result-grid-primary">
          <div className="card section-stack">
            <div className="section-stack">
              <h2 className="section-title">본문 확인 및 수정</h2>
              <p className="help">제목과 본문을 가볍게 다듬은 뒤 저장할 수 있습니다.</p>
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="post-title">
                제목
              </label>
              <input id="post-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="post-body">
                본문
              </label>
              <textarea id="post-body" className="textarea" value={body} onChange={(event) => setBody(event.target.value)} />
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="post-faq">
                FAQ
              </label>
              <textarea
                id="post-faq"
                className="textarea"
                value={faq}
                onChange={(event) => setFaq(event.target.value)}
                placeholder="자주 묻는 질문이 있으면 그대로 두고, 필요 없으면 비워도 됩니다."
              />
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="post-cta">
                마무리 안내
              </label>
              <textarea
                id="post-cta"
                className="textarea"
                value={cta}
                onChange={(event) => setCta(event.target.value)}
                placeholder="방문 전 확인할 점이나 마지막 안내 문구를 넣어 주세요."
              />
            </div>

            <div className="inline-actions">
              <button className="btn btn-primary" onClick={() => void handleSave()} type="button">
                수정 저장
              </button>
              <button className="btn btn-secondary" onClick={() => void handleRewrite("rewrite")} type="button">
                본문 다듬기
              </button>
              <button className="btn btn-secondary" onClick={() => void handleRewrite("short")} type="button">
                더 짧게
              </button>
              <button className="btn btn-secondary" onClick={() => void handleRewrite("long")} type="button">
                더 길게
              </button>
            </div>
          </div>

          <div className="copy-panel">
            <div className="section-stack">
              <h2 className="section-title">네이버 복붙용 결과</h2>
              <p className="help">아래 텍스트가 실제 복사되는 결과입니다. FAQ와 마무리 안내까지 즉시 반영됩니다.</p>
            </div>

            <div className="pre">{previewExportText}</div>

            <div className="inline-actions">
              <button className="btn btn-primary" onClick={() => void handleCopy()} type="button">
                결과 복사
              </button>
              <Link href="/history" className="btn btn-secondary">
                히스토리 보기
              </Link>
            </div>
          </div>
        </section>
      )}

      {post && (
        <section className="result-grid-primary">
          <div className="card section-stack">
            <div className="section-stack">
              <h2 className="section-title">원고 미리보기</h2>
              <p className="help">사진 가이드 줄과 본문 구조를 화면에서도 바로 확인할 수 있게 정리했습니다.</p>
            </div>
            <div className="pre">{preview}</div>
          </div>

          <div className="card section-stack">
            <div className="section-stack">
              <h2 className="section-title">FAQ와 마무리 안내</h2>
              <p className="help">복사 결과에 포함되는 마지막 블록도 화면에서 같이 확인합니다.</p>
            </div>

            <div className="surface-muted section-stack">
              <strong>FAQ</strong>
              <div className="pre">{faq.trim() || "현재 FAQ가 없습니다."}</div>
            </div>

            <div className="surface-muted section-stack">
              <strong>마무리 안내</strong>
              <div className="pre">{cta.trim() || "현재 마무리 안내가 없습니다."}</div>
            </div>
          </div>
        </section>
      )}

      {post && (
        <section className="card section-stack">
          <div className="section-stack">
            <h2 className="section-title">사진 촬영 가이드</h2>
            <p className="help">복사 결과에 포함되는 사진 가이드만 따로 빠르게 훑어볼 수 있습니다.</p>
          </div>

          {photoGuides.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">이번 결과에는 별도 사진 가이드가 없습니다.</p>
            </div>
          ) : (
            <ul className="list-clean">
              {photoGuides.map((guide) => (
                <li key={guide}>{guide}</li>
              ))}
            </ul>
          )}

          <div className="surface-muted section-stack">
            <strong>다음 행동</strong>
            <p className="small-note">복사 후 네이버 블로그에 붙여넣고, 사진은 위 가이드 순서대로 준비하면 됩니다.</p>
          </div>
        </section>
      )}

      {post && (
        <section className="card section-stack">
          <div className="section-stack">
            <h2 className="section-title">다음 글 이어쓰기</h2>
            <p className="help">이번 글과 자연스럽게 이어지는 다음 키워드를 바로 눌러 새 글로 넘어갈 수 있습니다.</p>
          </div>

          <div className="chips">
            {post.nextSuggestions.length === 0 && <span className="help">아직 추천 키워드가 없습니다.</span>}
            {post.nextSuggestions.map((suggestion) => (
              <Link key={suggestion} href={`/dashboard?keyword=${encodeURIComponent(suggestion)}`} className="chip">
                {suggestion}
              </Link>
            ))}
          </div>
        </section>
      )}

      {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}

      <section className="inline-actions">
        <Link href="/dashboard" className="btn btn-secondary">
          다시 생성하기
        </Link>
        <Link href="/history" className="btn btn-secondary">
          저장된 글 보기
        </Link>
      </section>
    </div>
  );
}

export default function ResultPage(): React.ReactNode {
  return (
    <Suspense fallback={<div className="status">결과 페이지 로딩 중...</div>}>
      <ResultContent />
    </Suspense>
  );
}
