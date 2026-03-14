import Link from "next/link";

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
  const approvedKeywordCount = watchRows.filter((row) => row.approvedCount > 0).length;
  const candidateHeavyCount = watchRows.filter((row) => row.candidateCount > row.approvedCount).length;
  const recommendationHeavyCount = watchRows.filter((row) => row.recommendationCount > 0).length;
  const actionPriorityCount = watchRows.filter((row) => row.candidateCount > 0 && row.approvedCount === 0).length;

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card section-stack admin-section-hero">
          <span className="eyebrow">Keyword Watch</span>
          <h1 className="section-title">랭킹 감시 키워드군</h1>
          <p className="help">최근 생성 글, 추천 키워드, SEO 참고 URL에서 반복되는 키워드군을 묶어 어떤 주제가 실제로 쌓이고 있는지 운영자가 점검하는 화면입니다.</p>
          <div className="admin-summary-band">
            <article className="admin-summary-tile">
              <span className="eyebrow">관찰</span>
              <strong>{watchRows.length}개</strong>
              <div className="meta-line">현재 추적 중인 키워드군</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">승인</span>
              <strong>{approvedKeywordCount}개</strong>
              <div className="meta-line">승인 참고 보유</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">Action</span>
              <strong>{actionPriorityCount}개</strong>
              <div className="meta-line">즉시 검토 필요</div>
            </article>
          </div>
        </section>

        <section className="card section-stack tone-surface admin-side-reference">
          <span className="eyebrow">Fast Jump</span>
          <h2 className="section-title">바로 이동</h2>
          <div className="inline-actions">
            <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
              후보 검토 큐
            </Link>
            <Link href="/admin/seo-learning" className="btn btn-secondary">
              학습 패턴 보기
            </Link>
            <Link href="/admin/seo-references" className="btn btn-secondary">
              참고 URL 운영
            </Link>
          </div>
        </section>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Watch Summary</span>
          <h2 className="section-title">신호 분포</h2>
          <div className="info-grid">
            <div className="compact-card">
              <strong>후보 우세</strong>
              <div>{candidateHeavyCount}개</div>
            </div>
            <div className="compact-card">
              <strong>추천 신호 있음</strong>
              <div>{recommendationHeavyCount}개</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Interpretation</span>
          <h2 className="section-title">운영 판단 기준</h2>
          <ul className="list-clean">
            <li>승인 URL이 없고 후보만 많으면 후보 검토를 먼저 닫는 편이 맞습니다.</li>
            <li>학습 신호는 있으나 생성 글이 없으면 대시보드 테스트 생성으로 연결하는 편이 낫습니다.</li>
            <li>추천 신호까지 같이 쌓이면 시리즈 주제로 연결할 가치가 있습니다.</li>
          </ul>
        </article>
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Watch Feed</span>
        <h2 className="section-title">키워드군 상태</h2>
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
                  <div className="small-note">
                    {row.approvedCount === 0 && row.candidateCount > 0
                      ? "승인된 참고 URL이 없어 먼저 후보 검토가 필요합니다."
                      : row.postCount === 0
                        ? "학습 신호는 있으나 실제 생성 글이 아직 없습니다."
                        : "승인 참고, 생성 글, 추천 신호가 함께 쌓이고 있습니다."}
                  </div>
                  <div className="chips">
                    <span className="chip">승인 URL {row.approvedCount}</span>
                    <span className="chip">후보 URL {row.candidateCount}</span>
                    <span className="chip">생성 글 {row.postCount}</span>
                    <span className="chip">추천 {row.recommendationCount}</span>
                  </div>
                  <div className="inline-actions">
                    <Link href={`/dashboard?keyword=${encodeURIComponent(row.keyword)}`} className="btn btn-secondary">
                      이 키워드로 생성 보기
                    </Link>
                    <Link href={`/admin/seo-references/candidates?keyword=${encodeURIComponent(row.keyword)}`} className="btn btn-secondary">
                      이 키워드 후보 검토
                    </Link>
                    <Link href="/admin/seo-learning" className="btn btn-secondary">
                      학습 패턴 점검
                    </Link>
                  </div>
                  <div className="inline-actions">
                    <Link href={`/history?keyword=${encodeURIComponent(row.keyword)}`} className="btn btn-secondary">
                      관련 글 히스토리
                    </Link>
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
