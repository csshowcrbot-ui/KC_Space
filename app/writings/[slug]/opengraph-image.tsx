import { ImageResponse } from "next/og";
import { dataService } from "@/db";

export const alt = "文章封面分享圖";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const article = await dataService.getArticleBySlug(params.slug);

  const title = article ? article.title : "KC Space · 深度文章";
  const category = article ? article.category : "Engineering";
  const readingTime = article ? article.readingTime : "5 min read";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0F1115",
          padding: "80px",
          fontFamily: "sans-serif",
          color: "#F0F2F5",
        }}
      >
        {/* 頂部品牌識別與分類 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#4D7DF2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#FFFFFF",
              }}
            >
              KC
            </div>
            <span style={{ fontSize: "24px", fontWeight: "600", color: "#94A1B2" }}>
              KC Space · 數位花園
            </span>
          </div>
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: "#202734",
              color: "#4D7DF2",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            {category}
          </div>
        </div>

        {/* 核心文章標題 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "800",
              lineHeight: 1.25,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
        </div>

        {/* 底部時間與網站標示 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #262B33",
            paddingTop: "32px",
            fontSize: "20px",
            color: "#68707B",
          }}
        >
          <span>kc-space.dev</span>
          <span>預估閱讀時間：{readingTime}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
