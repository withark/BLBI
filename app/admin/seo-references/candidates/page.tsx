import {
  analyzeApprovedSeoReferencesAction,
  analyzeSeoReferenceAction,
  approveAndAnalyzeSeoReferenceAction,
  updateSeoReferenceStatusAction
} from "@/app/admin/actions";
import { listSeoReferences } from "@/lib/store/db";

export const dynamic = "force-dynamic";

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

export default async function AdminSeoReferenceCandidatesPage(): Promise<React.ReactNode> {
  const references = await listSeoReferences();
  const candidates = references.filter((reference) => reference.status === "candidate");
  const autoCandidates = candidates.filter((reference) => reference.sourceType === "search_api").length;

  return (
    <div className="page-stack">
      <section className="card section-stack tone-surface">
        <span className="eyebrow">Candidate Queue</span>
        <h1 className="section-title">자동 후보 검토 큐</h1>
        <p className="help">내부 데이터 기반 후보와 수동 등록 후보 중 아직 승인되지 않은 SEO 참고 URL만 모아 운영자가 빠르게 검토하는 화면입니다.</p>
        <div className="info-grid">
          <div className="compact-card">
            <strong>전체 후보</strong>
            <div>{candidates.length}개</div>
          </div>
          <div className="compact-card">
            <strong>자동 생성 후보</strong>
            <div>{autoCandidates}개</div>
          </div>
        </div>
        <div className="inline-actions">
          <form action={analyzeApprovedSeoReferencesAction}>
            <input type="hidden" name="limit" value="6" />
            <button type="submit" className="btn btn-secondary">
              승인된 참고 일괄 재분석
            </button>
          </form>
        </div>
      </section>

      <section className="card section-stack">
        {candidates.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">검토할 후보가 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {candidates.map((reference) => (
              <article key={reference.id} className="compact-card history-card">
                <div className="section-stack">
                  <strong>{reference.title || reference.keyword}</strong>
                  <div className="meta-line">
                    {reference.keyword} · {reference.region || "지역 미지정"} · {reference.businessType || "업종 미지정"}
                  </div>
                  <div className="small-note">{reference.url}</div>
                  {reference.summary && <div className="small-note">{reference.summary}</div>}
                  <div className="meta-line">최근 분석 {formatDate(reference.lastAnalyzedAt)} · 소스 {reference.sourceType}</div>
                </div>

                <div className="inline-actions">
                  <form action={updateSeoReferenceStatusAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button type="submit" className="btn btn-primary">
                      승인
                    </button>
                  </form>
                  <form action={approveAndAnalyzeSeoReferenceAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <button type="submit" className="btn btn-primary">
                      승인 후 분석
                    </button>
                  </form>
                  <form action={updateSeoReferenceStatusAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button type="submit" className="btn btn-secondary">
                      제외
                    </button>
                  </form>
                  <form action={analyzeSeoReferenceAction}>
                    <input type="hidden" name="referenceId" value={reference.id} />
                    <button type="submit" className="btn btn-secondary">
                      바로 분석
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
