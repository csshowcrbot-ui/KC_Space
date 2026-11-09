import Link from "next/link";
import { Rss } from "lucide-react";
import { Github, Twitter, Linkedin } from "./Icons";

export function Footer() {
  return (
    <footer className="w-full border-t border-border mt-auto py-12 bg-background transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} KC Space. 保持克制，持續思考與輸出。
          </p>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/75">
            <span>本站建構於 Next.js 14, Tailwind CSS 與 Edge Network.</span>
            <span>·</span>
            <Link href="/admin" className="hover:text-accent transition-colors underline">
              後台維護
            </Link>
          </div>
        </div>

        {/* 社群與訂閱連結 */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors p-1.5"
            aria-label="GitHub 檔案"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors p-1.5"
            aria-label="Twitter / X"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors p-1.5"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
