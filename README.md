# KC Space · 個人品牌數位花園系統 (Digital Garden & Showcase)

本專案依據 `code_artifact.md` 與 `ui_ux.md` 之高規格設計與架構規格打造，採用現代化 Jamstack / Hybrid 架構設計，強調極致首頁載入速度（LCP < 1.0s）、優秀的 SEO 爬取能力，全站內容**全面以資料庫方式進行存取**，並內建**視覺化管理後台系統**。

---

## 🌟 核心功能特色

1. **視覺化管理後台系統（Admin Dashboard）**：
   - 存取路徑：`/admin`。
   - **全站總覽儀表板**：即時掌握文章數、專案數、微動態、訂閱名單人數與累積閱讀/拍手量。
   - **深度文章維護**：支援即時 Markdown 編輯、草稿/公開/封存狀態切換、分類與標籤設定、直接入庫與刪除。
   - **專案成果維護**：維護作品集、量化成果指標（Impact Metrics 動態新增/刪除）、技術棧與外連網址。
   - **關於我與現況看板**：維護個人經歷時間軸、修改職稱簡介，並可**即時修改首頁 `/now` 當前專注研究看板**！
   - **微動態管理**：即時檢視與刪除動態速寫。
2. **全站資料庫架構（Hybrid DB Layer）**：
   - 定義 Drizzle ORM 與 PostgreSQL Schema（`articles`、`projects`、`feeds`、`engagements`、`subscribers`、`experiences`、`site_profiles`）。
   - 支援本地檔案儲存（`data/local-store.json`）與外部 PostgreSQL / Supabase 無縫切換，開箱即用！
3. **清新簡約視覺系統（Clean & Minimalist Modern）**：
   - 嚴格依照設計規範之色彩計畫（支援淺色與深色模式）。
   - 浮動閱讀目錄（Sticky Mini-TOC）與頁面頂部閱讀進度條（Scroll Progress Bar）。
   - 拍手喝采彩帶動態（Confetti Micro-interaction）。

---

## 🚀 快速開始

### 1. 安裝相依套件

```bash
npm install
```

### 2. 環境變數設定

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

> **後台預設密鑰**：`ADMIN_SECRET_KEY="kc-space-admin-key"`

### 3. 本地啟動開發伺服器

```bash
npm run dev
```

* 網站首頁：[http://localhost:3000](http://localhost:3000)
* 管理後台：[http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📂 目錄架構

```
KC_Space/
├── app/                          # Next.js App Router 頁面與 API
│   ├── (site)/                   # 公開展示頁面 (Home, Writings, Projects, Feed, About)
│   ├── admin/                    # 管理後台介面 (Admin Dashboard)
│   ├── api/                      # RESTful Route Handlers (Articles, Projects, Feeds, Profile...)
│   ├── layout.tsx                # 全站根版型 (Navbar, Footer, Theme)
│   └── globals.css               # 設計系統 Token 與樣式
├── components/                   # UI 元件庫
│   ├── content/                  # MDX 閱讀器、TOC、進度條
│   ├── home/                     # 首頁 Hero、現況看板、精選作品
│   └── shared/                   # 導航列、頁尾、拍手鈕、主題切換
├── data/                         # 本機持久化資料庫 (local-store.json)
├── db/                           # 資料庫層 (Schema 定義與 DataService)
└── lib/                          # 工具函式庫 (日期格式化、樣式整合)
```
