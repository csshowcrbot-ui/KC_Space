import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";
import { isAdminRequestAuthorized } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await dataService.getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ error: "找不到該專案" }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  } catch (error) {
    return NextResponse.json({ error: "取得專案失敗" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdminRequestAuthorized(request))) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }
    const body = await request.json();
    const saved = await dataService.saveProject({
      ...body,
      id: params.id,
    });
    return NextResponse.json({ data: saved });
  } catch (error) {
    return NextResponse.json({ error: "更新專案失敗" }, { status: 500 });
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
    const success = await dataService.deleteProject(params.id);
    if (!success) {
      return NextResponse.json({ error: "找不到該專案以供刪除" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "刪除專案失敗" }, { status: 500 });
  }
}

