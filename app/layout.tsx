import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "블비 | 지역 음식점 블로그 자동 운영 AI",
  description: "키워드 한 개로 네이버 블로그에 붙여넣기 좋은 원고를 생성하는 서비스"
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div className="container topbar-inner">
              <Link href="/" className="brand">
                <span className="brand-mark">BLBI</span>
                <span className="brand-copy">
                  <strong>블비</strong>
                  <span>지역 사장님용 블로그 운영 스튜디오</span>
                </span>
              </Link>
              <MainNav />
            </div>
          </header>
          <main>
            <div className="container">{children}</div>
          </main>
          <footer className="footer">
            <div className="container footer-inner">
              <div className="footer-grid">
                <section className="footer-panel section-stack">
                  <span className="eyebrow">BLBI</span>
                  <strong>지역 사장님용 블로그 운영 스튜디오</strong>
                  <span>키워드 한 개 입력으로 시작하고, 결과는 바로 복붙 가능하게 정리하는 운영 도구입니다.</span>
                </section>

                <section className="footer-panel section-stack">
                  <span className="eyebrow">Quick Routes</span>
                  <div className="footer-links">
                    <Link href="/dashboard">만들기</Link>
                    <Link href="/history">히스토리</Link>
                    <Link href="/onboarding">가게 정보</Link>
                    <Link href="/features">기능</Link>
                    <Link href="/guide">가이드</Link>
                    <Link href="/support">지원</Link>
                  </div>
                </section>

                <section className="footer-panel section-stack">
                  <span className="eyebrow">Best Next</span>
                  <div className="footer-links">
                    <Link href="/dashboard">키워드로 바로 생성</Link>
                    <Link href="/pricing">플랜 판단</Link>
                    <Link href="/admin">관리자 허브</Link>
                  </div>
                  <div className="footer-note">겉은 단순하게, 결과는 바로 복붙 가능하게.</div>
                </section>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
