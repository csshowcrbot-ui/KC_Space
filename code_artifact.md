# 個人品牌網站系統開發規格與技術架構文件 (Technical Specification)

## 1. 系統架構總覽 (Architecture Overview)

本專案採用現代化 Jamstack / Hybrid 架構設計，強調極致首頁載入速度（LCP < 1.0s）、優秀的 SEO 爬取能力，以及最低維護成本的資料持久化策略。

```
+--------------------------------------------------------------------------+
|                              用戶端 (Client)                             |
|  Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui + Framer Motion     |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
|                         邊緣運算與路由層 (Edge Layer)                     |
|  Vercel Edge Network / Cloudflare CDN (快取、動態 OG 生成、ISR 重新驗證)  |
+--------------------------------------------------------------------------+
          │                                            │
          ▼                                            ▼
+-----------------------+                    +-----------------------------+
| 靜態內容 (Git-backed) |                    | 動態微服務 (API & DB)        |
| - 長篇深度文章 (MDX)  |                    | - 微動態 (Feed / Notes)     |
| - 專案作品集 (JSON)   |                    | - 互動數據 (按讚/閱覽次數)   |
| - 個人簡介與經歷      |                    | - 電子報訂閱 (Newsletter)   |
| (Contentlayer / Velite|                    | (Supabase / PostgreSQL)     |
+-----------------------+                    +-----------------------------+
```

### 1.1 核心技術選型 (Tech Stack)

* **前端框架**：Next.js 14+ (App Router, React Server Components)
* **樣式工具**：Tailwind CSS v3+、`tailwind-merge`、`clsx`
* **UI 元件庫**：Radix UI 原語封裝 (`shadcn/ui`)、Lucide React 圖標庫
* **動態動畫**：Framer Motion
* **長篇內容管理**：Velite / Contentlayer (MDX 解析、Frontmatter 型別校驗、代碼高亮 `rehype-pretty-code`)
* **動態資料庫與認證**：Supabase (PostgreSQL) + Drizzle ORM
* **檔案儲存 (Assets)**：Cloudflare R2 或 Supabase Storage (WebP/AVIF 自動壓縮)
* **部署環境**：Vercel (支援 Incremental Static Regeneration - ISR)

---

## 2. 資料結構設計 (Database Schema & Content Modeling)

系統內容採用「雙軌制」：
1. **靜態內容（文章、成果）**：以 Markdown/MDX 存放在代碼庫，具備版本歷程與嚴格型別檢查。
2. **動態內容（微動態、讀者互動）**：存放於 PostgreSQL 資料庫。

### 2.1 靜態 Frontmatter 規格 (MDX)

#### 文章 (Articles) - `content/articles/*.mdx`
```yaml
---
title: "如何透過漸進式重構降低技術債務"
slug: "progressive-refactoring-guide"
publishedAt: "2026-03-15T10:00:00Z"
updatedAt: "2026-03-18T14:20:00Z"
excerpt: "大型單體架構遷移並非一蹴可幾，本文探討如何透過 Strangler Fig 模式平滑過渡。"
coverImage: "/images/posts/refactor-architecture.webp"
category: "Engineering"
tags: ["Refactoring", "Architecture", "TypeScript"]
featured: true
status: "published" # draft | published | archived
---
```

#### 成果案例 (Projects) - `content/projects/*.json`
```json
{
  "id": "e-commerce-replatform",
  "title": "高併發電商平台核心架構重構",
  "description": "主導 200 萬用戶電商前台向 Next.js 與邊緣運算轉移。",
  "period": "2025.06 - 2025.12",
  "role": "Lead Architect & Tech Lead",
  "featured": true,
  "metrics": [
    { "label": "LCP 載入效能", "value": "提升 45%" },
    { "label": "伺服器成本", "value": "-30%" }
  ],
  "technologies": ["Next.js", "TypeScript", "Redis", "Tailwind CSS"],
  "externalUrl": "https://example.com",
  "githubUrl": "https://github.com/example/repo"
}
```

### 2.2 動態資料庫綱要 (PostgreSQL Schema)

使用 Drizzle ORM 定義如下表結構：

```typescript
// schema.ts
import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";

// 1. 微動態/短篇靈感 (Feed / Snippets)
export const feeds = pgTable("feeds", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"), // 單張圖片或短影音
  tags: text("tags").array(), // 標籤：['#架構思考', '#閱讀短評']
  isPinned: boolean("is_pinned").default(false).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. 頁面統計與按讚計數 (Engagements)
export const engagements = pgTable("engagements", {
  slug: text("slug").primaryKey(), // 可對應 article slug 或 project id
  views: integer("views").default(0).notNull(),
  claps: integer("claps").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. 電子報訂閱名單 (Newsletter Subscribers)
export const subscribers = pgTable("subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  status: text("status").default("active").notNull(), // pending | active | unsubscribed
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});
```

---

## 3. 核心 API 規格 (API Specifications)

全站採用 Next.js Route Handlers (`app/api/*`)。

### 3.1 微動態列表與新增
* **獲取微動態**
  * `GET /api/feeds?limit=10&cursor=<timestamp>`
  * **Response**:
    ```json
    {
      "data": [
        {
          "id": "c1f7...",
          "content": "好設計是盡可能無設計（Less, but better）。",
          "tags": ["#設計隨筆"],
          "likeCount": 18,
          "createdAt": "2026-03-20T08:00:00Z"
        }
      ],
      "nextCursor": "2026-03-10T12:00:00Z"
    }
    ```

* **發布微動態 (受認證保護)**
  * `POST /api/feeds`
  * **Headers**: `Authorization: Bearer <ADMIN_SECRET_TOKEN>`
  * **Body**: `{ "content": string, "mediaUrl"?: string, "tags"?: string[] }`
  * **Status**: `201 Created`

### 3.2 互動反饋 (Clap / View)
* **遞增閱讀量 / 拍手**
  * `POST /api/engagements/[slug]`
  * **Body**: `{ "action": "clap" | "view", "count"?: number }`
  * **限制**: 針對 IP 進行 Rate Limiting (Upstash Redis, 單 IP 每分鐘最多 20 次拍手)。

### 3.3 電子報訂閱
* `POST /api/newsletter`
* **Body**: `{ "email": "reader@example.com" }`
* **處理邏輯**: 串接 Resend / ConvertKit API，成功後寫入本地資料庫並回傳 `200 OK`。

---

## 4. 專案目錄結構規劃 (Repository Structure)

```
my-personal-brand/
├── app/                          # Next.js App Router 頁面
│   ├── (site)/                   # 公開展示頁面
│   │   ├── page.tsx              # 首頁 (Home Dashboard)
│   │   ├── writings/             # 深度文章列表與詳情
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── projects/             # 專案作品集
│   │   ├── feed/                 # 微動態牆
│   │   └── about/                # 關於我 / 履歷
│   ├── api/                      # 後端 API 接口
│   ├── sitemap.ts                # 動態產生站點地圖
│   ├── robots.ts                 # 爬蟲設定
│   └── layout.tsx                # 全站外框 (Navbar, Footer, Providers)
├── components/                   # UI 元件
│   ├── ui/                       # shadcn/ui 基礎元件 (button, card, dialog)
│   ├── home/                     # 首頁專用區塊 (Hero, NowStatus, BentoGrid)
│   ├── content/                  # MDX 自訂渲染元件 (CodeBlock, Callout, ZoomImage)
│   └── shared/                   # 通用元件 (ThemeToggle, ClapButton, Navbar)
├── content/                      # 靜態資料庫
│   ├── articles/                 # .mdx 文章檔案
│   └── projects/                 # .json 專案資料
├── db/                           # 資料庫連線與 ORM
│   ├── index.ts
│   └── schema.ts
├── lib/                          # 工具函式
│   ├── mdx.ts                    # MDX 內容聚合與搜尋索引
│   └── utils.ts
├── public/                       # 靜態資源 (圖片、Favicon)
├── tailwind.config.ts            # Tailwind 設定
└── next.config.mjs
```

---

## 5. 關鍵功能實作細節

### 5.1 漸進式靜態生成 (ISR) 策略
* **靜態頁面**：文章詳情頁使用 `generateStaticParams` 於建置期 (Build Time) 生成靜態 HTML。
* **動態數據合流**：
  * 文章內文為靜態快取。
  * 文章底部的「閱讀數」與「拍手數」透過 SWR / React Query 在客戶端向 `/api/engagements/[slug]` 發起非同步取得，保證快取不會因數據跳動而失效。

### 5.2 SEO 與動態 OG 影像生成
* 使用 Next.js 内建的 `ImageResponse` (`@vercel/og`)。
* 路由：`app/writings/[slug]/opengraph-image.tsx`。
* 動態抓取文章標題、標籤與閱讀時間，即時生成 1200x630 的簡約風格社群分享預覽圖。

### 5.3 代碼塊高亮與語法渲染
* 使用 `rehype-pretty-code` 搭配 VS Code 主題（如 `github-dark-dimmed` 與 `github-light`）。
* 內建支援「一鍵複製代碼」、「檔案名稱標題列」與「行號標註」。

---

## 6. 非功能性需求與指標 (NFRs)

| 評估維度 | 目標值 | 驗證方式 |
| :--- | :--- | :--- |
| **Lighthouse 效能** | 95+ (Performance, Accessibility, SEO) | Chrome DevTools Lighthouse / PageSpeed |
| **首屏載入 (LCP)** | < 1.0s (桌機), < 1.8s (行動端) | Web Vitals 遙測 |
| **累計版面位移 (CLS)**| < 0.05 | 圖片與字型強制設定寬高與 `font-display: swap` |
| **安全防護** | Content Security Policy (CSP), CORS 限制 | 安全標頭檢查 (securityheaders.com) |
| **存取可用性 (a11y)**| 符合 WCAG 2.1 AA 標準 | 色彩對比度大於 4.5:1，完整支援鍵盤 Focus |

---

## 7. 開發與部署流程 (CI/CD)

### 7.1 本地開發環境準備
1. **環境變數設定 (`.env.local`)**：
   ```env
   DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ADMIN_SECRET_KEY="your-secure-secret-key"
   RESEND_API_KEY="re_..."
   ```
2. **安裝依賴與資料庫遷移**：
   ```bash
   pnpm install
   pnpm db:push
   ```
3. **啟動本機伺服器**：
   ```bash
   pnpm dev
   ```

### 7.2 發布與自動化流水線
* **GitHub Actions**：
  * 每次提交至 `main` 時自動執行 `pnpm typecheck` 與 `pnpm lint`。
  * 自動建置並校驗 MDX 檔案格式與 Broken Links。
* **Vercel 自動部署**：
  * 偵測代碼提交即刻觸發預覽分支 (Preview Deployment)。
  * 主分支合併後自動發布至生產環境 CDN 邊緣節點。
```

這份開發文件完整梳理了個人品牌網站的架構選型、資料模型、API 接口及工程落地細節。你可以直接以此架構開始初始化 Next.js 專案。如果需要先行撰寫特定模組的樣板代碼（例如 MDX 解析器或資料庫介面），請隨時告訴我！