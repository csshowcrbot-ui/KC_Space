import Link from "next/link";
import { ArrowRight, Sparkles, Compass } from "lucide-react";

export function HeroSection() {
  return (
    <section className="pt-8 pb-12 sm:pt-14 sm:pb-16">
      <div className="space-y-6">
        {/* 身分徽章 */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-medium text-muted-foreground shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>全端架構師 · 產品設計師 · 獨立創作者</span>
        </div>

        {/* 標題與引言 */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2] max-w-2xl">
          打造有溫度的數位產品，在混亂與秩序間持續思考。
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          哈囉，我是 KC。這裡是我的個人數位花園（Digital Garden），我在此記錄架構重構的實踐、產品工程的權衡，以及隨手捕捉的微小靈感。
        </p>

        {/* 行動按鈕列 */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent-hover active:scale-[0.98] transition-all shadow-sm group"
          >
            <span>瀏覽專案成果</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/writings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface text-foreground font-medium text-sm hover:bg-muted active:scale-[0.98] transition-all"
          >
            <Compass className="w-4 h-4 text-muted-foreground" />
            <span>閱讀深度文章</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

