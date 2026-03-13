import Link from "next/link";

export default function AuthPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="section-stack">
          <span className="eyebrow">Auth</span>
          <h1 className="hero-title" style={{ fontSize: "2rem" }}>
            지금 버전은 데모 사용자 흐름으로 동작합니다
          </h1>
          <p className="help">실제 소셜 로그인과 계정 연동은 다음 단계에서 붙일 예정입니다. 현재는 바로 생성과 관리 흐름을 검증하는 데 집중합니다.</p>
        </div>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Current</span>
          <h2 className="section-title">지금 가능한 것</h2>
          <ul className="list-clean">
            <li>가게 정보 등록</li>
            <li>키워드 기반 글 생성</li>
            <li>히스토리 저장/복사/재사용</li>
            <li>관리자 운영 확인</li>
          </ul>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Later</span>
          <h2 className="section-title">다음 단계</h2>
          <ul className="list-clean">
            <li>실제 로그인/회원가입</li>
            <li>구독 결제 연동</li>
            <li>다중 사용자 권한 관리</li>
          </ul>
        </section>
      </section>

      <section className="card section-stack">
        <div className="inline-actions">
          <Link className="btn btn-primary" href="/dashboard">
            데모로 계속 진행
          </Link>
          <Link className="btn btn-secondary" href="/onboarding">
            가게 정보 먼저 입력
          </Link>
        </div>
      </section>
    </div>
  );
}
