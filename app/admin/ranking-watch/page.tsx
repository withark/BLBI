import { listAllPosts, listAllRecommendations, listSeoReferences } from "@/lib/store/db";

export const dynamic = "force-dynamic";

interface KeywordWatchRow {
  keyword: string;
  region: string;
  approvedCount: number;
  candidateCount: number;
  postCount: number;
  recommendationCount: number;
  lastTouchedAt: string;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminRankingWatchPage(): Promise<React.ReactNode> {
  const [posts, recommendations, references] = await Promise.all([
    listAllPosts(),
    listAllRecommendations(),
    listSeoReferences()
  ]);
  const rows = new Map<string, KeywordWatchRow>();

  for (const reference of references) {
    const key = normalizeKey(reference.keyword);
    const row = rows.get(key) ?? {
      keyword: reference.keyword,
      region: reference.region,
      approvedCount: 0,
      candidateCount: 0,
      postCount: 0,
      recommendationCount: 0,
      lastTouchedAt: reference.updatedAt
    };

    row.region = row.region || reference.region;
    row.lastTouchedAt = new Date(row.lastTouchedAt).getTime() > new Date(reference.updatedAt).getTime() ? row.lastTouchedAt : reference.updatedAt;

    if (reference.status === "approved") {
      row.approvedCount += 1;
    }

    if (reference.status === "candidate") {
      row.candidateCount += 1;
    }

    rows.set(key, row);
  }

  for (const post of posts) {
    const key = normalizeKey(post.keyword);
    const row = rows.get(key) ?? {
      keyword: post.keyword,
      region: "",
      approvedCount: 0,
      candidateCount: 0,
      postCount: 0,
      recommendationCount: 0,
      lastTouchedAt: post.updatedAt
    };

    row.postCount += 1;
    row.lastTouchedAt = new Date(row.lastTouchedAt).getTime() > new Date(post.updatedAt).getTime() ? row.lastTouchedAt : post.updatedAt;
    rows.set(key, row);
  }

  for (const recommendation of recommendations) {
    const key = normalizeKey(recommendation.keyword);
    const row = rows.get(key) ?? {
      keyword: recommendation.keyword,
      region: "",
      approvedCount: 0,
      candidateCount: 0,
      postCount: 0,
      recommendationCount: 0,
      lastTouchedAt: recommendation.createdAt
    };

    row.recommendationCount += 1;
    row.lastTouchedAt =
      new Date(row.lastTouchedAt).getTime() > new Date(recommendation.createdAt).getTime() ? row.lastTouchedAt : recommendation.createdAt;
    rows.set(key, row);
  }

  const watchRows = [...rows.values()]
    .sort((a, b) => {
      const aScore = a.approvedCount * 3 + a.candidateCount * 2 + a.postCount + a.recommendationCount;
      const bScore = b.approvedCount * 3 + b.candidateCount * 2 + b.postCount + b.recommendationCount;

      return bScore - aScore || new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime();
    })
    .slice(0, 16);

  return (
    <div className="page-stack">
      <section className="card section-stack tone-surface">
        <span className="eyebrow">Keyword Watch</span>
        <h1 className="section-title">랭킹 감시 키워드군</h1>
        <p className="help">최근 생성 글, 추천 키워드, SEO 참고 URL에서 반복되는 키워드군을 묶어 어떤 주제가 실제로 쌓이고 있는지 운영자가 점검하는 화면입니다.</p>
      </section>

      <section className="card section-stack">
        {watchRows.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 관찰할 키워드군이 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {watchRows.map((row) => (
              <article key={`${row.keyword}-${row.region}`} className="compact-card history-card">
                <div className="section-stack">
                  <strong>{row.keyword}</strong>
                  <div className="meta-line">{row.region || "지역 미지정"} · 최근 반영 {formatDate(row.lastTouchedAt)}</div>
                  <div className="chips">
                    <span className="chip">승인 URL {row.approvedCount}</span>
                    <span className="chip">후보 URL {row.candidateCount}</span>
                    <span className="chip">생성 글 {row.postCount}</span>
                    <span className="chip">추천 {row.recommendationCount}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
