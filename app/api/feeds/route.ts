import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const feeds = await dataService.getFeeds(limit);

    return NextResponse.json({
      data: feeds,
      nextCursor: feeds.length > 0 ? feeds[feeds.length - 1].createdAt : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "獲取微動態失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 檢查點讚動作
    if (body.action === "like" && body.feedId) {
      const updated = await dataService.likeFeed(body.feedId);
      if (!updated) {
        return NextResponse.json({ error: "找不到該筆動態" }, { status: 404 });
      }
      return NextResponse.json({ data: updated });
    }

    // 發布新動態 (支援管理員密鑰驗證，若未設定則允許開發測試)
    const authHeader = request.headers.get("authorization");
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "動態內容不可為空" }, { status: 400 });
    }

    const newFeed = await dataService.createFeed({
      content: body.content,
      mediaUrl: body.mediaUrl,
      tags: body.tags || [],
    });

    return NextResponse.json({ data: newFeed }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "處理動態請求失敗" }, { status: 500 });
  }
}

