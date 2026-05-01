"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

export interface HeaderNavItem {
  label: string;
  href: string;
  match?: string;
}

interface HeaderProps {
  items: HeaderNavItem[];
}

export function Header({ items }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href={items[0]?.href ?? "/"} className="brand-link" aria-label="API documentation home">
          <span className="brand-icon">
            <BookOpen size={17} strokeWidth={2.2} />
          </span>
          <span className="brand-text">API Docs</span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          {items.map((item) => {
            const isActive = item.match
              ? pathname.startsWith(item.match)
              : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "top-nav-link top-nav-link-active" : "top-nav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
