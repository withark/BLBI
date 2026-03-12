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
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
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
    setStatus({ type: "info", message: "가게 정보를 저장하고 있습니다..." });

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
        setStatus({ type: "error", message: json.message || "저장에 실패했습니다." });
        return;
      }

      setStatus({ type: "success", message: "가게 정보를 저장했습니다. 바로 생성 화면으로 이동합니다." });
      router.push("/dashboard?welcome=profile-saved");
    } catch {
      setStatus({ type: "error", message: "저장 중 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="card hero-card accent-card">
        <div className="chips" aria-label="입력 안내">
          <span className="pill">처음 1회만 입력</span>
          <span className="pill">모르면 비워도 됨</span>
          <span className="pill">저장 후 바로 생성</span>
        </div>

        <div className="section-stack">
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
            가게 정보를 한 번만 정리해 두면 글 품질이 더 좋아집니다
          </h1>
          <p className="help">없는 정보를 만들지 말고 실제 정보만 적어 주세요. 필수 항목은 상호명과 지역입니다.</p>
        </div>

        <div className="step-grid">
          <div className="step-card">
            <div className="step-kicker">필수</div>
            <div className="step-title">상호명과 지역</div>
            <div className="step-body">키워드 글에 가게 정보가 자연스럽게 들어가도록 가장 먼저 쓰는 정보입니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">추천</div>
            <div className="step-title">대표 메뉴와 소개</div>
            <div className="step-body">메뉴명과 가게 설명이 있으면 본문과 사진 가이드가 훨씬 구체적으로 나옵니다.</div>
          </div>
          <div className="step-card">
            <div className="step-kicker">다음 단계</div>
            <div className="step-title">저장 후 바로 생성</div>
            <div className="step-body">저장하면 대시보드로 돌아가서 곧바로 키워드 하나로 글을 만들 수 있습니다.</div>
          </div>
        </div>
      </section>

      <form onSubmit={(event) => void handleSubmit(event)} className="section-stack">
        <section className="card section-stack">
          <div className="section-stack">
            <h2 className="section-title">꼭 필요한 정보</h2>
            <p className="help">이 두 항목만 있어도 글 방향이 더 선명해집니다.</p>
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-name">
              상호명 *
            </label>
            <input
              id="business-name"
              className="input"
              placeholder="예: 블비 칼국수"
              value={form.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
              required
            />
            <p className="field-help">손님이 실제로 보는 간판 이름 그대로 적어 주세요.</p>
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-region">
              지역 *
            </label>
            <input
              id="business-region"
              className="input"
              placeholder="예: 노원구 상계동"
              value={form.region}
              onChange={(event) => updateField("region", event.target.value)}
              required
            />
            <p className="field-help">동네명까지 적으면 지역 키워드 글에 더 잘 반영됩니다.</p>
          </div>
        </section>

        <section className="card section-stack">
          <div className="section-stack">
            <h2 className="section-title">있으면 더 좋아지는 정보</h2>
            <p className="help">모르는 항목은 비워도 됩니다. 있는 정보만 넣으세요.</p>
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-address">
              주소
            </label>
            <input
              id="business-address"
              className="input"
              placeholder="예: 서울 노원구 ..."
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
            />
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-hours">
              영업시간
            </label>
            <input
              id="business-hours"
              className="input"
              placeholder="예: 매일 11:00 - 21:00"
              value={form.openingHours}
              onChange={(event) => updateField("openingHours", event.target.value)}
            />
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-menus">
              대표 메뉴
            </label>
            <input
              id="business-menus"
              className="input"
              placeholder="예: 들깨칼국수, 만두전골, 김치만두"
              value={menuText}
              onChange={(event) => setMenuText(event.target.value)}
            />
            <p className="field-help">쉼표로 구분해 입력하면 메뉴 키워드에 더 잘 반영됩니다.</p>
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-description">
              가게 설명
            </label>
            <textarea
              id="business-description"
              className="textarea"
              placeholder="예: 점심 손님이 많은 동네 칼국수집, 직접 빚은 만두가 강점"
              value={form.storeDescription}
              onChange={(event) => updateField("storeDescription", event.target.value)}
            />
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-facilities">
              편의시설
            </label>
            <textarea
              id="business-facilities"
              className="textarea"
              placeholder="예: 주차 가능, 예약 가능, 단체석 있음"
              value={form.facilities}
              onChange={(event) => updateField("facilities", event.target.value)}
            />
          </div>

          <div className="field-stack">
            <label className="field-label" htmlFor="business-tone">
              원하는 문체 가이드
            </label>
            <textarea
              id="business-tone"
              className="textarea"
              placeholder="예: 친근하고 동네 단골이 추천하는 느낌으로"
              value={form.toneGuide}
              onChange={(event) => updateField("toneGuide", event.target.value)}
            />
          </div>
        </section>

        <div className="surface-muted section-stack">
          <strong>입력 팁</strong>
          <p className="small-note">모든 항목을 채울 필요는 없습니다. 필수만 넣고 저장한 뒤, 부족한 정보는 나중에 다시 수정해도 됩니다.</p>
        </div>

        {status && <div className={`status ${status.type === "error" ? "error" : status.type === "success" ? "success" : ""}`}>{status.message}</div>}

        <div className="inline-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "저장 중..." : "저장하고 생성하러 가기"}
          </button>
          <Link href="/dashboard" className="btn btn-secondary">
            나중에 하고 대시보드 보기
          </Link>
        </div>
      </form>
    </div>
  );
}
