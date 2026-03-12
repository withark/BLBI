import Link from "next/link";

export default function BillingPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card">
        <div className="chips" aria-label="결제 상태">
          <span className="pill">결제 연동 준비 중</span>
          <span className="pill">데모 플랜 전환 가능</span>
        </div>

        <div className="section-stack">
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
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

        <div className="inline-actions">
          <Link href="/pricing" className="btn btn-secondary">
            요금제 다시 보기
          </Link>
          <Link href="/settings" className="btn btn-primary">
            데모 플랜 전환
          </Link>
        </div>
      </section>
    </div>
  );
}
