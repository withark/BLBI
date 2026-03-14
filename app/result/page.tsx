"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [post, setPost] = useState<PostItem | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [faq, setFaq] = useState("");
  const [cta, setCta] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const draftStorageKey = post ? `blbi:result-draft:${post.id}` : null;

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
        let nextTitle = json.post.title;
        let nextBody = json.post.body;
        let nextFaq = json.post.faq;
        let nextCta = json.post.cta;

        if (typeof window !== "undefined") {
          try {
            const rawDraft = window.localStorage.getItem(`blbi:result-draft:${json.post.id}`);

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
            window.localStorage.removeItem(`blbi:result-draft:${json.post.id}`);
          }
        }

        setPost(json.post);
        setTitle(nextTitle);
        setBody(nextBody);
        setFaq(nextFaq);
        setCta(nextCta);
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
  const publishChecklist = useMemo(
    () => [
      {
        label: "제목과 본문",
        ready: Boolean(title.trim() && body.trim()),
        note: "핵심 키워드와 본문 흐름이 비어 있지 않은지 확인"
      },
      {
        label: "사진 가이드",
        ready: photoGuides.length > 0,
        note: photoGuides.length > 0 ? `${photoGuides.length}개 가이드 준비됨` : "사진 순서를 한 번 더 정리하면 좋습니다."
      },
      {
        label: "FAQ",
        ready: Boolean(faq.trim()),
        note: faq.trim() ? "질문 블록이 포함됩니다." : "FAQ 없이도 발행 가능하지만 정보성이 줄어듭니다."
      },
      {
        label: "마무리 안내",
        ready: Boolean(cta.trim()),
        note: cta.trim() ? "마지막 방문 안내가 포함됩니다." : "마지막 행동 유도 문장을 넣으면 더 자연스럽습니다."
      }
    ],
    [body, cta, faq, photoGuides.length, title]
  );
  const publishReadyCount = publishChecklist.filter((item) => item.ready).length;
  const publishNextSteps = [
    "네이버 블로그 새 글 화면에 복사 결과를 그대로 붙여넣기",
    photoGuides.length > 0 ? `사진 ${Math.min(photoGuides.length, 3)}장 이상을 가이드 순서대로 배치` : "가게 외관, 대표 메뉴, 분위기 사진을 최소 3장 준비",
    "제목에 핵심 키워드가 자연스럽게 들어갔는지 마지막 확인",
    "발행 후 다음 추천 키워드 하나를 바로 이어서 생성"
  ];
  const usageFitLabel = body.includes("점심") || title.includes("점심")
    ? "점심 손님 유입용"
    : body.includes("저녁") || title.includes("저녁")
      ? "저녁 방문 유도용"
      : body.includes("주말") || title.includes("주말")
        ? "주말 방문 유도용"
        : "상시 노출용";

  useEffect(() => {
    if (!draftStorageKey || typeof window === "undefined") {
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
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`blbi:result-draft:${json.post.id}`);
      }
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
      setFaq(json.post.faq);
      setCta(json.post.cta);
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

  async function handleDelete(): Promise<void> {
    if (!post) {
      return;
    }

    const confirmed = window.confirm("이 글을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setStatus({ type: "error", message: "삭제에 실패했습니다." });
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(`blbi:result-draft:${post.id}`);
      }

      router.push("/history");
    } catch {
      setStatus({ type: "error", message: "삭제 중 오류가 발생했습니다." });
    }
  }

  return (
    <div className="result-grid">
      <section className="card hero-card accent-card">
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
          <div className="card section-stack tone-surface">
            <div className="section-stack">
              <h2 className="section-title">본문 확인 및 수정</h2>
              <p className="help">제목과 본문을 가볍게 다듬은 뒤 저장할 수 있습니다.</p>
              <p className="small-note">저장 전 수정 내용은 이 브라우저에 임시 저장됩니다.</p>
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
              <Link className="btn btn-secondary" href={`/posts/${post.id}`}>
                편집 전용 화면
              </Link>
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
          <div className="card section-stack tone-surface">
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
        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <h2 className="section-title">발행 전 10초 체크</h2>
            <p className="help">지금 복사해도 되는지 마지막으로 보는 확인판입니다. 네 항목 중 많이 채워질수록 바로 발행하기 편합니다.</p>
          </div>

          <div className="quality-meter">
            <div className="quality-meter-head">
              <strong>{publishReadyCount === publishChecklist.length ? "바로 발행 가능" : "조금만 확인하면 발행 가능"}</strong>
              <span className="small-note">
                {publishReadyCount} / {publishChecklist.length} 항목 준비
              </span>
            </div>
            <div className="quality-track" aria-hidden="true">
              <div className="quality-fill" style={{ width: `${Math.max((publishReadyCount / publishChecklist.length) * 100, 8)}%` }} />
            </div>
          </div>

          <div className="step-grid">
            {publishChecklist.map((item, index) => (
              <article key={item.label} className="step-card" style={item.ready ? undefined : { opacity: 0.7 }}>
                <div className="step-kicker">{index + 1}</div>
                <div className="step-title">{item.label}</div>
                <div className="step-body">{item.note}</div>
              </article>
            ))}
          </div>
        </section>
      )}

      {post && (
        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <h2 className="section-title">복사 후 바로 할 일</h2>
            <p className="help">이 화면에서 저장과 복사를 마쳤다면, 아래 순서대로 바로 발행까지 이어가면 됩니다.</p>
          </div>

          <div className="step-grid">
            {publishNextSteps.map((step, index) => (
              <article key={step} className="step-card">
                <div className="step-kicker">{index + 1}</div>
                <div className="step-title">다음 행동</div>
                <div className="step-body">{step}</div>
              </article>
            ))}
          </div>

          <div className="inline-actions">
            <Link href={`/dashboard?keyword=${encodeURIComponent(post.keyword)}`} className="btn btn-secondary">
              같은 키워드로 다시 생성
            </Link>
            <Link href={post.nextSuggestions[0] ? `/dashboard?keyword=${encodeURIComponent(post.nextSuggestions[0])}` : "/dashboard"} className="btn btn-secondary">
              다음 추천으로 이어쓰기
            </Link>
          </div>
        </section>
      )}

      {post && (
        <section className="card section-stack tone-surface">
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
        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <h2 className="section-title">다음 글 이어쓰기</h2>
            <p className="help">이번 글은 현재 <strong>{usageFitLabel}</strong> 톤으로 읽히기 좋습니다. 자연스럽게 이어지는 다음 키워드를 바로 눌러 새 글로 넘어갈 수 있습니다.</p>
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
        {post && (
          <button type="button" className="btn btn-danger" onClick={() => void handleDelete()}>
            삭제
          </button>
        )}
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
