import { getAdminStats } from "@/lib/store/db";

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
  const stats = await getAdminStats();

  return (
    <div className="page-stack">
      <section className="card hero-card">
        <div className="chips" aria-label="관리 지표">
          <span className="pill">실사용 지표</span>
          <span className="pill">최근 생성 흐름</span>
          <span className="pill">플랜 분포</span>
        </div>

        <div className="section-stack">
          <h1 className="hero-title" style={{ fontSize: "1.95rem" }}>
            서비스가 실제로 이어지고 있는지 한 화면에서 확인합니다
          </h1>
          <p className="help">프론트, API, 저장 흐름이 실제 운영처럼 연결돼 있는지 보는 최소 관리자 화면입니다.</p>
        </div>

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
      </section>

      <section className="two-column">
        <section className="card section-stack">
          <h2 className="section-title">운영 핵심 지표</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>가게 정보 등록 수</strong>
              <div>{stats.businessProfileCount}</div>
              <div className="meta-line">온보딩이 실제로 사용되고 있는지 보는 기본 지표입니다.</div>
            </div>
            <div className="compact-card">
              <strong>추천 키워드 기록 수</strong>
              <div>{stats.recommendationCount}</div>
              <div className="meta-line">생성 후 다음 글 제안 흐름이 누적되고 있는지 확인합니다.</div>
            </div>
          </div>
        </section>

        <section className="card section-stack">
          <h2 className="section-title">플랜 분포</h2>
          <div className="history-list">
            <div className="compact-card">
              <strong>Free</strong>
              <div>{stats.planCounts.FREE}명</div>
            </div>
            <div className="compact-card">
              <strong>Basic</strong>
              <div>{stats.planCounts.BASIC}명</div>
            </div>
            <div className="compact-card">
              <strong>Premium</strong>
              <div>{stats.planCounts.PREMIUM}명</div>
            </div>
          </div>
        </section>
      </section>

      <section className="card section-stack">
        <h2 className="section-title">최근 생성 글</h2>
        {stats.recentPosts.length === 0 && <div className="status">아직 생성된 글이 없습니다.</div>}
        <div className="history-list">
          {stats.recentPosts.map((post) => (
            <article key={post.id} className="compact-card history-card">
              <strong>{post.title}</strong>
              <div className="meta-line">
                {post.keyword} · {formatDate(post.createdAt)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-stack">
        <h2 className="section-title">최근 사용자</h2>
        {stats.users.length === 0 && <div className="status">등록된 사용자가 없습니다.</div>}
        <div className="history-list">
          {stats.users.map((user) => (
            <article key={user.id} className="compact-card history-card">
              <strong>{user.id}</strong>
              <div className="meta-line">
                플랜: {user.plan} · 가입일: {formatDate(user.createdAt)}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
