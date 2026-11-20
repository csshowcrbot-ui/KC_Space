import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSecret } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { valid, configured } = verifyAdminSecret(body?.key);

    if (!configured) {
      return NextResponse.json(
        { error: "伺服器尚未設定 ADMIN_SECRET_KEY 環境變數，請聯繫系統管理員。" },
        { status: 500 }
      );
    }

    if (!valid) {
      return NextResponse.json(
        { error: "管理員安全密鑰錯誤，請重新確認。" },
        { status: 401 }
      );
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ error: "驗證請求格式錯誤" }, { status: 400 });
  }
}
