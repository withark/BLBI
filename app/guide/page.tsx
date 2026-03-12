import Link from "next/link";

export default function GuidePage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="section-stack">
          <span className="eyebrow">Quick Guide</span>
          <h1 className="hero-title" style={{ fontSize: "2rem" }}>
            블비는 복잡하게 배우지 않아도 됩니다. 순서대로만 움직이면 됩니다.
          </h1>
          <p className="help">처음에는 가게 정보, 이후에는 키워드 중심 운영, 마지막에는 복사와 사진 가이드 확인이 핵심입니다.</p>
        </div>
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Step By Step</span>
        <div className="step-grid">
          <div className="step-card">
            <div className="step-kicker">1</div>
            <div className="step-title">가게 정보를 한 번 입력</div>
            <div className="step-body">상호명과 지역만 먼저 넣어도 됩니다. 대표 메뉴와 설명이 있으면 글이 더 구체적으로 변합니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">2</div>
            <div className="step-title">키워드 하나로 생성</div>
            <div className="step-body">메뉴, 지역, 상황이 섞인 한 줄 키워드면 충분합니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">3</div>
            <div className="step-title">결과 확인 후 복사</div>
            <div className="step-body">제목, 본문, FAQ, 마무리 안내, 사진 가이드를 보고 복사하면 됩니다.</div>
          </div>
        </div>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Good Keywords</span>
          <h2 className="section-title">잘 되는 입력 예시</h2>
          <ul className="list-clean">
            <li>상계동 칼국수 맛집</li>
            <li>망원동 브런치 카페 추천</li>
            <li>성수 파스타 점심 모임</li>
          </ul>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Avoid</span>
          <h2 className="section-title">이런 입력은 덜 좋습니다</h2>
          <ul className="list-clean">
            <li>맛집</li>
            <li>우리 가게 홍보글</li>
            <li>좋은 글 써줘</li>
          </ul>
        </section>
      </section>

      <section className="card section-stack">
        <span className="eyebrow">Start</span>
        <div className="inline-actions">
          <Link className="btn btn-primary" href="/onboarding">
            가게 정보 입력
          </Link>
          <Link className="btn btn-secondary" href="/dashboard">
            바로 생성하러 가기
          </Link>
        </div>
      </section>
    </div>
  );
}
