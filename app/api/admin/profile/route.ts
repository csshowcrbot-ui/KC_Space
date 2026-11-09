import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

export async function GET() {
  try {
    const profile = await dataService.getProfile();
    return NextResponse.json({ data: profile });
  } catch (error) {
    return NextResponse.json({ error: "取得個人檔案失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await dataService.updateProfile(body);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "更新個人檔案失敗" }, { status: 500 });
  }
}

