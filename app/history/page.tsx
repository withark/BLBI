"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface PostItem {
  id: string;
  title: string;
  keyword: string;
  exportText: string;
  createdAt: string;
  plan: "FREE" | "BASIC" | "PREMIUM";
}

type PlanFilter = "ALL" | PostItem["plan"];
type PeriodFilter = "ALL" | "TODAY" | "MONTH";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function buildExcerpt(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function isWithinPeriod(value: string, period: PeriodFilter): boolean {
  if (period === "ALL") {
    return true;
  }

  const createdAt = new Date(value).getTime();
  const now = new Date();

  if (period === "TODAY") {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    return createdAt >= dayStart.getTime();
  }

  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return createdAt >= monthStart.getTime();
}

export default function HistoryPage(): React.ReactNode {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("ALL");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("ALL");
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    async function loadPosts(): Promise<void> {
      try {
        const response = await fetch("/api/posts", { cache: "no-store" });

        if (!response.ok) {
          setStatus({ type: "error", message: "히스토리를 불러오지 못했습니다." });
          return;
        }

        const json = (await response.json()) as { posts: PostItem[] };
        setPosts(json.posts);
      } catch {
        setStatus({ type: "error", message: "히스토리를 불러오지 못했습니다." });
      }
    }

    loadPosts().catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = keywordFilter.trim().toLowerCase();

    if (!q) {
      return posts;
    }

    return posts.filter((post) => {
      const matchesQuery = !q || post.keyword.toLowerCase().includes(q) || post.title.toLowerCase().includes(q);
      const matchesPlan = planFilter === "ALL" || post.plan === planFilter;
      const matchesPeriod = isWithinPeriod(post.createdAt, periodFilter);
      return matchesQuery && matchesPlan && matchesPeriod;
    });
  }, [keywordFilter, periodFilter, planFilter, posts]);
  const keywordChips = useMemo(() => {
    const counts = new Map<string, number>();

    for (const post of posts) {
      counts.set(post.keyword, (counts.get(post.keyword) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([keyword]) => keyword);
  }, [posts]);

  async function copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ type: "success", message: "복사했습니다. 바로 붙여넣어 사용할 수 있습니다." });
    } catch {
      setStatus({ type: "error", message: "복사에 실패했습니다." });
    }
  }

  return (
    <div className="page-stack">
      <section className="card hero-card">
        <div className="chips" aria-label="히스토리 안내">
          <span className="pill">다시 보기</span>
          <span className="pill">복사</span>
          <span className="pill">키워드 재사용</span>
        </div>

        <div className="section-stack">
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
            저장된 글을 다시 열고, 복사하고, 다음 글로 이어서 씁니다
          </h1>
          <p className="help">이전 글을 그대로 두고 필요할 때 다시 꺼내 쓰는 운영 화면입니다.</p>
        </div>

        <div className="info-grid">
          <div className="compact-card">
            <strong>저장된 글</strong>
            <div>{posts.length}개</div>
            <div className="meta-line">최근에 만든 글부터 다시 확인할 수 있습니다.</div>
          </div>
          <div className="compact-card">
            <strong>현재 검색 결과</strong>
            <div>{filtered.length}개</div>
            <div className="meta-line">키워드나 제목 일부만 입력해도 찾을 수 있습니다.</div>
          </div>
        </div>
      </section>

      <section className="card section-stack">
        <div className="section-stack">
          <h2 className="section-title">글 찾기</h2>
          <p className="help">메뉴명, 지역명, 제목 일부로 검색해 보세요.</p>
        </div>

        <input
          className="input"
          placeholder="예: 칼국수, 브런치, 회식"
          value={keywordFilter}
          onChange={(event) => setKeywordFilter(event.target.value)}
        />

        <div className="chips">
          <button type="button" className={`chip ${planFilter === "ALL" ? "chip-active" : ""}`.trim()} onClick={() => setPlanFilter("ALL")}>
            전체 플랜
          </button>
          <button type="button" className={`chip ${planFilter === "FREE" ? "chip-active" : ""}`.trim()} onClick={() => setPlanFilter("FREE")}>
            Free
          </button>
          <button type="button" className={`chip ${planFilter === "BASIC" ? "chip-active" : ""}`.trim()} onClick={() => setPlanFilter("BASIC")}>
            Basic
          </button>
          <button type="button" className={`chip ${planFilter === "PREMIUM" ? "chip-active" : ""}`.trim()} onClick={() => setPlanFilter("PREMIUM")}>
            Premium
          </button>
          <button type="button" className={`chip ${periodFilter === "ALL" ? "chip-active" : ""}`.trim()} onClick={() => setPeriodFilter("ALL")}>
            전체 기간
          </button>
          <button type="button" className={`chip ${periodFilter === "TODAY" ? "chip-active" : ""}`.trim()} onClick={() => setPeriodFilter("TODAY")}>
            오늘 생성
          </button>
          <button type="button" className={`chip ${periodFilter === "MONTH" ? "chip-active" : ""}`.trim()} onClick={() => setPeriodFilter("MONTH")}>
            이번 달
          </button>
        </div>

        {keywordChips.length > 0 && (
          <div className="section-stack">
            <p className="small-note">자주 쓴 키워드를 누르면 바로 검색됩니다.</p>
            <div className="chips">
              {keywordChips.map((keyword) => (
                <button key={keyword} type="button" className="chip" onClick={() => setKeywordFilter(keyword)}>
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {filtered.length === 0 ? (
        <section className="card section-stack">
          <strong>{posts.length === 0 ? "아직 저장된 글이 없습니다" : "검색 결과가 없습니다"}</strong>
          <p className="small-note">
            {posts.length === 0
              ? "대시보드에서 첫 글을 만들면 이 화면에서 다시 열고 복사할 수 있습니다."
              : "다른 키워드나 제목으로 다시 검색해 보세요."}
          </p>
          <div className="inline-actions">
            <Link className="btn btn-primary" href="/dashboard">
              새 글 만들기
            </Link>
            <Link className="btn btn-secondary" href="/dashboard">
              대시보드로 이동
            </Link>
          </div>
        </section>
      ) : (
        <section className="history-list">
          {filtered.map((post) => (
            <article key={post.id} className="card history-card">
              <div className="section-stack">
                <h2 style={{ fontSize: "1.08rem", lineHeight: 1.45 }}>{post.title}</h2>
                <p className="meta-line">
                  키워드: {post.keyword} · 플랜: {post.plan} · {formatDate(post.createdAt)}
                </p>
                <p className="excerpt">{buildExcerpt(post.exportText)}...</p>
              </div>

              <div className="inline-actions">
                <Link className="btn btn-secondary" href={`/result?postId=${post.id}`}>
                  결과 보기
                </Link>
                <button type="button" className="btn btn-secondary" onClick={() => void copyText(post.exportText)}>
                  복사
                </button>
                <Link className="btn btn-secondary" href={`/dashboard?keyword=${encodeURIComponent(post.keyword)}`}>
                  키워드 재사용
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}
    </div>
  );
}
