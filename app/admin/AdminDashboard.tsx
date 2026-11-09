"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  User,
  Lock,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  X,
  ExternalLink,
  Eye,
  Heart,
  Users,
  LogOut,
  FolderGit2,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import type {
  ArticleItem,
  ProjectItem,
  SiteProfileItem,
  ExperienceItem,
} from "@/db/schema";

interface ImageUploaderProps {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  aspectRatio?: "video" | "square";
  helpText?: string;
}

function ImageUploader({
  label,
  value,
  onChange,
  aspectRatio = "video",
  helpText,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUploadFile = async (file: File) => {
    setErrorMsg(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "圖片上傳失敗");
      }

      onChange(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || "上傳發生錯誤");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-foreground">
        {label}
      </label>

      {value ? (
        <div className="space-y-2">
          <div
            className={`relative ${
              aspectRatio === "square" ? "w-28 h-28" : "w-full aspect-video"
            } rounded-xl overflow-hidden bg-muted border border-border group`}
          >
            <img
              src={value}
              alt="預覽圖片"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 hover:bg-rose-600 text-white text-xs transition-colors shadow-sm flex items-center gap-1"
              title="清除圖片"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">移除</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value || null)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-mono text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="圖片連結網址..."
            />
            <label className="px-3 py-1.5 rounded-lg bg-muted border border-border hover:bg-muted/80 text-foreground text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 flex-shrink-0">
              <Upload className="w-3.5 h-3.5 text-accent" />
              <span>替換本機圖片</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 transition-all text-center flex flex-col items-center justify-center ${
            isDragging
              ? "border-accent bg-accent/10"
              : "border-border/80 hover:border-accent/50 bg-background/50 hover:bg-muted/30"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 text-accent text-xs font-medium py-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>正在上傳圖片中，請稍候...</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-1">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="text-xs text-foreground font-medium">
                點擊選擇或將圖片拖曳至此處
              </div>
              <p className="text-[11px] text-muted-foreground">
                支援 PNG, JPG, WebP, SVG, GIF (上限 10MB)
              </p>
              <div className="pt-2">
                <label className="px-3.5 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold cursor-pointer hover:bg-accent-hover transition-colors shadow-xs inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>從電腦選擇檔案上傳</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="w-full mt-3 pt-3 border-t border-border/40">
            <input
              type="text"
              placeholder="或在此直接貼上網路圖片網址 (URL)..."
              onChange={(e) => {
                if (e.target.value.trim()) onChange(e.target.value.trim());
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
      )}
      {helpText && (
        <p className="text-[11px] text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminKey, setAdminKey] = useState<string>("");
  const [loginInput, setLoginInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "articles" | "projects" | "profile">("overview");

  // 狀態與資料
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [profile, setProfile] = useState<SiteProfileItem | null>(null);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 編輯狀態
  const [editingArticle, setEditingArticle] = useState<Partial<ArticleItem> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [editingExp, setEditingExp] = useState<Partial<ExperienceItem> | null>(null);

  // 檢查登入
  useEffect(() => {
    const savedKey = localStorage.getItem("kc_admin_key");
    if (savedKey) {
      setAdminKey(savedKey);
      setIsAuthenticated(true);
    }
  }, []);

  // 載入資料
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, artRes, projRes, profRes, expRes] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/articles?all=true").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
        fetch("/api/admin/profile").then((r) => r.json()),
        fetch("/api/admin/experiences").then((r) => r.json()),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (artRes.data) setArticles(artRes.data);
      if (projRes.data) setProjects(projRes.data);
      if (profRes.data) setProfile(profRes.data);
      if (expRes.data) setExperiences(expRes.data);
    } catch (err) {
      console.error("載入後台資料失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.trim()) {
      localStorage.setItem("kc_admin_key", loginInput.trim());
      setAdminKey(loginInput.trim());
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kc_admin_key");
    setIsAuthenticated(false);
    setAdminKey("");
  };

  // ================= 文章操作 =================
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title || !editingArticle.slug || !editingArticle.content) {
      showToast("標題、Slug 與內容不可為空", "error");
      return;
    }

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(editingArticle),
      });

      if (res.ok) {
        showToast("文章已成功儲存至資料庫！");
        setEditingArticle(null);
        loadAllData();
      } else {
        showToast("儲存文章失敗", "error");
      }
    } catch {
      showToast("網路異常", "error");
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm(`確定要從資料庫刪除文章「${slug}」嗎？此動作無法復原。`)) return;

    try {
      const res = await fetch(`/api/articles/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (res.ok) {
        showToast("文章已刪除");
        loadAllData();
      } else {
        showToast("刪除失敗", "error");
      }
    } catch {
      showToast("網路連線錯誤", "error");
    }
  };

  // ================= 專案操作 =================
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.id || !editingProject.title) {
      showToast("專案 ID 與標題為必填", "error");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(editingProject),
      });

      if (res.ok) {
        showToast("專案成果已成功更新至資料庫！");
        setEditingProject(null);
        loadAllData();
      } else {
        showToast("儲存專案失敗", "error");
      }
    } catch {
      showToast("網路連線錯誤", "error");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm(`確定要刪除專案「${id}」嗎？`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (res.ok) {
        showToast("專案已刪除");
        loadAllData();
      } else {
        showToast("刪除專案失敗", "error");
      }
    } catch {
      showToast("連線錯誤", "error");
    }
  };

  // ================= 個人檔案與 /now 操作 =================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        showToast("個人檔案與 /now 現況已更新！");
        loadAllData();
      } else {
        showToast("更新失敗", "error");
      }
    } catch {
      showToast("連線失敗", "error");
    }
  };

  // ================= 經歷操作 =================
  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp || !editingExp.company || !editingExp.role) {
      showToast("公司與角色為必填", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingExp),
      });
      if (res.ok) {
        showToast("工作經歷已儲存！");
        setEditingExp(null);
        loadAllData();
      }
    } catch {
      showToast("連線失敗", "error");
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm("確定要刪除此工作經歷？")) return;
    try {
      const res = await fetch(`/api/admin/experiences?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("經歷已刪除");
        loadAllData();
      }
    } catch {
      showToast("刪除失敗", "error");
    }
  };

  // 未登入畫面
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl border border-border bg-surface shadow-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">管理員認證</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            請輸入管理密鑰以維護關於我、專案成果、深度文章等全站資料庫內容。
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              管理員安全密鑰 (ADMIN_SECRET_KEY)
            </label>
            <input
              type="password"
              placeholder="預設密鑰：kc-space-admin-key"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent-hover transition-colors shadow-sm"
          >
            驗證並進入後台
          </button>
        </form>

        <div className="p-3 rounded-lg bg-badge-bg border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
          💡 <strong>開發測試提示</strong>：系統預設密鑰為 <code className="text-accent font-mono">kc-space-admin-key</code>。
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 提示 Toast */}
      {message && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* 後台頂部 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              後台管理系統 · Dashboard
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            資料庫直連維護：深度文章、專案成果、關於我與現況看板。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-muted text-foreground transition-colors"
          >
            {loading ? "更新中..." : "重新整理"}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>登出</span>
          </button>
        </div>
      </div>

      {/* 頁籤導覽列 */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "overview"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>全站總覽</span>
        </button>

        <button
          onClick={() => setActiveTab("articles")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "articles"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>深度文章維護 ({articles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "projects"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>專案成果維護 ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "profile"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <User className="w-4 h-4" />
          <span>關於我與現況</span>
        </button>
      </div>

      {/* ================= 頁籤 1：全站總覽 ================= */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>深度文章</span>
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-extrabold text-foreground">{stats.totalArticles} 篇</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                已公開 {stats.publishedArticles} 篇
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>專案成果</span>
                <Briefcase className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl font-extrabold text-foreground">{stats.totalProjects} 個</div>
              <div className="text-[11px] text-muted-foreground mt-1">展示核心案例</div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>總閱覽與拍手</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-foreground">{stats.totalClaps} 次</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                累積 {stats.totalViews} 次點閱
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>電子報訂閱者</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-foreground">{stats.totalSubscribers} 位</div>
              <div className="text-[11px] text-muted-foreground mt-1">核心忠實讀者</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-surface space-y-3">
            <h3 className="text-base font-bold text-foreground">快速快捷管理引導</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveTab("articles");
                  setEditingArticle({
                    title: "",
                    slug: "new-article-" + Date.now().toString(36),
                    category: "Engineering",
                    tags: ["Architecture"],
                    excerpt: "",
                    content: "在這裡撰寫 Markdown 內文...",
                    status: "published",
                    readingTime: "5 min",
                  });
                }}
                className="p-4 rounded-xl border border-border hover:border-accent/60 bg-background text-left transition-colors"
              >
                <div className="text-xs font-bold text-accent">+ 發布新文章</div>
                <div className="text-[11px] text-muted-foreground mt-1">撰寫 Markdown 並即時入庫</div>
              </button>

              <button
                onClick={() => {
                  setActiveTab("projects");
                  setEditingProject({
                    id: "project-" + Date.now().toString(36),
                    title: "",
                    description: "",
                    period: "2026",
                    role: "Lead Architect",
                    featured: true,
                    metrics: [{ label: "成效指標", value: "+50%" }],
                    technologies: ["Next.js", "TypeScript"],
                  });
                }}
                className="p-4 rounded-xl border border-border hover:border-accent/60 bg-background text-left transition-colors"
              >
                <div className="text-xs font-bold text-accent">+ 新增專案成果</div>
                <div className="text-[11px] text-muted-foreground mt-1">建立作品集案例與量化指標</div>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className="p-4 rounded-xl border border-border hover:border-accent/60 bg-background text-left transition-colors"
              >
                <div className="text-xs font-bold text-accent">✎ 編輯 /now 現況與簡介</div>
                <div className="text-[11px] text-muted-foreground mt-1">更新當前正在進行的研究與經歷</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 頁籤 2：深度文章維護 ================= */}
      {activeTab === "articles" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">文章列表管理</h2>
            <button
              onClick={() =>
                setEditingArticle({
                  title: "",
                  slug: "new-article-" + Date.now().toString(36),
                  category: "Engineering",
                  tags: ["Architecture"],
                  excerpt: "",
                  content: "## 1. 簡介\n\n在此撰寫文章內文...",
                  status: "published",
                  readingTime: "5 min",
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>撰寫新文章</span>
            </button>
          </div>

          {/* 文章編輯 Modal */}
          {editingArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-surface border border-border rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-foreground">
                    {editingArticle.id ? "編輯文章" : "撰寫新文章 (入資料庫)"}
                  </h3>
                  <button
                    onClick={() => setEditingArticle(null)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveArticle} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        文章標題 (Title)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingArticle.title || ""}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Slug (網址唯一路徑)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingArticle.slug || ""}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        分類 (Category)
                      </label>
                      <input
                        type="text"
                        value={editingArticle.category || "Engineering"}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, category: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        閱讀時間估計
                      </label>
                      <input
                        type="text"
                        value={editingArticle.readingTime || "5 min"}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, readingTime: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        發布狀態 (Status)
                      </label>
                      <select
                        value={editingArticle.status || "published"}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            status: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="published">公開發布 (published)</option>
                        <option value="draft">草稿 (draft)</option>
                        <option value="archived">已封存 (archived)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      文章標籤 (以逗點分隔，如: Architecture, TypeScript)
                    </label>
                    <input
                      type="text"
                      value={editingArticle.tags?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <ImageUploader
                    label="文章封面圖片 (Cover Image - 選填)"
                    value={editingArticle.coverImage}
                    onChange={(url) =>
                      setEditingArticle({ ...editingArticle, coverImage: url })
                    }
                    helpText="支援上傳本地圖片或輸入外連網址；可留空。"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      文章摘要 (Excerpt)
                    </label>
                    <textarea
                      rows={2}
                      value={editingArticle.excerpt || ""}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      正文內容 (Markdown 語法)
                    </label>
                    <textarea
                      rows={12}
                      required
                      value={editingArticle.content || ""}
                      onChange={(e) =>
                        setEditingArticle({ ...editingArticle, content: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditingArticle(null)}
                      className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>儲存至資料庫</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 文章清單 Table */}
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">標題與 Slug</th>
                  <th className="p-4">分類</th>
                  <th className="p-4">狀態</th>
                  <th className="p-4">發布日期</th>
                  <th className="p-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((art) => (
                  <tr key={art.slug} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-foreground">{art.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">/writings/{art.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-badge-bg text-badge-text text-xs">
                        {art.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          art.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(art.publishedAt).toLocaleDateString("zh-TW")}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingArticle(art)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-accent transition-colors"
                        title="編輯"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.slug)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 頁籤 3：專案成果維護 ================= */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">專案作品管理</h2>
            <button
              onClick={() =>
                setEditingProject({
                  id: "project-" + Date.now().toString(36),
                  title: "",
                  description: "",
                  period: "2026.01 - 至今",
                  role: "Tech Lead",
                  featured: true,
                  metrics: [{ label: "成效指標", value: "+40%" }],
                  technologies: ["Next.js", "TypeScript"],
                  externalUrl: "",
                  githubUrl: "",
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>新增專案成果</span>
            </button>
          </div>

          {/* 專案編輯 Modal */}
          {editingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-foreground">維護專案成果</h3>
                  <button
                    onClick={() => setEditingProject(null)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        專案唯一 ID
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProject.id || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, id: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        專案標題 (Title)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProject.title || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        擔當角色 (Role)
                      </label>
                      <input
                        type="text"
                        value={editingProject.role || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, role: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        執行區間 (Period)
                      </label>
                      <input
                        type="text"
                        value={editingProject.period || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, period: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      專案痛點與成效概述 (Description)
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.description || ""}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, description: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    />
                  </div>

                  {/* 量化指標動態陣列 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-foreground">
                        核心量化指標 (Impact Metrics)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            metrics: [
                              ...(editingProject.metrics || []),
                              { label: "新指標", value: "+20%" },
                            ],
                          })
                        }
                        className="text-xs text-accent font-semibold hover:underline"
                      >
                        + 增加指標
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editingProject.metrics?.map((m, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="指標名稱 (如: LCP 載入效能)"
                            value={m.label}
                            onChange={(e) => {
                              const newM = [...(editingProject.metrics || [])];
                              newM[idx].label = e.target.value;
                              setEditingProject({ ...editingProject, metrics: newM });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                          />
                          <input
                            type="text"
                            placeholder="數值 (如: 提升 45%)"
                            value={m.value}
                            onChange={(e) => {
                              const newM = [...(editingProject.metrics || [])];
                              newM[idx].value = e.target.value;
                              setEditingProject({ ...editingProject, metrics: newM });
                            }}
                            className="w-32 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-bold text-accent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newM = editingProject.metrics?.filter((_, i) => i !== idx);
                              setEditingProject({ ...editingProject, metrics: newM });
                            }}
                            className="p-1.5 text-muted-foreground hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ImageUploader
                    label="專案封面圖片 (Cover Image)"
                    value={editingProject.coverImage}
                    onChange={(url) =>
                      setEditingProject({
                        ...editingProject,
                        coverImage: url,
                      })
                    }
                    helpText="支援上傳本地圖片或輸入外連網址；留空將自動套用質感科技橫幅。"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      技術棧 (以逗點分隔)
                    </label>
                    <input
                      type="text"
                      value={editingProject.technologies?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        線上 Demo 網址
                      </label>
                      <input
                        type="url"
                        value={editingProject.externalUrl || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, externalUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        GitHub 專案庫網址
                      </label>
                      <input
                        type="url"
                        value={editingProject.githubUrl || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, githubUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>儲存專案</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 專案卡片列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{proj.period}</span>
                    <span className="text-accent font-semibold">{proj.role}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{proj.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground font-mono">ID: {proj.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProject(proj)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-accent transition-colors"
                      title="編輯"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 頁籤 4：關於我與現況維護 ================= */}
      {activeTab === "profile" && profile && (
        <div className="space-y-8 max-w-2xl">
          {/* 基本檔案與 /now 看板表單 */}
          <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl border border-border bg-surface space-y-4">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-2">
              基本檔案與 /now 現況看板
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">姓名 / 品牌稱呼</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">所在城市 / 工作模式</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">專業職稱頭銜 (Title)</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">公開聯絡 Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <ImageUploader
              label="個人形象照 / 頭像 (Avatar Photo)"
              value={profile.avatarUrl}
              onChange={(url) => setProfile({ ...profile, avatarUrl: url || "" })}
              aspectRatio="square"
              helpText="支援上傳本機大頭照或輸入外連網址。"
            />

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">自述個人簡介 (Bio)</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-badge-bg border border-border space-y-3">
              <div className="text-xs font-bold text-accent">🟢 /now 現況看板 (首頁即時顯示)</div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">目前正在關注／研究的主題</label>
                <input
                  type="text"
                  value={profile.nowStatus}
                  onChange={(e) => setProfile({ ...profile, nowStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">更新季度標示</label>
                <input
                  type="text"
                  value={profile.nowUpdateSeason}
                  onChange={(e) => setProfile({ ...profile, nowUpdateSeason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>儲存基本檔案與現況</span>
              </button>
            </div>
          </form>

          {/* 工作經歷維護 */}
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-bold text-foreground">工作經歷時間軸維護</h3>
              <button
                onClick={() =>
                  setEditingExp({
                    company: "",
                    role: "",
                    period: "2024 - 至今",
                    description: "",
                    order: experiences.length + 1,
                  })
                }
                className="text-xs text-accent font-semibold hover:underline"
              >
                + 新增工作經歷
              </button>
            </div>

            {editingExp && (
              <form onSubmit={handleSaveExp} className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <div className="text-xs font-bold text-accent">填寫經歷內容</div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="公司名稱"
                    value={editingExp.company || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="擔當角色"
                    value={editingExp.role || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="執行期間 (如: 2023 - 至今)"
                  value={editingExp.period || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="職責與技術貢獻描述..."
                  value={editingExp.description || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingExp(null)}
                    className="px-3 py-1 rounded-lg border border-border text-xs text-muted-foreground"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-semibold"
                  >
                    儲存經歷
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl border border-border bg-background flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">{exp.company}</span> · {exp.role} ({exp.period})
                    </div>
                    <p className="text-xs text-muted-foreground">{exp.description}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingExp(exp)}
                      className="p-1 text-muted-foreground hover:text-accent"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExp(exp.id)}
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

