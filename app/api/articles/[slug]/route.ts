import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await dataService.getArticleBySlug(params.slug);
    if (!article) {
      return NextResponse.json({ error: "找不到該文章" }, { status: 404 });
    }
    return NextResponse.json({ data: article });
  } catch (error) {
    return NextResponse.json({ error: "從資料庫查詢文章失敗" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    const body = await request.json();
    const saved = await dataService.saveArticle({
      ...body,
      slug: params.slug,
    });
    return NextResponse.json({ data: saved });
  } catch (error) {
    return NextResponse.json({ error: "更新資料庫文章失敗" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    const deleted = await dataService.deleteArticle(params.slug);
    if (!deleted) {
      return NextResponse.json({ error: "找不到該文章以供刪除" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "從資料庫刪除文章失敗" }, { status: 500 });
  }
}

