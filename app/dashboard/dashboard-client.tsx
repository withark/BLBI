"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UsageResponse = {
  usage: {
    plan: "FREE" | "BASIC" | "PREMIUM";
    used: number;
    limit: number | null;
    remaining: number | null;
    window: "daily" | "monthly" | "unlimited";
  };
  plan: "FREE" | "BASIC" | "PREMIUM";
};

type ProfileResponse = {
  profile: {
    businessName: string;
    region: string;
    openingHours: string;
    representativeMenus: string[];
    storeDescription: string;
    facilities: string;
  } | null;
};

type RecommendationResponse = {
  recommendations: Array<{ id: string; keyword: string }>;
};

type PostSummary = {
  id: string;
  title: string;
  keyword: string;
  exportText: string;
  createdAt: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function DashboardClient(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState("");
  const [details, setDetails] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [tone, setTone] = useState<"friendly" | "professional" | "warm">("friendly");
  const [includeFaq, setIncludeFaq] = useState(true);

  const [usage, setUsage] = useState<UsageResponse["usage"] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse["profile"]>(null);
  const [recommendations, setRecommendations] = useState<Array<{ id: string; keyword: string }>>([]);
  const [seriesTopics, setSeriesTopics] = useState<string[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostSummary[]>([]);

  const [loading, setLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    const initialKeyword = searchParams.get("keyword");
    const welcome = searchParams.get("welcome");

    if (initialKeyword) {
      setKeyword(initialKeyword);
    }

    if (welcome === "profile-saved") {
      setStatus({ type: "success", message: "가게 정보를 저장했습니다. 이제 키워드 하나로 바로 생성해 보세요." });
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadContext(): Promise<void> {
      try {
        const [usageRes, profileRes, recRes, postsRes] = await Promise.all([
          fetch("/api/usage", { cache: "no-store" }),
          fetch("/api/business-profile", { cache: "no-store" }),
          fetch("/api/recommendations?limit=6", { cache: "no-store" }),
          fetch("/api/posts", { cache: "no-store" })
        ]);

        if (usageRes.ok) {
          const usageJson = (await usageRes.json()) as UsageResponse;
          setUsage(usageJson.usage);
        }

        if (profileRes.ok) {
          const profileJson = (await profileRes.json()) as ProfileResponse;
          setProfile(profileJson.profile);
        }

        if (recRes.ok) {
          const recJson = (await recRes.json()) as RecommendationResponse;
          setRecommendations(recJson.recommendations);
        }

        if (postsRes.ok) {
          const postsJson = (await postsRes.json()) as { posts: PostSummary[] };
          setRecentPosts(postsJson.posts.slice(0, 3));
        }
      } catch {
        setStatus({ type: "error", message: "초기 데이터를 불러오지 못했습니다." });
      }
    }

    loadContext().catch(() => undefined);
  }, []);

  async function refreshUsage(): Promise<void> {
    const usageRes = await fetch("/api/usage", { cache: "no-store" });

    if (!usageRes.ok) {
      return;
    }

    const usageJson = (await usageRes.json()) as UsageResponse;
    setUsage(usageJson.usage);
  }

  async function copyExportText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ type: "success", message: "복사했습니다. 네이버 블로그에 바로 붙여넣을 수 있습니다." });
    } catch {
      setStatus({ type: "error", message: "복사에 실패했습니다." });
    }
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!keyword.trim()) {
      setStatus({ type: "error", message: "키워드를 입력해 주세요." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "블로그 글을 생성하고 있습니다..." });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          keyword,
          details,
          length,
          tone,
          includeFaq
        })
      });

      const json = (await response.json()) as {
        error?: string;
        message?: string;
        post?: { id: string };
        usage?: UsageResponse["usage"];
      };

      if (!response.ok || !json.post) {
        setStatus({ type: "error", message: json.message || "생성에 실패했습니다." });

        if (json.usage) {
          setUsage(json.usage);
        }

        return;
      }

      if (json.usage) {
        setUsage(json.usage);
      }

      setStatus({ type: "success", message: "생성이 완료되어 결과 페이지로 이동합니다." });
      router.push(`/result?postId=${json.post.id}`);
    } catch {
      setStatus({ type: "error", message: "네트워크 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSeriesGenerate(): Promise<void> {
    if (!keyword.trim()) {
      setStatus({ type: "error", message: "시리즈 주제를 만들려면 키워드를 먼저 입력해 주세요." });
      return;
    }

    setSeriesLoading(true);
    setStatus({ type: "info", message: "시리즈 주제를 생성하고 있습니다..." });

    try {
      const response = await fetch("/api/series-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword })
      });

      const json = (await response.json()) as { topics?: string[]; message?: string };

      if (!response.ok || !json.topics) {
        setStatus({ type: "error", message: json.message || "시리즈 주제 생성에 실패했습니다." });
        return;
      }

      setSeriesTopics(json.topics);
      setStatus({ type: "success", message: "시리즈 주제를 만들었습니다. 원하는 주제를 눌러 키워드를 채우세요." });
    } catch {
      setStatus({ type: "error", message: "시리즈 주제 생성 중 오류가 발생했습니다." });
    } finally {
      setSeriesLoading(false);
    }
  }

  const usageText = usage
    ? usage.limit === null
      ? `이번 기간 사용량 ${usage.used}회 / 무제한`
      : `이번 기간 사용량 ${usage.used}회 / ${usage.limit}회 (남음 ${usage.remaining}회)`
    : "사용량 정보를 불러오는 중";

  const usageGuide = usage
    ? usage.limit === null
      ? "Premium 플랜이라 생성 횟수 제한 없이 계속 작성할 수 있습니다."
      : usage.remaining === 0
        ? "생성 가능 횟수를 모두 사용했습니다. 요금제를 확인하거나 다음 기간에 다시 생성해 주세요."
        : `지금 바로 ${usage.remaining}회 더 생성할 수 있습니다.`
    : "사용량을 확인하는 중입니다.";

  const canUseSeries = usage?.plan === "PREMIUM";
  const profileChecklist = useMemo(() => {
    if (!profile) {
      return [];
    }

    return [
      { label: "상호명과 지역", ready: Boolean(profile.businessName && profile.region) },
      { label: "대표 메뉴", ready: profile.representativeMenus.length > 0 },
      { label: "가게 설명", ready: Boolean(profile.storeDescription.trim()) },
      { label: "영업시간", ready: Boolean(profile.openingHours.trim()) },
      { label: "편의 정보", ready: Boolean(profile.facilities.trim()) }
    ];
  }, [profile]);
  const profileReadyCount = profileChecklist.filter((item) => item.ready).length;

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card hero-card">
          <div className="section-stack">
            <div className="chips" aria-label="생성 핵심">
              <span className="pill">키워드 1개 입력</span>
              <span className="pill">추천은 보조</span>
              <span className="pill">복붙용 결과 생성</span>
            </div>
            <h1 className="hero-title" style={{ fontSize: "1.95rem" }}>
              오늘 올릴 글 하나를 지금 바로 만드세요
            </h1>
            <p className="help">메인 화면은 입력창과 생성 버튼 중심으로 유지하고, 운영 정보는 옆에서 보조합니다.</p>
          </div>

          {!profile && (
            <div className="status error">
              가게 정보가 아직 없습니다. 생성 품질을 높이려면
              <Link href="/onboarding" style={{ textDecoration: "underline", marginLeft: "0.35rem" }}>
                온보딩에서 먼저 등록
              </Link>
              해 주세요.
            </div>
          )}

          <form onSubmit={(event) => void handleGenerate(event)} className="section-stack">
            <div className="field-stack">
              <label className="field-label" htmlFor="dashboard-keyword">
                오늘 만들 키워드
              </label>
              <textarea
                id="dashboard-keyword"
                className="textarea hero-input"
                placeholder="예: 상계동 칼국수 맛집"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
              <p className="field-help">메뉴, 지역, 상황 키워드 한 줄이면 충분합니다.</p>
            </div>

            <div className="row">
              <div className="field-stack">
                <label className="field-label" htmlFor="dashboard-length">
                  글 길이
                </label>
                <select id="dashboard-length" className="select" value={length} onChange={(event) => setLength(event.target.value as typeof length)}>
                  <option value="short">짧게</option>
                  <option value="medium">기본 길이</option>
                  <option value="long">길게</option>
                </select>
              </div>

              <div className="field-stack">
                <label className="field-label" htmlFor="dashboard-tone">
                  문체
                </label>
                <select id="dashboard-tone" className="select" value={tone} onChange={(event) => setTone(event.target.value as typeof tone)}>
                  <option value="friendly">친근한 톤</option>
                  <option value="professional">전문적인 톤</option>
                  <option value="warm">따뜻한 톤</option>
                </select>
              </div>
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="dashboard-details">
                추가 반영 내용
              </label>
              <textarea
                id="dashboard-details"
                className="textarea"
                placeholder="예: 점심 손님이 많고, 만두 사진이 꼭 들어가면 좋겠어요"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
              />
            </div>

            <label className="help" style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
              <input type="checkbox" checked={includeFaq} onChange={(event) => setIncludeFaq(event.target.checked)} />
              FAQ 포함
            </label>

            <div className="inline-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "생성 중..." : "블로그 글 생성"}
              </button>
              <Link className="btn btn-secondary" href="/onboarding">
                가게 정보 수정
              </Link>
            </div>
          </form>
        </section>

        <section className="section-stack">
          <section className="card section-stack">
            <div className="section-stack">
              <h2 className="section-title">오늘 상태</h2>
              <p className="help">{usageText}</p>
            </div>

            <div className="info-grid">
              <div className="compact-card">
                <strong>현재 플랜</strong>
                <div>{usage?.plan ?? "-"}</div>
                <div className="meta-line">{usageGuide}</div>
              </div>
              <div className="compact-card">
                <strong>등록 가게</strong>
                <div>{profile?.businessName ?? "미등록"}</div>
                <div className="meta-line">{profile?.region ? `${profile.region} 기준으로 생성됩니다.` : "지역 정보가 없으면 글이 더 일반적으로 생성됩니다."}</div>
              </div>
            </div>

            <div className="surface-muted section-stack">
              <strong>생성 품질 점검</strong>
              {!profile ? (
                <p className="small-note">가게 정보가 없으면 결과가 일반적인 안내문 형태로 생성됩니다.</p>
              ) : (
                <>
                  <p className="small-note">
                    가게 정보 {profileChecklist.length}개 항목 중 {profileReadyCount}개가 채워져 있습니다. 많이 채울수록 본문과 사진 가이드가 더 구체적으로 생성됩니다.
                  </p>
                  <div className="chips">
                    {profileChecklist.map((item) => (
                      <span key={item.label} className="pill" style={item.ready ? undefined : { opacity: 0.55 }}>
                        {item.ready ? "완료" : "보강 필요"} · {item.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="inline-actions">
              <button className="btn btn-secondary" type="button" onClick={() => void refreshUsage()}>
                사용량 새로고침
              </button>
              <Link className="btn btn-secondary" href="/pricing">
                요금제 보기
              </Link>
            </div>
          </section>

          <section className="card section-stack">
            <div className="section-stack">
              <h2 className="section-title">오늘 할 일</h2>
              <p className="help">복잡하게 찾지 말고 아래 순서대로 움직이면 됩니다.</p>
            </div>

            <div className="step-grid">
              <div className="step-card">
                <div className="step-kicker">1</div>
                <div className="step-title">키워드 입력</div>
                <div className="step-body">오늘 밀고 싶은 메뉴, 지역, 상황 키워드를 위 입력창에 적습니다.</div>
              </div>
              <div className="step-card">
                <div className="step-kicker">2</div>
                <div className="step-title">결과 확인</div>
                <div className="step-body">복사 전에 제목과 본문, 사진 가이드만 짧게 확인하면 충분합니다.</div>
              </div>
              <div className="step-card">
                <div className="step-kicker">3</div>
                <div className="step-title">복사 후 업로드</div>
                <div className="step-body">히스토리에서 이전 글도 다시 열고 복사할 수 있습니다.</div>
              </div>
            </div>
          </section>
        </section>
      </section>

      <section className="card section-stack">
        <div className="section-stack">
          <h2 className="section-title">비서 추천 키워드</h2>
          <p className="help">추천은 키워드만 채웁니다. 생성은 반드시 위 버튼으로 직접 실행됩니다.</p>
        </div>
        <div className="chips">
          {recommendations.length === 0 && <span className="help">아직 추천 데이터가 없습니다.</span>}
          {recommendations.map((item) => (
            <button key={item.id} type="button" className="chip" onClick={() => setKeyword(item.keyword)}>
              {item.keyword}
            </button>
          ))}
        </div>
      </section>

      <section className="two-column">
        <section className="card section-stack">
          <div className="section-stack">
            <h2 className="section-title">최근 작성한 글</h2>
            <p className="help">다시 열거나 복사하거나, 키워드를 재사용해 다음 글로 이어갈 수 있습니다.</p>
          </div>

          {recentPosts.length === 0 ? (
            <div className="surface-muted section-stack">
              <strong>아직 저장된 글이 없습니다</strong>
              <p className="small-note">첫 글을 만들면 여기에서 다시 열기, 복사, 키워드 재사용이 가능합니다.</p>
            </div>
          ) : (
            <div className="history-list">
              {recentPosts.map((post) => (
                <article key={post.id} className="compact-card history-card">
                  <strong>{post.title}</strong>
                  <div className="meta-line">
                    키워드: {post.keyword} · {formatDate(post.createdAt)}
                  </div>
                  <div className="inline-actions">
                    <Link className="btn btn-secondary" href={`/result?postId=${post.id}`}>
                      다시 보기
                    </Link>
                    <button type="button" className="btn btn-secondary" onClick={() => void copyExportText(post.exportText)}>
                      복사
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setKeyword(post.keyword);
                        setStatus({ type: "success", message: `키워드 '${post.keyword}'를 다시 채웠습니다. 필요하면 내용만 조금 바꿔서 새 글을 만드세요.` });
                      }}
                    >
                      키워드 재사용
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <Link className="btn btn-secondary" href="/history">
            전체 히스토리 보기
          </Link>
        </section>

        <section className="card section-stack">
          <div className="section-stack">
            <h2 className="section-title">시리즈 주제 만들기</h2>
            <p className="help">Premium에서 한 번에 여러 주제를 만든 뒤 원하는 주제를 눌러 키워드를 채울 수 있습니다.</p>
          </div>

          {!canUseSeries && (
            <div className="status">
              현재 플랜에서는 시리즈 주제 생성이 잠겨 있습니다. Premium으로 업그레이드하면 여러 글 흐름을 한 번에 잡을 수 있습니다.
            </div>
          )}

          <div className="inline-actions">
            <button className="btn btn-secondary" type="button" disabled={seriesLoading || !canUseSeries} onClick={() => void handleSeriesGenerate()}>
              {seriesLoading ? "생성 중..." : canUseSeries ? "시리즈 주제 생성" : "Premium 전용"}
            </button>
            <Link href="/pricing" className="btn btn-secondary">
              요금제 보기
            </Link>
          </div>
          <div className="chips">
            {seriesTopics.map((topic) => (
              <button key={topic} type="button" className="chip" onClick={() => setKeyword(topic)}>
                {topic}
              </button>
            ))}
          </div>
        </section>
      </section>

      {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}
    </div>
  );
}
