"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/dashboard", label: "만들기" },
  { href: "/history", label: "히스토리" },
  { href: "/onboarding", label: "가게 정보" },
  { href: "/pricing", label: "요금제" },
  { href: "/settings", label: "설정" },
  { href: "/admin", label: "관리자" }
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav(): React.ReactNode {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="메인 탐색">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={`nav-link ${isActive(pathname, item.href) ? "is-active" : ""}`.trim()}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
