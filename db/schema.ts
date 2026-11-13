import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// 1. 文章資料表 (Articles)
export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  category: text("category").default("Engineering").notNull(),
  tags: text("tags").array().notNull(),
  featured: boolean("featured").default(false).notNull(),
  status: text("status").default("published").notNull(), // draft | published | archived
  readingTime: text("reading_time").default("5 min").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. 專案成果資料表 (Projects)
export const projects = pgTable("projects", {
  id: text("id").primaryKey(), // 專案唯一標識符 (如 e-commerce-replatform)
  title: text("title").notNull(),
  description: text("description").notNull(),
  period: text("period").notNull(),
  role: text("role").notNull(),
  featured: boolean("featured").default(false).notNull(),
  coverImage: text("cover_image"),
  metrics: jsonb("metrics").$type<Array<{ label: string; value: string }>>().notNull(),
  technologies: text("technologies").array().notNull(),
  externalUrl: text("external_url"),
  githubUrl: text("github_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. 微動態/短篇靈感 (Feed / Snippets)
export const feeds = pgTable("feeds", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  tags: text("tags").array(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. 頁面統計與按讚計數 (Engagements)
export const engagements = pgTable("engagements", {
  slug: text("slug").primaryKey(), // 可對應 article slug 或 project id
  views: integer("views").default(0).notNull(),
  claps: integer("claps").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. 電子報訂閱名單 (Newsletter Subscribers)
export const subscribers = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  status: text("status").default("active").notNull(), // pending | active | unsubscribed
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

// 6. 個人經歷與檔案資料表 (Experiences & Profiles)
export const experiences = pgTable("experiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  period: text("period").notNull(),
  description: text("description").notNull(),
  order: integer("order").default(0).notNull(),
});

export const siteProfiles = pgTable("site_profiles", {
  id: text("id").primaryKey(), // 'main'
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  location: text("location").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"), // 個人頭像/形象照網址
  nowStatus: text("now_status").notNull(),
  nowUpdateSeason: text("now_update_season").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TypeScript 型別導出
export type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  category: string;
  tags: string[];
  featured: boolean;
  status: "draft" | "published" | "archived";
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
};

export type ArticleMeta = Omit<ArticleItem, "content">;

export type ProjectMetric = {
  label: string;
  value: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  period: string;
  role: string;
  featured: boolean;
  coverImage?: string | null;
  metrics: ProjectMetric[];
  technologies: string[];
  externalUrl?: string | null;
  githubUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeedItem = {
  id: string;
  content: string;
  mediaUrl?: string | null;
  tags?: string[] | null;
  isPinned: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type EngagementItem = {
  slug: string;
  views: number;
  claps: number;
  updatedAt: string;
};

export type SubscriberItem = {
  id: string;
  email: string;
  status: "pending" | "active" | "unsubscribed";
  subscribedAt: string;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  order: number;
};

export type SiteProfileItem = {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  avatarUrl?: string | null;
  nowStatus: string;
  nowUpdateSeason: string;
  updatedAt: string;
};
