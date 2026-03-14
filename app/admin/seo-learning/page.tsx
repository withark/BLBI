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
      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Learning Coverage</span>
          <h2 className="section-title">학습 풀 상태</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>승인 참고 URL</strong>
              <div>{approvedReferences.length}개</div>
            </div>
            <div className="compact-card">
              <strong>학습 스냅샷</strong>
              <div>{snapshots.length}개</div>
            </div>
            <div className="compact-card">
              <strong>평균 품질</strong>
              <div>{averageQuality}점</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Tone Direction</span>
          <h2 className="section-title">현재 많이 반영되는 톤</h2>
          <div className="chips">
            {topTonePatterns.length === 0 ? (
              <span className="help">아직 누적된 톤 패턴이 없습니다.</span>
            ) : (
              topTonePatterns.map((item) => (
                <span key={item.label} className="chip">
                  {item.label} · {item.count}
                </span>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Next Action</span>
          <h2 className="section-title">학습 풀을 바로 보강하기</h2>
          <p className="help">패턴을 확인한 뒤 같은 화면에서 바로 후보를 늘리고, 승인된 참고 URL을 다시 분석할 수 있어야 운영 속도가 유지됩니다.</p>
          <div className="inline-actions">
            <form action={generateSeoCandidatesAction}>
              <input type="hidden" name="limit" value="12" />
              <button type="submit" className="btn btn-primary">
                후보 12개 다시 생성
              </button>
            </form>
            <form action={analyzeApprovedSeoReferencesAction}>
              <input type="hidden" name="limit" value="6" />
              <button type="submit" className="btn btn-secondary">
                승인 참고 6개 재분석
              </button>
            </form>
            <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
              후보 검토 큐로 이동
            </Link>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Coverage Gaps</span>
          <h2 className="section-title">지금 보강이 필요한 부분</h2>
          {lowCoverageReasons.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">기본 학습 풀이 안정권입니다. 이제는 품질 점수가 낮은 스냅샷을 줄이고, 지역/메뉴별 세부 패턴을 더 쌓는 쪽이 맞습니다.</p>
            </div>
          ) : (
            <div className="history-list">
              {lowCoverageReasons.map((reason) => (
                <article key={reason} className="compact-card history-card">
                  <strong>{reason}</strong>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Keyword Rules</span>
          <h2 className="section-title">자주 학습된 키워드 결합</h2>
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

        <section className="card section-stack tone-surface">
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

      <section className="card section-stack tone-surface">
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

      <section className="card section-stack">
        <span className="eyebrow">Best Snapshots</span>
        <h2 className="section-title">품질이 높은 최근 스냅샷</h2>
        {strongestSnapshots.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 분석된 스냅샷이 없습니다.</p>
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
