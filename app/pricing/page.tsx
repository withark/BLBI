"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PLAN_DISPLAY, PRICING_CARDS } from "@/lib/domain/plan";

type Plan = "FREE" | "BASIC" | "PREMIUM";

type UsageState = {
  used: number;
  limit: number | null;
  remaining: number | null;
  window: "daily" | "monthly" | "unlimited";
};

function formatPlanWindow(usage: UsageState | null): string {
  if (!usage) {
    return "사용량을 불러오는 중";
  }

  if (usage.limit === null) {
    return `현재 사용량 ${usage.used}회 / 무제한`;
  }

  return `현재 사용량 ${usage.used}회 / ${usage.limit}회 (남음 ${usage.remaining}회)`;
}

export default function PricingPage(): React.ReactNode {
  const [plan, setPlan] = useState<Plan>("FREE");
  const [usage, setUsage] = useState<UsageState | null>(null);
  const suggestedPlan =
    usage && usage.limit !== null && usage.remaining !== null && usage.remaining <= 1
      ? plan === "FREE"
        ? "BASIC"
        : "PREMIUM"
      : plan;

  useEffect(() => {
    async function loadPricingContext(): Promise<void> {
      const [planRes, usageRes] = await Promise.all([
        fetch("/api/plan", { cache: "no-store" }),
        fetch("/api/usage", { cache: "no-store" })
      ]);

      if (planRes.ok) {
        const planJson = (await planRes.json()) as { plan: Plan };
        setPlan(planJson.plan);
      }

      if (usageRes.ok) {
        const usageJson = (await usageRes.json()) as { usage: UsageState };
        setUsage(usageJson.usage);
      }
    }

    loadPricingContext().catch(() => undefined);
  }, []);

  return (
    <div className="page-stack">
      <section className="two-column">
        <section className="card hero-card accent-card">
          <div className="chips" aria-label="요금제 안내">
            <span className="pill">체험부터 시작</span>
            <span className="pill">필요할 때 업그레이드</span>
            <span className="pill">Premium 시리즈 제공</span>
          </div>

          <div className="section-stack">
            <span className="eyebrow">Pricing</span>
            <h1 className="hero-title" style={{ fontSize: "2rem" }}>
              사장님 운영 방식에 맞는 플랜을 고르면 됩니다
            </h1>
            <p className="help">처음에는 Free로 시작하고, 운영 빈도가 늘어나면 Basic 또는 Premium으로 올리면 됩니다. 지금은 결제 대신 데모 플랜 전환으로 기능 차이를 바로 확인할 수 있습니다.</p>
          </div>

          <div className="info-grid">
            <div className="compact-card">
              <strong>현재 플랜</strong>
              <div>{PLAN_DISPLAY[plan].name}</div>
              <div className="meta-line">{PLAN_DISPLAY[plan].summary}</div>
            </div>
            <div className="compact-card">
              <strong>현재 상태</strong>
              <div>{formatPlanWindow(usage)}</div>
              <div className="meta-line">현재 사용 흐름 기준 추천: {PLAN_DISPLAY[suggestedPlan].name}</div>
            </div>
          </div>
        </section>

        <section className="card section-stack tone-surface">
          <span className="eyebrow">Decision</span>
          <h2 className="section-title">지금 바로 판단하는 기준</h2>
          <div className="history-list">
            <article className="compact-card history-card">
              <strong>Free 유지</strong>
              <div className="small-note">첫 글 몇 개를 만들며 복붙 결과와 운영 리듬을 익히는 단계</div>
            </article>
            <article className="compact-card history-card">
              <strong>Basic 고려</strong>
              <div className="small-note">한 달에 10개 안팎으로 꾸준히 올리고 저장 글 재활용이 시작됐을 때</div>
            </article>
            <article className="compact-card history-card">
              <strong>Premium 고려</strong>
              <div className="small-note">시리즈 주제, 반복 생성, 관리자 SEO 학습 흐름까지 같이 써야 할 때</div>
            </article>
          </div>
          <div className="inline-actions">
            <Link href="/settings" className="btn btn-primary">
              지금 플랜 적용 보기
            </Link>
            <Link href="/history" className="btn btn-secondary">
              저장 글 기준으로 판단
            </Link>
          </div>
        </section>
      </section>

      <section className="row">
        {PRICING_CARDS.map((card) => {
          const isCurrent = card.plan === plan;

          return (
            <article key={card.plan} className="card section-stack" style={{ minWidth: "250px", borderColor: isCurrent ? "rgba(29, 78, 216, 0.36)" : undefined }}>
              <div className="section-stack">
                <div className="chips">
                  <span className="pill">{PLAN_DISPLAY[card.plan].name}</span>
                  {isCurrent && <span className="pill">현재 사용 중</span>}
                </div>
                <h2 style={{ fontSize: "1.16rem" }}>{card.price}</h2>
                <p className="help">{PLAN_DISPLAY[card.plan].summary}</p>
              </div>

              <ul className="list-clean">
                {card.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="inline-actions">
                <Link href="/billing" className="btn btn-primary">
                  {card.plan === plan ? "결제 준비 상태 보기" : "이 플랜 보기"}
                </Link>
                <Link href="/settings" className="btn btn-secondary">
                  데모 플랜 전환
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="card section-stack tone-surface">
        <span className="eyebrow">Selection Guide</span>
        <h2 className="section-title">어떤 플랜을 고르면 되나요?</h2>
        <div className="step-grid">
          <div className="step-card">
            <div className="step-kicker">Free</div>
            <div className="step-title">처음 시작할 때</div>
            <div className="step-body">하루 3회 안에서 글 구조와 복붙 결과를 먼저 익히는 단계에 맞습니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">Basic</div>
            <div className="step-title">주기적으로 올릴 때</div>
            <div className="step-body">월 15회 안에서 꾸준히 블로그를 운영하려는 가게에 맞습니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">Premium</div>
            <div className="step-title">여러 주제를 묶어 운영할 때</div>
            <div className="step-body">시리즈 주제와 무제한 생성이 필요할 때 선택하면 됩니다.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
