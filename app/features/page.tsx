import Link from "next/link";

export default function FeaturesPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card hero-card accent-card">
          <div className="chips" aria-label="기능 핵심">
            <span className="pill">키워드 1개 입력</span>
            <span className="pill">가게 정보 반영</span>
            <span className="pill">관리자 SEO 학습</span>
          </div>

          <div className="section-stack">
            <span className="eyebrow">Feature Overview</span>
            <h1 className="hero-title" style={{ fontSize: "2.05rem" }}>
              블비는 글 한 편 생성기가 아니라, 지역 가게 블로그 운영 시간을 줄이는 도구입니다
            </h1>
            <p className="help">키워드 입력, 결과 복사, 저장 글 재사용, 추천, 관리자 학습 흐름까지 한 덩어리로 설계했습니다. 설명보다 실제 다음 행동이 먼저 보이게 정리했습니다.</p>
          </div>

          <div className="launchpad-strip">
            <article className="launchpad-stat">
              <span className="eyebrow">Generate</span>
              <strong>키워드 한 줄</strong>
              <div className="meta-line">채팅 대신 입력창 하나로 시작합니다.</div>
            </article>
            <article className="launchpad-stat">
              <span className="eyebrow">Operate</span>
              <strong>저장과 재사용</strong>
              <div className="meta-line">다시 열기, 복사, 같은 키워드 재실행이 바로 됩니다.</div>
            </article>
            <article className="launchpad-stat">
              <span className="eyebrow">Learn</span>
              <strong>SEO 학습 허브</strong>
              <div className="meta-line">참고 URL과 학습 스냅샷을 관리자에서 누적합니다.</div>
            </article>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Best Start</span>
          <h2 className="section-title">지금 가장 빠른 시작 경로</h2>
          <div className="history-list">
            <article className="compact-card history-card">
              <strong>처음 시작</strong>
              <div className="small-note">가게 정보가 아직 없으면 온보딩에서 상호명과 지역부터 입력합니다.</div>
            </article>
            <article className="compact-card history-card">
              <strong>바로 생성</strong>
              <div className="small-note">이미 가게 정보가 있으면 대시보드에서 키워드 한 줄로 바로 초안을 만듭니다.</div>
            </article>
            <article className="compact-card history-card">
              <strong>반복 운영</strong>
              <div className="small-note">글이 쌓였다면 히스토리와 관리자에서 패턴을 보며 다음 글로 이어갑니다.</div>
            </article>
          </div>
          <div className="inline-actions">
            <Link className="btn btn-primary" href="/dashboard">
              바로 생성 시작
            </Link>
            <Link className="btn btn-secondary" href="/onboarding">
              가게 정보 입력
            </Link>
            <Link className="btn btn-secondary" href="/history">
              저장 글 보기
            </Link>
          </div>
        </section>
      </section>

      <section className="overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Generate</span>
          <h2 className="section-title">입력은 짧고 결과는 길게</h2>
          <ul className="list-clean">
            <li>큰 입력창 1개와 생성 버튼 1개가 메인입니다.</li>
            <li>추천 키워드는 보조로만 두고, 생성은 사용자가 직접 실행합니다.</li>
            <li>결과는 네이버 블로그 복붙용 순수 텍스트로 정리합니다.</li>
          </ul>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Operate</span>
          <h2 className="section-title">저장 후 다시 쓰는 흐름</h2>
          <ul className="list-clean">
            <li>저장된 글을 다시 열고 복사하고 키워드를 재사용할 수 있습니다.</li>
            <li>가게 정보, 플랜, 사용량을 운영 화면에서 같이 봅니다.</li>
            <li>편집 후 저장하면 복사 결과도 같은 내용으로 갱신됩니다.</li>
          </ul>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Learn</span>
          <h2 className="section-title">상위노출 학습 구조</h2>
          <ul className="list-clean">
            <li>관리자에서 참고 URL을 등록하고 승인/분석할 수 있습니다.</li>
            <li>제목, 소제목, CTA 패턴을 스냅샷으로 누적합니다.</li>
            <li>학습 시그널이 생성 엔진에 반영되도록 연결했습니다.</li>
          </ul>
        </article>
      </section>

      <section className="overview-grid">
        <Link href="/onboarding" className="card section-stack admin-link-card">
          <span className="eyebrow">Onboarding</span>
          <strong>가게 정보 준비</strong>
          <p className="help">상호명, 지역, 메뉴를 한 번 정리해 두면 이후 글 전부의 기준이 됩니다.</p>
        </Link>
        <Link href="/history" className="card section-stack admin-link-card">
          <span className="eyebrow">History</span>
          <strong>운영형 히스토리</strong>
          <p className="help">다시 보기, 복사, 편집, 키워드 재사용까지 저장된 글을 운영 도구처럼 다룹니다.</p>
        </Link>
        <Link href="/admin" className="card section-stack admin-link-card">
          <span className="eyebrow">Admin</span>
          <strong>학습과 운영 허브</strong>
          <p className="help">사용량, 사용자, SEO 참고, 스냅샷, 작업 로그를 한곳에서 봅니다.</p>
        </Link>
      </section>
    </div>
  );
}
