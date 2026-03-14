import Link from "next/link";

export default function RegisterPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card hero-card accent-card">
          <div className="chips" aria-label="회원가입 프리뷰">
            <span className="pill">회원가입 미구현</span>
            <span className="pill">제품 흐름 검증 우선</span>
          </div>
          <div className="section-stack">
            <span className="eyebrow">Register Preview</span>
            <h1 className="hero-title" style={{ fontSize: "1.95rem" }}>
              회원가입은 아직 준비 단계입니다
            </h1>
            <p className="help">실제 계정 생성보다 먼저, 사장님이 키워드로 글을 만들고 저장하고 다시 쓰는 핵심 흐름이 충분히 좋아야 합니다.</p>
          </div>
          <div className="inline-actions">
            <Link className="btn btn-primary" href="/onboarding">
              가게 정보부터 입력
            </Link>
            <Link className="btn btn-secondary" href="/auth">
              인증 안내로 이동
            </Link>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Why Later</span>
          <h2 className="section-title">회원가입을 뒤로 둔 이유</h2>
          <ul className="list-clean">
            <li>핵심 생성 흐름이 먼저 안정화돼야 합니다.</li>
            <li>가게 정보 반영과 결과 품질이 인증보다 앞선 가치입니다.</li>
            <li>이후에 소셜 로그인과 구독을 붙이는 편이 운영 리스크가 낮습니다.</li>
          </ul>
        </section>
      </section>
    </div>
  );
}
