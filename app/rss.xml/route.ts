import { dataService } from "@/db";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kc-space.dev";
  const articles = await dataService.getArticles();

  const rssItems = articles
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/writings/${article.slug}</link>
      <guid>${baseUrl}/writings/${article.slug}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
      <category>${article.category}</category>
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KC Space · 個人品牌數位花園</title>
    <link>${baseUrl}</link>
    <description>全端架構、數位花園經營、產品工程思考與即時靈感速寫。</description>
    <language>zh-TW</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
