import Link from "next/link";

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

interface AdminSeoReferenceCandidatesPageProps {
  searchParams?: Promise<{
    keyword?: string;
  }>;
}

export default async function AdminSeoReferenceCandidatesPage({
  searchParams
}: AdminSeoReferenceCandidatesPageProps): Promise<React.ReactNode> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const references = await listSeoReferences();
  const keywordFilter = (resolvedSearchParams?.keyword || "").trim().toLowerCase();
  const candidates = references.filter((reference) => {
    if (reference.status !== "candidate") {
      return false;
    }

    if (!keywordFilter) {
      return true;
    }

    return reference.keyword.toLowerCase().includes(keywordFilter);
  });
  const autoCandidates = candidates.filter((reference) => reference.sourceType === "search_api").length;
  const regionCount = new Set(candidates.map((reference) => reference.region.trim()).filter(Boolean)).size;
  const businessTypeCount = new Set(candidates.map((reference) => reference.businessType.trim()).filter(Boolean)).size;

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card section-stack admin-section-hero">
          <span className="eyebrow">Candidate Queue</span>
          <h1 className="section-title">자동 후보 검토 큐</h1>
          <p className="help">내부 데이터 기반 후보와 수동 등록 후보 중 아직 승인되지 않은 SEO 참고 URL만 모아 운영자가 빠르게 검토하는 화면입니다.</p>
          {keywordFilter ? <div className="status">현재 `{resolvedSearchParams?.keyword}` 키워드에 맞는 후보만 보고 있습니다.</div> : null}
          <div className="admin-summary-band">
            <article className="admin-summary-tile">
              <span className="eyebrow">후보</span>
              <strong>{candidates.length}개</strong>
              <div className="meta-line">현재 검토 대상</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">자동</span>
              <strong>{autoCandidates}개</strong>
              <div className="meta-line">내부 데이터 기반</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">지역</span>
              <strong>{regionCount}개</strong>
              <div className="meta-line">지역 분산</div>
            </article>
          </div>
        </section>

        <section className="card section-stack tone-surface admin-side-reference">
          <span className="eyebrow">Fast Jump</span>
          <h2 className="section-title">바로 이동</h2>
          <div className="inline-actions">
            <form action={analyzeApprovedSeoReferencesAction}>
              <input type="hidden" name="limit" value="6" />
              <button type="submit" className="btn btn-secondary">
                승인 참고 일괄 재분석
              </button>
            </form>
            <Link href="/admin/ranking-watch" className="btn btn-secondary">
              랭킹 감시로 이동
            </Link>
            {keywordFilter ? (
              <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
                필터 해제
              </Link>
            ) : null}
          </div>
        </section>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Distribution</span>
          <h2 className="section-title">후보 분산</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>포함 지역</strong>
              <div>{regionCount}개</div>
            </div>
            <div className="compact-card">
              <strong>업종 분산</strong>
              <div>{businessTypeCount}개</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Review Rule</span>
          <h2 className="section-title">검토 기준</h2>
          <ul className="list-clean">
            <li>후보만 있고 승인 URL이 없으면 승인 후 분석까지 한 번에 닫는 편이 낫습니다.</li>
            <li>지역/업종이 비어 있으면 학습 패턴으로 쓰기 전에 메모 보강이 필요합니다.</li>
            <li>같은 키워드로 생성 테스트를 바로 열어 실제 결과 품질을 같이 보는 흐름이 안전합니다.</li>
          </ul>
        </article>
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Candidate Feed</span>
        <h2 className="section-title">후보 목록</h2>
        {candidates.length === 0 ? (
          <div className="surface-muted section-stack">
            <p className="small-note">검토할 후보가 없습니다.</p>
            <div className="inline-actions">
              <Link href="/admin/seo-references" className="btn btn-secondary">
                참고 URL 관리로 이동
              </Link>
              <Link href="/admin/ranking-watch" className="btn btn-secondary">
                랭킹 감시 보기
              </Link>
            </div>
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
                  <Link href={`/dashboard?keyword=${encodeURIComponent(reference.keyword)}`} className="btn btn-secondary">
                    이 키워드로 생성
                  </Link>
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
