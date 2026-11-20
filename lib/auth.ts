import crypto from "crypto";
import { NextRequest } from "next/server";

/**
 * 使用常數時間比對驗證傳入密鑰是否符合伺服器環境變數 ADMIN_SECRET_KEY
 */
export function verifyAdminSecret(inputKey: string | null | undefined): {
  valid: boolean;
  configured: boolean;
} {
  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) {
    return { valid: false, configured: false };
  }
  if (!inputKey || typeof inputKey !== "string") {
    return { valid: false, configured: true };
  }

  const expected = Buffer.from(adminKey, "utf-8");
  const actual = Buffer.from(inputKey.trim(), "utf-8");
  if (expected.length !== actual.length) {
    return { valid: false, configured: true };
  }

  return {
    valid: crypto.timingSafeEqual(expected, actual),
    configured: true,
  };
}

/**
 * 檢查 API 請求的 Authorization Bearer Token 是否合法
 */
export function isAdminRequestAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice(7);
  const { valid } = verifyAdminSecret(token);
  return valid;
}
