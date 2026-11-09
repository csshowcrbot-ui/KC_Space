import { dataService } from "@/db";
import { FeedClient } from "./FeedClient";

export const metadata = {
  title: "微動態速寫 · Feed & Snippets",
  description: "即時捕捉的思想碎片、架構心得、讀書筆記與微小靈感。",
};

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const initialFeeds = await dataService.getFeeds(30);

  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          微動態速寫 · Feed & Notes
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          不設限長度與主題的即時思考發布牆。紀錄平日在架構設計、閱讀短評、程式調校或日常生活中的靈光一閃。
        </p>
      </div>

      <FeedClient initialFeeds={initialFeeds} />
    </div>
  );
}

