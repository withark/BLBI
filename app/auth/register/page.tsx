import Link from "next/link";

export default function RegisterPage(): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="section-stack">
          <span className="eyebrow">Register Preview</span>
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
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
    </div>
  );
}
