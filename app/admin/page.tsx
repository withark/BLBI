import Link from "next/link";

import { analyzeApprovedSeoReferencesAction, generateSeoCandidatesAction } from "@/app/admin/actions";

import { getAdminStats, listAdminJobs, listSeoReferences, listSeoSnapshots } from "@/lib/store/db";

export const dynamic = "force-dynamic";

const STALE_REFERENCE_DAYS = 10;
const LOW_QUALITY_SNAPSHOT_SCORE = 75;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function isOlderThanDays(value: string | null, days: number): boolean {
  if (!value) {
    return true;
  }

  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(value).getTime() < threshold;
}

function getPriorityTone(level: "danger" | "warning" | "stable"): string {
  switch (level) {
    case "danger":
      return "is-danger";
    case "warning":
      return "is-warning";
    default:
      return "is-stable";
  }
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
  const failedJobCount = adminJobs.filter((job) => job.status === "failed").length;
  const staleApprovedCount = seoReferences.filter(
    (item) => item.status === "approved" && isOlderThanDays(item.lastAnalyzedAt, STALE_REFERENCE_DAYS)
  ).length;
  const lowQualitySnapshotCount = seoSnapshots.filter((snapshot) => snapshot.qualityScore < LOW_QUALITY_SNAPSHOT_SCORE).length;
  const latestSnapshot = seoSnapshots[0] ?? null;
  const latestJob = adminJobs[0] ?? null;
  const latestFailure = adminJobs.find((job) => job.status === "failed") ?? null;
  const unprofiledUserCount = Math.max(stats.userCount - stats.businessProfileCount, 0);
  const priorityItems = [
    {
      key: "candidates",
      label: "검토 적체 후보",
      count: candidateSeoCount,
      tone: candidateSeoCount >= 8 ? "danger" : candidateSeoCount > 0 ? "warning" : "stable",
      description:
        candidateSeoCount === 0
          ? "지금은 승인 대기 후보가 없습니다."
          : "후보가 쌓일수록 학습 승인 속도가 느려집니다. 먼저 큐를 비워야 생성 품질 개선이 빨라집니다.",
      href: "/admin/seo-references/candidates",
      actionLabel: candidateSeoCount === 0 ? "후보 만들기" : "후보 검토하기",
      helper: candidateSeoCount === 0 ? "내부 데이터 기준 새 후보를 만들 차례입니다." : "보류된 후보를 승인 또는 제외 처리합니다."
    },
    {
      key: "approved",
      label: "재분석 필요 참고",
      count: staleApprovedCount,
      tone: staleApprovedCount >= 6 ? "danger" : staleApprovedCount > 0 ? "warning" : "stable",
      description:
        staleApprovedCount === 0
          ? "승인된 참고 URL이 최근 분석 상태를 유지하고 있습니다."
          : `승인된 참고 URL 중 ${STALE_REFERENCE_DAYS}일 이상 업데이트되지 않은 항목입니다.`,
      href: "/admin/seo-references",
      actionLabel: staleApprovedCount === 0 ? "참고 URL 보기" : "재분석 실행하기",
      helper: staleApprovedCount === 0 ? "추가 승인 대상을 넓히거나 후보를 더 늘리면 됩니다." : "승인 참고를 다시 분석해 최신 패턴을 보강합니다."
    },
    {
      key: "quality",
      label: "낮은 품질 스냅샷",
      count: lowQualitySnapshotCount,
      tone: lowQualitySnapshotCount >= 4 ? "danger" : lowQualitySnapshotCount > 0 ? "warning" : "stable",
      description:
        lowQualitySnapshotCount === 0
          ? "현재 누적 학습 스냅샷 품질이 안정권입니다."
          : `품질 ${LOW_QUALITY_SNAPSHOT_SCORE}점 미만 스냅샷입니다. 승인 기준이나 참고 URL 구성이 약할 수 있습니다.`,
      href: "/admin/seo-learning",
      actionLabel: lowQualitySnapshotCount === 0 ? "학습 현황 보기" : "학습 패턴 점검",
      helper: lowQualitySnapshotCount === 0 ? "이제 커버리지가 비는 키워드군을 넓히는 쪽이 맞습니다." : "약한 스냅샷이 많으면 생성 문체와 소제목 일관성이 흔들립니다."
    },
    {
      key: "jobs",
      label: "최근 실패 작업",
      count: failedJobCount,
      tone: failedJobCount >= 2 ? "danger" : failedJobCount > 0 ? "warning" : "stable",
      description:
        failedJobCount === 0
          ? "최근 자동 작업은 모두 정상 종료됐습니다."
          : "후보 생성이나 분석이 실패한 기록입니다. 흐름이 끊기기 전에 원인을 확인해야 합니다.",
      href: "/admin/jobs",
      actionLabel: failedJobCount === 0 ? "작업 로그 보기" : "실패 로그 확인",
      helper:
        failedJobCount === 0
          ? "다음 작업은 실패 추적보다 후보 생성과 승인 루프 강화에 집중하면 됩니다."
          : latestFailure ? `${formatDate(latestFailure.createdAt)} 실패 기록부터 확인합니다.` : "최근 로그에서 실패 원인을 먼저 확인합니다."
    }
  ] as const;
  const topPriority = [...priorityItems].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="page-stack">
      <section className="card section-stack admin-hero">
        <div className="section-stack">
          <span className="eyebrow">Control Tower</span>
          <h1 className="hero-title">오늘 먼저 처리할 운영 우선순위</h1>
          <p className="help">
            관리자 홈에서는 숫자보다 순서가 더 중요합니다. 후보 적체, 승인 참고 재분석, 낮은 품질 스냅샷, 실패 작업 중 지금 가장 큰 막힘을 먼저
            제거하면 생성 품질 개선 속도가 올라갑니다.
          </p>
        </div>
        <div className="priority-grid">
          {priorityItems.map((item) => (
            <article key={item.key} className={`priority-card ${getPriorityTone(item.tone)}`}>
              <div className="priority-card-head">
                <span className="eyebrow">{item.label}</span>
                <strong>{item.count}건</strong>
              </div>
              <p className="help">{item.description}</p>
              <p className="small-note">{item.helper}</p>
              <div className="inline-actions">
                <Link href={item.href} className="btn btn-secondary">
                  {item.actionLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

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
              <strong>최우선 처리</strong>
              <div className="meta-line">
                {topPriority.label} · {topPriority.count}건
              </div>
              <div className="small-note">{topPriority.helper}</div>
            </article>
            <article className="compact-card history-card">
              <strong>가게 정보 커버리지</strong>
              <div className="meta-line">등록 {stats.businessProfileCount}개 · 미등록 사용자 {unprofiledUserCount}명</div>
              <div className="small-note">가게 정보가 비면 생성 품질과 지역 키워드 정확도가 함께 떨어집니다.</div>
            </article>
            <article className="compact-card history-card">
              <strong>최근 학습/작업 상태</strong>
              <div className="meta-line">
                최근 스냅샷 {latestSnapshot ? formatDate(latestSnapshot.fetchedAt) : "없음"} · 최근 작업 {latestJob ? formatDate(latestJob.createdAt) : "없음"}
              </div>
              <div className="small-note">
                {latestFailure
                  ? `실패 로그가 남아 있습니다. ${formatDate(latestFailure.createdAt)} 기록을 우선 확인합니다.`
                  : "최근 작업 흐름은 안정적입니다. 후보 승인과 재분석 주기를 넓히면 됩니다."}
              </div>
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
