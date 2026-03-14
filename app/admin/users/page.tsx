import Link from "next/link";

import { toggleUserLimitBypassAction } from "@/app/admin/actions";
import { listAllBusinessProfiles, listAllPosts, listAllUsers } from "@/lib/store/db";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AdminUsersPage(): Promise<React.ReactNode> {
  const [users, posts, profiles] = await Promise.all([listAllUsers(), listAllPosts(), listAllBusinessProfiles()]);
  const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));
  const usersWithoutProfile = users.filter((user) => !profileMap.has(user.id)).length;
  const usersWithoutPosts = users.filter((user) => posts.every((post) => post.userId !== user.id)).length;
  const bypassCount = users.filter((user) => user.limitBypass).length;

  return (
    <div className="page-stack">
      <section className="card section-stack tone-surface">
        <span className="eyebrow">Users</span>
        <h2 className="section-title">사용자 운영</h2>
        <p className="help">플랜 상태, 생성 이력, 가게 정보 연결 여부, 한도 우회 여부를 함께 점검합니다.</p>
      </section>

      <section className="admin-overview-grid">
        <article className="card section-stack tone-surface">
          <span className="eyebrow">Coverage</span>
          <div className="info-grid">
            <div className="compact-card">
              <strong>전체 사용자</strong>
              <div>{users.length}명</div>
            </div>
            <div className="compact-card">
              <strong>온보딩 미완료</strong>
              <div>{usersWithoutProfile}명</div>
            </div>
            <div className="compact-card">
              <strong>생성 이력 없음</strong>
              <div>{usersWithoutPosts}명</div>
            </div>
            <div className="compact-card">
              <strong>한도 우회</strong>
              <div>{bypassCount}명</div>
            </div>
          </div>
        </article>

        <article className="card section-stack tone-surface">
          <span className="eyebrow">Related Pages</span>
          <h2 className="section-title">함께 볼 화면</h2>
          <div className="inline-actions">
            <Link href="/admin/subscription" className="btn btn-secondary">
              구독 화면
            </Link>
            <Link href="/admin/usage" className="btn btn-secondary">
              사용량 화면
            </Link>
            <Link href="/admin/posts" className="btn btn-secondary">
              생성 글 화면
            </Link>
          </div>
        </article>
      </section>

      <section className="history-list">
        {users.length === 0 ? (
          <div className="card section-stack">
            <strong>아직 등록된 사용자가 없습니다.</strong>
          </div>
        ) : (
          users.map((user) => {
            const userPosts = posts.filter((post) => post.userId === user.id);
            const profile = profileMap.get(user.id);

            return (
              <article key={user.id} className="card section-stack tone-surface">
                <div className="info-grid">
                  <div className="compact-card">
                    <strong>사용자</strong>
                    <div>{user.id}</div>
                    <div className="meta-line">가입일 {formatDate(user.createdAt)}</div>
                  </div>
                  <div className="compact-card">
                    <strong>현재 플랜</strong>
                    <div>{user.plan}</div>
                    <div className="meta-line">{user.limitBypass ? "한도 우회 켜짐" : "기본 한도 적용 중"}</div>
                  </div>
                  <div className="compact-card">
                    <strong>가게 연결</strong>
                    <div>{profile ? `${profile.businessName} · ${profile.region}` : "미등록"}</div>
                    <div className="meta-line">{profile ? `대표 메뉴 ${profile.representativeMenus.length}개` : "온보딩 필요"}</div>
                  </div>
                  <div className="compact-card">
                    <strong>생성 이력</strong>
                    <div>{userPosts.length}개</div>
                    <div className="meta-line">{userPosts[0] ? `최근 생성 ${formatDate(userPosts[0].createdAt)}` : "아직 생성 이력 없음"}</div>
                  </div>
                </div>

                <div className="inline-actions">
                  <form action={toggleUserLimitBypassAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="nextValue" value={String(!user.limitBypass)} />
                    <button type="submit" className={user.limitBypass ? "btn btn-danger" : "btn btn-secondary"}>
                      {user.limitBypass ? "한도 우회 끄기" : "한도 우회 켜기"}
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
