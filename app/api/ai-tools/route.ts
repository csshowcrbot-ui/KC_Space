import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";
import { isAdminRequestAuthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tools = await dataService.getAiTools();
    return NextResponse.json({ data: tools });
  } catch (error) {
    return NextResponse.json({ error: "從資料庫讀取 AI 工具失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequestAuthorized(request))) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.url) {
      return NextResponse.json({ error: "工具名稱與網址為必填" }, { status: 400 });
    }

    const saved = await dataService.saveAiTool({
      ...body,
      id: body.id || "tool-" + Date.now().toString(36),
    });
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "儲存 AI 工具至資料庫失敗" }, { status: 500 });
  }
}
