"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "感謝訂閱！每當有深度思考文章發布時，將第一時間寄送給您。");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "訂閱發生錯誤，請稍後再試。");
      }
    } catch {
      setStatus("error");
      setMessage("網絡連線異常，請稍後再試。");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-badge-bg text-badge-text text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>思考速報 · Newsletter</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2">
          訂閱我的數位花園與深度思考
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          不定期分享軟體架構重構、產品體驗打磨、以及個人知識管理體系的實踐心得。承諾無垃圾信件，可隨時取消訂閱。
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="輸入您的電子郵件地址..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>即刻訂閱</span>
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-xs text-rose-500 mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}

