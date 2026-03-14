import Link from "next/link";

export default function LoginPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card hero-card accent-card">
          <div className="chips" aria-label="로그인 프리뷰">
            <span className="pill">실제 로그인 미구현</span>
            <span className="pill">데모 흐름 유지</span>
          </div>
          <div className="section-stack">
            <span className="eyebrow">Login Preview</span>
            <h1 className="hero-title" style={{ fontSize: "1.95rem" }}>
              실제 로그인 화면은 아직 열리지 않았습니다
            </h1>
            <p className="help">현재는 데모 사용자 기준으로 핵심 생성 흐름을 먼저 검증하고 있습니다. 로그인 대신 바로 생성과 저장 흐름을 확인하면 됩니다.</p>
          </div>
          <div className="inline-actions">
            <Link className="btn btn-primary" href="/dashboard">
              데모로 계속 진행
            </Link>
            <Link className="btn btn-secondary" href="/auth">
              인증 안내로 이동
            </Link>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Best Path</span>
          <h2 className="section-title">지금 대신 열어야 할 화면</h2>
          <div className="history-list">
            <article className="compact-card history-card">
              <strong>대시보드</strong>
              <div className="small-note">실제 사용 가치는 여기서 가장 빠르게 확인됩니다.</div>
            </article>
            <article className="compact-card history-card">
              <strong>온보딩</strong>
              <div className="small-note">가게 정보가 비어 있으면 결과 품질이 먼저 흔들립니다.</div>
            </article>
          </div>
        </section>
      </section>
    </div>
  );
}
