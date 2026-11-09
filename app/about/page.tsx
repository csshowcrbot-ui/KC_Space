import Link from "next/link";
import { Mail, MapPin, Briefcase, GraduationCap, CheckCircle2, Sparkles } from "lucide-react";
import { Github, Twitter, Linkedin } from "@/components/shared/Icons";
import { NewsletterBox } from "@/components/shared/NewsletterBox";
import { dataService } from "@/db";

export const metadata = {
  title: "關於我 · About & Experience",
  description: "關於 KC 的工程背景、設計哲學、專業經歷與聯絡方式。",
};

const SKILL_GROUPS = [
  {
    category: "核心架構與語言",
    skills: ["TypeScript", "React", "Next.js 14+ (App Router)", "Node.js", "Python", "Go"],
  },
  {
    category: "雲端與邊緣運算",
    skills: ["Cloudflare Workers", "Vercel Edge", "PostgreSQL", "Supabase", "Redis", "Docker"],
  },
  {
    category: "產品與設計體驗",
    skills: ["UI/UX 架構", "Tailwind CSS", "Figma", "設計系統 (Design Systems)", "Web 效能極限優化"],
  },
];

export const revalidate = 60;

export default async function AboutPage() {
  // 從資料庫存取個人個人檔案與履歷經歷
  const profile = await dataService.getProfile();
  const experiences = await dataService.getExperiences();

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* 個人簡介 Header 區塊：圖文並排設計 */}
      <section className="border-b border-border pb-10">
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-8 md:gap-12">
          {/* 左側：文字自述 */}
          <div className="space-y-4 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-badge-bg text-badge-text border border-border/50">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2]">
              哈囉，我是 {profile.name}。
            </h1>

            <div className="text-base sm:text-lg font-medium text-accent">
              {profile.title}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-1">
              一名專注於高併發 Web 架構演進、極致使用者體驗與個人知識管理的資深全端工程師與產品建構者。
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>

            {/* 社交連結 */}
            <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:border-accent transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>寄信聯絡</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 右側：個人形象照卡片 */}
          <div className="flex-shrink-0 relative group">
            <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-3xl overflow-hidden border-2 border-border/80 bg-surface shadow-xl relative transition-transform duration-500 group-hover:scale-[1.02]">
              <img
                src={
                  profile.avatarUrl ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                }
                alt={profile.name}
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
              {/* 底部微漸層遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
              
              {/* 照片角落上的在線狀態 */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-background/85 backdrop-blur-md border border-border/80 text-[11px] font-semibold text-foreground shadow-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>開放交流諮詢</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Taipei</span>
              </div>
            </div>

            {/* 背後柔和環境光暈 */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-accent/20 to-emerald-500/20 rounded-3xl blur-2xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </section>

      {/* 經歷時間軸 (從資料庫動態載入) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-foreground">經歷歷程 (Experience)</h2>
        </div>
        <div className="space-y-6 border-l-2 border-border/80 pl-5 ml-2.5">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative space-y-1.5 group">
              <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-accent ring-4 ring-background" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-accent">{exp.company}</span>
                <span>{exp.period}</span>
              </div>
              <h3 className="text-base font-bold text-foreground">{exp.role}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 技能矩陣 */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-foreground">技能與專長 (Tech & Skills)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SKILL_GROUPS.map((group, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-border bg-surface space-y-3"
            >
              <h4 className="text-xs font-bold text-foreground tracking-wide border-b border-border pb-2">
                {group.category}
              </h4>
              <ul className="space-y-1.5">
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="text-xs text-muted-foreground flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 聯絡我 / 預約談話 (Contact CTA) */}
      <section id="contact" className="space-y-4 p-8 rounded-2xl border border-border bg-surface shadow-xs scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground">聯絡我 · 預約談話</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          目前開放技術顧問諮詢、大型專案架構重構規劃、或是單純的交流分享。歡迎透過下列管道與我取得聯繫：
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
          >
            <Mail className="w-4 h-4" />
            <span>寄信至 {profile.email}</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
        </div>
      </section>

      {/* 電子報訂閱 */}
      <NewsletterBox />
    </div>
  );
}
