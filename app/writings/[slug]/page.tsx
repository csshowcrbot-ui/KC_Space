import { notFound } from "next/navigation";
import Link from "next/link";
import { dataService } from "@/db";
import { formatDate } from "@/lib/utils";
import { ArticleReader } from "@/components/content/ArticleReader";
import { ScrollProgressBar } from "@/components/content/ScrollProgressBar";
import { TableOfContents } from "@/components/content/TableOfContents";
import { CopyLinkButton } from "@/components/content/CopyLinkButton";
import { ViewTracker } from "@/components/content/ViewTracker";
import { ClapButton } from "@/components/shared/ClapButton";
import { NewsletterBox } from "@/components/shared/NewsletterBox";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await dataService.getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await dataService.getArticleBySlug(params.slug);
  if (!article) return { title: "文章未找到" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      tags: article.tags,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // 從資料庫取得指定文章與內文
  const article = await dataService.getArticleBySlug(params.slug);
  if (!article) notFound();

  // 從資料庫取得互動數據
  const engagement = await dataService.getEngagement(params.slug);

  // 解析 H2 與 H3 生成目錄
  const headingMatches = article.content.matchAll(/^(##|###)\s+(.+)$/gm);
  const headings = Array.from(headingMatches).map((match) => {
    const level = match[1] === "##" ? 2 : 3;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-");
    return { id, text, level };
  });

  return (
    <article className="relative">
      {/* 閱讀進度條與瀏覽次數追蹤 */}
      <ScrollProgressBar />
      <ViewTracker slug={article.slug} />

      {/* 返回上一頁連結 */}
      <div className="mb-8">
        <Link
          href="/writings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>返回文章總覽</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10 items-start">
        {/* 文章核心主體 (聚焦 700px 閱讀體驗) */}
        <div className="max-w-prose w-full mx-auto lg:mx-0">
          {/* 文章標頭與詮釋資料 */}
          <header className="space-y-4 pb-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-badge-bg text-badge-text">
                {article.category}
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-[1.25]">
              {article.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(article.publishedAt)}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTime}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {engagement.views} 次閱讀
                </span>
              </div>
              <CopyLinkButton />
            </div>
          </header>

          {/* 封面圖 */}
          {article.coverImage && (
            <div className="my-8 rounded-2xl overflow-hidden border border-border shadow-sm">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-auto object-cover max-h-[420px]"
              />
            </div>
          )}

          {/* 文章正文 */}
          <div className="py-4">
            <ArticleReader content={article.content} />
          </div>

          {/* 文末拍手與互動反饋 */}
          <div className="my-12 py-8 border-t border-b border-border flex flex-col items-center justify-center space-y-4 text-center">
            <ClapButton slug={article.slug} initialClaps={engagement.claps} />
          </div>

          {/* 電子報訂閱模組 */}
          <div className="mt-12">
            <NewsletterBox />
          </div>
        </div>

        {/* 桌面端側邊浮動目錄 (Sticky Mini-TOC) */}
        <aside className="hidden lg:block sticky top-24 space-y-6">
          <TableOfContents headings={headings} />

          <div className="p-4 rounded-xl border border-border bg-surface/50 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">關於此文章：</p>
            <p>本文為思想沉澱之數位花園筆記，若有錯誤或建議，歡迎透過聯絡頁面給予反饋。</p>
          </div>
        </aside>
      </div>
    </article>
  );
}
