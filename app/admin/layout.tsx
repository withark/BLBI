import Link from "next/link";

import { AdminNav } from "./admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="page-stack">
      <section className="card hero-card admin-hero">
        <div className="admin-hero-grid">
          <div className="section-stack">
            <div className="chips" aria-label="관리자 안내">
              <span className="pill">운영 데이터 단일 소스</span>
              <span className="pill">SEO 학습 관리</span>
              <span className="pill">플랜/사용량 점검</span>
            </div>
            <span className="eyebrow">Admin Studio</span>
            <h1 className="hero-title" style={{ fontSize: "2rem" }}>
              사용자 운영 흐름과 SEO 학습 상태를 한곳에서 봅니다
            </h1>
            <p className="help">관리자 화면은 프론트, API, 저장 데이터, 상위노출 학습 흐름이 실제로 이어지는지 확인하는 운영 스튜디오입니다.</p>
          </div>

          <aside className="admin-studio-rail">
            <article className="admin-studio-card">
              <span className="eyebrow">Users</span>
              <strong>사용자 흐름</strong>
              <div className="meta-line">가게 정보, 생성, 플랜, 우회 권한 흐름을 한 묶음으로 봅니다.</div>
            </article>
            <article className="admin-studio-card">
              <span className="eyebrow">SEO</span>
              <strong>후보에서 학습까지</strong>
              <div className="meta-line">후보 생성, 승인, 분석, 스냅샷 축적이 하나의 루프로 이어집니다.</div>
            </article>
            <article className="admin-studio-card">
              <span className="eyebrow">Control</span>
              <strong>바로 실행하는 운영</strong>
              <div className="meta-line">후보 생성과 재분석을 이 화면에서 바로 돌릴 수 있습니다.</div>
            </article>
          </aside>
        </div>
      </section>

      <section className="card section-stack admin-panel admin-control-card">
        <div className="section-stack">
          <span className="eyebrow">Control Surface</span>
          <h2 className="section-title">관리 메뉴</h2>
        </div>
        <AdminNav />
        <div className="inline-actions">
          <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
            후보 검토 바로가기
          </Link>
          <Link href="/admin/ranking-watch" className="btn btn-secondary">
            랭킹 감시 바로가기
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            사용자 생성 화면 보기
          </Link>
        </div>
      </section>

      {children}
    </div>
  );
}
