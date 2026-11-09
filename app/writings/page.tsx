import { dataService } from "@/db";
import { WritingsClient } from "./WritingsClient";

export const metadata = {
  title: "深度文章 · Writings",
  description: "探索軟體架構重構、工程效能優化與個人思考體系建設。",
};

export const revalidate = 60;

export default async function WritingsPage() {
  // 從資料庫讀取所有文章
  const articles = await dataService.getArticles();

  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          深度文章 · Writings
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          記錄關於大規模架構演進、全端開發實踐與數位花園哲學的長篇思考。全站內容全面由資料庫驅動，強調知識沉澱與持續複利。
        </p>
      </div>

      <WritingsClient articles={articles} />
    </div>
  );
}
