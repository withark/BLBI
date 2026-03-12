"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  businessName: string;
  region: string;
  address: string;
  openingHours: string;
  representativeMenus: string[];
  storeDescription: string;
  facilities: string;
  toneGuide: string;
}

const EMPTY_FORM: Profile = {
  businessName: "",
  region: "",
  address: "",
  openingHours: "",
  representativeMenus: [],
  storeDescription: "",
  facilities: "",
  toneGuide: ""
};

export default function OnboardingPage(): React.ReactNode {
  const router = useRouter();
  const [form, setForm] = useState<Profile>(EMPTY_FORM);
  const [menuText, setMenuText] = useState("");
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      const response = await fetch("/api/business-profile", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const json = (await response.json()) as { profile: Profile | null };

      if (!json.profile) {
        return;
      }

      setForm(json.profile);
      setMenuText(json.profile.representativeMenus.join(", "));
    }

    loadProfile().catch(() => undefined);
  }, []);

  function updateField<Key extends keyof Profile>(key: Key, value: Profile[Key]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setStatus("저장 중입니다...");

    const representativeMenus = menuText
      .split(",")
      .map((menu) => menu.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          representativeMenus
        })
      });

      const json = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setStatus(json.message || "저장에 실패했습니다.");
        return;
      }

      setStatus("가게 정보가 저장되었습니다. 대시보드로 이동합니다.");
      router.push("/dashboard");
    } catch {
      setStatus("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.7rem" }}>
        <h1 style={{ fontSize: "1.4rem" }}>가게 정보 등록</h1>
        <p className="help">없는 정보는 만들지 않고, 실제 정보만 입력해 주세요.</p>

        <form onSubmit={(event) => void handleSubmit(event)} style={{ display: "grid", gap: "0.65rem" }}>
          <input
            className="input"
            placeholder="상호명 *"
            value={form.businessName}
            onChange={(event) => updateField("businessName", event.target.value)}
            required
          />
          <input
            className="input"
            placeholder="지역 (예: 노원구) *"
            value={form.region}
            onChange={(event) => updateField("region", event.target.value)}
            required
          />
          <input
            className="input"
            placeholder="주소"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
          />
          <input
            className="input"
            placeholder="영업시간"
            value={form.openingHours}
            onChange={(event) => updateField("openingHours", event.target.value)}
          />
          <input
            className="input"
            placeholder="대표 메뉴 (쉼표로 구분)"
            value={menuText}
            onChange={(event) => setMenuText(event.target.value)}
          />
          <textarea
            className="textarea"
            placeholder="가게 설명"
            value={form.storeDescription}
            onChange={(event) => updateField("storeDescription", event.target.value)}
          />
          <textarea
            className="textarea"
            placeholder="편의시설 (예: 주차/예약/단체석)"
            value={form.facilities}
            onChange={(event) => updateField("facilities", event.target.value)}
          />
          <textarea
            className="textarea"
            placeholder="원하는 문체 가이드"
            value={form.toneGuide}
            onChange={(event) => updateField("toneGuide", event.target.value)}
          />

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "저장 중..." : "저장하고 계속하기"}
          </button>
        </form>
      </section>

      {status && <div className="status">{status}</div>}

      <Link href="/dashboard" className="btn btn-secondary">
        대시보드로 이동
      </Link>
    </div>
  );
}
