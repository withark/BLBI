import Link from "next/link";

import { analyzeApprovedSeoReferencesAction, generateSeoCandidatesAction } from "@/app/admin/actions";

import { getAdminStats, listAdminJobs, listSeoReferences, listSeoSnapshots } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminPage(): Promise<React.ReactNode> {
  const [stats, seoReferences, seoSnapshots, adminJobs] = await Promise.all([
    getAdminStats(),
    listSeoReferences(),
    listSeoSnapshots(),
    listAdminJobs(8)
  ]);
  const approvedSeoCount = seoReferences.filter((item) => item.status === "approved").length;
  const candidateSeoCount = seoReferences.filter((item) => item.status === "candidate").length;
  const averageSeoQuality =
    seoSnapshots.length === 0 ? 0 : Math.round(seoSnapshots.reduce((sum, snapshot) => sum + snapshot.qualityScore, 0) / seoSnapshots.length);

  return (
    <div className="page-stack">
      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Overview</span>
          <div className="kv">
            <div className="kv-item">
              <div className="kv-label">총 사용자</div>
              <div className="kv-value">{stats.userCount}</div>
            </div>
            <div className="kv-item">
              <div className="kv-label">총 생성 글</div>
              <div className="kv-value">{stats.postCount}</div>
            </div>
            <div className="kv-item">
              <div className="kv-label">이번 달 생성</div>
              <div className="kv-value">{stats.monthPostCount}</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">SEO Engine</span>
          <div className="info-grid">
            <div className="compact-card">
              <strong>참고 URL</strong>
              <div>{stats.seoReferenceCount}개</div>
              <div className="meta-line">승인 {approvedSeoCount}개 · 후보 {seoReferences.filter((item) => item.status === "candidate").length}개</div>
            </div>
            <div className="compact-card">
              <strong>학습 스냅샷</strong>
              <div>{stats.seoSnapshotCount}개</div>
              <div className="meta-line">평균 품질 {averageSeoQuality}점</div>
            </div>
          </div>
        </article>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <span className="eyebrow">Operator Actions</span>
          <h2 className="section-title">바로 실행할 SEO 운영 작업</h2>
          <p className="help">관리자 홈에서 바로 후보를 늘리고 승인된 참고 URL을 재분석할 수 있게 해 두면, 학습 주기를 따로 찾지 않아도 됩니다.</p>
          <div className="inline-actions">
            <form action={generateSeoCandidatesAction}>
              <input type="hidden" name="limit" value="12" />
              <button type="submit" className="btn btn-primary">
                후보 12개 생성
              </button>
            </form>
            <form action={analyzeApprovedSeoReferencesAction}>
              <input type="hidden" name="limit" value="6" />
              <button type="submit" className="btn btn-secondary">
                승인 참고 6개 재분석
              </button>
            </form>
            <Link href="/admin/seo-references/candidates" className="btn btn-secondary">
              후보 검토 바로가기
            </Link>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Attention</span>
          <h2 className="section-title">지금 먼저 볼 항목</h2>
          <div className="history-list">
            <article className="compact-card history-card">
              <strong>검토 대기 후보</strong>
              <div className="meta-line">{candidateSeoCount}개</div>
            </article>
            <article className="compact-card history-card">
              <strong>승인 참고 URL</strong>
              <div className="meta-line">{approvedSeoCount}개</div>
            </article>
            <article className="compact-card history-card">
              <strong>최근 자동 작업</strong>
              <div className="meta-line">{adminJobs.length}건 표시 중</div>
            </article>
          </div>
        </section>
      </section>

      <section className="admin-overview-grid">
        <Link href="/admin/users" className="card section-stack admin-link-card">
          <span className="eyebrow">Users</span>
          <strong>사용자 운영 보기</strong>
          <p className="help">플랜, 우회 권한, 가게 정보 연결 여부를 함께 확인합니다.</p>
        </Link>
        <Link href="/admin/subscription" className="card section-stack admin-link-card">
          <span className="eyebrow">Subscription</span>
          <strong>구독과 플랜 분포</strong>
          <p className="help">플랜별 사용자 수와 전환 필요 대상을 빠르게 볼 수 있습니다.</p>
        </Link>
        <Link href="/admin/posts" className="card section-stack admin-link-card">
          <span className="eyebrow">Posts</span>
          <strong>생성 글 흐름</strong>
          <p className="help">어떤 키워드와 글이 실제로 쌓이고 있는지 확인합니다.</p>
        </Link>
        <Link href="/admin/usage" className="card section-stack admin-link-card">
          <span className="eyebrow">Usage</span>
          <strong>사용량과 한도</strong>
          <p className="help">플랜 정책과 실제 사용량 계산이 맞는지 검증합니다.</p>
        </Link>
        <Link href="/admin/seo-references" className="card section-stack admin-link-card">
          <span className="eyebrow">SEO References</span>
          <strong>상위노출 학습 관리</strong>
          <p className="help">참고 URL 등록, 승인, 분석, 스냅샷 누적을 관리합니다.</p>
        </Link>
        <Link href="/admin/seo-references/candidates" className="card section-stack admin-link-card">
          <span className="eyebrow">Candidate Queue</span>
          <strong>후보 검토 큐</strong>
          <p className="help">자동 생성되거나 수동 등록된 후보 중 아직 승인되지 않은 항목만 빠르게 검토합니다.</p>
        </Link>
        <Link href="/admin/seo-learning" className="card section-stack admin-link-card">
          <span className="eyebrow">SEO Learning</span>
          <strong>학습 패턴 보기</strong>
          <p className="help">누적된 키워드, 소제목, CTA, 톤 패턴이 실제로 어떻게 쌓이는지 확인합니다.</p>
        </Link>
        <Link href="/admin/ranking-watch" className="card section-stack admin-link-card">
          <span className="eyebrow">Ranking Watch</span>
          <strong>키워드군 감시</strong>
          <p className="help">생성 글, 추천, 참고 URL에서 반복되는 키워드군을 모아 관찰합니다.</p>
        </Link>
        <Link href="/admin/jobs" className="card section-stack admin-link-card">
          <span className="eyebrow">Jobs</span>
          <strong>자동 작업 로그</strong>
          <p className="help">후보 생성과 분석 작업이 몇 건 반영됐는지 운영 로그로 확인합니다.</p>
        </Link>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <span className="eyebrow">Recent Posts</span>
            <h2 className="section-title">최근 생성 글</h2>
          </div>

          {stats.recentPosts.length === 0 ? (
            <div className="surface-muted section-stack">
              <p className="small-note">아직 생성된 글이 없습니다.</p>
              <div className="inline-actions">
                <Link className="btn btn-primary" href="/dashboard">
                  첫 글 생성 화면 보기
                </Link>
                <Link className="btn btn-secondary" href="/onboarding">
                  가게 정보 확인
                </Link>
              </div>
            </div>
          ) : (
            <div className="history-list">
              {stats.recentPosts.slice(0, 6).map((post) => (
                <article key={post.id} className="compact-card history-card">
                  <strong>{post.title}</strong>
                  <div className="meta-line">
                    {post.keyword} · {formatDate(post.createdAt)} · {post.plan}
                  </div>
                  <div className="inline-actions">
                    <Link className="btn btn-secondary" href={`/result?postId=${post.id}`}>
                      결과 보기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card section-stack tone-surface">
          <div className="section-stack">
            <span className="eyebrow">Recent Learning</span>
            <h2 className="section-title">최근 SEO 학습</h2>
          </div>

          {seoSnapshots.length === 0 ? (
            <div className="surface-muted">
              <p className="small-note">아직 분석된 SEO 스냅샷이 없습니다. 참고 URL을 추가하고 분석을 실행하면 이곳에 누적됩니다.</p>
              <div className="inline-actions">
                <Link className="btn btn-secondary" href="/admin/seo-references">
                  참고 URL 추가하러 가기
                </Link>
              </div>
            </div>
          ) : (
            <div className="history-list">
              {seoSnapshots.slice(0, 6).map((snapshot) => (
                <article key={snapshot.id} className="compact-card history-card">
                  <strong>{snapshot.keywordPatterns[0] || "학습 스냅샷"}</strong>
                  <div className="meta-line">
                    품질 {snapshot.qualityScore}점 · 신선도 {snapshot.freshnessScore}점 · {formatDate(snapshot.fetchedAt)}
                  </div>
                  <div className="small-note">{snapshot.notes}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="card section-stack tone-surface">
        <div className="section-stack">
          <span className="eyebrow">Recent Jobs</span>
          <h2 className="section-title">최근 자동 작업</h2>
        </div>

        {adminJobs.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 기록된 자동 작업이 없습니다.</p>
            <div className="inline-actions">
              <Link className="btn btn-secondary" href="/admin/seo-references">
                자동 후보 작업 시작하기
              </Link>
            </div>
          </div>
        ) : (
          <div className="history-list">
            {adminJobs.map((job) => (
              <article key={job.id} className="compact-card history-card">
                <strong>{job.summary}</strong>
                <div className="meta-line">
                  {job.jobType} · {job.status === "success" ? "성공" : "실패"} · 반영 {job.affectedCount}건 · {formatDate(job.createdAt)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
