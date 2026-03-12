"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface PostItem {
  id: string;
  title: string;
  keyword: string;
  exportText: string;
  createdAt: string;
  plan: "FREE" | "BASIC" | "PREMIUM";
}

export default function HistoryPage(): React.ReactNode {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    async function loadPosts(): Promise<void> {
      try {
        const response = await fetch("/api/posts", { cache: "no-store" });

        if (!response.ok) {
          setStatus("히스토리를 불러오지 못했습니다.");
          return;
        }

        const json = (await response.json()) as { posts: PostItem[] };
        setPosts(json.posts);
      } catch {
        setStatus("히스토리를 불러오지 못했습니다.");
      }
    }

    loadPosts().catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = keywordFilter.trim().toLowerCase();

    if (!q) {
      return posts;
    }

    return posts.filter((post) => post.keyword.toLowerCase().includes(q) || post.title.toLowerCase().includes(q));
  }, [posts, keywordFilter]);

  async function copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("복사했습니다.");
    } catch {
      setStatus("복사에 실패했습니다.");
    }
  }

  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.4rem" }}>히스토리</h1>
        <p className="help">작성한 글을 다시 열고 복사할 수 있습니다.</p>
        <input
          className="input"
          placeholder="키워드 또는 제목 검색"
          value={keywordFilter}
          onChange={(event) => setKeywordFilter(event.target.value)}
        />
      </section>

      {filtered.map((post) => (
        <article key={post.id} className="card" style={{ display: "grid", gap: "0.6rem" }}>
          <h2 style={{ fontSize: "1.08rem", lineHeight: 1.4 }}>{post.title}</h2>
          <p className="help">
            키워드: {post.keyword} · 플랜: {post.plan} · {new Date(post.createdAt).toLocaleString("ko-KR")}
          </p>
          <div className="row">
            <Link className="btn btn-secondary" href={`/result?postId=${post.id}`}>
              결과 보기
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => void copyText(post.exportText)}>
              소스 없이 복사
            </button>
          </div>
        </article>
      ))}

      {filtered.length === 0 && <div className="status">저장된 글이 없습니다.</div>}
      {status && <div className="status">{status}</div>}
    </div>
  );
}
