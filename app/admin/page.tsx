import { getAdminStats } from "@/lib/store/db";

export const dynamic = "force-dynamic";

export default async function AdminPage(): Promise<React.ReactNode> {
  const stats = await getAdminStats();

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h1 style={{ fontSize: "1.45rem" }}>관리자 대시보드</h1>
        <p className="help">프론트/API/저장 흐름이 실제로 연결되어 있는지 확인하는 운영 화면입니다.</p>
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

      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h2 className="section-title">최근 생성 글</h2>
        {stats.recentPosts.length === 0 && <div className="status">아직 생성된 글이 없습니다.</div>}
        {stats.recentPosts.map((post) => (
          <article key={post.id} className="status">
            <strong>{post.title}</strong>
            <div className="help">
              {post.keyword} · {new Date(post.createdAt).toLocaleString("ko-KR")}
            </div>
          </article>
        ))}
      </section>

      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h2 className="section-title">최근 사용자</h2>
        {stats.users.length === 0 && <div className="status">등록된 사용자가 없습니다.</div>}
        {stats.users.map((user) => (
          <article key={user.id} className="status">
            <strong>{user.id}</strong>
            <div className="help">
              플랜: {user.plan} · 가입일: {new Date(user.createdAt).toLocaleString("ko-KR")}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
