import Link from "next/link";

import { KeywordQuickStart } from "@/components/keyword-quick-start";

export default function HomePage(): React.ReactNode {
  return (
    <div className="page-stack">
      <KeywordQuickStart />

      <section className="card section-stack">
        <div className="section-stack">
          <h2 className="section-title">처음이면 이렇게 시작하면 됩니다</h2>
          <p className="help">처음 1회만 가게 정보를 넣고, 그다음부터는 키워드 중심으로 빠르게 운영합니다.</p>
        </div>

        <div className="step-grid">
          <div className="step-card">
            <div className="step-kicker">처음 1회</div>
            <div className="step-title">가게 정보 등록</div>
            <div className="step-body">상호명, 지역, 대표 메뉴만 넣어도 생성 결과가 더 자연스러워집니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">매일 반복</div>
            <div className="step-title">키워드로 생성</div>
            <div className="step-body">홍보하고 싶은 메뉴, 시간대, 상황 키워드를 넣고 바로 글을 만듭니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">업로드 직전</div>
            <div className="step-title">복사 후 업로드</div>
            <div className="step-body">네이버 블로그에 붙여넣기 쉬운 텍스트와 사진 가이드를 같이 확인합니다.</div>
          </div>
        </div>

        <div className="inline-actions">
          <Link className="btn btn-secondary" href="/onboarding">
            가게 정보 등록
          </Link>
          <Link className="btn btn-secondary" href="/dashboard">
            바로 대시보드로
          </Link>
        </div>
      </section>

      <section className="card section-stack">
        <div className="section-stack">
          <h2 className="section-title">이 결과를 바로 받습니다</h2>
          <p className="help">겉은 단순하지만, 실제 운영에 필요한 출력 규칙은 안쪽에서 맞춰 둡니다.</p>
        </div>

        <ul className="list-clean">
          <li>가게 정보가 반영된 제목과 본문</li>
          <li>사진 촬영 가이드가 들어간 순수 텍스트 결과</li>
          <li>다음 글 추천 키워드와 시리즈 주제 흐름</li>
          <li>히스토리와 플랜 사용량을 함께 보는 운영 화면</li>
        </ul>

        <div className="inline-actions">
          <Link className="btn btn-secondary" href="/history">
            저장된 글 보기
          </Link>
          <Link className="btn btn-secondary" href="/pricing">
            요금제 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
