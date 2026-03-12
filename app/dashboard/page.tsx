"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
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
  } | null;
};

type RecommendationResponse = {
  recommendations: Array<{ id: string; keyword: string }>;
};

function DashboardContent(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seeded = useRef(false);

  const [keyword, setKeyword] = useState("");
  const [details, setDetails] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [tone, setTone] = useState<"friendly" | "professional" | "warm">("friendly");
  const [includeFaq, setIncludeFaq] = useState(true);

  const [usage, setUsage] = useState<UsageResponse["usage"] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse["profile"]>(null);
  const [recommendations, setRecommendations] = useState<Array<{ id: string; keyword: string }>>([]);
  const [seriesTopics, setSeriesTopics] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    if (seeded.current) {
      return;
    }

    const initialKeyword = searchParams.get("keyword");

    if (initialKeyword) {
      setKeyword(initialKeyword);
    }

    seeded.current = true;
  }, [searchParams]);

  useEffect(() => {
    async function loadContext(): Promise<void> {
      try {
        const [usageRes, profileRes, recRes] = await Promise.all([
          fetch("/api/usage", { cache: "no-store" }),
          fetch("/api/business-profile", { cache: "no-store" }),
          fetch("/api/recommendations?limit=6", { cache: "no-store" })
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

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", lineHeight: 1.35 }}>키워드 입력 후 바로 생성</h1>
        <p className="help">채팅 없이 입력 한 번으로 결과를 만듭니다. 추천 키워드는 보조로만 사용하세요.</p>

        {!profile && (
          <div className="status error">
            가게 정보가 아직 없습니다. 생성 품질을 높이려면
            <Link href="/onboarding" style={{ textDecoration: "underline", marginLeft: "0.35rem" }}>
              온보딩에서 먼저 등록
            </Link>
            해 주세요.
          </div>
        )}

        <form onSubmit={(event) => void handleGenerate(event)} style={{ display: "grid", gap: "0.7rem" }}>
          <textarea
            className="textarea hero-input"
            placeholder="예: 상계동 칼국수 맛집"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />

          <div className="row">
            <select className="select" value={length} onChange={(event) => setLength(event.target.value as typeof length)}>
              <option value="short">짧게</option>
              <option value="medium">기본 길이</option>
              <option value="long">길게</option>
            </select>

            <select className="select" value={tone} onChange={(event) => setTone(event.target.value as typeof tone)}>
              <option value="friendly">친근한 톤</option>
              <option value="professional">전문적인 톤</option>
              <option value="warm">따뜻한 톤</option>
            </select>
          </div>

          <textarea
            className="textarea"
            placeholder="추가로 반영할 내용이 있다면 작성하세요 (선택)"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />

          <label className="help" style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
            <input type="checkbox" checked={includeFaq} onChange={(event) => setIncludeFaq(event.target.checked)} />
            FAQ 포함
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "생성 중..." : "블로그 글 생성"}
          </button>
        </form>

        <div className="status">{usageText}</div>
      </section>

      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h2 className="section-title">비서 추천 키워드</h2>
        <p className="help">추천을 누르면 키워드만 채워집니다. 생성은 반드시 버튼으로 실행됩니다.</p>
        <div className="chips">
          {recommendations.length === 0 && <span className="help">아직 추천 데이터가 없습니다.</span>}
          {recommendations.map((item) => (
            <button key={item.id} type="button" className="chip" onClick={() => setKeyword(item.keyword)}>
              {item.keyword}
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h2 className="section-title">시리즈 주제 만들기 (Premium)</h2>
        <p className="help">한 번에 여러 주제를 만든 뒤 원하는 주제를 눌러 키워드를 채울 수 있습니다.</p>
        <div className="row">
          <button className="btn btn-secondary" type="button" disabled={seriesLoading} onClick={() => void handleSeriesGenerate()}>
            {seriesLoading ? "생성 중..." : "시리즈 주제 생성"}
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

      <section className="card">
        <div className="kv">
          <div className="kv-item">
            <div className="kv-label">현재 플랜</div>
            <div className="kv-value">{usage?.plan ?? "-"}</div>
          </div>
          <div className="kv-item">
            <div className="kv-label">등록 가게</div>
            <div className="kv-value">{profile?.businessName ?? "미등록"}</div>
          </div>
          <div className="kv-item">
            <div className="kv-label">지역</div>
            <div className="kv-value">{profile?.region ?? "미등록"}</div>
          </div>
        </div>
      </section>

      {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}

      <section className="row">
        <button className="btn btn-secondary" type="button" onClick={() => void refreshUsage()}>
          사용량 새로고침
        </button>
        <Link className="btn btn-secondary" href="/history">
          히스토리 보기
        </Link>
      </section>
    </div>
  );
}

export default function DashboardPage(): React.ReactNode {
  return (
    <Suspense fallback={<div className="status">대시보드 로딩 중...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
