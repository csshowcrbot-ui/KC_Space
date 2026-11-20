import { dataService } from "@/db";
import { AiToolsClient } from "./AiToolsClient";

export const metadata = {
  title: "AI 工具收集 · AI Tools",
  description: "精選實用的 AI 工具庫，涵蓋對話寫作、程式開發、搜尋研究、設計與效率自動化。",
};

export const revalidate = 60;

export default async function AiToolsPage() {
  const tools = await dataService.getAiTools();

  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          AI 工具收集 · AI Tools
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          長期實戰篩選並整理的高效 AI 工具清單，涵蓋日常對話推理、程式輔助開發、知識研究與自動化工作流，協助提升數位創作與工程生產力。
        </p>
      </div>

      <AiToolsClient tools={tools} />
    </div>
  );
}
