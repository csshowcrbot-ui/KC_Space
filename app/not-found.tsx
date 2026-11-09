import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-badge-bg border border-border flex items-center justify-center text-accent">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-bold uppercase tracking-wider text-accent">
          404 · 找不到此頁面
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          這片數位花園似乎尚未開墾
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          您所造訪的頁面可能已被移除、更名，或暫時處於思考醞釀狀態。
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>返回首頁</span>
        </Link>
        <Link
          href="/writings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface text-foreground text-xs font-semibold hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>瀏覽深度文章</span>
        </Link>
      </div>
    </div>
  );
}

