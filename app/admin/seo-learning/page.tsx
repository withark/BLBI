import Link from "next/link";

import { analyzeApprovedSeoReferencesAction, generateSeoCandidatesAction } from "@/app/admin/actions";
import { listSeoReferences, listSeoSnapshots } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function collectTopPatterns(values: string[][], limit = 8): Array<{ label: string; count: number }> {
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminSeoLearningPage(): Promise<React.ReactNode> {
  const [references, snapshots] = await Promise.all([listSeoReferences(), listSeoSnapshots()]);
  const approvedReferences = references.filter((reference) => reference.status === "approved");
  const candidateReferences = references.filter((reference) => reference.status === "candidate");
  const topKeywordPatterns = collectTopPatterns(snapshots.map((snapshot) => snapshot.keywordPatterns));
  const topSectionPatterns = collectTopPatterns(snapshots.map((snapshot) => snapshot.sectionPatterns), 6);
  const topCtaPatterns = collectTopPatterns(snapshots.map((snapshot) => snapshot.ctaPatterns), 6);
  const topTonePatterns = collectTopPatterns(snapshots.map((snapshot) => snapshot.tonePatterns), 6);
  const strongestSnapshots = snapshots
    .slice()
    .sort((a, b) => b.qualityScore - a.qualityScore || new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime())
    .slice(0, 6);
  const averageQuality =
    snapshots.length === 0 ? 0 : Math.round(snapshots.reduce((sum, snapshot) => sum + snapshot.qualityScore, 0) / snapshots.length);
  const lowCoverageReasons = [
    approvedReferences.length < 5 ? "승인 참고 URL 풀이 아직 얕습니다." : "",
    candidateReferences.length < 3 ? "검토 대기 후보가 적어 다음 학습 재료가 부족합니다." : "",
    topSectionPatterns.length < 3 ? "소제목 구조 패턴이 아직 충분히 다양하지 않습니다." : "",
    topTonePatterns.length < 3 ? "톤 패턴이 좁아져 결과 문체가 단조로워질 수 있습니다." : ""
  ].filter(Boolean);

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card section-stack admin-section-hero">
          <span className="eyebrow">Learning Coverage</span>
          <h2 className="section-title">SEO 학습 풀 상태</h2>
          <p className="help">승인 참고 URL과 스냅샷 품질을 같이 보면서 생성 엔진이 너무 얕거나 한쪽 톤으로 쏠리지 않았는지 판단하는 화면입니다.</p>
          <div className="admin-summary-band">
            <article className="admin-summary-tile">
              <span className="eyebrow">승인 풀</span>
              <strong>{approvedReferences.length}개</strong>
              <div className="meta-line">재분석 가능한 참고 URL</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">Snapshot</span>
              <strong>{snapshots.length}개</strong>
              <div className="meta-line">누적 학습 조각</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">품질 평균</span>
              <strong>{averageQuality}점</strong>
              <div className="meta-line">현재 학습 안정도</div>
            </article>
          </div>
        </section>

        <section className="card section-stack tone-surface admin-side-reference">
          <span className="eyebrow">Related Pages</span>
          <h2 className="section-title">함께 볼 화면</h2>
          <div className="inline-actions">
            <Link href="/admin/seo-references" className="btn btn-secondary">
              참고 URL 운영
            </Link>
            <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
              후보 검토 큐
            </Link>
            <Link href="/admin/ranking-watch" className="btn btn-secondary">
              랭킹 감시 보기
            </Link>
          </div>
        </section>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Coverage Warnings</span>
          <h2 className="section-title">지금 보강해야 할 부분</h2>
          {lowCoverageReasons.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">현재 기준으로는 승인 풀과 패턴 폭이 크게 부족하지 않습니다.</p>
            </div>
          ) : (
            <ul className="list-clean">
              {lowCoverageReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
          <div className="inline-actions">
            <form action={generateSeoCandidatesAction}>
              <button type="submit" className="btn btn-primary">
                학습 풀 보강하기
              </button>
            </form>
            <form action={analyzeApprovedSeoReferencesAction}>
              <input type="hidden" name="limit" value="8" />
              <button type="submit" className="btn btn-secondary">
                승인 참고 재분석
              </button>
            </form>
          </div>
        </article>

        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Tone Direction</span>
          <h2 className="section-title">지금 많이 반영되는 톤</h2>
          {topTonePatterns.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">아직 누적된 톤 패턴이 없습니다.</p>
            </div>
          ) : (
            <div className="chips">
              {topTonePatterns.map((item) => (
                <span key={item.label} className="chip">
                  {item.label} · {item.count}
                </span>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="admin-overview-grid">
        <section className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Keyword Rules</span>
          <h2 className="section-title">상위 키워드 패턴</h2>
          {topKeywordPatterns.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">아직 학습된 키워드 패턴이 없습니다.</p>
            </div>
          ) : (
            <div className="chips">
              {topKeywordPatterns.map((item) => (
                <span key={item.label} className="chip">
                  {item.label} · {item.count}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">CTA Rules</span>
          <h2 className="section-title">자주 학습된 마무리 문장</h2>
          {topCtaPatterns.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">아직 학습된 CTA 패턴이 없습니다.</p>
            </div>
          ) : (
            <div className="history-list">
              {topCtaPatterns.map((item) => (
                <article key={item.label} className="compact-card history-card">
                  <strong>{item.label}</strong>
                  <div className="meta-line">반영 {item.count}회</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="card section-stack tone-surface admin-data-card">
        <span className="eyebrow">Section Rules</span>
        <h2 className="section-title">자주 학습된 소제목 구조</h2>
        {topSectionPatterns.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 누적된 소제목 패턴이 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {topSectionPatterns.map((item) => (
              <article key={item.label} className="compact-card history-card">
                <strong>{item.label}</strong>
                <div className="meta-line">반영 {item.count}회</div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Best Snapshots</span>
        <h2 className="section-title">품질이 높은 최근 스냅샷</h2>
        {strongestSnapshots.length === 0 ? (
          <div className="surface-muted section-stack">
            <p className="small-note">아직 분석된 스냅샷이 없습니다.</p>
            <div className="inline-actions">
              <Link href="/admin/seo-references" className="btn btn-secondary">
                참고 URL 등록하러 가기
              </Link>
              <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
                후보 검토부터 시작
              </Link>
            </div>
          </div>
        ) : (
          <div className="history-list">
            {strongestSnapshots.map((snapshot) => (
              <article key={snapshot.id} className="compact-card history-card">
                <strong>{snapshot.keywordPatterns[0] || "SEO 학습 스냅샷"}</strong>
                <div className="meta-line">
                  품질 {snapshot.qualityScore}점 · 신선도 {snapshot.freshnessScore}점 · {formatDate(snapshot.fetchedAt)}
                </div>
                <div className="small-note">{snapshot.notes}</div>
                <div className="inline-actions">
                  <Link href="/admin/seo-references" className="btn btn-secondary">
                    참고 URL 운영 화면
                  </Link>
                  <Link href={`/dashboard?keyword=${encodeURIComponent(snapshot.keywordPatterns[0] || "")}`} className="btn btn-secondary">
                    이 패턴으로 생성 보기
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
