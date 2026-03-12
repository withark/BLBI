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

export default function SettingsPage(): React.ReactNode {
  const [plan, setPlan] = useState<Plan>("FREE");
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings(): Promise<void> {
      const [planRes, usageRes] = await Promise.all([
        fetch("/api/plan", { cache: "no-store" }),
        fetch("/api/usage", { cache: "no-store" })
      ]);

      if (planRes.ok) {
        const planJson = (await planRes.json()) as { plan: Plan };
        setPlan(planJson.plan);
      }

      if (usageRes.ok) {
        const usageJson = (await usageRes.json()) as {
          usage: UsageState;
        };
        setUsage(usageJson.usage);
      }
    }

    loadSettings().catch(() => setStatus({ type: "error", message: "설정 정보를 불러오지 못했습니다." }));
  }, []);

  async function savePlan(): Promise<void> {
    setSaving(true);
    setStatus({ type: "info", message: "플랜을 저장하고 있습니다..." });

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });

      const json = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus({ type: "error", message: json.message || "플랜 저장에 실패했습니다." });
        return;
      }

      const usageRes = await fetch("/api/usage", { cache: "no-store" });

      if (usageRes.ok) {
        const usageJson = (await usageRes.json()) as {
          usage: UsageState;
        };
        setUsage(usageJson.usage);
      }

      setStatus({ type: "success", message: "플랜을 저장했습니다. 대시보드와 생성 제한이 즉시 반영됩니다." });
    } catch {
      setStatus({ type: "error", message: "플랜 저장 중 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="card hero-card">
        <div className="chips" aria-label="설정 안내">
          <span className="pill">데모 플랜 전환</span>
          <span className="pill">즉시 반영</span>
          <span className="pill">운영 화면 연결</span>
        </div>

        <div className="section-stack">
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
            지금은 여기서 플랜 상태를 바꾸고 기능 범위를 바로 확인할 수 있습니다
          </h1>
          <p className="help">결제 연동 전까지는 데모 환경에서 플랜을 직접 바꿔 보며 실제 제한과 기능 차이를 확인합니다.</p>
        </div>

        <div className="info-grid">
          <div className="compact-card">
            <strong>현재 플랜</strong>
            <div>{PLAN_DISPLAY[plan].name}</div>
            <div className="meta-line">{PLAN_DISPLAY[plan].summary}</div>
          </div>
          <div className="compact-card">
            <strong>현재 사용량</strong>
            <div>{usage ? `${usage.used} / ${usage.limit === null ? "무제한" : usage.limit}` : "불러오는 중"}</div>
            <div className="meta-line">{usage ? `남은 횟수: ${usage.remaining ?? "-"}` : "사용량 정보를 확인하는 중입니다."}</div>
          </div>
        </div>
      </section>

      <section className="card section-stack">
        <div className="section-stack">
          <h2 className="section-title">데모 플랜 전환</h2>
          <p className="help">선택 후 저장하면 대시보드의 한도와 기능 안내가 바로 바뀝니다.</p>
        </div>

        <div className="history-list">
          {PRICING_CARDS.map((card) => {
            const selected = plan === card.plan;

            return (
              <button
                key={card.plan}
                type="button"
                className="compact-card"
                onClick={() => setPlan(card.plan)}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  borderColor: selected ? "rgba(29, 78, 216, 0.36)" : undefined,
                  background: selected ? "rgba(239, 246, 255, 0.72)" : undefined
                }}
              >
                <strong>{PLAN_DISPLAY[card.plan].name}</strong>
                <div>{card.price}</div>
                <div className="meta-line">{PLAN_DISPLAY[card.plan].summary}</div>
              </button>
            );
          })}
        </div>

        <div className="inline-actions">
          <button className="btn btn-primary" onClick={() => void savePlan()} disabled={saving} type="button">
            {saving ? "저장 중..." : "플랜 저장"}
          </button>
          <Link href="/pricing" className="btn btn-secondary">
            요금제 다시 보기
          </Link>
        </div>
      </section>

      {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}

      <section className="two-column">
        <section className="card section-stack">
          <h2 className="section-title">바로 이어서 할 일</h2>
          <div className="step-grid">
            <div className="step-card">
              <div className="step-kicker">1</div>
              <div className="step-title">가게 정보 점검</div>
              <div className="step-body">온보딩 정보가 실제 가게와 맞는지 확인합니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">2</div>
              <div className="step-title">대시보드 생성</div>
              <div className="step-body">현재 플랜 기준으로 생성 제한과 기능을 바로 확인합니다.</div>
            </div>
            <div className="step-card">
              <div className="step-kicker">3</div>
              <div className="step-title">결과 복사</div>
              <div className="step-body">복붙 결과와 히스토리 흐름까지 이어서 확인합니다.</div>
            </div>
          </div>
        </section>

        <section className="card section-stack">
          <h2 className="section-title">연결된 화면</h2>
          <div className="inline-actions">
            <Link href="/onboarding" className="btn btn-secondary">
              가게 정보 수정
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              대시보드
            </Link>
            <Link href="/billing" className="btn btn-secondary">
              결제 준비 상태
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
