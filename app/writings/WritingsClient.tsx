"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Tag, ArrowRight, Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ArticleItem } from "@/db/schema";

interface WritingsClientProps {
  articles: ArticleItem[];
}

export function WritingsClient({ articles }: WritingsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // 取得不重複的分類列表
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => set.add(a.category));
    return ["All", ...Array.from(set)];
  }, [articles]);

  // 過濾邏輯
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchCategory =
        selectedCategory === "All" || article.category === selectedCategory;
      const matchSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 搜尋與分類篩選列 */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋標題、內容或標籤..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        {/* 分類標籤切換 */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "All" ? "全部類別" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 文章卡片列表 */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-surface/50 text-muted-foreground">
          沒有找到符合「{searchQuery}」的文章，歡迎嘗試其他關鍵字。
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/writings/${article.slug}`}
              className="group block p-6 rounded-2xl border border-border bg-surface hover:border-accent/40 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                  {article.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readingTime}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-badge-bg text-badge-text">
                    {article.category}
                  </span>
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-semibold text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  閱讀內文 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

