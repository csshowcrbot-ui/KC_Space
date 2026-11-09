import { dataService } from "@/db";
import { HeroSection } from "@/components/home/HeroSection";
import { NowStatus } from "@/components/home/NowStatus";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { RecentWritings } from "@/components/home/RecentWritings";
import { NewsletterBox } from "@/components/shared/NewsletterBox";

export const revalidate = 60; // 邊緣 ISR 快取

export default async function HomePage() {
  // 全面從資料庫中存取內容
  const articles = await dataService.getArticles();
  const projects = await dataService.getProjects();
  const profile = await dataService.getProfile();

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* 1. 首頁 Hero 區塊 */}
      <HeroSection />

      {/* 2. 現況速覽 (Now Status) */}
      <NowStatus statusText={profile.nowStatus} updateSeason={profile.nowUpdateSeason} />

      {/* 3. 精選專案成果 (Featured Work) */}
      <FeaturedProjects projects={projects} />

      {/* 4. 最新深度文章 (Recent Writings) */}
      <RecentWritings articles={articles} />

      {/* 5. 電子報訂閱區塊 */}
      <div className="pt-6">
        <NewsletterBox />
      </div>
    </div>
  );
}
