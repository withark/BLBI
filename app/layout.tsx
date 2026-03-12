import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "블비 | 지역 음식점 블로그 자동 운영 AI",
  description: "키워드 한 개로 네이버 블로그에 붙여넣기 좋은 원고를 생성하는 서비스"
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "만들기" },
  { href: "/history", label: "히스토리" },
  { href: "/onboarding", label: "가게 정보" },
  { href: "/pricing", label: "요금제" },
  { href: "/settings", label: "설정" },
  { href: "/admin", label: "관리자" }
];

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <div className="container topbar-inner">
              <Link href="/" className="brand">
                블비
              </Link>
              <nav className="nav" aria-label="메인 탐색">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main>
            <div className="container">{children}</div>
          </main>
          <footer className="footer">
            <div className="container footer-inner">
              키워드 한 개 입력으로 시작하는 지역 사장님용 블로그 자동 운영 도구
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
