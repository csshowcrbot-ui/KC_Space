"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, ArrowUpRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "首頁" },
  { href: "/writings", label: "深度文章" },
  { href: "/projects", label: "專案成果" },
  { href: "/about", label: "關於我" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / 品牌識別 */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform">
            KC
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-foreground group-hover:text-accent transition-colors">
              KC Space
            </span>
            <span className="text-[10px] text-muted-foreground leading-none">
              數位花園 · Digital Garden
            </span>
          </div>
        </Link>

        {/* 桌面端導航項目 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-surface text-accent shadow-sm border border-border/80 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 快速行動 (CTA) 與主題切換 */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/admin"
            className="w-9 h-9 rounded-full border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
            title="開啟後台管理系統"
            aria-label="管理後台"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <Link
            href="/about#contact"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground hover:bg-accent-hover transition-colors shadow-sm"
          >
            聯絡我
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 行動端漢堡選單切換 */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-border text-foreground hover:bg-muted"
            aria-label="開啟選單"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 行動端下拉選單 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 py-3 space-y-2 animate-fade-in shadow-lg">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-border bg-surface text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-accent" />
              管理後台系統
            </Link>
            <Link
              href="/about#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
            >
              聯絡我 / 預約談話
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

