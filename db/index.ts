import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import type {
  ArticleItem,
  ProjectItem,
  EngagementItem,
  SubscriberItem,
  ExperienceItem,
  SiteProfileItem,
} from "./schema";

// 判斷是否有設定 Postgres 資料庫連線
const connectionString = process.env.DATABASE_URL;
const isPostgresConfigured = Boolean(
  connectionString && !connectionString.includes("user:pass@db.supabase.co")
);

let dbInstance: ReturnType<typeof drizzle> | null = null;
if (isPostgresConfigured) {
  try {
    const client = postgres(connectionString!, { max: 1 });
    dbInstance = drizzle(client, { schema });
  } catch (error) {
    console.warn("Postgres 連線初始化失敗，自動啟用本地持久化儲存:", error);
  }
}

export const db = dbInstance;

// 本地降級持久化檔案路徑 (開發與無外部資料庫模式)
const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "local-store.json");

interface LocalStoreData {
  articles: ArticleItem[];
  projects: ProjectItem[];
  engagements: Record<string, EngagementItem>;
  subscribers: SubscriberItem[];
  experiences: ExperienceItem[];
  profile: SiteProfileItem;
}

const defaultInitialData: LocalStoreData = {
  profile: {
    id: "main",
    name: "KC",
    title: "全端架構師 · 產品設計師 · 獨立創作者",
    bio: "打造有溫度的數位產品，在混亂與秩序間持續思考。這裡是我的個人數位花園（Digital Garden），我在此記錄架構重構的實踐、產品工程的權衡，以及隨手捕捉的微小靈感。",
    location: "台北 · 遠端協作",
    email: "contact@kc-space.dev",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    nowStatus: "正在深耕 Next.js 14 邊緣渲染架構、探索 Local-first 知識系統與實踐數位花園經營",
    nowUpdateSeason: "2026 年春季更新",
    updatedAt: new Date().toISOString(),
  },
  experiences: [
    {
      id: "exp-1",
      role: "Lead Architect & Tech Lead",
      company: "知名跨國電商平台",
      period: "2023 - 至今",
      description: "負責核心前台與支付流程的邊緣化重構，導入 Next.js 與分散式快取機制，日處理百萬級並發請求，LCP 提升 45%。",
      order: 1,
    },
    {
      id: "exp-2",
      role: "Senior Fullstack Engineer",
      company: "SaaS 協作雲端軟體",
      period: "2021 - 2023",
      description: "主導協作畫布與離線優先 (Local-first) 資料同步引擎開發，運用 CRDT 與 WebAssembly 打造毫秒級多人即時同步體驗。",
      order: 2,
    },
    {
      id: "exp-3",
      role: "Frontend Engineer & UI Designer",
      company: "數位產品創新實驗室",
      period: "2019 - 2021",
      description: "負責多個開創性 Web 與行動應用之原型設計、前端架構搭建與設計系統 (Design System) 規格制定。",
      order: 3,
    },
  ],
  articles: [
    {
      id: "art-1",
      slug: "progressive-refactoring-guide",
      title: "如何透過漸進式重構降低技術債務",
      excerpt: "大型單體架構遷移並非一蹴可幾，本文探討如何透過 Strangler Fig 模式平滑過渡，兼顧業務迭代與系統穩定性。",
      category: "Engineering",
      tags: ["Refactoring", "Architecture", "TypeScript", "Next.js"],
      featured: true,
      status: "published",
      readingTime: "8 min",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      publishedAt: "2026-03-15T10:00:00.000Z",
      updatedAt: "2026-03-18T14:20:00.000Z",
      content: `在現代快速迭代的軟體工程中，技術債務（Technical Debt）就像金融利息一樣，如果不進行有序的管理與償還，最終會導致團隊交付速度急劇下降，甚至使系統陷入難以維護的泥淖。

許多團隊在面對陳舊程式碼時，直覺會想要「推倒重來」（Big Bang Rewrite）。然而歷史告訴我們，一次性的重寫往往伴隨著巨大的商業風險、功能漏失與無法如期上線的困境。

## 1. 什麼是絞殺者模式 (Strangler Fig Pattern)？

絞殺者模式源於馬丁·福勒（Martin Fowler）在澳洲雨林中對絞殺榕的觀察。這種植物在老樹枝幹上發芽，逐步向下生根包圍宿主，最終取而代之。

在系統架構中，這意味著：

> **核心思維**：不要試圖一口氣重寫整個系統。而是在邊緣逐步攔截流量，將特定功能抽取為新的微服務或現代化模組，直到老舊系統完全被邊緣化並自然下線。

\`\`\`typescript
// 路由閘道端範例：透過特徵旗標與路徑逐步代理流量
export async function proxyHandler(req: Request) {
  const url = new URL(req.url);
  const useNewOrderService = await checkFeatureFlag("checkout_v2", req);

  if (url.pathname.startsWith("/api/checkout") && useNewOrderService) {
    // 轉發至現代化 Next.js Edge 服務
    return fetch(process.env.NEW_SERVICE_URL + url.pathname, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  }

  // 預設仍保留給舊版單體系統處理
  return fetch(process.env.LEGACY_BACKEND_URL + url.pathname, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
}
\`\`\`

## 2. 漸進式重構的四部曲

1. **建立邊界與防腐層 (Anti-Corruption Layer)**：確保新寫的業務邏輯不會被舊資料庫結構污染，使用 DTO (Data Transfer Object) 進行清晰轉換。
2. **導入全域端對端整合測試 (E2E Tests)**：在不動既有行為的前提下記錄輸入與輸出基準，作為重構的安全防護網。
3. **金絲雀發布 (Canary Release)**：先引導 5% 的內部或低風險用戶流量至新端點，觀察監控指標 (APM) 與錯誤日誌。
4. **清理遺留代碼與下線**：切記在流量 100% 轉移並穩定運行兩週後，徹底移除老舊程式碼，避免成為幽靈依賴。

## 3. 效益與反思

重構從來不是技術狂熱者的自嗨，而是為了讓團隊跑得更快、系統更具韌性。透過這套漸進策略，我們成功在半年內將百萬日活的電商平台逐步遷移至邊緣運算節點，LCP 首屏速度提升 45%，同時保持了每週三次正常上線的業務節奏。`,
    },
    {
      id: "art-2",
      slug: "digital-garden-philosophy",
      title: "個人品牌如何從小受眾開始累積影響力：數位花園經營哲學",
      excerpt: "擺脫傳統部落格與社群媒體演算法的焦慮，打造屬於自己的思想苗圃與長期數位資產。",
      category: "Product",
      tags: ["Productivity", "Digital Garden", "Creator Economy"],
      featured: true,
      status: "published",
      readingTime: "5 min",
      coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      publishedAt: "2026-02-28T14:30:00.000Z",
      updatedAt: "2026-03-02T09:00:00.000Z",
      content: `在社群媒體的「串流」（Stream）時代，貼文如同急流中的樹葉，往往在發布後 24 小時內便被時間軸淹沒。這種以注意力為導向的環境，容易讓創作者陷入「頻繁產出但缺乏積累」的焦慮。

## 什麼是「數位花園」(Digital Garden)？

數位花園與傳統時間線為主的部落格最大的不同在於：

* **拓撲結構而非線性流水**：文章之間透過雙向連結與主題網絡交織，隨時可以回頭修剪、補寫與更新。
* **承認半成品（Works in Progress）**：你不需要等到一篇文章完美無缺才發布，可以標記為「幼苗 🌱」、「灌木 🌿」或「常青樹 🌲」。
* **長期價值沉澱**：內容隨時間推移持續產生複利，成為你個人的第二大腦與公開思考的遊樂場。

## 如何建立微受眾的信任？

與其追求百萬點擊，不如專注服務一百位真正理解並產生共鳴的核心讀者。

1. **公開構建（Build in Public）**：誠實分享失敗經驗、架構選擇的權衡，這比光鮮亮麗的成功宣言更有價值。
2. **設計極致純粹的閱讀體驗**：無侵入式廣告、極致的載入效能、舒適的排版字體。尊重讀者的注意力，就是建立品牌聲譽的第一步。`,
    },
  ],
  projects: [
    {
      id: "e-commerce-replatform",
      title: "高併發電商平台核心架構重構",
      description: "主導 200 萬用戶電商前台向 Next.js 與邊緣運算轉移，實現高可靠、低延遲的極致購物體驗。",
      period: "2025.06 - 2025.12",
      role: "Lead Architect & Tech Lead",
      featured: true,
      coverImage: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80",
      metrics: [
        { label: "LCP 載入效能", value: "提升 45%" },
        { label: "伺服器成本", value: "-30%" },
        { label: "轉換率提升", value: "+18.2%" },
      ],
      technologies: ["Next.js", "TypeScript", "Redis", "Tailwind CSS", "Cloudflare Workers"],
      externalUrl: "https://example.com/ecommerce-demo",
      githubUrl: "https://github.com/example/ecommerce-replatform",
      createdAt: new Date("2025-06-01").toISOString(),
      updatedAt: new Date("2025-12-30").toISOString(),
    },
    {
      id: "knowledge-base-app",
      title: "跨平台個人第二大腦與知識庫 App",
      description: "打造結合本機優先 (Local-first) 與端對端加密同步的個人筆記工具，支援雙向連結與離線全文檢索。",
      period: "2025.01 - 2025.05",
      role: "Product Creator & Fullstack Dev",
      featured: true,
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      metrics: [
        { label: "活躍用戶成長", value: "+120%" },
        { label: "本機檢索速度", value: "< 15ms" },
        { label: "用戶留存率", value: "68%" },
      ],
      technologies: ["React", "TypeScript", "IndexedDB", "WebAssembly", "Framer Motion"],
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
    "e-commerce-replatform": {
      slug: "e-commerce-replatform",
      views: 180,
      claps: 35,
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
};

function readLocalStore(): LocalStoreData {
  try {
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      const dir = path.dirname(LOCAL_STORE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(defaultInitialData, null, 2), "utf-8");
      return defaultInitialData;
    }
    const content = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
    const data = JSON.parse(content);
    return {
      ...defaultInitialData,
      ...data,
      articles: data.articles || defaultInitialData.articles,
      projects: data.projects || defaultInitialData.projects,
      profile: {
        ...defaultInitialData.profile,
        ...(data.profile || {}),
        avatarUrl: data.profile?.avatarUrl || defaultInitialData.profile.avatarUrl,
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
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("寫入本地資料庫失敗:", err);
  }
}

/**
 * 統一資料庫服務層 (Data Service)
 * 支援文章、專案、微動態、個人經歷、網站設定等全方位 CRUD 存取
 */
export const dataService = {
  // ================= 1. 文章 (Articles) =================
  async getArticles(includeDrafts = false): Promise<ArticleItem[]> {
    const store = readLocalStore();
    return store.articles
      .filter((a) => includeDrafts || a.status === "published")
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },

  async getArticleBySlug(slug: string): Promise<ArticleItem | null> {
    const store = readLocalStore();
    const article = store.articles.find((a) => a.slug === slug);
    return article || null;
  },

  async saveArticle(input: Partial<ArticleItem> & { slug: string; title: string; content: string }): Promise<ArticleItem> {
    const store = readLocalStore();
    const existingIndex = store.articles.findIndex((a) => a.slug === input.slug);
    const now = new Date().toISOString();

    let saved: ArticleItem;
    if (existingIndex >= 0) {
      saved = {
        ...store.articles[existingIndex],
        ...input,
        updatedAt: now,
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
        publishedAt: input.publishedAt || now,
        updatedAt: now,
      };
      store.articles.unshift(saved);
    }
    writeLocalStore(store);
    return saved;
  },

  async deleteArticle(slug: string): Promise<boolean> {
    const store = readLocalStore();
    const initialLen = store.articles.length;
    store.articles = store.articles.filter((a) => a.slug !== slug);
    if (store.articles.length !== initialLen) {
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  // ================= 2. 專案 (Projects) =================
  async getProjects(): Promise<ProjectItem[]> {
    const store = readLocalStore();
    return store.projects
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getProjectById(id: string): Promise<ProjectItem | null> {
    const store = readLocalStore();
    const project = store.projects.find((p) => p.id === id);
    return project || null;
  },

  async saveProject(input: Partial<ProjectItem> & { id: string; title: string }): Promise<ProjectItem> {
    const store = readLocalStore();
    const existingIndex = store.projects.findIndex((p) => p.id === input.id);
    const now = new Date().toISOString();

    let saved: ProjectItem;
    if (existingIndex >= 0) {
      saved = {
        ...store.projects[existingIndex],
        ...input,
        updatedAt: now,
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
        createdAt: input.createdAt || now,
        updatedAt: now,
      };
      store.projects.unshift(saved);
    }
    writeLocalStore(store);
    return saved;
  },

  async deleteProject(id: string): Promise<boolean> {
    const store = readLocalStore();
    const initialLen = store.projects.length;
    store.projects = store.projects.filter((p) => p.id !== id);
    if (store.projects.length !== initialLen) {
      writeLocalStore(store);
      return true;
    }
    return false;
  },

  // ================= 3. 互動數據 (Engagements) =================
  async getEngagement(slug: string): Promise<EngagementItem> {
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

  async incrementEngagement(slug: string, action: "view" | "clap", count: number = 1): Promise<EngagementItem> {
    const store = readLocalStore();
    if (!store.engagements[slug]) {
      store.engagements[slug] = {
        slug,
        views: 0,
        claps: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    if (action === "view") {
      store.engagements[slug].views += count;
    } else if (action === "clap") {
      store.engagements[slug].claps += count;
    }
    store.engagements[slug].updatedAt = new Date().toISOString();
    writeLocalStore(store);
    return store.engagements[slug];
  },

  // ================= 5. 電子報 (Newsletter) =================
  async getSubscribers(): Promise<SubscriberItem[]> {
    const store = readLocalStore();
    return store.subscribers;
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; alreadySubscribed?: boolean }> {
    const store = readLocalStore();
    const existing = store.subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: true, alreadySubscribed: true };
    }
    const newSub: SubscriberItem = {
      id: "sub-" + Math.random().toString(36).substring(2, 9),
      email,
      status: "active",
      subscribedAt: new Date().toISOString(),
    };
    store.subscribers.push(newSub);
    writeLocalStore(store);
    return { success: true, alreadySubscribed: false };
  },

  // ================= 6. 簡歷與個人檔案 (Profile & Experiences) =================
  async getProfile(): Promise<SiteProfileItem> {
    const store = readLocalStore();
    return store.profile;
  },

  async updateProfile(input: Partial<SiteProfileItem>): Promise<SiteProfileItem> {
    const store = readLocalStore();
    store.profile = {
      ...store.profile,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    writeLocalStore(store);
    return store.profile;
  },

  async getExperiences(): Promise<ExperienceItem[]> {
    const store = readLocalStore();
    return store.experiences.slice().sort((a, b) => a.order - b.order);
  },

  async saveExperience(input: Partial<ExperienceItem> & { role: string; company: string }): Promise<ExperienceItem> {
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
        order: input.order ?? (store.experiences.length + 1),
      };
      store.experiences.push(saved);
    }
    writeLocalStore(store);
    return saved;
  },

  async deleteExperience(id: string): Promise<boolean> {
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
    const store = readLocalStore();
    const totalViews = Object.values(store.engagements).reduce((acc, curr) => acc + curr.views, 0);
    const totalClaps = Object.values(store.engagements).reduce((acc, curr) => acc + curr.claps, 0);

    return {
      totalArticles: store.articles.length,
      publishedArticles: store.articles.filter((a) => a.status === "published").length,
      totalProjects: store.projects.length,
      totalSubscribers: store.subscribers.length,
      totalViews,
      totalClaps,
    };
  },
};
