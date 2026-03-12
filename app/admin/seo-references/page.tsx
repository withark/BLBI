import { analyzeSeoReferenceAction, createSeoReferenceAction, updateSeoReferenceStatusAction } from "@/app/admin/actions";
import { listSeoReferences, listSeoSnapshots } from "@/lib/store/db";

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

export default async function AdminSeoReferencesPage(): Promise<React.ReactNode> {
  const [references, snapshots] = await Promise.all([listSeoReferences(), listSeoSnapshots()]);
  const latestSnapshots = snapshots.slice(0, 8);

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Manual Input</span>
          <h2 className="section-title">상위노출 참고 URL 등록</h2>
          <p className="help">자동 수집 이전 단계에서도 운영자가 직접 좋은 참고 URL을 등록하고 분석 흐름에 넣을 수 있어야 합니다.</p>

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
          <span className="eyebrow">Learning Summary</span>
          <h2 className="section-title">최근 학습 스냅샷</h2>
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
                </article>
              ))}
            </div>
          )}
        </section>
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
