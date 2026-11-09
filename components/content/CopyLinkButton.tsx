"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-surface text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent transition-colors shadow-sm"
      title="複製本頁分享連結"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-500">已複製連結</span>
        </>
      ) : (
        <>
          <Link2 className="w-3.5 h-3.5" />
          <span>複製連結</span>
        </>
      )}
    </button>
  );
}

