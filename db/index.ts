import fs from "fs";
import path from "path";
import { desc, asc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import type {
  ArticleItem,
  ProjectItem,
  FeedItem,
  EngagementItem,
  SubscriberItem,
  ExperienceItem,
  SiteProfileItem,
  AiToolItem,
  SystemSettingItem,
} from "./schema";

// 判斷是否有設定 Postgres 資料庫連線
const connectionString = process.env.DATABASE_URL;
const isPostgresConfigured = Boolean(
  connectionString && !connectionString.includes("user:pass@db.supabase.co")
);

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
if (isPostgresConfigured) {
  try {
    const client = postgres(connectionString!, {
      max: 5,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    dbInstance = drizzle(client, { schema });
  } catch (error) {
    console.warn("Postgres 連線初始化失敗，自動啟用本地持久化儲存:", error);
  }
}

export const db = dbInstance;

// 生產環境（如 Railway）嚴格模式：禁止降級讀取本地 local-store.json 假資料
const isStrictDbMode = Boolean(db) || process.env.NODE_ENV === "production";

const emptyProfile: SiteProfileItem = {
  id: "main",
  name: "",
  title: "",
  bio: "",
  location: "",
  email: "",
  avatarUrl: null,
  nowStatus: "",
  nowUpdateSeason: "",
  updatedAt: new Date(0).toISOString(),
};

// 驗證是否為合法 UUID 格式（避免傳入非 UUID 字串導致 Postgres 報錯）
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(id?: string | null): id is string {
  return Boolean(id && UUID_REGEX.test(id));
}

// 本地降級持久化檔案路徑 (僅於未設定 DATABASE_URL 時使用)
const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "local-store.json");

interface LocalStoreData {
  articles: ArticleItem[];
  projects: ProjectItem[];
  feeds: FeedItem[];
  engagements: Record<string, EngagementItem>;
  subscribers: SubscriberItem[];
  experiences: ExperienceItem[];
  profile: SiteProfileItem;
  aiTools: AiToolItem[];
  systemSettings: Record<string, SystemSettingItem>;
}

const defaultInitialData: LocalStoreData = {
  profile: {
    id: "main",
    name: "KC",
    title: "全端架構師 · 產品設計師 · 獨立創作者",
    bio: "打造有溫度的數位產品，在混亂與秩序間持續思考。這裡是我的個人數位花園（Digital Garden），我在此記錄架構重構的實踐、產品工程的權衡，以及隨手捕捉的微小靈感。",
    location: "台北 · 遠端協作",
    email: "contact@kc-space.dev",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    nowStatus:
      "正在深耕 Next.js 14 邊緣渲染架構、探索 Local-first 知識系統與實踐數位花園經營",
    nowUpdateSeason: "2026 年春季更新",
    updatedAt: new Date().toISOString(),
  },
  experiences: [
    {
      id: "exp-1",
      role: "Lead Architect & Tech Lead",
      company: "知名跨國電商平台",
      period: "2023 - 至今",
      description:
        "負責核心前台與支付流程的邊緣化重構，導入 Next.js 與分散式快取機制，日處理百萬級並發請求，LCP 提升 45%。",
      order: 1,
    },
    {
      id: "exp-2",
      role: "Senior Fullstack Engineer",
      company: "SaaS 協作雲端軟體",
      period: "2021 - 2023",
      description:
        "主導協作畫布與離線優先 (Local-first) 資料同步引擎開發，運用 CRDT 與 WebAssembly 打造毫秒級多人即時同步體驗。",
      order: 2,
    },
    {
      id: "exp-3",
      role: "Frontend Engineer & UI Designer",
      company: "數位產品創新實驗室",
      period: "2019 - 2021",
      description:
        "負責多個開創性 Web 與行動應用之原型設計、前端架構搭建與設計系統 (Design System) 規格制定。",
      order: 3,
    },
  ],
  articles: [
    {
      id: "art-1",
      slug: "progressive-refactoring-guide",
      title: "如何透過漸進式重構降低技術債務",
      excerpt:
        "大型單體架構遷移並非一蹴可幾，本文探討如何透過 Strangler Fig 模式平滑過渡，兼顧業務迭代與系統穩定性。",
      category: "Engineering",
      tags: ["Refactoring", "Architecture", "TypeScript", "Next.js"],
      featured: true,
      status: "published",
      readingTime: "8 min",
      coverImage:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      publishedAt: "2026-03-15T10:00:00.000Z",
      updatedAt: "2026-03-18T14:20:00.000Z",
      content: `在現代快速迭代的軟體工程中，技術債務（Technical Debt）就像金融利息一樣，如果不進行有序的管理與償還，最終會導致團隊交付速度急劇下降，甚至使系統陷入難以維護的泥淖。

許多團隊在面對陳舊程式碼時，直覺會想要「推倒重來」（Big Bang Rewrite）。然而歷史告訴我們，一次性的重寫往往伴隨著巨大的商業風險、功能漏失與無法如期上線的困境。

## 1. 什麼是絞殺者模式 (Strangler Fig Pattern)？

絞殺者模式源於馬丁·福勒（Martin Fowler）在澳洲雨林中對絞殺榕的觀察。這種植物在老樹枝幹上發芽，逐步向下生根包圍宿主，最終取而代之。

在系統架構中，這意味著：

> **核心思維**：不要試圖一口氣重寫整個系統。而是在邊緣逐步攔截流量，將特定功能抽取為新的微服務或現代化模組，直到老舊系統完全被邊緣化並自然下線。

## 2. 漸進式重構的四部曲

1. **建立邊界與防腐層 (Anti-Corruption Layer)**：確保新寫的業務邏輯不會被舊資料庫結構污染，使用 DTO (Data Transfer Object) 進行清晰轉換。
2. **導入全域端對端整合測試 (E2E Tests)**：在不動既有行為的前提下記錄輸入與輸出基準，作為重構的安全防護網。
3. **金絲雀發布 (Canary Release)**：先引導 5% 的內部或低風險用戶流量至新端點，觀察監控指標 (APM) 與錯誤日誌。
4. **清理遺留代碼與下線**：切記在流量 100% 轉移並穩定運行兩週後，徹底移除老舊程式碼，避免成為幽靈依賴。`,
    },
    {
      id: "art-2",
      slug: "digital-garden-philosophy",
      title: "個人品牌如何從小受眾開始累積影響力：數位花園經營哲學",
      excerpt:
        "擺脫傳統部落格與社群媒體演算法的焦慮，打造屬於自己的思想苗圃與長期數位資產。",
      category: "Product",
      tags: ["Productivity", "Digital Garden", "Creator Economy"],
      featured: true,
      status: "published",
      readingTime: "5 min",
      coverImage:
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      publishedAt: "2026-02-28T14:30:00.000Z",
      updatedAt: "2026-03-02T09:00:00.000Z",
      content: `在社群媒體的「串流」（Stream）時代，貼文如同急流中的樹葉，往往在發布後 24 小時內便被時間軸淹沒。這種以注意力為導向的環境，容易讓創作者陷入「頻繁產出但缺乏積累」的焦慮。

## 什麼是「數位花園」(Digital Garden)？

數位花園與傳統時間線為主的部落格最大的不同在於：

* **拓撲結構而非線性流水**：文章之間透過雙向連結與主題網絡交織，隨時可以回頭修剪、補寫與更新。
* **承認半成品（Works in Progress）**：你不需要等到一篇文章完美無缺才發布，可以標記為「幼苗 🌱」、「灌木 🌿」或「常青樹 🌲」。
* **長期價值沉澱**：內容隨時間推移持續產生複利，成為你個人的第二大腦與公開思考的遊樂場。`,
    },
  ],
  projects: [
    {
      id: "e-commerce-replatform",
      title: "高併發電商平台核心架構重構",
      description:
        "主導 200 萬用戶電商前台向 Next.js 與邊緣運算轉移，實現高可靠、低延遲的極致購物體驗。",
      period: "2025.06 - 2025.12",
      role: "Lead Architect & Tech Lead",
      featured: true,
      coverImage:
        "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80",
      metrics: [
        { label: "LCP 載入效能", value: "提升 45%" },
        { label: "伺服器成本", value: "-30%" },
        { label: "轉換率提升", value: "+18.2%" },
      ],
      technologies: [
        "Next.js",
        "TypeScript",
        "Redis",
        "Tailwind CSS",
        "Cloudflare Workers",
      ],
      externalUrl: "https://example.com/ecommerce-demo",
      githubUrl: "https://github.com/example/ecommerce-replatform",
      createdAt: new Date("2025-06-01").toISOString(),
      updatedAt: new Date("2025-12-30").toISOString(),
    },
    {
      id: "knowledge-base-app",
      title: "跨平台個人第二大腦與知識庫 App",
      description:
        "打造結合本機優先 (Local-first) 與端對端加密同步的個人筆記工具，支援雙向連結與離線全文檢索。",
      period: "2025.01 - 2025.05",
      role: "Product Creator & Fullstack Dev",
      featured: true,
      coverImage:
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      metrics: [
        { label: "活躍用戶成長", value: "+120%" },
        { label: "本機檢索速度", value: "< 15ms" },
        { label: "用戶留存率", value: "68%" },
      ],
      technologies: [
        "React",
        "TypeScript",
        "IndexedDB",
        "WebAssembly",
        "Framer Motion",
      ],
      externalUrl: "https://example.com/knowledge-app",
      githubUrl: "https://github.com/example/knowledge-base-app",
      createdAt: new Date("2025-01-01").toISOString(),
      updatedAt: new Date("2025-05-30").toISOString(),
    },
  ],
  engagements: {
    "progressive-refactoring-guide": {
      slug: "progressive-refactoring-guide",
      views: 342,
      claps: 88,
      updatedAt: new Date().toISOString(),
    },
    "digital-garden-philosophy": {
      slug: "digital-garden-philosophy",
      views: 215,
      claps: 59,
      updatedAt: new Date().toISOString(),
    },
  },
  subscribers: [
    {
      id: "sub-1",
      email: "demo@example.com",
      status: "active",
      subscribedAt: new Date().toISOString(),
    },
  ],
  feeds: [
    {
      id: "f-1",
      content:
        "好設計是盡可能無設計（Less, but better）。在構建個人數位花園的過程中，克制的使用色彩與動畫，能讓文字與思想真正成為焦點。",
      mediaUrl: null,
      tags: ["#設計隨筆", "#架構思考"],
      isPinned: true,
      likeCount: 24,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ],
  aiTools: [
    {
      id: "tool-claude",
      name: "Claude (Anthropic)",
      description:
        "擅長深度推理、長文本脈絡理解與高品質程式碼撰寫的 AI 對話夥伴，寫作語氣自然且邏輯嚴謹。",
      category: "對話與寫作",
      pricing: "Freemium / 訂閱制",
      url: "https://claude.ai",
      tags: ["LLM", "寫作", "推理", "Artifacts"],
      isFeatured: true,
      createdAt: new Date("2026-01-10").toISOString(),
      updatedAt: new Date("2026-01-10").toISOString(),
    },
    {
      id: "tool-cursor",
      name: "Cursor",
      description:
        "基於 VS Code 打造的 AI 原生程式編輯器，支援全專案上下文索引、Composer 多檔重構與極速補全。",
      category: "程式開發",
      pricing: "Freemium / 訂閱制",
      url: "https://www.cursor.com",
      tags: ["IDE", "Coding", "Agent"],
      isFeatured: true,
      createdAt: new Date("2026-01-12").toISOString(),
      updatedAt: new Date("2026-01-12").toISOString(),
    },
    {
      id: "tool-perplexity",
      name: "Perplexity AI",
      description:
        "結合即時網路搜尋與來源引用的 AI 知識檢索引擎，大幅縮短技術調研與資料查證的時間成本。",
      category: "搜尋與研究",
      pricing: "Freemium / 訂閱制",
      url: "https://www.perplexity.ai",
      tags: ["Search", "Research", "Citations"],
      isFeatured: true,
      createdAt: new Date("2026-01-15").toISOString(),
      updatedAt: new Date("2026-01-15").toISOString(),
    },
  ],
  systemSettings: {},
};

function readLocalStore(): LocalStoreData {
  // 生產環境禁止讀取本地假資料檔案
  if (isStrictDbMode) {
    return {
      articles: [],
      projects: [],
      feeds: [],
      engagements: {},
      subscribers: [],
      experiences: [],
      profile: emptyProfile,
      aiTools: [],
      systemSettings: {},
    };
  }
  try {
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      const dir = path.dirname(LOCAL_STORE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        LOCAL_STORE_PATH,
        JSON.stringify(defaultInitialData, null, 2),
        "utf-8"
      );
      return defaultInitialData;
    }
    const content = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
    const data = JSON.parse(content);
    return {
      ...defaultInitialData,
      ...data,
      articles: data.articles || defaultInitialData.articles,
      projects: data.projects || defaultInitialData.projects,
      feeds: data.feeds || defaultInitialData.feeds,
      aiTools: data.aiTools || defaultInitialData.aiTools,
      systemSettings: data.systemSettings || defaultInitialData.systemSettings,
      profile: {
        ...defaultInitialData.profile,
        ...(data.profile || {}),
        avatarUrl:
          data.profile?.avatarUrl || defaultInitialData.profile.avatarUrl,
      },
      experiences: data.experiences || defaultInitialData.experiences,
      engagements: data.engagements || defaultInitialData.engagements,
      subscribers: data.subscribers || defaultInitialData.subscribers,
    };
  } catch (err) {
    console.error("讀取本地資料庫失敗，使用預設資料:", err);
    return defaultInitialData;
  }
}

function writeLocalStore(data: LocalStoreData) {
  if (isStrictDbMode) {
    throw new Error(
      "尚未設定 DATABASE_URL（PostgreSQL 連線字串），無法於生產環境儲存資料，請至 Railway Variables 綁定資料庫。"
    );
  }
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("寫入本地資料庫失敗:", err);
    throw err;
  }
}

/**
 * 統一資料庫服務層 (Data Service)
 * 當設定 DATABASE_URL 時，全站所有內容一律直連 PostgreSQL (Drizzle ORM) 進行讀寫；
 * 本機開發未設定 DATABASE_URL 時，自動降級使用 data/local-store.json。
 */
export const dataService = {
  // ================= 1. 文章 (kc_articles) =================
  async getArticles(includeDrafts = false): Promise<ArticleItem[]> {
    if (db) {
      const rows = includeDrafts
        ? await db
            .select()
            .from(schema.articles)
            .orderBy(desc(schema.articles.publishedAt))
        : await db
            .select()
            .from(schema.articles)
            .where(eq(schema.articles.status, "published"))
            .orderBy(desc(schema.articles.publishedAt));

      return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImage: r.coverImage,
        category: r.category,
        tags: r.tags || [],
        featured: r.featured,
        status: (r.status as ArticleItem["status"]) || "published",
        readingTime: r.readingTime,
        publishedAt: r.publishedAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }

    const store = readLocalStore();
    return store.articles
      .filter((a) => includeDrafts || a.status === "published")
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  },

  async getArticleBySlug(slug: string): Promise<ArticleItem | null> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.articles)
        .where(eq(schema.articles.slug, slug))
        .limit(1);
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImage: r.coverImage,
        category: r.category,
        tags: r.tags || [],
        featured: r.featured,
        status: (r.status as ArticleItem["status"]) || "published",
        readingTime: r.readingTime,
        publishedAt: r.publishedAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    return store.articles.find((a) => a.slug === slug) || null;
  },

  async saveArticle(
    input: Partial<ArticleItem> & {
      slug: string;
      title: string;
      content: string;
    }
  ): Promise<ArticleItem> {
    const now = new Date();
    if (db) {
      const rows = await db
        .insert(schema.articles)
        .values({
          slug: input.slug,
          title: input.title,
          excerpt: input.excerpt || "",
          content: input.content,
          coverImage: input.coverImage || null,
          category: input.category || "Engineering",
          tags: input.tags || [],
          featured: Boolean(input.featured),
          status: input.status || "published",
          readingTime: input.readingTime || "5 min",
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.articles.slug,
          set: {
            title: input.title,
            excerpt: input.excerpt ?? "",
            content: input.content,
            coverImage: input.coverImage ?? null,
            category: input.category || "Engineering",
            tags: input.tags || [],
            featured: Boolean(input.featured),
            status: input.status || "published",
            readingTime: input.readingTime || "5 min",
            updatedAt: now,
          },
        })
        .returning();

      const r = rows[0];
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImage: r.coverImage,
        category: r.category,
        tags: r.tags || [],
        featured: r.featured,
        status: (r.status as ArticleItem["status"]) || "published",
        readingTime: r.readingTime,
        publishedAt: r.publishedAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    const existingIndex = store.articles.findIndex((a) => a.slug === input.slug);
    const nowIso = now.toISOString();

    let saved: ArticleItem;
    if (existingIndex >= 0) {
      saved = {
        ...store.articles[existingIndex],
        ...input,
        updatedAt: nowIso,
      };
      store.articles[existingIndex] = saved;
    } else {
      saved = {
        id: "art-" + Math.random().toString(36).substring(2, 9),
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt || "",
        content: input.content,
        coverImage: input.coverImage || null,
        category: input.category || "General",
        tags: input.tags || [],
        featured: Boolean(input.featured),
        status: input.status || "published",
        readingTime: input.readingTime || "5 min",
        publishedAt: input.publishedAt || nowIso,
        updatedAt: nowIso,
      };
      store.articles.unshift(saved);
    }
    writeLocalStore(store);
    return saved;
  },

  async deleteArticle(slug: string): Promise<boolean> {
    if (db) {
      const deleted = await db
        .delete(schema.articles)
        .where(eq(schema.articles.slug, slug))
        .returning({ id: schema.articles.id });
      return deleted.length > 0;
    }

    const store = readLocalStore();
    const initialLen = store.articles.length;
    store.articles = store.articles.filter((a) => a.slug !== slug);
    if (store.articles.length !== initialLen) {
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  // ================= 2. 專案 (kc_projects) =================
  async getProjects(): Promise<ProjectItem[]> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.projects)
        .orderBy(desc(schema.projects.createdAt));

      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        period: r.period,
        role: r.role,
        featured: r.featured,
        coverImage: r.coverImage,
        metrics: Array.isArray(r.metrics) ? r.metrics : [],
        technologies: r.technologies || [],
        externalUrl: r.externalUrl,
        githubUrl: r.githubUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }

    const store = readLocalStore();
    return store.projects
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  async getProjectById(id: string): Promise<ProjectItem | null> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, id))
        .limit(1);
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        period: r.period,
        role: r.role,
        featured: r.featured,
        coverImage: r.coverImage,
        metrics: Array.isArray(r.metrics) ? r.metrics : [],
        technologies: r.technologies || [],
        externalUrl: r.externalUrl,
        githubUrl: r.githubUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    return store.projects.find((p) => p.id === id) || null;
  },

  async saveProject(
    input: Partial<ProjectItem> & { id: string; title: string }
  ): Promise<ProjectItem> {
    const now = new Date();
    if (db) {
      const rows = await db
        .insert(schema.projects)
        .values({
          id: input.id,
          title: input.title,
          description: input.description || "",
          period: input.period || "2026",
          role: input.role || "Developer",
          featured: Boolean(input.featured),
          coverImage: input.coverImage || null,
          metrics: input.metrics || [],
          technologies: input.technologies || [],
          externalUrl: input.externalUrl || null,
          githubUrl: input.githubUrl || null,
          createdAt: input.createdAt ? new Date(input.createdAt) : now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: {
            title: input.title,
            description: input.description ?? "",
            period: input.period || "2026",
            role: input.role || "Developer",
            featured: Boolean(input.featured),
            coverImage: input.coverImage ?? null,
            metrics: input.metrics || [],
            technologies: input.technologies || [],
            externalUrl: input.externalUrl ?? null,
            githubUrl: input.githubUrl ?? null,
            updatedAt: now,
          },
        })
        .returning();

      const r = rows[0];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        period: r.period,
        role: r.role,
        featured: r.featured,
        coverImage: r.coverImage,
        metrics: Array.isArray(r.metrics) ? r.metrics : [],
        technologies: r.technologies || [],
        externalUrl: r.externalUrl,
        githubUrl: r.githubUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    const existingIndex = store.projects.findIndex((p) => p.id === input.id);
    const nowIso = now.toISOString();

    let saved: ProjectItem;
    if (existingIndex >= 0) {
      saved = {
        ...store.projects[existingIndex],
        ...input,
        updatedAt: nowIso,
      };
      store.projects[existingIndex] = saved;
    } else {
      saved = {
        id: input.id,
        title: input.title,
        description: input.description || "",
        period: input.period || "2026",
        role: input.role || "Developer",
        featured: Boolean(input.featured),
        coverImage: input.coverImage || null,
        metrics: input.metrics || [],
        technologies: input.technologies || [],
        externalUrl: input.externalUrl || null,
        githubUrl: input.githubUrl || null,
        createdAt: input.createdAt || nowIso,
        updatedAt: nowIso,
      };
      store.projects.unshift(saved);
    }
    writeLocalStore(store);
    return saved;
  },

  async deleteProject(id: string): Promise<boolean> {
    if (db) {
      const deleted = await db
        .delete(schema.projects)
        .where(eq(schema.projects.id, id))
        .returning({ id: schema.projects.id });
      return deleted.length > 0;
    }

    const store = readLocalStore();
    const initialLen = store.projects.length;
    store.projects = store.projects.filter((p) => p.id !== id);
    if (store.projects.length !== initialLen) {
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  // ================= 3. 微動態 (kc_feeds) =================
  async getFeeds(limit: number = 20): Promise<FeedItem[]> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.feeds)
        .orderBy(desc(schema.feeds.isPinned), desc(schema.feeds.createdAt))
        .limit(limit);

      return rows.map((r) => ({
        id: r.id,
        content: r.content,
        mediaUrl: r.mediaUrl,
        tags: r.tags || [],
        isPinned: r.isPinned,
        likeCount: r.likeCount,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }

    const store = readLocalStore();
    return store.feeds
      .slice()
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .slice(0, limit);
  },

  async createFeed(input: {
    content: string;
    mediaUrl?: string | null;
    tags?: string[];
  }): Promise<FeedItem> {
    if (db) {
      const rows = await db
        .insert(schema.feeds)
        .values({
          content: input.content,
          mediaUrl: input.mediaUrl || null,
          tags: input.tags || [],
          isPinned: false,
          likeCount: 0,
        })
        .returning();
      const r = rows[0];
      return {
        id: r.id,
        content: r.content,
        mediaUrl: r.mediaUrl,
        tags: r.tags || [],
        isPinned: r.isPinned,
        likeCount: r.likeCount,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    const newFeed: FeedItem = {
      id: "feed-" + Math.random().toString(36).substring(2, 9),
      content: input.content,
      mediaUrl: input.mediaUrl || null,
      tags: input.tags || [],
      isPinned: false,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.feeds.unshift(newFeed);
    writeLocalStore(store);
    return newFeed;
  },

  async likeFeed(feedId: string): Promise<FeedItem | null> {
    if (db) {
      if (!isValidUuid(feedId)) return null;
      const rows = await db
        .update(schema.feeds)
        .set({
          likeCount: sql`${schema.feeds.likeCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.feeds.id, feedId))
        .returning();
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        content: r.content,
        mediaUrl: r.mediaUrl,
        tags: r.tags || [],
        isPinned: r.isPinned,
        likeCount: r.likeCount,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    const target = store.feeds.find((f) => f.id === feedId);
    if (!target) return null;
    target.likeCount += 1;
    target.updatedAt = new Date().toISOString();
    writeLocalStore(store);
    return target;
  },

  async deleteFeed(id: string): Promise<boolean> {
    if (db) {
      if (!isValidUuid(id)) return false;
      const deleted = await db
        .delete(schema.feeds)
        .where(eq(schema.feeds.id, id))
        .returning({ id: schema.feeds.id });
      return deleted.length > 0;
    }

    const store = readLocalStore();
    const initialLen = store.feeds.length;
    store.feeds = store.feeds.filter((f) => f.id !== id);
    if (store.feeds.length !== initialLen) {
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  // ================= 4. 互動數據 (kc_engagements) =================
  async getEngagement(slug: string): Promise<EngagementItem> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.engagements)
        .where(eq(schema.engagements.slug, slug))
        .limit(1);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          slug: r.slug,
          views: r.views,
          claps: r.claps,
          updatedAt: r.updatedAt.toISOString(),
        };
      }
      return {
        slug,
        views: 0,
        claps: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    const store = readLocalStore();
    if (!store.engagements[slug]) {
      store.engagements[slug] = {
        slug,
        views: 0,
        claps: 0,
        updatedAt: new Date().toISOString(),
      };
      writeLocalStore(store);
    }
    return store.engagements[slug];
  },

  async incrementEngagement(
    slug: string,
    action: "view" | "clap",
    count: number = 1
  ): Promise<EngagementItem> {
    const now = new Date();
    if (db) {
      const rows = await db
        .insert(schema.engagements)
        .values({
          slug,
          views: action === "view" ? count : 0,
          claps: action === "clap" ? count : 0,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.engagements.slug,
          set:
            action === "view"
              ? {
                  views: sql`${schema.engagements.views} + ${count}`,
                  updatedAt: now,
                }
              : {
                  claps: sql`${schema.engagements.claps} + ${count}`,
                  updatedAt: now,
                },
        })
        .returning();
      const r = rows[0];
      return {
        slug: r.slug,
        views: r.views,
        claps: r.claps,
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    if (!store.engagements[slug]) {
      store.engagements[slug] = {
        slug,
        views: 0,
        claps: 0,
        updatedAt: now.toISOString(),
      };
    }
    if (action === "view") {
      store.engagements[slug].views += count;
    } else {
      store.engagements[slug].claps += count;
    }
    store.engagements[slug].updatedAt = now.toISOString();
    writeLocalStore(store);
    return store.engagements[slug];
  },

  // ================= 5. 電子報 (kc_subscribers) =================
  async getSubscribers(): Promise<SubscriberItem[]> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.subscribers)
        .orderBy(desc(schema.subscribers.subscribedAt));
      return rows.map((r) => ({
        id: r.id,
        email: r.email,
        status: (r.status as SubscriberItem["status"]) || "active",
        subscribedAt: r.subscribedAt.toISOString(),
      }));
    }

    const store = readLocalStore();
    return store.subscribers;
  },

  async subscribeNewsletter(
    email: string
  ): Promise<{ success: boolean; alreadySubscribed?: boolean }> {
    const normalized = email.trim().toLowerCase();
    if (db) {
      const existing = await db
        .select({ id: schema.subscribers.id })
        .from(schema.subscribers)
        .where(eq(schema.subscribers.email, normalized))
        .limit(1);
      if (existing.length > 0) {
        return { success: true, alreadySubscribed: true };
      }
      await db.insert(schema.subscribers).values({
        email: normalized,
        status: "active",
      });
      return { success: true, alreadySubscribed: false };
    }

    const store = readLocalStore();
    const existing = store.subscribers.find(
      (s) => s.email.toLowerCase() === normalized
    );
    if (existing) {
      return { success: true, alreadySubscribed: true };
    }
    const newSub: SubscriberItem = {
      id: "sub-" + Math.random().toString(36).substring(2, 9),
      email: normalized,
      status: "active",
      subscribedAt: new Date().toISOString(),
    };
    store.subscribers.push(newSub);
    writeLocalStore(store);
    return { success: true, alreadySubscribed: false };
  },

  // ================= 6. 簡歷與個人檔案 (kc_site_profiles & kc_experiences) =================
  async getProfile(): Promise<SiteProfileItem> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.siteProfiles)
        .where(eq(schema.siteProfiles.id, "main"))
        .limit(1);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          name: r.name,
          title: r.title,
          bio: r.bio,
          location: r.location,
          email: r.email,
          avatarUrl: r.avatarUrl,
          nowStatus: r.nowStatus,
          nowUpdateSeason: r.nowUpdateSeason,
          updatedAt: r.updatedAt.toISOString(),
        };
      }
      return emptyProfile;
    }

    const store = readLocalStore();
    return store.profile;
  },

  async updateProfile(input: Partial<SiteProfileItem>): Promise<SiteProfileItem> {
    const now = new Date();
    if (db) {
      const current = await this.getProfile();
      const updateFields = {
        name: String(input.name ?? current.name ?? ""),
        title: String(input.title ?? current.title ?? ""),
        bio: String(input.bio ?? current.bio ?? ""),
        location: String(input.location ?? current.location ?? ""),
        email: String(input.email ?? current.email ?? ""),
        avatarUrl:
          input.avatarUrl !== undefined
            ? input.avatarUrl || null
            : current.avatarUrl ?? null,
        nowStatus: String(input.nowStatus ?? current.nowStatus ?? ""),
        nowUpdateSeason: String(
          input.nowUpdateSeason ?? current.nowUpdateSeason ?? ""
        ),
        updatedAt: now,
      };
      const rows = await db
        .insert(schema.siteProfiles)
        .values({ id: "main", ...updateFields })
        .onConflictDoUpdate({
          target: schema.siteProfiles.id,
          set: updateFields,
        })
        .returning();
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        title: r.title,
        bio: r.bio,
        location: r.location,
        email: r.email,
        avatarUrl: r.avatarUrl,
        nowStatus: r.nowStatus,
        nowUpdateSeason: r.nowUpdateSeason,
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    store.profile = {
      ...store.profile,
      ...input,
      updatedAt: now.toISOString(),
    };
    writeLocalStore(store);
    return store.profile;
  },

  async getExperiences(): Promise<ExperienceItem[]> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.experiences)
        .orderBy(asc(schema.experiences.order));
      return rows.map((r) => ({
        id: r.id,
        role: r.role,
        company: r.company,
        period: r.period,
        description: r.description,
        order: r.order,
      }));
    }

    const store = readLocalStore();
    return store.experiences.slice().sort((a, b) => a.order - b.order);
  },

  async saveExperience(
    input: Partial<ExperienceItem> & { role: string; company: string }
  ): Promise<ExperienceItem> {
    if (db) {
      if (isValidUuid(input.id)) {
        const updated = await db
          .update(schema.experiences)
          .set({
            role: input.role,
            company: input.company,
            period: input.period || "2026",
            description: input.description || "",
            order: input.order ?? 0,
          })
          .where(eq(schema.experiences.id, input.id))
          .returning();
        if (updated.length > 0) return updated[0];
      }
      const inserted = await db
        .insert(schema.experiences)
        .values({
          role: input.role,
          company: input.company,
          period: input.period || "2026",
          description: input.description || "",
          order: input.order ?? 0,
        })
        .returning();
      return inserted[0];
    }

    const store = readLocalStore();
    const existingIndex = store.experiences.findIndex((e) => e.id === input.id);

    let saved: ExperienceItem;
    if (existingIndex >= 0) {
      saved = {
        ...store.experiences[existingIndex],
        ...input,
      };
      store.experiences[existingIndex] = saved;
    } else {
      saved = {
        id: "exp-" + Math.random().toString(36).substring(2, 9),
        role: input.role,
        company: input.company,
        period: input.period || "2026",
        description: input.description || "",
        order: input.order ?? store.experiences.length + 1,
      };
      store.experiences.push(saved);
    }
    writeLocalStore(store);
    return saved;
  },

  async deleteExperience(id: string): Promise<boolean> {
    if (db) {
      if (!isValidUuid(id)) return false;
      const deleted = await db
        .delete(schema.experiences)
        .where(eq(schema.experiences.id, id))
        .returning({ id: schema.experiences.id });
      return deleted.length > 0;
    }

    const store = readLocalStore();
    const initialLen = store.experiences.length;
    store.experiences = store.experiences.filter((e) => e.id !== id);
    if (store.experiences.length !== initialLen) {
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  // ================= 7. 全站統計總覽 (Dashboard Stats) =================
  async getStats() {
    if (db) {
      const [
        allArticles,
        allProjects,
        allFeeds,
        allAiTools,
        allSubscribers,
        allEngagements,
      ] = await Promise.all([
        db.select({ status: schema.articles.status }).from(schema.articles),
        db.select({ id: schema.projects.id }).from(schema.projects),
        db.select({ id: schema.feeds.id }).from(schema.feeds),
        db.select({ id: schema.aiTools.id }).from(schema.aiTools),
        db.select({ id: schema.subscribers.id }).from(schema.subscribers),
        db
          .select({
            views: schema.engagements.views,
            claps: schema.engagements.claps,
          })
          .from(schema.engagements),
      ]);

      const totalViews = allEngagements.reduce((acc, c) => acc + c.views, 0);
      const totalClaps = allEngagements.reduce((acc, c) => acc + c.claps, 0);

      return {
        dbMode: "postgresql" as const,
        totalArticles: allArticles.length,
        publishedArticles: allArticles.filter((a) => a.status === "published")
          .length,
        totalProjects: allProjects.length,
        totalFeeds: allFeeds.length,
        totalAiTools: allAiTools.length,
        totalSubscribers: allSubscribers.length,
        totalViews,
        totalClaps,
      };
    }

    const store = readLocalStore();
    const totalViews = Object.values(store.engagements).reduce(
      (acc, curr) => acc + curr.views,
      0
    );
    const totalClaps = Object.values(store.engagements).reduce(
      (acc, curr) => acc + curr.claps,
      0
    );

    return {
      dbMode: isStrictDbMode ? ("unconfigured" as const) : ("local-file" as const),
      totalArticles: store.articles.length,
      publishedArticles: store.articles.filter((a) => a.status === "published")
        .length,
      totalProjects: store.projects.length,
      totalFeeds: store.feeds.length,
      totalAiTools: store.aiTools.length,
      totalSubscribers: store.subscribers.length,
      totalViews,
      totalClaps,
    };
  },

  // ================= 8. AI 工具收集 (kc_ai_tools) =================
  async getAiTools(): Promise<AiToolItem[]> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.aiTools)
        .orderBy(desc(schema.aiTools.isFeatured), desc(schema.aiTools.createdAt));
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        pricing: r.pricing,
        url: r.url,
        tags: r.tags || [],
        isFeatured: r.isFeatured,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }

    const store = readLocalStore();
    return store.aiTools.slice().sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  },

  async saveAiTool(
    input: Partial<AiToolItem> & { id: string; name: string; url: string }
  ): Promise<AiToolItem> {
    const now = new Date();
    if (db) {
      const rows = await db
        .insert(schema.aiTools)
        .values({
          id: input.id,
          name: input.name,
          description: input.description || "",
          category: input.category || "對話與寫作",
          pricing: input.pricing || "Freemium",
          url: input.url,
          tags: input.tags || [],
          isFeatured: Boolean(input.isFeatured),
          createdAt: input.createdAt ? new Date(input.createdAt) : now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.aiTools.id,
          set: {
            name: input.name,
            description: input.description ?? "",
            category: input.category || "對話與寫作",
            pricing: input.pricing || "Freemium",
            url: input.url,
            tags: input.tags || [],
            isFeatured: Boolean(input.isFeatured),
            updatedAt: now,
          },
        })
        .returning();
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        pricing: r.pricing,
        url: r.url,
        tags: r.tags || [],
        isFeatured: r.isFeatured,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    }

    const store = readLocalStore();
    const existingIndex = store.aiTools.findIndex((t) => t.id === input.id);
    const nowIso = now.toISOString();

    let saved: AiToolItem;
    if (existingIndex >= 0) {
      saved = {
        ...store.aiTools[existingIndex],
        ...input,
        updatedAt: nowIso,
      };
      store.aiTools[existingIndex] = saved;
    } else {
      saved = {
        id: input.id,
        name: input.name,
        description: input.description || "",
        category: input.category || "對話與寫作",
        pricing: input.pricing || "Freemium",
        url: input.url,
        tags: input.tags || [],
        isFeatured: Boolean(input.isFeatured),
        createdAt: input.createdAt || nowIso,
        updatedAt: nowIso,
      };
      store.aiTools.unshift(saved);
    }
    writeLocalStore(store);
    return saved;
  },

  async deleteAiTool(id: string): Promise<boolean> {
    if (db) {
      const deleted = await db
        .delete(schema.aiTools)
        .where(eq(schema.aiTools.id, id))
        .returning({ id: schema.aiTools.id });
      return deleted.length > 0;
    }

    const store = readLocalStore();
    const initialLen = store.aiTools.length;
    store.aiTools = store.aiTools.filter((t) => t.id !== id);
    if (store.aiTools.length !== initialLen) {
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  // ================= 9. 系統設定與環境配置 (kc_system_settings) =================
  async getSystemSetting(key: string): Promise<SystemSettingItem | null> {
    if (db) {
      const rows = await db
        .select()
        .from(schema.systemSettings)
        .where(eq(schema.systemSettings.key, key))
        .limit(1);
      if (rows.length > 0) {
        return {
          key: rows[0].key,
          value: rows[0].value,
          description: rows[0].description,
          updatedAt: rows[0].updatedAt.toISOString(),
        };
      }
      return null;
    }

    const store = readLocalStore();
    return store.systemSettings?.[key] || null;
  },

  async setSystemSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<SystemSettingItem> {
    const now = new Date();
    if (db) {
      await db
        .insert(schema.systemSettings)
        .values({
          key,
          value,
          description: description || null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.systemSettings.key,
          set: {
            value,
            description: description || null,
            updatedAt: now,
          },
        });
      return {
        key,
        value,
        description: description || null,
        updatedAt: now.toISOString(),
      };
    }

    const store = readLocalStore();
    if (!store.systemSettings) store.systemSettings = {};
    const item: SystemSettingItem = {
      key,
      value,
      description: description || null,
      updatedAt: now.toISOString(),
    };
    store.systemSettings[key] = item;
    writeLocalStore(store);
    return item;
  },
};
