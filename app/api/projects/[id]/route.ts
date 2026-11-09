import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

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
    const success = await dataService.deleteProject(params.id);
    if (!success) {
      return NextResponse.json({ error: "找不到該專案以供刪除" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "刪除專案失敗" }, { status: 500 });
  }
}

