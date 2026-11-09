import { dataService } from "@/db";
import { ProjectsClient } from "./ProjectsClient";

export const metadata = {
  title: "專案成果 · Projects & Case Studies",
  description: "精選代表性軟體架構重構、產品落地成果與高併發系統設計案例。",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  // 從資料庫中讀取專案資料
  const projects = await dataService.getProjects();

  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          專案成果 · Case Studies
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          收錄實際交付之大型專案、架構遷移經驗與個人開源成果。所有內容皆由資料庫存取，重視可量化的業務指標 (Impact Metrics)、系統韌性與現代工程標準。
        </p>
      </div>

      <ProjectsClient projects={projects} />
    </div>
  );
}
