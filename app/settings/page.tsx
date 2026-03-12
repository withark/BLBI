"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = "FREE" | "BASIC" | "PREMIUM";

export default function SettingsPage(): React.ReactNode {
  const [plan, setPlan] = useState<Plan>("FREE");
  const [usage, setUsage] = useState<{ used: number; limit: number | null; remaining: number | null } | null>(null);
  const [status, setStatus] = useState("");
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
          usage: { used: number; limit: number | null; remaining: number | null };
        };
        setUsage(usageJson.usage);
      }
    }

    loadSettings().catch(() => setStatus("설정 정보를 불러오지 못했습니다."));
  }, []);

  async function savePlan(): Promise<void> {
    setSaving(true);
    setStatus("플랜 저장 중...");

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });

      const json = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus(json.message || "플랜 저장에 실패했습니다.");
        return;
      }

      const usageRes = await fetch("/api/usage", { cache: "no-store" });

      if (usageRes.ok) {
        const usageJson = (await usageRes.json()) as {
          usage: { used: number; limit: number | null; remaining: number | null };
        };
        setUsage(usageJson.usage);
      }

      setStatus("플랜이 저장되었습니다.");
    } catch {
      setStatus("플랜 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h1 style={{ fontSize: "1.4rem" }}>설정</h1>
        <p className="help">데모 환경에서는 플랜을 직접 변경해 기능을 확인할 수 있습니다.</p>

        <select className="select" value={plan} onChange={(event) => setPlan(event.target.value as Plan)}>
          <option value="FREE">Free</option>
          <option value="BASIC">Basic</option>
          <option value="PREMIUM">Premium</option>
        </select>

        <button className="btn btn-primary" onClick={() => void savePlan()} disabled={saving} type="button">
          {saving ? "저장 중..." : "플랜 저장"}
        </button>

        {usage && (
          <div className="status">
            사용량: {usage.used} / {usage.limit === null ? "무제한" : usage.limit} (남은 횟수: {usage.remaining ?? "-"})
          </div>
        )}
      </section>

      {status && <div className="status">{status}</div>}

      <section className="row">
        <Link href="/onboarding" className="btn btn-secondary">
          가게 정보 수정
        </Link>
        <Link href="/dashboard" className="btn btn-secondary">
          대시보드
        </Link>
      </section>
    </div>
  );
}
