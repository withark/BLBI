import Link from "next/link";

export default function BillingPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card hero-card accent-card">
          <div className="chips" aria-label="결제 상태">
            <span className="pill">결제 연동 준비 중</span>
            <span className="pill">데모 플랜 전환 가능</span>
            <span className="pill">운영 검증 우선</span>
          </div>

          <div className="section-stack">
            <span className="eyebrow">Billing Preview</span>
            <h1 className="hero-title" style={{ fontSize: "1.95rem" }}>
              실제 결제는 아직 열리지 않았습니다
            </h1>
            <p className="help">현재는 기능 검증 단계라서 결제 연동 대신 설정 페이지에서 데모 플랜 전환으로 사용 흐름을 확인할 수 있습니다.</p>
          </div>

          <div className="info-grid">
            <div className="compact-card">
              <strong>지금 가능한 것</strong>
              <div className="meta-line">설정 페이지에서 Free, Basic, Premium을 바꿔 보며 생성 제한과 화면 변화를 확인할 수 있습니다.</div>
            </div>
            <div className="compact-card">
              <strong>나중에 열릴 것</strong>
              <div className="meta-line">실제 구독 결제, 업그레이드, 결제 상태 관리가 이 화면에 연결될 예정입니다.</div>
            </div>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Fast Path</span>
          <h2 className="section-title">결제 대신 지금 확인할 화면</h2>
          <div className="history-list">
            <article className="compact-card history-card">
              <strong>설정</strong>
              <div className="small-note">플랜을 직접 바꾸며 실제 제한과 기능 차이를 즉시 확인합니다.</div>
            </article>
            <article className="compact-card history-card">
              <strong>대시보드</strong>
              <div className="small-note">현재 플랜 기준으로 생성과 시리즈 잠금 여부를 바로 확인합니다.</div>
            </article>
            <article className="compact-card history-card">
              <strong>관리자 구독 화면</strong>
              <div className="small-note">운영 기준으로 사용자 플랜 분포와 변경 상태를 점검합니다.</div>
            </article>
          </div>
          <div className="inline-actions">
            <Link href="/settings" className="btn btn-primary">
              플랜 바로 바꾸기
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              현재 플랜으로 생성 보기
            </Link>
            <Link href="/admin/subscription" className="btn btn-secondary">
              관리자 구독 화면
            </Link>
          </div>
        </section>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Current Flow</span>
          <h2 className="section-title">지금 결제 대신 확인하는 것</h2>
          <div className="step-grid">
            <div className="step-card">
              <div className="step-kicker">1</div>
              <div className="step-title">설정에서 플랜 전환</div>
              <div className="step-body">Free, Basic, Premium을 직접 바꿔 보며 한도와 화면이 어떻게 달라지는지 확인합니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">2</div>
              <div className="step-title">대시보드에서 생성</div>
              <div className="step-body">실제 사용량과 Premium 전용 시리즈 잠금 여부가 바로 반영됩니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">3</div>
              <div className="step-title">관리자에서 정책 확인</div>
              <div className="step-body">플랜 변경과 사용량 계산이 실제로 맞는지 운영 화면에서 검증합니다.</div>
            </div>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Later</span>
          <h2 className="section-title">추후 연결될 결제 기능</h2>
          <ul className="list-clean">
            <li>실제 구독 시작과 업그레이드</li>
            <li>결제 상태 및 갱신일 확인</li>
            <li>요금제 변경 이력과 영수증 관리</li>
          </ul>
        </section>
      </section>
    </div>
  );
}
