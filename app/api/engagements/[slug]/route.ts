import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const engagement = await dataService.getEngagement(slug);
    return NextResponse.json(engagement);
  } catch (error) {
    return NextResponse.json({ error: "讀取互動數據失敗" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const action = body.action === "clap" ? "clap" : "view";
    const count = typeof body.count === "number" ? Math.min(Math.max(body.count, 1), 10) : 1;

    const updated = await dataService.incrementEngagement(slug, action, count);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "更新互動數據失敗" }, { status: 500 });
  }
}

