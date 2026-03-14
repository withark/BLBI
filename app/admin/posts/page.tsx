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

  return (
    <div className="page-stack">
      <section className="card section-stack tone-surface">
        <span className="eyebrow">Posts</span>
        <h2 className="section-title">전체 생성 글</h2>
        <p className="help">키워드, 사용자, 연결된 가게 정보, 플랜을 함께 보며 실제 생성 흐름을 점검합니다.</p>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Post Snapshot</span>
          <div className="info-grid">
            <div className="compact-card">
              <strong>전체 글</strong>
              <div>{posts.length}개</div>
            </div>
            <div className="compact-card">
              <strong>가게 연결됨</strong>
              <div>{withProfileCount}개</div>
            </div>
            <div className="compact-card">
              <strong>Free / Basic</strong>
              <div>
                {freeCount} / {basicCount}
              </div>
            </div>
            <div className="compact-card">
              <strong>Premium</strong>
              <div>{premiumCount}개</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
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
              사용자 히스토리 화면
            </Link>
          </div>
        </article>
      </section>

      <section className="history-list">
        {posts.length === 0 ? (
          <div className="card section-stack">
            <strong>아직 생성된 글이 없습니다.</strong>
          </div>
        ) : (
          posts.map((post) => {
            const profile = post.businessProfileId ? profileMap.get(post.businessProfileId) : null;

            return (
              <article key={post.id} className="card section-stack tone-surface">
                <div className="section-stack">
                  <strong>{post.title}</strong>
                  <div className="meta-line">
                    키워드 {post.keyword} · 사용자 {post.userId} · 플랜 {post.plan} · {formatDate(post.createdAt)}
                  </div>
                  <div className="small-note">
                    {profile ? `${profile.businessName} · ${profile.region}` : "연결된 가게 정보 없음"}
                  </div>
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
          })
        )}
      </section>
    </div>
  );
}
