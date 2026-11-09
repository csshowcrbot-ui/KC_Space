"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface ArticleReaderProps {
  content: string;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border bg-[#12141A] text-slate-200 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#181B22] border-b border-border/40 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-accent" />
          <span>{language || "snippet"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="複製代碼"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">已複製</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>複製</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03]">
                <td className="pr-4 select-none text-right text-slate-600 text-xs w-8 align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre">{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ArticleReader({ content }: ArticleReaderProps) {
  // 將 markdown 內容依段落與代碼塊切分渲染
  const renderBlocks = () => {
    const rawLines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCode = false;
    let codeBuffer: string[] = [];
    let codeLang = "";
    let paragraphBuffer: string[] = [];

    const flushParagraph = (key: string) => {
      if (paragraphBuffer.length === 0) return;
      const text = paragraphBuffer.join("\n").trim();
      paragraphBuffer = [];
      if (!text) return;

      // 檢查是否為清單項目
      if (text.startsWith("* ") || text.startsWith("- ")) {
        const items = text.split("\n").map((line) => line.replace(/^[*|-]\s+/, ""));
        elements.push(
          <ul key={key} className="list-disc pl-6 my-4 space-y-1.5 text-foreground/90">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        );
        return;
      }

      if (text.startsWith("> ")) {
        elements.push(
          <blockquote
            key={key}
            className="border-l-4 border-accent pl-4 my-6 italic bg-surface p-4 rounded-r-lg border-border"
          >
            {text.replace(/^>\s+/, "")}
          </blockquote>
        );
        return;
      }

      elements.push(
        <p key={key} className="mb-5 leading-relaxed text-foreground/90">
          {text}
        </p>
      );
    };

    rawLines.forEach((line, index) => {
      // 處理代碼區塊
      if (line.startsWith("```")) {
        if (!inCode) {
          flushParagraph(`p-${index}`);
          inCode = true;
          codeLang = line.replace("```", "").trim();
          codeBuffer = [];
        } else {
          inCode = false;
          elements.push(
            <CodeBlock
              key={`code-${index}`}
              code={codeBuffer.join("\n")}
              language={codeLang}
            />
          );
          codeBuffer = [];
        }
        return;
      }

      if (inCode) {
        codeBuffer.push(line);
        return;
      }

      // 處理標題 H2 / H3
      if (line.startsWith("## ")) {
        flushParagraph(`p-${index}`);
        const text = line.replace("## ", "").trim();
        const id = text.toLowerCase().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-");
        elements.push(
          <h2
            id={id}
            key={`h2-${index}`}
            className="text-2xl font-bold tracking-tight text-foreground mt-10 mb-4 pt-2 border-t border-border/50 scroll-mt-20"
          >
            {text}
          </h2>
        );
        return;
      }

      if (line.startsWith("### ")) {
        flushParagraph(`p-${index}`);
        const text = line.replace("### ", "").trim();
        const id = text.toLowerCase().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-");
        elements.push(
          <h3
            id={id}
            key={`h3-${index}`}
            className="text-xl font-semibold tracking-tight text-foreground mt-8 mb-3 scroll-mt-20"
          >
            {text}
          </h3>
        );
        return;
      }

      if (line.trim() === "") {
        flushParagraph(`p-${index}`);
      } else {
        paragraphBuffer.push(line);
      }
    });

    flushParagraph("final-p");
    return elements;
  };

  return <div className="prose-custom text-foreground">{renderBlocks()}</div>;
}

