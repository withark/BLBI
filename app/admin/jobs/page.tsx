import Link from "next/link";

import { listAdminJobs } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatJobType(value: string): string {
  switch (value) {
    case "seo_candidate_generation":
      return "SEO 후보 생성";
    case "seo_reference_analysis":
      return "SEO 참고 분석";
    default:
      return value;
  }
}

export default async function AdminJobsPage(): Promise<React.ReactNode> {
  const jobs = await listAdminJobs(40);
  const successCount = jobs.filter((job) => job.status === "success").length;
  const failedCount = jobs.filter((job) => job.status === "failed").length;
  const candidateJobs = jobs.filter((job) => job.jobType === "seo_candidate_generation");
  const analysisJobs = jobs.filter((job) => job.jobType === "seo_reference_analysis");

  return (
    <div className="page-stack">
      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Job Overview</span>
          <h2 className="section-title">최근 운영 작업 상태</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>전체 작업</strong>
              <div>{jobs.length}건</div>
            </div>
            <div className="compact-card">
              <strong>성공</strong>
              <div>{successCount}건</div>
            </div>
            <div className="compact-card">
              <strong>실패</strong>
              <div>{failedCount}건</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Automation Mix</span>
          <h2 className="section-title">작업 종류 분포</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>후보 생성</strong>
              <div>{candidateJobs.length}건</div>
            </div>
            <div className="compact-card">
              <strong>참고 분석</strong>
              <div>{analysisJobs.length}건</div>
            </div>
          </div>
          <div className="inline-actions">
            <Link href="/admin/seo-references" className="btn btn-secondary">
              SEO 참고 관리
            </Link>
            <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
              후보 검토 큐
            </Link>
          </div>
        </article>
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Operations Feed</span>
        <h2 className="section-title">작업 로그</h2>
        <p className="help">내부 데이터 기반 후보 생성과 참고 URL 분석이 실제로 실행됐는지, 몇 건이 반영됐는지 운영자가 확인하는 화면입니다.</p>

        {jobs.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 실행된 작업이 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {jobs.map((job) => (
              <article key={job.id} className="compact-card history-card">
                <div className="section-stack">
                  <div className="chips">
                    <span className="pill">{formatJobType(job.jobType)}</span>
                    <span className="pill">{job.status === "success" ? "성공" : "실패"}</span>
                    <span className="pill">반영 {job.affectedCount}건</span>
                  </div>
                  <strong>{job.summary}</strong>
                  <div className="meta-line">{formatDate(job.createdAt)}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
