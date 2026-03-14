import Link from "next/link";

import { HomeOperationsOverview } from "@/components/home-operations-overview";
import { KeywordQuickStart } from "@/components/keyword-quick-start";

export default function HomePage(): React.ReactNode {
  return (
    <div className="page-stack">
      <KeywordQuickStart />
      <HomeOperationsOverview />

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

      <section className="card section-stack tone-surface">
        <div className="section-stack">
          <h2 className="section-title">지금 가장 빠른 시작 경로</h2>
          <p className="help">처음 접속한 사람도 여기서 바로 다음 행동을 고를 수 있게 정리했습니다.</p>
        </div>

        <div className="history-list">
          <article className="compact-card history-card">
            <strong>가게 정보가 아직 없으면</strong>
            <div className="small-note">온보딩에서 상호명과 지역만 먼저 입력한 뒤 대시보드로 넘어가는 편이 맞습니다.</div>
          </article>
          <article className="compact-card history-card">
            <strong>이미 준비가 되어 있으면</strong>
            <div className="small-note">대시보드에서 키워드 한 줄로 바로 생성하고 결과 화면에서 복사하면 됩니다.</div>
          </article>
          <article className="compact-card history-card">
            <strong>이미 글이 쌓여 있으면</strong>
            <div className="small-note">히스토리에서 다시 쓰기 쉬운 글을 먼저 열고 키워드를 재사용하는 편이 빠릅니다.</div>
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
            저장 글 운영 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
