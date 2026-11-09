import Link from "next/link";
import { BookOpen, ArrowUpRight, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ArticleItem } from "@/db/schema";

interface RecentWritingsProps {
  articles: ArticleItem[];
}

export function RecentWritings({ articles }: RecentWritingsProps) {
  const recent = articles.slice(0, 3);

  return (
    <section className="py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            最新深度文章 (Recent Writings)
          </h2>
        </div>
        <Link
          href="/writings"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <span>查看全部文章</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
        {recent.map((article) => (
          <Link
            key={article.slug}
            href={`/writings/${article.slug}`}
            className="group block p-5 sm:p-6 hover:bg-muted/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 mb-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                <span>·</span>
                <span>{article.readingTime}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between mt-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-badge-bg text-badge-text">
                  {article.category}
                </span>
                {article.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-[11px] text-muted-foreground">
                    #{t}
                  </span>
                ))}
              </div>
              <span className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                閱讀全文 <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

