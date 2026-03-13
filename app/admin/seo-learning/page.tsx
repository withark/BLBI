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
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
