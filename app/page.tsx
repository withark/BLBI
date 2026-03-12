import Link from "next/link";

import { KeywordQuickStart } from "@/components/keyword-quick-start";

export default function HomePage(): React.ReactNode {
  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <KeywordQuickStart />
      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h2 className="section-title">이 서비스가 해주는 일</h2>
        <div className="chips" aria-label="핵심 기능">
          <span className="chip">가게 정보 반영</span>
          <span className="chip">사진 촬영 가이드</span>
          <span className="chip">네이버 복붙 최적화</span>
          <span className="chip">저장/히스토리</span>
          <span className="chip">다음 글 추천</span>
          <span className="chip">시리즈 생성</span>
        </div>
        <p className="help">
          복잡한 단계 없이 바로 시작하고, 자세한 설정이 필요할 때만 추가하면 됩니다.
        </p>
        <div className="row">
          <Link className="btn btn-secondary" href="/dashboard">
            대시보드 열기
          </Link>
          <Link className="btn btn-secondary" href="/pricing">
            요금제 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
