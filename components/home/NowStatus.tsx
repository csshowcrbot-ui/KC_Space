import { Activity, Clock } from "lucide-react";

interface NowStatusProps {
  statusText?: string;
  updateSeason?: string;
}

export function NowStatus({
  statusText = "正在深耕 Next.js 14 邊緣渲染架構、探索 Local-first 知識系統與實踐數位花園經營",
  updateSeason = "2026 年春季更新",
}: NowStatusProps) {
  return (
    <div className="my-6 p-4 rounded-xl border border-border bg-surface/70 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <div className="text-sm">
          <span className="font-semibold text-foreground mr-2">/now 現況：</span>
          <span className="text-muted-foreground">{statusText}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground self-end sm:self-auto flex-shrink-0">
        <Clock className="w-3.5 h-3.5" />
        <span>{updateSeason}</span>
      </div>
    </div>
  );
}
