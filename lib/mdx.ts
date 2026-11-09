import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTICLES_PATH = path.join(process.cwd(), "content", "articles");
const PROJECTS_PATH = path.join(process.cwd(), "content", "projects");

export interface ArticleMeta {
  title: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  featured?: boolean;
  status: "draft" | "published" | "archived";
  readingTime?: string;
}

export interface Article extends ArticleMeta {
  content: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  period: string;
  role: string;
  featured?: boolean;
  coverImage?: string;
  metrics: ProjectMetric[];
  technologies: string[];
  externalUrl?: string;
  githubUrl?: string;
}

/**
 * 取得所有已發布的文章列表 (依時間倒序排列)
 */
export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(ARTICLES_PATH)) return [];

  const files = fs.readdirSync(ARTICLES_PATH).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const articles: ArticleMeta[] = files
    .map((filename) => {
      const filePath = path.join(ARTICLES_PATH, filename);
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContents);

      return {
        title: data.title || "未命名文章",
        slug: data.slug || filename.replace(/\.mdx?$/, ""),
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        excerpt: data.excerpt || "",
        coverImage: data.coverImage,
        category: data.category || "General",
        tags: data.tags || [],
        featured: Boolean(data.featured),
        status: data.status || "published",
        readingTime: data.readingTime || "5 min",
      };
    })
    .filter((article) => article.status === "published")
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return articles;
}

/**
 * 根據 slug 取得單篇文章詳情與內文
 */
export function getArticleBySlug(slug: string): Article | null {
  if (!fs.existsSync(ARTICLES_PATH)) return null;

  const files = fs.readdirSync(ARTICLES_PATH);
  for (const filename of files) {
    if (!filename.endsWith(".mdx") && !filename.endsWith(".md")) continue;
    const filePath = path.join(ARTICLES_PATH, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContents);

    const articleSlug = data.slug || filename.replace(/\.mdx?$/, "");
    if (articleSlug === slug) {
      return {
        title: data.title || "未命名文章",
        slug: articleSlug,
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        excerpt: data.excerpt || "",
        coverImage: data.coverImage,
        category: data.category || "General",
        tags: data.tags || [],
        featured: Boolean(data.featured),
        status: data.status || "published",
        readingTime: data.readingTime || "5 min",
        content,
      };
    }
  }

  return null;
}

/**
 * 取得所有專案列表
 */
export function getAllProjects(): ProjectItem[] {
  if (!fs.existsSync(PROJECTS_PATH)) return [];

  const files = fs.readdirSync(PROJECTS_PATH).filter((f) => f.endsWith(".json"));

  const projects: ProjectItem[] = files.map((filename) => {
    const filePath = path.join(PROJECTS_PATH, filename);
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  });

  return projects;
}

