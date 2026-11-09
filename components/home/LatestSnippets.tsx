"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquareQuote, ArrowUpRight, Heart } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { FeedItem } from "@/db/schema";

interface LatestSnippetsProps {
  initialFeeds: FeedItem[];
}

export function LatestSnippets({ initialFeeds }: LatestSnippetsProps) {
  const [feeds, setFeeds] = useState<FeedItem[]>(initialFeeds);
  const snippets = feeds.slice(0, 2);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <section className="py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            微發言牆精選 (Latest Snippets)
          </h2>
        </div>
        <Link
          href="/feed"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <span>查看碎念牆</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {snippets.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between space-y-3 hover:border-accent/40 transition-colors shadow-xs"
          >
            <p className="text-sm text-foreground/90 leading-relaxed italic">
              “{item.content}”
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleLike(item.id, e)}
                  className="flex items-center gap-1 text-rose-500 font-medium hover:bg-rose-500/10 px-2 py-0.5 rounded-md transition-colors"
                  title="點擊點讚"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{item.likeCount} 讚</span>
                </button>
                <span>·</span>
                <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
              </div>
              <div className="flex gap-1.5">
                {item.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[11px] text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
