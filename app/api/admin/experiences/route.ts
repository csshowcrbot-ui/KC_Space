import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";
import { isAdminRequestAuthorized } from "@/lib/auth";

export async function GET() {
  try {
    const list = await dataService.getExperiences();
    return NextResponse.json({ data: list });
  } catch (error) {
    return NextResponse.json({ error: "取得工作經歷失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequestAuthorized(request)) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }
    const body = await request.json();
    if (!body.company || !body.role) {
      return NextResponse.json({ error: "公司名稱與角色為必填" }, { status: 400 });
    }
    const saved = await dataService.saveExperience(body);
    return NextResponse.json({ data: saved });
  } catch (error) {
    return NextResponse.json({ error: "儲存工作經歷失敗" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdminRequestAuthorized(request)) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少經歷 ID" }, { status: 400 });
    }
    const success = await dataService.deleteExperience(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: "刪除工作經歷失敗" }, { status: 500 });
  }
}

