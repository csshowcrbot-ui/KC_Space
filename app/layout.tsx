import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "KC Space · 個人品牌數位花園",
    template: "%s | KC Space",
  },
  description: "全端架構、數位花園經營、產品工程思考與即時靈感速寫。",
  keywords: ["全端開發", "架構重構", "數位花園", "TypeScript", "Next.js", "技術寫作"],
  authors: [{ name: "KC" }],
  creator: "KC",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: "/",
    siteName: "KC Space",
    title: "KC Space · 個人品牌數位花園",
    description: "全端架構、數位花園經營、產品工程思考與即時靈感速寫。",
  },
  twitter: {
    card: "summary_large_image",
    title: "KC Space · 個人品牌數位花園",
    description: "全端架構、數位花園經營、產品工程思考與即時靈感速寫。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

