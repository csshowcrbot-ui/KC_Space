import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";
import { isAdminRequestAuthorized } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminRequestAuthorized(request))) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    const body = await request.json();
    const saved = await dataService.saveAiTool({
      ...body,
      id: params.id,
    });
    return NextResponse.json({ data: saved });
  } catch (error) {
    return NextResponse.json({ error: "更新 AI 工具失敗" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminRequestAuthorized(request))) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    const success = await dataService.deleteAiTool(params.id);
    if (!success) {
      return NextResponse.json({ error: "找不到該 AI 工具以供刪除" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "刪除 AI 工具失敗" }, { status: 500 });
  }
}
