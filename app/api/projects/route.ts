import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

export async function GET() {
  try {
    const projects = await dataService.getProjects();
    return NextResponse.json({ data: projects });
  } catch (error) {
    return NextResponse.json({ error: "從資料庫讀取專案失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (adminKey && authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id || !body.title) {
      return NextResponse.json({ error: "專案 ID 與標題為必填" }, { status: 400 });
    }

    const saved = await dataService.saveProject(body);
    return NextResponse.json({ data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "儲存專案至資料庫失敗" }, { status: 500 });
  }
}

