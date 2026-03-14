"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const ONBOARDING_DRAFT_KEY = "blbi:onboarding-draft:v1";

function buildKeywordPreview(region: string, menu: string, businessName: string): string {
  return [region, menu || businessName, "맛집"].map((value) => value.trim()).filter(Boolean).join(" ");
}

export default function OnboardingPage(): React.ReactNode {
  const router = useRouter();
  const [form, setForm] = useState<Profile>(EMPTY_FORM);
  const [menuText, setMenuText] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [didHydrateDraft, setDidHydrateDraft] = useState(false);

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      const response = await fetch("/api/business-profile", { cache: "no-store" });

      if (!response.ok) {
        setDidHydrateDraft(true);
        return;
      }

      const json = (await response.json()) as { profile: Profile | null };

      if (!json.profile) {
        if (typeof window !== "undefined") {
          try {
            const rawDraft = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);

            if (rawDraft) {
              const draft = JSON.parse(rawDraft) as Profile;
              setForm(draft);
              setMenuText((draft.representativeMenus ?? []).join(", "));
            }
          } catch {
            window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
          }
        }

        setDidHydrateDraft(true);
        return;
      }

      setForm(json.profile);
      setMenuText(json.profile.representativeMenus.join(", "));
      setDidHydrateDraft(true);
    }

    loadProfile().catch(() => undefined);
  }, []);

  function updateField<Key extends keyof Profile>(key: Key, value: Profile[Key]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const representativeMenus = useMemo(
    () =>
      menuText
        .split(",")
        .map((menu) => menu.trim())
        .filter(Boolean),
    [menuText]
  );

  const profileChecklist = useMemo(
    () => [
      { label: "상호명", ready: Boolean(form.businessName.trim()), note: form.businessName || "간판 이름을 넣어 주세요." },
      { label: "지역", ready: Boolean(form.region.trim()), note: form.region || "동네명까지 넣어 주세요." },
      {
        label: "대표 메뉴",
        ready: representativeMenus.length > 0,
        note: representativeMenus.length > 0 ? representativeMenus.slice(0, 2).join(", ") : "메뉴가 있으면 본문이 더 구체적입니다."
      },
      {
        label: "가게 설명",
        ready: Boolean(form.storeDescription.trim()),
        note: form.storeDescription || "손님이 왜 오는지 한 줄 설명이 있으면 좋습니다."
      },
      {
        label: "운영 정보",
        ready: Boolean(form.openingHours.trim() || form.facilities.trim()),
        note: form.openingHours || form.facilities || "영업시간이나 편의시설 중 하나만 있어도 충분합니다."
      }
    ],
    [form, representativeMenus]
  );

  const readyCount = profileChecklist.filter((item) => item.ready).length;
  const completionRatio = profileChecklist.length === 0 ? 0 : readyCount / profileChecklist.length;
  const readinessLabel = completionRatio >= 0.8 ? "거의 준비됨" : completionRatio >= 0.5 ? "기본 준비됨" : "필수 정보부터 입력";
  const keywordPreview = buildKeywordPreview(form.region, representativeMenus[0] || "", form.businessName);
  const photoGuidePreview = [
    representativeMenus[0] ? `${representativeMenus[0]}가 가장 맛있어 보이게 담긴 한 장` : "대표 메뉴를 먼저 찍은 한 장",
    form.address ? "가게 외관과 간판이 함께 보이는 컷" : "가게 입구와 분위기가 보이는 컷",
    form.facilities ? `${form.facilities.split(",")[0]?.trim() || "매장 편의 정보"}를 보여 주는 컷` : "좌석이나 내부 분위기를 보여 주는 컷"
  ];

  useEffect(() => {
    if (!didHydrateDraft || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      ONBOARDING_DRAFT_KEY,
      JSON.stringify({
        ...form,
        representativeMenus
      })
    );
  }, [didHydrateDraft, form, representativeMenus]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: "info", message: "가게 정보를 저장하고 있습니다..." });

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
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
      }
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
        <section className="two-column onboarding-layout">
          <div className="page-stack">
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
          </div>

          <aside className="support-column">
            <section className="card section-stack tone-surface">
              <div className="section-stack">
                <span className="eyebrow">Readiness</span>
                <h2 className="section-title">현재 준비도</h2>
                <p className="help">입력이 얼마나 쌓였는지 바로 확인하고, 부족한 항목만 채우면 됩니다.</p>
              </div>

              <div className="quality-meter">
                <div className="quality-meter-head">
                  <strong>{readinessLabel}</strong>
                  <span className="small-note">{readyCount} / {profileChecklist.length} 항목</span>
                </div>
                <div className="quality-track" aria-hidden="true">
                  <div className="quality-fill" style={{ width: `${Math.max(completionRatio * 100, 8)}%` }} />
                </div>
              </div>

              <div className="check-list">
                {profileChecklist.map((item) => (
                  <div key={item.label} className="check-item">
                    <span className={`check-badge ${item.ready ? "is-ready" : "is-pending"}`}>{item.ready ? "완료" : "보강"}</span>
                    <div className="section-stack" style={{ gap: "0.25rem" }}>
                      <strong>{item.label}</strong>
                      <span className="small-note">{item.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card section-stack tone-surface">
              <div className="section-stack">
                <span className="eyebrow">Preview</span>
                <h2 className="section-title">저장 후 바로 보일 느낌</h2>
              </div>

              <div className="compact-card">
                <strong>추천 키워드 예시</strong>
                <div>{keywordPreview || "지역과 대표 메뉴를 넣으면 여기서 미리 보입니다."}</div>
                <div className="meta-line">상호명, 지역, 대표 메뉴가 조합되면 키워드 추천과 생성 방향이 더 선명해집니다.</div>
              </div>

              <div className="compact-card">
                <strong>사진 가이드 예시</strong>
                <ul className="preview-list">
                  {photoGuidePreview.map((item) => (
                    <li key={item} className="preview-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-muted section-stack">
                <strong>임시 저장 안내</strong>
                <p className="small-note">입력 중인 가게 정보는 이 브라우저에 임시 저장됩니다. 중간에 나가도 다시 켜면 이어서 정리할 수 있습니다.</p>
              </div>
            </section>
          </aside>
        </section>
      </form>
    </div>
  );
}
