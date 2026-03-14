import Link from "next/link";

import {
  analyzeApprovedSeoReferencesAction,
  analyzeSeoReferenceAction,
  approveAndAnalyzeSeoReferenceAction,
  createSeoReferenceAction,
  generateSeoCandidatesAction,
  updateSeoReferenceStatusAction
} from "@/app/admin/actions";
import { listAdminJobs, listSeoReferences, listSeoSnapshots } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function collectTopPatterns(values: string[][], limit = 5): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();

  for (const group of values) {
    for (const value of group) {
      const key = value.trim();

      if (!key) {
        continue;
      }

      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function formatDate(value: string | null): string {
  if (!value) {
    return "아직 분석 전";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminSeoReferencesPage(): Promise<React.ReactNode> {
  const [references, snapshots, jobs] = await Promise.all([listSeoReferences(), listSeoSnapshots(), listAdminJobs(12)]);
  const latestSnapshots = snapshots.slice(0, 8);
  const latestCandidateJobs = jobs.filter((job) => job.jobType === "seo_candidate_generation").slice(0, 4);
  const statusCounts = {
    candidate: references.filter((reference) => reference.status === "candidate").length,
    approved: references.filter((reference) => reference.status === "approved").length,
    rejected: references.filter((reference) => reference.status === "rejected").length,
    archived: references.filter((reference) => reference.status === "archived").length
  };
  const topKeywordPatterns = collectTopPatterns(snapshots.map((snapshot) => snapshot.keywordPatterns));
  const topSectionPatterns = collectTopPatterns(snapshots.map((snapshot) => snapshot.sectionPatterns));
  const topTonePatterns = collectTopPatterns(snapshots.map((snapshot) => snapshot.tonePatterns), 4);

  return (
    <div className="page-stack">
      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Queue Status</span>
          <h2 className="section-title">참고 URL 상태</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>후보</strong>
              <div>{statusCounts.candidate}개</div>
            </div>
            <div className="compact-card">
              <strong>승인</strong>
              <div>{statusCounts.approved}개</div>
            </div>
            <div className="compact-card">
              <strong>제외</strong>
              <div>{statusCounts.rejected}개</div>
            </div>
            <div className="compact-card">
              <strong>보관</strong>
              <div>{statusCounts.archived}개</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Learned Signals</span>
          <h2 className="section-title">누적 학습 시그널</h2>
          <div className="history-list">
            <div className="compact-card">
              <strong>상위 키워드 패턴</strong>
              <div className="chips">
                {topKeywordPatterns.length === 0 ? <span className="help">아직 없음</span> : topKeywordPatterns.map((item) => <span key={item.label} className="chip">{item.label} · {item.count}</span>)}
              </div>
            </div>
            <div className="compact-card">
              <strong>상위 톤 패턴</strong>
              <div className="chips">
                {topTonePatterns.length === 0 ? <span className="help">아직 없음</span> : topTonePatterns.map((item) => <span key={item.label} className="chip">{item.label} · {item.count}</span>)}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="admin-overview-grid">
        <Link href="/admin/seo-references/candidates" className="card section-stack admin-link-card">
          <span className="eyebrow">Candidate Queue</span>
          <strong>후보만 따로 보기</strong>
          <p className="help">검토해야 할 후보만 분리해서 승인과 제외를 빠르게 처리합니다.</p>
        </Link>
        <Link href="/admin/seo-learning" className="card section-stack admin-link-card">
          <span className="eyebrow">Learning View</span>
          <strong>학습 규칙 보기</strong>
          <p className="help">누적된 키워드와 소제목 패턴이 생성 엔진에 어떤 방향을 주는지 확인합니다.</p>
        </Link>
        <Link href="/admin/ranking-watch" className="card section-stack admin-link-card">
          <span className="eyebrow">Ranking Watch</span>
          <strong>키워드군 감시</strong>
          <p className="help">후보, 승인 참고, 생성 글이 함께 쌓이는 키워드군을 우선순위로 확인합니다.</p>
        </Link>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Manual Input</span>
          <h2 className="section-title">상위노출 참고 URL 등록</h2>
          <p className="help">운영자는 직접 참고 URL을 등록할 수 있고, 외부 API 연동 전 단계에서는 내부 데이터로 후보를 먼저 자동 생성해 검토 큐를 늘릴 수 있습니다.</p>

          <div className="compact-card">
            <strong>내부 데이터 기반 후보 생성</strong>
            <p className="small-note">최근 생성 글, 추천 키워드, 가게 정보를 합쳐 네이버 블로그 검색 후보를 자동으로 만들고 `candidate` 상태로 큐에 추가합니다.</p>
            <div className="inline-actions">
              <form action={generateSeoCandidatesAction}>
                <input type="hidden" name="limit" value="12" />
                <button type="submit" className="btn btn-secondary">
                  내부 데이터로 후보 생성
                </button>
              </form>
              <form action={analyzeApprovedSeoReferencesAction}>
                <input type="hidden" name="limit" value="6" />
                <button type="submit" className="btn btn-secondary">
                  승인 참고 일괄 재분석
                </button>
              </form>
            </div>
          </div>

          <form action={createSeoReferenceAction} className="section-stack">
            <div className="row">
              <div className="field-stack">
                <label className="field-label" htmlFor="seo-keyword">
                  키워드
                </label>
                <input id="seo-keyword" name="keyword" className="input" placeholder="예: 상계동 칼국수 맛집" required />
              </div>
              <div className="field-stack">
                <label className="field-label" htmlFor="seo-region">
                  지역
                </label>
                <input id="seo-region" name="region" className="input" placeholder="예: 노원구 상계동" />
              </div>
            </div>

            <div className="row">
              <div className="field-stack">
                <label className="field-label" htmlFor="seo-business-type">
                  업종
                </label>
                <input id="seo-business-type" name="businessType" className="input" placeholder="예: 칼국수집, 카페, 브런치" />
              </div>
              <div className="field-stack">
                <label className="field-label" htmlFor="seo-title">
                  참고 제목
                </label>
                <input id="seo-title" name="title" className="input" placeholder="예: 상계동 칼국수 추천 글" />
              </div>
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="seo-url">
                참고 URL
              </label>
              <input id="seo-url" name="url" className="input" placeholder="https://..." required />
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="seo-summary">
                참고 메모
              </label>
              <textarea id="seo-summary" name="summary" className="textarea" placeholder="왜 참고할 가치가 있는지, 어떤 패턴을 보고 싶은지 적습니다." />
            </div>

            <div className="inline-actions">
              <button type="submit" className="btn btn-primary">
                참고 URL 추가
              </button>
            </div>
          </form>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Automation Status</span>
          <h2 className="section-title">최근 자동 후보 작업</h2>
          {latestCandidateJobs.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">아직 실행된 자동 후보 생성 작업이 없습니다.</p>
            </div>
          ) : (
            <div className="history-list">
              {latestCandidateJobs.map((job) => (
                <article key={job.id} className="compact-card history-card">
                  <strong>{job.summary}</strong>
                  <div className="meta-line">
                    {job.status === "success" ? "성공" : "실패"} · 반영 {job.affectedCount}건 · {formatDate(job.createdAt)}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="section-stack">
            <span className="eyebrow">Learning Summary</span>
            <h3 className="section-title">최근 학습 스냅샷</h3>
            {latestSnapshots.length === 0 ? (
              <div className="surface-muted">
                <p className="small-note">아직 학습 스냅샷이 없습니다. 참고 URL을 등록하고 분석을 실행하면 요약 패턴이 여기에 쌓입니다.</p>
              </div>
            ) : (
              <div className="history-list">
                {latestSnapshots.map((snapshot) => (
                  <article key={snapshot.id} className="compact-card history-card">
                    <strong>{snapshot.keywordPatterns[0] || "SEO 학습"}</strong>
                    <div className="meta-line">
                      소제목 {snapshot.headingCount}개 · 사진 가이드 {snapshot.photoGuideCount}개 · 품질 {snapshot.qualityScore}
                    </div>
                    <div className="small-note">{snapshot.notes}</div>
                    <div className="inline-actions">
                      <Link
                        href={`/dashboard?keyword=${encodeURIComponent(snapshot.keywordPatterns[0] || "")}`}
                        className="btn btn-secondary"
                      >
                        이 패턴으로 생성 보기
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Section Intelligence</span>
        <h2 className="section-title">자주 학습된 소제목 구조</h2>
        {topSectionPatterns.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 누적된 소제목 패턴이 없습니다.</p>
          </div>
        ) : (
          <div className="chips">
            {topSectionPatterns.map((item) => (
              <span key={item.label} className="chip">
                {item.label} · {item.count}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="card section-stack">
        <span className="eyebrow">Reference Queue</span>
        <h2 className="section-title">참고 URL 큐</h2>
        {references.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 등록된 참고 URL이 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {references.map((reference) => (
              <article key={reference.id} className="compact-card history-card">
                <div className="section-stack">
                  <strong>{reference.title || reference.keyword}</strong>
                  <div className="meta-line">
                    {reference.keyword} · {reference.region || "지역 미지정"} · {reference.businessType || "업종 미지정"} · {reference.sourceType}
                  </div>
                  <div className="small-note">{reference.url}</div>
                  {reference.summary && <div className="small-note">{reference.summary}</div>}
                  <div className="meta-line">최근 분석 {formatDate(reference.lastAnalyzedAt)}</div>
                </div>

                <div className="inline-actions">
                  <form action={updateSeoReferenceStatusAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <input type="hidden" name="status" value="candidate" />
                    <button type="submit" className={reference.status === "candidate" ? "btn btn-primary" : "btn btn-secondary"}>
                      후보
                    </button>
                  </form>
                  <form action={updateSeoReferenceStatusAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button type="submit" className={reference.status === "approved" ? "btn btn-primary" : "btn btn-secondary"}>
                      승인
                    </button>
                  </form>
                  <form action={approveAndAnalyzeSeoReferenceAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <button type="submit" className="btn btn-secondary">
                      승인 후 분석
                    </button>
                  </form>
                  <form action={updateSeoReferenceStatusAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button type="submit" className={reference.status === "rejected" ? "btn btn-primary" : "btn btn-secondary"}>
                      제외
                    </button>
                  </form>
                  <form action={analyzeSeoReferenceAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <button type="submit" className="btn btn-secondary">
                      분석 실행
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
