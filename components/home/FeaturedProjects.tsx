"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderGit2, TrendingUp, Code2 } from "lucide-react";
import type { ProjectItem } from "@/db/schema";

interface FeaturedProjectsProps {
  projects: ProjectItem[];
}

function FeaturedCoverImage({
  src,
  title,
}: {
  src?: string | null;
  title: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-surface via-muted/60 to-accent/10 border-b border-border/50 flex flex-col items-center justify-center p-6 text-center select-none group-hover:bg-muted/80 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-1.5 shadow-xs group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300">
          <Code2 className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground font-semibold">
          Featured Work
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
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

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const featured = projects.filter((p) => p.featured).slice(0, 2);

  return (
    <section className="py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            精選專案成果 (Featured Work)
          </h2>
        </div>
        <Link
          href="/projects"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
        >
          <span>查看全部專案</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {featured.map((project) => (
          <div
            key={project.id}
            className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-md flex flex-col h-full"
          >
            {/* 封面圖片 / 一致性橫幅 */}
            <FeaturedCoverImage src={project.coverImage} title={project.title} />

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.period}</span>
                  <span className="font-medium text-accent">{project.role}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* 量化成果指標 (Metrics) */}
              {project.metrics && project.metrics.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-badge-bg text-[11px] font-medium text-foreground border border-border/40"
                    >
                      <TrendingUp className="w-3 h-3 text-accent" />
                      <span className="text-muted-foreground">{metric.label}:</span>
                      <span className="font-semibold text-accent">{metric.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 技術棧標籤與外連 */}
              <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      #{tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {project.externalUrl && (
                    <a
                      href={project.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5"
                    >
                      <span>檢視展示</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
