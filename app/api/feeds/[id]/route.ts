import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await dataService.deleteFeed(params.id);
    if (!success) {
      return NextResponse.json({ error: "找不到該微動態" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "刪除微動態失敗" }, { status: 500 });
  }
}

