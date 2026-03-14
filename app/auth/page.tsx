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
        <span className="eyebrow">Why Demo First</span>
        <h2 className="section-title">지금은 왜 로그인 없이 먼저 검증하나요?</h2>
        <div className="step-grid">
          <div className="step-card">
            <div className="step-kicker">1</div>
            <div className="step-title">핵심 생성 흐름 먼저</div>
            <div className="step-body">키워드 입력, 결과 생성, 복사, 히스토리까지 실제 사용 가치가 먼저 확인돼야 합니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">2</div>
            <div className="step-title">가게 정보 반영 검증</div>
            <div className="step-body">로그인보다 먼저 결과 품질과 운영 흐름이 맞는지 보는 단계입니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">3</div>
            <div className="step-title">이후 계정 연결</div>
            <div className="step-body">소셜 로그인과 결제는 이 핵심 흐름이 안정화된 뒤 붙이는 것이 더 안전합니다.</div>
          </div>
        </div>
      </section>

      <section className="card section-stack">
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

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Fast Path</span>
        <h2 className="section-title">지금 가장 빠른 흐름</h2>
        <div className="step-grid">
          <div className="step-card">
            <div className="step-kicker">1</div>
            <div className="step-title">온보딩 확인</div>
            <div className="step-body">가게 정보가 비어 있으면 먼저 상호명과 지역만 채웁니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">2</div>
            <div className="step-title">대시보드 생성</div>
            <div className="step-body">키워드 한 줄로 초안을 만든 뒤 결과 화면으로 바로 이동합니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">3</div>
            <div className="step-title">히스토리 운영</div>
            <div className="step-body">저장된 글을 다시 열고 복사하고 키워드를 재사용합니다.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
