import Link from "next/link";

export default function FeaturesPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="section-stack">
          <span className="eyebrow">Feature Overview</span>
          <h1 className="hero-title" style={{ fontSize: "2rem" }}>
            블비는 글 한 편만 만드는 도구가 아니라 운영 흐름 전체를 줄이는 서비스입니다
          </h1>
          <p className="help">키워드 입력부터 가게 정보 반영, 복붙 결과, 추천, 히스토리, 관리자 학습까지 하나의 흐름으로 설계했습니다.</p>
        </div>
      </section>

      <section className="overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Generate</span>
          <h2 className="section-title">키워드 1개 입력 중심</h2>
          <ul className="list-clean">
            <li>큰 입력창 1개와 생성 버튼 1개가 핵심입니다.</li>
            <li>추천 키워드는 보조로만 두고, 메인은 도구처럼 유지합니다.</li>
            <li>결과는 바로 네이버 블로그 복붙이 가능한 순수 텍스트로 정리합니다.</li>
          </ul>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Operate</span>
          <h2 className="section-title">운영형 저장과 재사용</h2>
          <ul className="list-clean">
            <li>저장된 글을 다시 열고 복사하고 키워드를 재사용할 수 있습니다.</li>
            <li>플랜 사용량과 가게 정보 준비 상태를 운영 화면에서 바로 봅니다.</li>
            <li>결과 수정 후 저장하면 복사 결과도 함께 맞춰집니다.</li>
          </ul>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Learn</span>
          <h2 className="section-title">상위노출 학습 기반 고도화</h2>
          <ul className="list-clean">
            <li>관리자에서 참고 URL을 등록하고 분석 스냅샷을 누적합니다.</li>
            <li>학습된 제목/소제목/CTA 패턴을 생성 엔진에 반영합니다.</li>
            <li>자동 후보 수집과 관리자 승인 구조로 확장할 수 있게 설계했습니다.</li>
          </ul>
        </article>
      </section>

      <section className="card section-stack">
        <span className="eyebrow">Next Action</span>
        <h2 className="section-title">바로 써보려면</h2>
        <p className="help">기능을 읽고 끝내지 않고, 지금 단계에 맞는 화면으로 바로 이동할 수 있게 묶었습니다.</p>
        <div className="history-list">
          <article className="compact-card history-card">
            <strong>처음 시작</strong>
            <div className="small-note">가게 정보가 아직 없으면 온보딩부터 시작하는 편이 결과 품질이 안정적입니다.</div>
          </article>
          <article className="compact-card history-card">
            <strong>바로 생성</strong>
            <div className="small-note">이미 가게 정보가 있으면 대시보드에서 키워드 한 줄로 바로 초안을 만들면 됩니다.</div>
          </article>
          <article className="compact-card history-card">
            <strong>운영 점검</strong>
            <div className="small-note">글이 이미 쌓였다면 히스토리와 관리자 화면에서 반복 패턴과 학습 흐름을 확인하면 됩니다.</div>
          </article>
        </div>
        <div className="inline-actions">
          <Link className="btn btn-secondary" href="/onboarding">
            온보딩 시작
          </Link>
          <Link className="btn btn-primary" href="/dashboard">
            대시보드로 이동
          </Link>
          <Link className="btn btn-secondary" href="/guide">
            사용 가이드 보기
          </Link>
        </div>
      </section>

      <section className="overview-grid">
        <Link href="/onboarding" className="card section-stack admin-link-card">
          <span className="eyebrow">Onboarding</span>
          <strong>가게 정보 준비</strong>
          <p className="help">상호명, 지역, 메뉴를 한 번 정리해 두면 이후 모든 글에 반영됩니다.</p>
        </Link>
        <Link href="/history" className="card section-stack admin-link-card">
          <span className="eyebrow">History</span>
          <strong>운영형 히스토리</strong>
          <p className="help">다시 보기, 복사, 편집, 키워드 재사용까지 저장된 글을 운영 도구처럼 다룹니다.</p>
        </Link>
        <Link href="/admin" className="card section-stack admin-link-card">
          <span className="eyebrow">Admin</span>
          <strong>학습과 운영 허브</strong>
          <p className="help">사용량, 사용자, SEO 참고, 학습 스냅샷, 작업 로그를 한곳에서 관리합니다.</p>
        </Link>
      </section>
    </div>
  );
}
