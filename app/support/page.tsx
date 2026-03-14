import Link from "next/link";

const SUPPORT_EMAIL = "support@blbi.kr";

export default function SupportPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="section-stack">
          <span className="eyebrow">Support</span>
          <h1 className="hero-title" style={{ fontSize: "2rem" }}>
            사용 중 막히는 지점이 있으면 바로 확인할 수 있게 정리했습니다
          </h1>
          <p className="help">블비는 초보 사용자도 이해하기 쉬운 도구를 목표로 하므로, 자주 막히는 상황을 먼저 안내합니다.</p>
        </div>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
          <div className="history-list">
            <article className="compact-card">
              <strong>가게 정보를 다 입력해야 하나요?</strong>
              <div className="small-note">아닙니다. 상호명과 지역만 있어도 시작할 수 있습니다.</div>
            </article>
            <article className="compact-card">
              <strong>사진은 자동으로 생성되나요?</strong>
              <div className="small-note">이미지 생성은 하지 않고, 사진 촬영 가이드 문구만 제공합니다.</div>
            </article>
            <article className="compact-card">
              <strong>복사 결과는 HTML이 섞이나요?</strong>
              <div className="small-note">아닙니다. 순수 텍스트로 정리해 네이버 블로그 붙여넣기용으로 제공합니다.</div>
            </article>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Contact</span>
          <h2 className="section-title">문의 안내</h2>
          <div className="surface-muted section-stack">
            <strong>이메일</strong>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="btn btn-secondary" style={{ width: "fit-content" }}>
              {SUPPORT_EMAIL}
            </a>
            <p className="small-note">버그, 사용 문의, 기능 요청은 이 메일로 받는 기준으로 정리해 두었습니다.</p>
          </div>
          <div className="inline-actions">
            <Link className="btn btn-secondary" href="/guide">
              사용 가이드 보기
            </Link>
            <Link className="btn btn-primary" href="/dashboard">
              다시 생성하러 가기
            </Link>
          </div>
        </section>
      </section>

      <section className="card section-stack">
        <span className="eyebrow">Troubleshooting</span>
        <h2 className="section-title">자주 막히는 흐름</h2>
        <div className="step-grid">
          <div className="step-card">
            <div className="step-kicker">1</div>
            <div className="step-title">결과가 너무 일반적일 때</div>
            <div className="step-body">온보딩에서 상호명, 지역, 대표 메뉴를 먼저 보강하면 본문과 사진 가이드가 더 구체적으로 나옵니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">2</div>
            <div className="step-title">원하는 흐름이 안 잡힐 때</div>
            <div className="step-body">대시보드 세부 설정에서 길이, 문체, 추가 반영 내용을 짧게 적으면 결과가 바로 달라집니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">3</div>
            <div className="step-title">다시 편집하고 싶을 때</div>
            <div className="step-body">히스토리와 결과 화면은 임시 저장을 지원하므로, 다시 열어 이어서 수정할 수 있습니다.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
