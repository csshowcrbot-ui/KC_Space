"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClapButtonProps {
  slug: string;
  initialClaps?: number;
}

export function ClapButton({ slug, initialClaps = 0 }: ClapButtonProps) {
  const [claps, setClaps] = useState(initialClaps);
  const [userClaps, setUserClaps] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // 獲取伺服器最新數據
    fetch(`/api/engagements/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.claps !== undefined) setClaps(data.claps);
      })
      .catch(() => {});
  }, [slug]);

  const handleClap = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (userClaps >= 20) return; // 單次瀏覽上限

    setAnimating(true);
    setUserClaps((prev) => prev + 1);
    setClaps((prev) => prev + 1);

    // 觸發彩帶爆發效果
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 22,
      spread: 60,
      origin: { x, y },
      colors: ["#2B59C3", "#4D7DF2", "#52B788", "#F59E0B"],
      ticks: 120,
      gravity: 1.2,
      scalar: 0.8,
    });

    setTimeout(() => setAnimating(false), 300);

    try {
      await fetch(`/api/engagements/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clap", count: 1 }),
      });
    } catch (err) {
      console.error("更新拍手失敗:", err);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <button
        onClick={handleClap}
        disabled={userClaps >= 20}
        aria-label="為本文拍手喝采"
        className={cn(
          "relative group flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-border bg-surface hover:border-accent text-foreground transition-all duration-200 shadow-sm",
          animating && "scale-110",
          userClaps > 0 && "border-accent/40 bg-accent/5"
        )}
      >
        <span className="relative flex items-center justify-center">
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              userClaps > 0 ? "fill-rose-500 text-rose-500" : "text-muted-foreground group-hover:text-rose-500",
              animating && "animate-ping"
            )}
          />
          {userClaps > 0 && (
            <span className="absolute -top-6 -right-2 text-[10px] font-bold text-accent animate-bounce">
              +{userClaps}
            </span>
          )}
        </span>
        <span className="text-sm font-semibold">{claps} 次拍手</span>
      </button>
      <span className="text-[11px] text-muted-foreground">
        {userClaps >= 20 ? "已達本日拍手上限，非常感謝您的鼓勵！" : "喜歡這篇文章？點擊按鈕給予支持"}
      </span>
    </div>
  );
}

