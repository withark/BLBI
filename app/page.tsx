import Link from "next/link";

import { HomeOperationsOverview } from "@/components/home-operations-overview";
import { KeywordQuickStart } from "@/components/keyword-quick-start";
import { PLAN_DISPLAY } from "@/lib/domain/plan";
import { applyLimitBypass, getUsageSnapshot } from "@/lib/domain/usage";
import { DEMO_USER_ID } from "@/lib/server-user";
import { getBusinessProfile, getUser, listPosts, listRecommendations } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function formatUsageLine(input: { used: number; limit: number | null; remaining: number | null; window: "daily" | "monthly" | "unlimited" }): string {
  if (input.limit === null) {
    return `이번 기간 ${input.used}회 생성 · 무제한`;
  }

  return `이번 ${input.window === "daily" ? "하루" : "달"} ${input.used} / ${input.limit}회 · 남음 ${input.remaining}회`;
}

export default async function HomePage(): Promise<React.ReactNode> {
  const userId = DEMO_USER_ID;
  const [user, profile, posts, recommendations] = await Promise.all([
    getUser(userId),
    getBusinessProfile(userId),
    listPosts(userId),
    listRecommendations(userId, 6)
  ]);
  const currentUser = user ?? {
    id: userId,
    plan: "FREE" as const,
    limitBypass: false,
    createdAt: "",
    updatedAt: ""
  };
  const usage = applyLimitBypass(getUsageSnapshot(posts, currentUser.plan), currentUser.limitBypass);
  const recentPost = posts[0] ?? null;
  const leadKeyword = recommendations[0]?.keyword || recentPost?.keyword || "";
  const quickStartHref = !profile
    ? "/onboarding"
    : leadKeyword
      ? `/dashboard?keyword=${encodeURIComponent(leadKeyword)}`
      : "/dashboard";
  const quickStartLabel = !profile ? "가게 정보 입력" : leadKeyword ? "추천 키워드로 시작" : "바로 생성 시작";
  const quickStartBody = !profile
    ? "아직 가게 정보가 없으니 상호명과 지역부터 먼저 넣는 편이 결과 품질에 유리합니다."
    : leadKeyword
      ? `지금 바로 쓰기 쉬운 키워드는 "${leadKeyword}"입니다. 대시보드에서 바로 초안으로 이어집니다.`
      : "지금은 새 키워드로 바로 생성해도 되는 상태입니다.";
  const keywordStream = Array.from(new Set([leadKeyword, ...recommendations.map((item) => item.keyword), ...posts.map((post) => post.keyword)].filter(Boolean))).slice(
    0,
    5
  );
  const routeCards = [
    {
      title: "가게 정보 기준선",
      body: profile
        ? `${profile.businessName} · ${profile.region}${profile.representativeMenus[0] ? ` · 대표 ${profile.representativeMenus[0]}` : ""}`
        : "상호명과 지역만 먼저 넣어도 제목과 본문이 훨씬 구체적으로 바뀝니다.",
      href: "/onboarding",
      label: profile ? "가게 정보 보강" : "가게 정보 등록"
    },
    {
      title: posts.length === 0 ? "첫 글 만들기" : "최근 글 이어쓰기",
      body:
        posts.length === 0
          ? "가게 정보가 준비됐다면 이제 키워드 한 줄로 첫 초안을 만들어 보면 됩니다."
          : `"${recentPost?.title}" 이후 흐름으로 같은 키워드나 다음 추천 키워드를 바로 이어갈 수 있습니다.`,
      href: posts.length === 0 ? "/dashboard" : `/history?keyword=${encodeURIComponent(recentPost?.keyword ?? "")}`,
      label: posts.length === 0 ? "대시보드 열기" : "같은 키워드 흐름 보기"
    },
    {
      title: `${PLAN_DISPLAY[currentUser.plan].name} 운영 상태`,
      body: `${formatUsageLine(usage)} · ${PLAN_DISPLAY[currentUser.plan].summary}`,
      href: "/pricing",
      label: usage.limit !== null && usage.remaining === 0 ? "플랜 확인" : "플랜 차이 보기"
    }
  ];

  return (
    <div className="page-stack">
      <KeywordQuickStart />
      <HomeOperationsOverview
        usage={{
          plan: usage.plan,
          used: usage.used,
          limit: usage.limit,
          remaining: usage.remaining
        }}
        profile={
          profile
            ? {
                businessName: profile.businessName,
                region: profile.region,
                representativeMenus: profile.representativeMenus,
                storeDescription: profile.storeDescription
              }
            : null
        }
        posts={posts.slice(0, 4).map((post) => ({
          id: post.id,
          keyword: post.keyword,
          title: post.title,
          createdAt: post.createdAt
        }))}
      />

      <section className="card section-stack tone-surface">
        <div className="section-stack">
          <h2 className="section-title">오늘 운영 바로가기</h2>
          <p className="help">현재 저장 상태와 플랜 기준으로 지금 가장 빠른 시작 경로를 바로 잡아 둡니다.</p>
        </div>

        <div className="history-list">
          <article className="compact-card history-card">
            <strong>{quickStartLabel}</strong>
            <div className="small-note">{quickStartBody}</div>
          </article>
          <article className="compact-card history-card">
            <strong>최근 생성 흐름</strong>
            <div className="small-note">
              {recentPost ? `${recentPost.title} · ${recentPost.keyword}` : "아직 생성된 글이 없습니다. 첫 글을 만들면 이곳에서 바로 이어서 운영할 수 있습니다."}
            </div>
          </article>
          <article className="compact-card history-card">
            <strong>플랜과 사용량</strong>
            <div className="small-note">{formatUsageLine(usage)}</div>
          </article>
        </div>

        {keywordStream.length > 0 && (
          <div className="chips">
            {keywordStream.map((keyword) => (
              <Link key={keyword} className="chip" href={`/dashboard?keyword=${encodeURIComponent(keyword)}`}>
                {keyword}
              </Link>
            ))}
          </div>
        )}

        <div className="inline-actions">
          <Link className="btn btn-primary" href={quickStartHref}>
            {quickStartLabel}
          </Link>
          <Link className="btn btn-secondary" href={recentPost ? `/history?keyword=${encodeURIComponent(recentPost.keyword)}` : "/history"}>
            저장 글 운영 보기
          </Link>
          <Link className="btn btn-secondary" href="/pricing">
            플랜 차이 보기
          </Link>
        </div>
      </section>

      <section className="card section-stack">
        <div className="section-stack">
          <h2 className="section-title">이 결과를 바로 받습니다</h2>
          <p className="help">겉은 단순하지만, 실제 운영에 필요한 출력 규칙은 안쪽에서 맞춰 둡니다.</p>
        </div>

        <ul className="list-clean">
          <li>가게 정보가 반영된 제목과 본문</li>
          <li>사진 촬영 가이드가 들어간 순수 텍스트 결과</li>
          <li>다음 글 추천 키워드와 시리즈 주제 흐름</li>
          <li>히스토리와 플랜 사용량을 함께 보는 운영 화면</li>
        </ul>

        <div className="inline-actions">
          <Link className="btn btn-secondary" href="/history">
            저장된 글 보기
          </Link>
          <Link className="btn btn-secondary" href="/pricing">
            요금제 보기
          </Link>
        </div>
      </section>

      <section className="card section-stack tone-surface">
        <div className="section-stack">
          <h2 className="section-title">지금 가장 빠른 시작 경로</h2>
          <p className="help">처음 접속, 첫 생성, 반복 운영 중 어디에 있는지에 따라 바로 눌러야 할 화면을 나눴습니다.</p>
        </div>

        <div className="history-list">
          {routeCards.map((item) => (
            <article key={item.title} className="compact-card history-card">
              <strong>{item.title}</strong>
              <div className="small-note">{item.body}</div>
              <div className="inline-actions">
                <Link className="btn btn-secondary" href={item.href}>
                  {item.label}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="inline-actions">
          <Link className="btn btn-primary" href={quickStartHref}>
            {quickStartLabel}
          </Link>
          <Link className="btn btn-secondary" href="/onboarding">
            가게 정보 입력
          </Link>
          <Link className="btn btn-secondary" href={recentPost ? `/history?keyword=${encodeURIComponent(recentPost.keyword)}` : "/history"}>
            저장 글 운영 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
