import Link from "next/link";

import { listAllBusinessProfiles, listAllPosts } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminPostsPage(): Promise<React.ReactNode> {
  const [posts, profiles] = await Promise.all([listAllPosts(), listAllBusinessProfiles()]);
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const withProfileCount = posts.filter((post) => post.businessProfileId && profileMap.has(post.businessProfileId)).length;
  const freeCount = posts.filter((post) => post.plan === "FREE").length;
  const basicCount = posts.filter((post) => post.plan === "BASIC").length;
  const premiumCount = posts.filter((post) => post.plan === "PREMIUM").length;
  const unlinkedCount = posts.length - withProfileCount;
  const premiumShare = posts.length === 0 ? 0 : Math.round((premiumCount / posts.length) * 100);

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card section-stack admin-section-hero">
          <span className="eyebrow">Posts Studio</span>
          <h2 className="section-title">전체 생성 글 운영</h2>
          <p className="help">키워드, 플랜, 가게 연결 상태를 한 번에 보면서 실제 생성 품질과 반복 운영 리듬을 점검하는 화면입니다.</p>
          <div className="admin-summary-band">
            <article className="admin-summary-tile">
              <span className="eyebrow">전체</span>
              <strong>{posts.length}개</strong>
              <div className="meta-line">저장된 생성 글</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">연결</span>
              <strong>{withProfileCount}개</strong>
              <div className="meta-line">가게 정보가 붙은 글</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">Premium</span>
              <strong>{premiumShare}%</strong>
              <div className="meta-line">Premium 비중</div>
            </article>
          </div>
        </section>

        <section className="card section-stack tone-surface admin-side-reference">
          <span className="eyebrow">Related Pages</span>
          <h2 className="section-title">함께 볼 화면</h2>
          <div className="inline-actions">
            <Link href="/admin/users" className="btn btn-secondary">
              사용자 보기
            </Link>
            <Link href="/admin/usage" className="btn btn-secondary">
              사용량 보기
            </Link>
            <Link href="/history" className="btn btn-secondary">
              사용자 히스토리
            </Link>
          </div>
        </section>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Plan Mix</span>
          <h2 className="section-title">플랜별 생성 분포</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>Free</strong>
              <div>{freeCount}개</div>
            </div>
            <div className="compact-card">
              <strong>Basic</strong>
              <div>{basicCount}개</div>
            </div>
            <div className="compact-card">
              <strong>Premium</strong>
              <div>{premiumCount}개</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Coverage</span>
          <h2 className="section-title">연결 상태</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>가게 연결됨</strong>
              <div>{withProfileCount}개</div>
              <div className="meta-line">가게 정보 반영 가능</div>
            </div>
            <div className="compact-card">
              <strong>연결 없음</strong>
              <div>{unlinkedCount}개</div>
              <div className="meta-line">온보딩 유도 필요</div>
            </div>
          </div>
        </article>
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Posts Feed</span>
        <h2 className="section-title">최근 생성 글</h2>
        <p className="help">실제 결과물에서 어떤 키워드가 반복되고, 가게 정보가 얼마나 붙어 있는지 카드 단위로 빠르게 확인합니다.</p>
        {posts.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 생성된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {posts.map((post) => {
              const profile = post.businessProfileId ? profileMap.get(post.businessProfileId) : null;

              return (
                <article key={post.id} className="compact-card history-card">
                  <div className="section-stack">
                    <strong>{post.title}</strong>
                    <div className="meta-line">
                      키워드 {post.keyword} · 사용자 {post.userId} · 플랜 {post.plan} · {formatDate(post.createdAt)}
                    </div>
                    <div className="small-note">{profile ? `${profile.businessName} · ${profile.region}` : "연결된 가게 정보 없음"}</div>
                  </div>

                  <div className="inline-actions">
                    <Link className="btn btn-secondary" href={`/result?postId=${post.id}`}>
                      결과 보기
                    </Link>
                    <Link className="btn btn-secondary" href={`/dashboard?keyword=${encodeURIComponent(post.keyword)}`}>
                      같은 키워드 재실행
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
