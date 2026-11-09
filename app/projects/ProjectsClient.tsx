"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Filter, X, Code2, FolderGit2 } from "lucide-react";
import { Github } from "@/components/shared/Icons";
import type { ProjectItem } from "@/db/schema";

interface ProjectsClientProps {
  projects: ProjectItem[];
}

function ProjectCoverImage({
  src,
  title,
  onClick,
}: {
  src?: string | null;
  title: string;
  onClick?: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        onClick={onClick}
        className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-surface via-muted/60 to-accent/10 border-b border-border/50 flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer group-hover:bg-muted/80 transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-2 shadow-xs group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300">
          <Code2 className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground font-semibold">
          Case Study
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video w-full overflow-hidden bg-muted cursor-pointer"
      onClick={onClick}
    >
      <img
        src={src}
        alt=""
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    </div>
  );
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [selectedTech, setSelectedTech] = useState<string>("全部");

  // 取得所有出現過的技術標籤
  const allTechs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.technologies?.forEach((t) => set.add(t)));
    return ["全部", ...Array.from(set)];
  }, [projects]);

  // 過濾專案
  const filteredProjects = useMemo(() => {
    if (selectedTech === "全部") return projects;
    return projects.filter((p) => p.technologies?.includes(selectedTech));
  }, [projects, selectedTech]);

  return (
    <div className="space-y-6">
      {/* 技術標籤篩選列 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1 flex-shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>篩選技術：</span>
        </div>
        {allTechs.map((tech) => (
          <button
            key={tech}
            onClick={() => setSelectedTech(tech)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
              selectedTech === tech
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      {/* 專案卡片網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-accent/60 transition-all duration-300 hover:shadow-lg flex flex-col h-full"
          >
            {/* 封面圖 / 優雅科技風橫幅 */}
            <ProjectCoverImage
              src={project.coverImage}
              title={project.title}
              onClick={() => setActiveProject(project)}
            />

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.period}</span>
                  <span className="font-semibold text-accent">{project.role}</span>
                </div>
                <h2
                  onClick={() => setActiveProject(project)}
                  className="text-xl font-bold text-foreground group-hover:text-accent transition-colors cursor-pointer"
                >
                  {project.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* 量化指標 (Metrics) */}
              {project.metrics && project.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {project.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-badge-bg border border-border/50 text-center"
                    >
                      <div className="text-[11px] text-muted-foreground line-clamp-1">
                        {metric.label}
                      </div>
                      <div className="text-sm font-bold text-accent mt-0.5">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 技術棧與操作按鈕 */}
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies?.slice(0, 3).map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setSelectedTech(tech)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground font-mono transition-colors"
                    >
                      {tech}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="GitHub 原始碼"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.externalUrl && (
                    <a
                      href={project.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition-colors shadow-xs"
                    >
                      <span>Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 專案詳情 Modal 彈窗 */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="關閉視窗"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-xs font-semibold text-accent mb-1">
                {activeProject.period} · {activeProject.role}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeProject.title}
              </h2>
            </div>

            <div className="rounded-xl overflow-hidden border border-border">
              <ProjectCoverImage
                src={activeProject.coverImage}
                title={activeProject.title}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                專案概述與核心突破
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {activeProject.description}
              </p>
            </div>

            {activeProject.metrics && activeProject.metrics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  核心成效指標 (Impact Metrics)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeProject.metrics.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-badge-bg border border-border/60 text-center"
                    >
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                      <div className="text-base font-bold text-accent mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                關鍵技術棧
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeProject.technologies?.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-lg bg-muted text-foreground font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              {activeProject.githubUrl && (
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub 專案庫
                </a>
              )}
              {activeProject.externalUrl && (
                <a
                  href={activeProject.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
                >
                  開啟線上 Demo
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
