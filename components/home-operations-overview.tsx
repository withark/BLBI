"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type UsageState = {
  plan: "FREE" | "BASIC" | "PREMIUM";
  used: number;
  limit: number | null;
  remaining: number | null;
};

type ProfileState = {
  businessName: string;
  region: string;
  representativeMenus: string[];
  storeDescription: string;
};

type PostSummary = {
  id: string;
  keyword: string;
  title: string;
  createdAt: string;
};

function formatUsage(usage: UsageState | null): string {
  if (!usage) {
    return "사용량을 확인하는 중입니다.";
  }

  if (usage.limit === null) {
    return `이번 기간 ${usage.used}회 생성 · 무제한 사용`;
  }

  return `이번 기간 ${usage.used} / ${usage.limit}회 생성 · 남음 ${usage.remaining}회`;
}

export function HomeOperationsOverview(): React.ReactNode {
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    async function loadOverview(): Promise<void> {
      const [usageRes, profileRes, postsRes] = await Promise.all([
        fetch("/api/usage", { cache: "no-store" }),
        fetch("/api/business-profile", { cache: "no-store" }),
        fetch("/api/posts", { cache: "no-store" })
      ]);

      if (usageRes.ok) {
        const usageJson = (await usageRes.json()) as { usage: UsageState };
        setUsage(usageJson.usage);
      }

      if (profileRes.ok) {
        const profileJson = (await profileRes.json()) as { profile: ProfileState | null };
        setProfile(profileJson.profile);
      }

      if (postsRes.ok) {
        const postsJson = (await postsRes.json()) as { posts: PostSummary[] };
        setPosts(postsJson.posts.slice(0, 4));
      }
    }

    loadOverview().catch(() => undefined);
  }, []);

  const nextAction = useMemo(() => {
    if (!profile) {
      return {
        title: "가게 정보부터 1회 등록",
        body: "상호명과 지역만 먼저 넣어도 생성 결과가 훨씬 구체적으로 바뀝니다.",
        href: "/onboarding",
        label: "가게 정보 입력"
      };
    }

    if (posts.length === 0) {
      return {
        title: "첫 글 생성 시작",
        body: "가게 정보가 준비됐으니 이제 키워드 하나로 첫 초안을 만들어 보면 됩니다.",
        href: "/dashboard",
        label: "대시보드 열기"
      };
    }

    return {
      title: "최근 글 이어서 운영",
      body: "최근에 만든 키워드를 다시 써서 다음 글을 빠르게 이어갈 수 있습니다.",
      href: `/dashboard?keyword=${encodeURIComponent(posts[0].keyword)}`,
      label: "최근 키워드로 시작"
    };
  }, [posts, profile]);

  const frequentKeywords = useMemo(() => {
    const counts = new Map<string, number>();

    for (const post of posts) {
      counts.set(post.keyword, (counts.get(post.keyword) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword)
      .slice(0, 4);
  }, [posts]);

  const readinessItems = useMemo(
    () => [
      {
        label: "가게 정보 등록",
        done: Boolean(profile),
        note: profile ? "기본 소개와 대표 메뉴가 연결됩니다." : "상호명과 지역만 먼저 넣어도 충분합니다."
      },
      {
        label: "첫 글 생성",
        done: posts.length > 0,
        note: posts.length > 0 ? `${posts.length}개의 저장 글이 있습니다.` : "키워드 1개로 첫 초안을 만들어 보면 됩니다."
      },
      {
        label: "반복 운영 준비",
        done: posts.length > 1,
        note: posts.length > 1 ? "최근 키워드를 다시 써서 시리즈 운영이 가능합니다." : "글이 2개 이상 쌓이면 운영 리듬이 더 쉬워집니다."
      }
    ],
    [posts.length, profile]
  );

  return (
    <section className="overview-grid">
      <article className="card section-stack accent-card accent-card-hero">
        <div className="section-stack">
          <span className="eyebrow">지금 할 일</span>
          <h2 className="section-title">{nextAction.title}</h2>
          <p className="help">{nextAction.body}</p>
        </div>
        <div className="inline-actions">
          <Link className="btn btn-primary" href={nextAction.href}>
            {nextAction.label}
          </Link>
          <Link className="btn btn-secondary" href="/history">
            저장된 글 보기
          </Link>
        </div>
      </article>

      <article className="card section-stack tone-surface">
        <div className="section-stack">
          <span className="eyebrow">현재 상태</span>
          <h2 className="section-title">운영 준비도</h2>
        </div>

        <div className="info-grid">
          <div className="compact-card">
            <strong>가게 정보</strong>
            <div>{profile ? `${profile.businessName} · ${profile.region}` : "아직 미등록"}</div>
            <div className="meta-line">
              {profile ? `대표 메뉴 ${profile.representativeMenus.length}개 등록` : "상호명과 지역만 넣어도 바로 시작할 수 있습니다."}
            </div>
          </div>
          <div className="compact-card">
            <strong>생성 현황</strong>
            <div>{formatUsage(usage)}</div>
            <div className="meta-line">현재 플랜에 맞는 생성 제한과 기능 범위를 바로 확인할 수 있습니다.</div>
          </div>
        </div>

        <div className="history-list">
          {readinessItems.map((item) => (
            <article key={item.label} className="compact-card history-card">
              <strong>{item.done ? "완료" : "진행 전"} · {item.label}</strong>
              <div className="small-note">{item.note}</div>
            </article>
          ))}
        </div>
      </article>

      <article className="card section-stack tone-surface">
        <div className="section-stack">
          <span className="eyebrow">최근 흐름</span>
          <h2 className="section-title">다시 쓰기 쉬운 키워드</h2>
          <p className="help">최근에 만든 글이 있으면 그대로 이어서 운영할 수 있습니다.</p>
        </div>

        {posts.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 저장된 글이 없습니다. 첫 글을 만들면 최근 키워드와 최근 제목이 여기에 보입니다.</p>
          </div>
        ) : (
          <>
            <div className="chips">
              {frequentKeywords.map((keyword) => (
                <Link key={keyword} href={`/dashboard?keyword=${encodeURIComponent(keyword)}`} className="chip">
                  {keyword}
                </Link>
              ))}
            </div>
            <div className="history-list">
              {posts.slice(0, 2).map((post) => (
                <article key={post.id} className="compact-card history-card">
                  <strong>{post.title}</strong>
                  <div className="meta-line">키워드: {post.keyword}</div>
                  <div className="inline-actions">
                    <Link className="btn btn-secondary" href={`/result?postId=${post.id}`}>
                      결과 보기
                    </Link>
                    <Link className="btn btn-secondary" href={`/dashboard?keyword=${encodeURIComponent(post.keyword)}`}>
                      다시 쓰기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </article>
    </section>
  );
}
