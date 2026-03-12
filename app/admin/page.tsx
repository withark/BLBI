import Link from "next/link";

import { getAdminStats, listSeoReferences, listSeoSnapshots } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminPage(): Promise<React.ReactNode> {
  const [stats, seoReferences, seoSnapshots] = await Promise.all([getAdminStats(), listSeoReferences(), listSeoSnapshots()]);
  const approvedSeoCount = seoReferences.filter((item) => item.status === "approved").length;

  return (
    <div className="page-stack">
      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Overview</span>
          <div className="kv">
            <div className="kv-item">
              <div className="kv-label">총 사용자</div>
              <div className="kv-value">{stats.userCount}</div>
            </div>
            <div className="kv-item">
              <div className="kv-label">총 생성 글</div>
              <div className="kv-value">{stats.postCount}</div>
            </div>
            <div className="kv-item">
              <div className="kv-label">이번 달 생성</div>
              <div className="kv-value">{stats.monthPostCount}</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">SEO Engine</span>
          <div className="info-grid">
            <div className="compact-card">
              <strong>참고 URL</strong>
              <div>{stats.seoReferenceCount}개</div>
              <div className="meta-line">승인 {approvedSeoCount}개 · 후보 {seoReferences.filter((item) => item.status === "candidate").length}개</div>
            </div>
            <div className="compact-card">
              <strong>학습 스냅샷</strong>
              <div>{stats.seoSnapshotCount}개</div>
              <div className="meta-line">최근 분석 결과가 누적되는 저장층입니다.</div>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-overview-grid">
        <Link href="/admin/users" className="card section-stack admin-link-card">
          <span className="eyebrow">Users</span>
          <strong>사용자 운영 보기</strong>
          <p className="help">플랜, 우회 권한, 가게 정보 연결 여부를 함께 확인합니다.</p>
        </Link>
        <Link href="/admin/subscription" className="card section-stack admin-link-card">
          <span className="eyebrow">Subscription</span>
          <strong>구독과 플랜 분포</strong>
          <p className="help">플랜별 사용자 수와 전환 필요 대상을 빠르게 볼 수 있습니다.</p>
        </Link>
        <Link href="/admin/posts" className="card section-stack admin-link-card">
          <span className="eyebrow">Posts</span>
          <strong>생성 글 흐름</strong>
          <p className="help">어떤 키워드와 글이 실제로 쌓이고 있는지 확인합니다.</p>
        </Link>
        <Link href="/admin/usage" className="card section-stack admin-link-card">
          <span className="eyebrow">Usage</span>
          <strong>사용량과 한도</strong>
          <p className="help">플랜 정책과 실제 사용량 계산이 맞는지 검증합니다.</p>
        </Link>
        <Link href="/admin/seo-references" className="card section-stack admin-link-card">
          <span className="eyebrow">SEO References</span>
          <strong>상위노출 학습 관리</strong>
          <p className="help">참고 URL 등록, 승인, 분석, 스냅샷 누적을 관리합니다.</p>
        </Link>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <span className="eyebrow">Recent Posts</span>
            <h2 className="section-title">최근 생성 글</h2>
          </div>

          {stats.recentPosts.length === 0 ? (
            <div className="status">아직 생성된 글이 없습니다.</div>
          ) : (
            <div className="history-list">
              {stats.recentPosts.slice(0, 6).map((post) => (
                <article key={post.id} className="compact-card history-card">
                  <strong>{post.title}</strong>
                  <div className="meta-line">
                    {post.keyword} · {formatDate(post.createdAt)} · {post.plan}
                  </div>
                  <div className="inline-actions">
                    <Link className="btn btn-secondary" href={`/result?postId=${post.id}`}>
                      결과 보기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <span className="eyebrow">Recent Learning</span>
            <h2 className="section-title">최근 SEO 학습</h2>
          </div>

          {seoSnapshots.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">아직 분석된 SEO 스냅샷이 없습니다. 참고 URL을 추가하고 분석을 실행하면 이곳에 누적됩니다.</p>
            </div>
          ) : (
            <div className="history-list">
              {seoSnapshots.slice(0, 6).map((snapshot) => (
                <article key={snapshot.id} className="compact-card history-card">
                  <strong>{snapshot.keywordPatterns[0] || "학습 스냅샷"}</strong>
                  <div className="meta-line">
                    품질 {snapshot.qualityScore}점 · 신선도 {snapshot.freshnessScore}점 · {formatDate(snapshot.fetchedAt)}
                  </div>
                  <div className="small-note">{snapshot.notes}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
