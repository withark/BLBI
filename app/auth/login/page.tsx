import Link from "next/link";

export default function LoginPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="section-stack">
          <span className="eyebrow">Login Preview</span>
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
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
    </div>
  );
}
