"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <form onSubmit={handleStart} className="card" style={{ display: "grid", gap: "0.8rem" }}>
      <h1 style={{ fontSize: "1.7rem", lineHeight: 1.35 }}>키워드 한 개로 사장님 블로그를 바로 만드세요</h1>
      <p className="help">
        예시: 강남역 점심 맛집, 홍대 브런치 카페, 분당 회식 장소
      </p>
      <textarea
        className="textarea hero-input"
        placeholder="키워드를 입력하세요"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <button type="submit" className="btn btn-primary">
        바로 만들어보기
      </button>
    </form>
  );
}
