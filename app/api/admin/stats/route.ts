import { NextResponse } from "next/server";
import { dataService } from "@/db";

export async function GET() {
  try {
    const stats = await dataService.getStats();
    return NextResponse.json({ data: stats });
  } catch (error) {
    return NextResponse.json({ error: "取得統計資料失敗" }, { status: 500 });
  }
}

