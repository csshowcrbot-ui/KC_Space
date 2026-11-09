"use client";

import { useState } from "react";
import { Heart, Pin, Send, Sparkles, MessageSquare, Share2, Check } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { FeedItem } from "@/db/schema";

interface FeedClientProps {
  initialFeeds: FeedItem[];
}

export function FeedClient({ initialFeeds }: FeedClientProps) {
  const [feeds, setFeeds] = useState<FeedItem[]>(initialFeeds);
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("#思考碎片");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("全部");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 取得所有標籤
  const allTags = ["全部", ...Array.from(new Set(feeds.flatMap((f) => f.tags || [])))];

  // 發表新動態
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(" ")
        .map((t) => (t.startsWith("#") ? t : `#${t}`))
        .filter(Boolean);

      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tags }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setFeeds([data.data, ...feeds]);
        setContent("");
      }
    } catch (err) {
      console.error("發布失敗:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 點讚
  const handleLike = async (id: string) => {
    // 樂觀更新
    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, likeCount: f.likeCount + 1 } : f))
    );

    try {
      await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", feedId: id }),
      });
    } catch (err) {
      console.error("點讚失敗:", err);
    }
  };

  // 分享
  const handleShare = (feed: FeedItem) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/feed#${feed.id}`);
      setCopiedId(feed.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredFeeds =
    activeFilter === "全部"
      ? feeds
      : feeds.filter((f) => f.tags?.includes(activeFilter));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 快捷發布區塊 */}
      <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent">
          <Sparkles className="w-4 h-4" />
          <span>捕捉隨手靈感與短記 (Ctrl/Cmd + Enter 快速發送)</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                handleSubmit(e);
              }
            }}
            placeholder="今天又產生了什麼新思考？隨手記下來..."
            className="w-full p-3 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="標籤 (以空白分隔，如 #閱讀 #架構)"
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground max-w-xs focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "發布中..." : "發表靈感"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 標籤分類篩選 */}
      <div className="flex flex-wrap gap-1.5 items-center pb-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === tag
                ? "bg-accent text-accent-foreground font-semibold"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 動態卡片清單 */}
      <div className="space-y-4">
        {filteredFeeds.map((feed) => (
          <div
            id={feed.id}
            key={feed.id}
            className="p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:border-accent/30 transition-all shadow-xs space-y-3 relative group"
          >
            {feed.isPinned && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent px-2 py-0.5 rounded-md bg-badge-bg">
                <Pin className="w-3 h-3" />
                <span>置頂精華</span>
              </div>
            )}

            <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {feed.content}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <time dateTime={feed.createdAt}>{formatRelativeTime(feed.createdAt)}</time>
                {feed.tags && feed.tags.length > 0 && (
                  <div className="flex gap-1.5">
                    {feed.tags.map((t) => (
                      <span key={t} className="text-accent font-medium text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike(feed.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  title="為這則動態點讚"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span className="font-semibold">{feed.likeCount}</span>
                </button>
                <button
                  onClick={() => handleShare(feed)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="分享連結"
                >
                  {copiedId === feed.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

