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
                <div className="section-stack" style={{ gap: "0.3rem" }}>
                  <strong>블비</strong>
                  <span>키워드 한 개 입력으로 시작하는 지역 사장님용 블로그 자동 운영 도구</span>
                </div>
                <div className="section-stack" style={{ gap: "0.45rem", justifyItems: "end" }}>
                  <div className="footer-links">
                    <Link href="/features">기능</Link>
                    <Link href="/guide">가이드</Link>
                    <Link href="/support">지원</Link>
                  </div>
                  <div className="footer-note">겉은 단순하게, 결과는 바로 복붙 가능하게.</div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
