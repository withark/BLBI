"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_ITEMS = [
  { href: "/admin", label: "개요" },
  { href: "/admin/users", label: "사용자" },
  { href: "/admin/subscription", label: "구독" },
  { href: "/admin/posts", label: "글" },
  { href: "/admin/usage", label: "사용량" },
  { href: "/admin/seo-references", label: "SEO 참고" },
  { href: "/admin/seo-learning", label: "SEO 학습" },
  { href: "/admin/ranking-watch", label: "랭킹 감시" },
  { href: "/admin/jobs", label: "작업 로그" }
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav(): React.ReactNode {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="관리자 메뉴">
      {ADMIN_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className={`admin-nav-link ${isActive(pathname, item.href) ? "is-active" : ""}`.trim()}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
