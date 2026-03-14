"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_KEYWORDS = ["성수 파스타 맛집", "망원동 브런치 카페", "노원 회식 장소"];

export function KeywordQuickStart(): React.ReactNode {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  function handleStart(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const value = keyword.trim();

    if (!value) {
      return;
    }

    router.push(`/dashboard?keyword=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleStart} className="card hero-card hero-shell hero-launchpad">
      <div className="section-stack">
        <div className="chips" aria-label="빠른 안내">
          <span className="pill">키워드 1개 입력</span>
          <span className="pill">가게 정보 반영</span>
          <span className="pill">네이버 복붙용 결과</span>
        </div>

        <div className="section-stack hero-copy">
          <span className="eyebrow">Keyword First Workflow</span>
          <h1 className="hero-title">사장님이 키워드 하나만 넣으면 바로 블로그 초안을 만듭니다</h1>
          <p className="help">복잡한 채팅 없이 입력창 하나와 생성 버튼 하나로 시작합니다. 추천과 설정은 뒤로 숨기고, 핵심 행동만 앞으로 뒀습니다.</p>
          <p className="small-note launchpad-note">입력은 짧게, 결과는 길고 구체적으로. 이 도구는 메뉴 하나를 오늘 올릴 블로그 글로 바꾸는 데 집중합니다.</p>
        </div>

        <div className="command-deck">
          <div className="field-stack">
            <label className="field-label" htmlFor="home-keyword">
              오늘 만들고 싶은 키워드
            </label>
            <textarea
              id="home-keyword"
              className="textarea hero-input"
              placeholder="예: 성수 파스타 맛집"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <p className="small-note">길게 설명할 필요 없습니다. 검색될 표현 한 줄이면 충분합니다.</p>
          </div>

          <div className="chips" aria-label="예시 키워드">
            {EXAMPLE_KEYWORDS.map((example) => (
              <button key={example} type="button" className="chip" onClick={() => setKeyword(example)}>
                {example}
              </button>
            ))}
          </div>

          <div className="inline-actions">
            <button type="submit" className="btn btn-primary">
              바로 생성 시작
            </button>
            <Link className="btn btn-secondary" href="/onboarding">
              가게 정보 먼저 입력
            </Link>
          </div>
        </div>

        <div className="launchpad-strip">
          <article className="launchpad-stat">
            <span className="eyebrow">Input</span>
            <strong>키워드 한 줄</strong>
            <div className="meta-line">메뉴, 지역, 상황 조합 하나면 시작됩니다.</div>
          </article>
          <article className="launchpad-stat">
            <span className="eyebrow">Context</span>
            <strong>가게 정보 자동 반영</strong>
            <div className="meta-line">한 번 넣은 상호, 지역, 메뉴 흐름을 계속 씁니다.</div>
          </article>
          <article className="launchpad-stat">
            <span className="eyebrow">Output</span>
            <strong>바로 복붙 가능한 결과</strong>
            <div className="meta-line">사진 가이드까지 포함한 순수 텍스트로 정리됩니다.</div>
          </article>
        </div>
      </div>

      <aside className="hero-side launchpad-side">
        <section className="showcase-card showcase-card-large">
          <div className="section-stack">
            <span className="eyebrow">Output Preview</span>
            <h2 className="section-title">완성물은 이렇게 보입니다</h2>
            <p className="help">네이버 블로그에 바로 붙여넣기 쉬운 순수 텍스트 구조를 기본으로 잡았습니다.</p>
          </div>

          <div className="pre showcase-pre">
            성수 파스타 맛집, 블비 키친 방문 전 꼭 보면 좋은 가이드
            {"\n\n"}1. 성수 파스타 맛집으로 찾는 손님에게 먼저 보여줄 정보
            {"\n"}블비 키친은 점심 손님이 많은 시간대에도 메뉴 선택이 쉬운 구성이 강점입니다.
            {"\n\n"}사진 가이드 : 대표 파스타 단면과 재료가 보이게 가까이 촬영해 주세요.
          </div>

          <div className="launchpad-proof-grid">
            <article className="launchpad-proof-card">
              <span className="eyebrow">Speed</span>
              <strong>입력 부담 최소화</strong>
              <div className="meta-line">설명 대신 검색어 한 줄로 바로 초안으로 넘어갑니다.</div>
            </article>
            <article className="launchpad-proof-card">
              <span className="eyebrow">Use</span>
              <strong>사진 순서까지 정리</strong>
              <div className="meta-line">무엇을 찍어야 할지 바로 보이도록 결과 안에 같이 넣습니다.</div>
            </article>
          </div>
        </section>

        <section className="metric-card-grid">
          <article className="compact-card tone-card tone-card-ember">
            <span className="eyebrow">Easy</span>
            <strong>키워드 한 줄</strong>
            <div className="meta-line">입력은 짧게, 결과는 길고 구체적으로.</div>
          </article>
          <article className="compact-card tone-card tone-card-forest">
            <span className="eyebrow">Useful</span>
            <strong>사진 가이드 포함</strong>
            <div className="meta-line">무엇을 찍어야 할지 바로 정리됩니다.</div>
          </article>
        </section>
      </aside>
    </form>
  );
}
