"use client";

import { useState, useMemo } from "react";
import { Search, ExternalLink, Sparkles, Star, Tag } from "lucide-react";
import type { AiToolItem } from "@/db/schema";

interface AiToolsClientProps {
  tools: AiToolItem[];
}

export function AiToolsClient({ tools }: AiToolsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach((t) => set.add(t.category));
    return ["全部", ...Array.from(set)];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchCategory =
        selectedCategory === "全部" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 搜尋與分類篩選列 */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋 AI 工具名稱、用途或標籤..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

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
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 工具卡片網格 */}
      {filteredTools.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-surface/50 text-muted-foreground text-sm">
          沒有找到符合「{searchQuery}」的 AI 工具，歡迎嘗試其他關鍵字或分類。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 rounded-2xl border border-border bg-surface hover:border-accent/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-badge-bg text-badge-text">
                      {tool.category}
                    </span>
                    {tool.isFeatured && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        title="精選推薦"
                      >
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>精選</span>
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </div>

                <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                  {tool.name}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {tool.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {tool.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground flex-shrink-0">
                  {tool.pricing}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
