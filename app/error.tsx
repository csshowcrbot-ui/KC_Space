"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("頁面運行錯誤:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          糟糕，頁面遇到非預期中斷
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          系統在渲染此頁面時遭遇問題，您可以嘗試重新載入或返回首頁。
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>重新載入頁面</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-foreground text-xs font-semibold hover:bg-muted transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>返回首頁</span>
        </Link>
      </div>
    </div>
  );
}

