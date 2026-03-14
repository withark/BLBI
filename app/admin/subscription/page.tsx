import Link from "next/link";

import { setUserPlanAction } from "@/app/admin/actions";
import { listAllUsers } from "@/lib/store/db";

export const dynamic = "force-dynamic";

const PLAN_OPTIONS = ["FREE", "BASIC", "PREMIUM"] as const;

export default async function AdminSubscriptionPage(): Promise<React.ReactNode> {
  const users = await listAllUsers();
  const counts = {
    FREE: users.filter((user) => user.plan === "FREE").length,
    BASIC: users.filter((user) => user.plan === "BASIC").length,
    PREMIUM: users.filter((user) => user.plan === "PREMIUM").length
  };
  const upgradeTargets = {
    freeToBasic: counts.FREE,
    basicToPremium: counts.BASIC
  };

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card section-stack admin-section-hero">
          <span className="eyebrow">Subscription Mix</span>
          <h2 className="section-title">플랜 분포</h2>
          <p className="help">Free, Basic, Premium이 어느 단계에서 막히는지 보고 업그레이드 타이밍을 조정하는 화면입니다.</p>
          <div className="admin-summary-band">
            <article className="admin-summary-tile">
              <span className="eyebrow">Free</span>
              <strong>{counts.FREE}명</strong>
              <div className="meta-line">처음 체험 단계</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">Basic</span>
              <strong>{counts.BASIC}명</strong>
              <div className="meta-line">월 15회 운영 단계</div>
            </article>
            <article className="admin-summary-tile">
              <span className="eyebrow">Premium</span>
              <strong>{counts.PREMIUM}명</strong>
              <div className="meta-line">무제한 + 시리즈 단계</div>
            </article>
          </div>
        </section>

        <section className="card section-stack tone-surface admin-side-reference">
          <span className="eyebrow">Related Pages</span>
          <h2 className="section-title">함께 볼 화면</h2>
          <div className="inline-actions">
            <Link href="/admin/usage" className="btn btn-secondary">
              사용량 보기
            </Link>
            <Link href="/admin/users" className="btn btn-secondary">
              사용자 보기
            </Link>
            <Link href="/pricing" className="btn btn-secondary">
              사용자 요금제 화면
            </Link>
          </div>
        </section>
      </section>

      <section className="two-column">
        <section className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Distribution</span>
          <div className="info-grid">
            <div className="compact-card">
              <strong>Free</strong>
              <div>{counts.FREE}명</div>
              <div className="meta-line">처음 체험 단계</div>
            </div>
            <div className="compact-card">
              <strong>Basic</strong>
              <div>{counts.BASIC}명</div>
              <div className="meta-line">월 15회 운영 단계</div>
            </div>
            <div className="compact-card">
              <strong>Premium</strong>
              <div>{counts.PREMIUM}명</div>
              <div className="meta-line">무제한 + 시리즈 단계</div>
            </div>
          </div>
        </section>

        <section className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">What To Watch</span>
          <h2 className="section-title">운영 포인트</h2>
          <ul className="list-clean">
            <li>Free 사용자가 많으면 온보딩 이후 첫 생성 전환을 더 봐야 합니다.</li>
            <li>Basic 사용자가 많으면 월 한도 도달 전 업그레이드 안내 위치를 더 조정할 수 있습니다.</li>
            <li>Premium 사용자는 시리즈 생성과 SEO 학습 흐름을 더 강하게 연결할 가치가 있습니다.</li>
          </ul>
        </section>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface admin-data-card">
          <span className="eyebrow">Upgrade Watch</span>
          <div className="info-grid">
            <div className="compact-card">
              <strong>Free → Basic 후보</strong>
              <div>{upgradeTargets.freeToBasic}명</div>
            </div>
            <div className="compact-card">
              <strong>Basic → Premium 후보</strong>
              <div>{upgradeTargets.basicToPremium}명</div>
            </div>
          </div>
        </article>
      </section>

      <section className="card section-stack">
        <span className="eyebrow">Plan Control</span>
        <h2 className="section-title">사용자 플랜 변경</h2>
        {users.length === 0 ? (
          <div className="surface-muted">
            <p className="small-note">아직 구독 상태를 점검할 사용자가 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {users.map((user) => (
              <article key={user.id} className="compact-card history-card">
                <strong>{user.id}</strong>
                <div className="meta-line">현재 플랜 {user.plan}</div>
                <div className="inline-actions">
                  {PLAN_OPTIONS.map((plan) => (
                    <form key={plan} action={setUserPlanAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="plan" value={plan} />
                      <button type="submit" className={plan === user.plan ? "btn btn-primary" : "btn btn-secondary"}>
                        {plan}
                      </button>
                    </form>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
