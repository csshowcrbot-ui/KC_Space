import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";
import { isAdminRequestAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get("all") === "true";
    const articles = await dataService.getArticles(includeDrafts);
    return NextResponse.json({ data: articles });
  } catch (error) {
    return NextResponse.json({ error: "從資料庫讀取文章失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequestAuthorized(request))) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: "標題、Slug 與文章內容為必填" }, { status: 400 });
    }

    const saved = await dataService.saveArticle(body);
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "儲存文章至資料庫失敗" }, { status: 500 });
  }
}

