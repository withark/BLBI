import Link from "next/link";

import { applyLimitBypass, getUsageSnapshot } from "@/lib/domain/usage";
import { listAllPosts, listAllUsers } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function buildUsageLabel(limit: number | null, used: number, remaining: number | null): string {
  if (limit === null) {
    return `${used}회 사용 · 무제한`;
  }

  return `${used} / ${limit}회 · 남음 ${remaining}회`;
}

export default async function AdminUsagePage(): Promise<React.ReactNode> {
  const [users, posts] = await Promise.all([listAllUsers(), listAllPosts()]);
  const usageRows = users.map((user) => {
    const userPosts = posts.filter((post) => post.userId === user.id);
    const usage = applyLimitBypass(getUsageSnapshot(userPosts, user.plan), user.limitBypass);

    return {
      user,
      usage
    };
  });
  const limitReachedCount = usageRows.filter((entry) => entry.usage.limit !== null && entry.usage.remaining === 0).length;
  const unlimitedCount = usageRows.filter((entry) => entry.usage.limit === null).length;
  const bypassCount = usageRows.filter((entry) => entry.user.limitBypass).length;

  return (
    <div className="page-stack">
      <section className="card section-stack tone-surface">
        <span className="eyebrow">Usage</span>
        <h2 className="section-title">사용량 점검</h2>
        <p className="help">플랜 정책 계산과 실제 생성 이력이 같은 데이터 소스에서 나오도록 확인하는 화면입니다.</p>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Snapshot</span>
          <div className="info-grid">
            <div className="compact-card">
              <strong>전체 사용자</strong>
              <div>{usageRows.length}명</div>
            </div>
            <div className="compact-card">
              <strong>한도 도달</strong>
              <div>{limitReachedCount}명</div>
            </div>
            <div className="compact-card">
              <strong>무제한 사용</strong>
              <div>{unlimitedCount}명</div>
            </div>
            <div className="compact-card">
              <strong>우회 적용</strong>
              <div>{bypassCount}명</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Related Pages</span>
          <h2 className="section-title">함께 볼 화면</h2>
          <div className="inline-actions">
            <Link href="/admin/users" className="btn btn-secondary">
              사용자 보기
            </Link>
            <Link href="/admin/subscription" className="btn btn-secondary">
              구독 보기
            </Link>
            <Link href="/settings" className="btn btn-secondary">
              사용자 설정 화면
            </Link>
          </div>
        </article>
      </section>

      <section className="history-list">
        {usageRows.map(({ user, usage }) => (
          <article key={user.id} className="card section-stack tone-surface">
              <div className="info-grid">
                <div className="compact-card">
                  <strong>사용자</strong>
                  <div>{user.id}</div>
                  <div className="meta-line">플랜 {user.plan}</div>
                </div>
                <div className="compact-card">
                  <strong>현재 사용량</strong>
                  <div>{buildUsageLabel(usage.limit, usage.used, usage.remaining)}</div>
                  <div className="meta-line">집계 창 {usage.window}</div>
                </div>
                <div className="compact-card">
                  <strong>우회 상태</strong>
                  <div>{user.limitBypass ? "활성" : "비활성"}</div>
                  <div className="meta-line">{user.limitBypass ? "관리자 한도 우회 적용 중" : "기본 한도 정책 사용 중"}</div>
                </div>
              </div>
          </article>
        ))}
      </section>
    </div>
  );
}
