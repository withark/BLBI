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
        <div className="inline-actions">
          <Link className="btn btn-primary" href="/dashboard">
            지금 바로 생성 시작
          </Link>
          <Link className="btn btn-secondary" href="/onboarding">
            가게 정보 먼저 입력
          </Link>
        </div>
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

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Photo Guide</span>
          <h2 className="section-title">사진은 이렇게 준비하면 됩니다</h2>
          <ul className="list-clean">
            <li>대표 메뉴가 가장 맛있어 보이는 컷 1장</li>
            <li>가게 외관이나 간판이 보이는 컷 1장</li>
            <li>좌석, 분위기, 편의 정보가 보이는 컷 1장</li>
          </ul>
          <p className="small-note">결과 페이지에서 사진 가이드만 따로 빠르게 확인할 수 있습니다.</p>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Operating Rhythm</span>
          <h2 className="section-title">운영 리듬 예시</h2>
          <div className="step-grid">
            <div className="step-card">
              <div className="step-kicker">월</div>
              <div className="step-title">대표 메뉴 키워드</div>
              <div className="step-body">가게를 가장 잘 보여 주는 기본 키워드부터 쌓습니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">수</div>
              <div className="step-title">상황 키워드</div>
              <div className="step-body">점심, 회식, 데이트 같은 상황 키워드로 넓힙니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">금</div>
              <div className="step-title">다음 글 추천 활용</div>
              <div className="step-body">이전 글 추천 키워드를 눌러 흐름을 이어가면 운영이 쉬워집니다.</div>
            </div>
          </div>
        </section>
      </section>

      <section className="card section-stack">
        <span className="eyebrow">Start</span>
        <p className="help">처음이면 온보딩, 이미 준비가 끝났으면 대시보드, 작성한 글이 있으면 히스토리로 바로 가는 흐름이 가장 빠릅니다.</p>
        <div className="inline-actions">
          <Link className="btn btn-primary" href="/onboarding">
            가게 정보 입력
          </Link>
          <Link className="btn btn-secondary" href="/dashboard">
            바로 생성하러 가기
          </Link>
          <Link className="btn btn-secondary" href="/history">
            저장 글 다시 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
