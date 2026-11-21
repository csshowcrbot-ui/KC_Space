import { NextRequest, NextResponse } from "next/server";
import {
  isAdminSecretConfigured,
  isAdminRequestAuthorized,
  saveAdminSecretToDb,
  verifyAdminSecret,
} from "@/lib/auth";

export async function GET() {
  try {
    const status = await isAdminSecretConfigured();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: "查詢認證狀態失敗" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body?.action || "login";

    // 初次設定密鑰（僅在尚未設定時開放）
    if (action === "setup") {
      const { configured } = await isAdminSecretConfigured();
      if (configured) {
        return NextResponse.json(
          { error: "管理員密鑰已設定，請直接登入。" },
          { status: 403 }
        );
      }
      const newKey = typeof body?.key === "string" ? body.key.trim() : "";
      if (newKey.length < 6) {
        return NextResponse.json(
          { error: "安全密鑰長度至少需 6 個字元。" },
          { status: 400 }
        );
      }
      await saveAdminSecretToDb(newKey);
      return NextResponse.json({ authenticated: true, source: "database" });
    }

    // 修改並儲存新密鑰至資料庫（需已認證授權）
    if (action === "change") {
      const authorized = await isAdminRequestAuthorized(request);
      if (!authorized) {
        return NextResponse.json({ error: "未授權的操作" }, { status: 401 });
      }
      const newKey = typeof body?.newKey === "string" ? body.newKey.trim() : "";
      if (newKey.length < 6) {
        return NextResponse.json(
          { error: "新安全密鑰長度至少需 6 個字元。" },
          { status: 400 }
        );
      }
      await saveAdminSecretToDb(newKey);
      return NextResponse.json({ updated: true, source: "database" });
    }

    // 一般登入驗證
    const { valid, configured, source } = await verifyAdminSecret(body?.key);

    if (!configured) {
      return NextResponse.json(
        { error: "尚未設定管理員安全密鑰，請先完成初次設定。", needSetup: true },
        { status: 403 }
      );
    }

    if (!valid) {
      return NextResponse.json(
        { error: "管理員安全密鑰錯誤，請重新確認。" },
        { status: 401 }
      );
    }

    return NextResponse.json({ authenticated: true, source });
  } catch {
    return NextResponse.json({ error: "驗證請求格式錯誤" }, { status: 400 });
  }
}
