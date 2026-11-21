import crypto from "crypto";
import { NextRequest } from "next/server";
import { dataService } from "@/db";

const ADMIN_SECRET_SETTING_KEY = "admin_secret_hash";

/**
 * 將明文密碼以隨機 Salt + scrypt 雜湊，回傳 "salt:hash" 格式
 */
export function hashAdminSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(secret.trim(), salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * 驗證輸入密鑰是否與資料庫儲存之 "salt:hash" 相符
 */
function verifyHashedSecret(inputKey: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const expected = Buffer.from(keyHex, "hex");
  const actual = crypto.scryptSync(inputKey.trim(), salt, 64);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

/**
 * 檢查是否已於資料庫（或環境變數備援）設定管理員密鑰
 */
export async function isAdminSecretConfigured(): Promise<{
  configured: boolean;
  source: "database" | "env" | "none";
}> {
  const dbSetting = await dataService.getSystemSetting(ADMIN_SECRET_SETTING_KEY);
  if (dbSetting?.value) {
    return { configured: true, source: "database" };
  }
  if (process.env.ADMIN_SECRET_KEY) {
    return { configured: true, source: "env" };
  }
  return { configured: false, source: "none" };
}

/**
 * 儲存或更新管理員安全密鑰至資料庫 (以雜湊形式儲存)
 */
export async function saveAdminSecretToDb(newSecret: string): Promise<void> {
  const hashed = hashAdminSecret(newSecret);
  await dataService.setSystemSetting(
    ADMIN_SECRET_SETTING_KEY,
    hashed,
    "管理員後台安全密鑰 (scrypt 雜湊儲存)"
  );
}

/**
 * 驗證傳入密鑰是否符合資料庫中之管理員密鑰 (若資料庫尚未設定，則回退檢查環境變數備援)
 */
export async function verifyAdminSecret(
  inputKey: string | null | undefined
): Promise<{
  valid: boolean;
  configured: boolean;
  source: "database" | "env" | "none";
}> {
  const dbSetting = await dataService.getSystemSetting(ADMIN_SECRET_SETTING_KEY);

  if (dbSetting?.value) {
    if (!inputKey || typeof inputKey !== "string") {
      return { valid: false, configured: true, source: "database" };
    }
    return {
      valid: verifyHashedSecret(inputKey, dbSetting.value),
      configured: true,
      source: "database",
    };
  }

  // 若資料庫尚未設定，檢查是否有環境變數備援
  const envKey = process.env.ADMIN_SECRET_KEY;
  if (envKey) {
    if (!inputKey || typeof inputKey !== "string") {
      return { valid: false, configured: true, source: "env" };
    }
    const expected = Buffer.from(envKey, "utf-8");
    const actual = Buffer.from(inputKey.trim(), "utf-8");
    const valid =
      expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
    return { valid, configured: true, source: "env" };
  }

  return { valid: false, configured: false, source: "none" };
}

/**
 * 檢查 API 請求的 Authorization Bearer Token 是否合法
 */
export async function isAdminRequestAuthorized(
  request: NextRequest
): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice(7);
  const { valid } = await verifyAdminSecret(token);
  return valid;
}
