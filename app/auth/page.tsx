import Link from "next/link";

export default function AuthPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card hero-card accent-card">
          <div className="chips" aria-label="인증 안내">
            <span className="pill">데모 사용자 흐름</span>
            <span className="pill">핵심 생성 검증 우선</span>
            <span className="pill">실제 인증은 후속</span>
          </div>

          <div className="section-stack">
            <span className="eyebrow">Auth</span>
            <h1 className="hero-title" style={{ fontSize: "2rem" }}>
              지금 버전은 로그인보다 생성 흐름 검증을 우선한 데모 사용자 구조입니다
            </h1>
            <p className="help">실제 소셜 로그인과 계정 연동은 다음 단계에서 붙일 예정입니다. 현재는 가게 정보 입력, 생성, 저장, 재사용이 제품 가치의 중심입니다.</p>
          </div>

          <div className="step-grid">
            <div className="step-card">
              <div className="step-kicker">1</div>
              <div className="step-title">가게 정보 확인</div>
              <div className="step-body">상호명과 지역부터 입력해 생성 품질 기준선을 만듭니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">2</div>
              <div className="step-title">대시보드 생성</div>
              <div className="step-body">키워드 한 줄로 초안을 만들고 결과 흐름을 바로 검증합니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">3</div>
              <div className="step-title">히스토리 운영</div>
              <div className="step-body">저장된 글을 다시 열고 복사하고 키워드를 재사용합니다.</div>
            </div>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Now / Later</span>
          <h2 className="section-title">지금 가능한 것과 다음 단계</h2>
          <div className="history-list">
            <article className="compact-card history-card">
              <strong>지금 가능한 것</strong>
              <div className="small-note">가게 정보 등록, 키워드 기반 생성, 히스토리 저장/복사/재사용, 관리자 운영 확인</div>
            </article>
            <article className="compact-card history-card">
              <strong>다음 단계</strong>
              <div className="small-note">실제 로그인/회원가입, 구독 결제 연동, 다중 사용자 권한 관리</div>
            </article>
          </div>
          <div className="inline-actions">
            <Link className="btn btn-primary" href="/dashboard">
              데모로 계속 진행
            </Link>
            <Link className="btn btn-secondary" href="/onboarding">
              가게 정보 먼저 입력
            </Link>
            <Link className="btn btn-secondary" href="/history">
              저장 글 다시 보기
            </Link>
          </div>
        </section>
      </section>

      <section className="overview-grid">
        <Link href="/auth/login" className="card section-stack admin-link-card">
          <span className="eyebrow">Login</span>
          <strong>로그인 안내 보기</strong>
          <p className="help">실제 로그인 대신 지금은 어떤 흐름으로 쓰면 되는지 짧게 정리했습니다.</p>
        </Link>
        <Link href="/auth/register" className="card section-stack admin-link-card">
          <span className="eyebrow">Register</span>
          <strong>회원가입 안내 보기</strong>
          <p className="help">실제 회원가입보다 먼저 제품 핵심 흐름을 검증하는 이유를 정리했습니다.</p>
        </Link>
        <Link href="/billing" className="card section-stack admin-link-card">
          <span className="eyebrow">Billing</span>
          <strong>결제 준비 상태 보기</strong>
          <p className="help">인증 이후 붙을 구독/결제 흐름의 현재 상태를 같이 확인할 수 있습니다.</p>
        </Link>
      </section>
    </div>
  );
}
