import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未選擇上傳檔案" }, { status: 400 });
    }

    // 檢查檔案類型
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "僅支援上傳 JPG, PNG, WebP, GIF, SVG 格式之圖片" },
        { status: 400 }
      );
    }

    // 檔案大小上限 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "圖片檔案過大，請勿超過 10MB" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 取得副檔名並產生安全唯一的檔名
    const originalExt = path.extname(file.name).toLowerCase() || ".png";
    const safeName = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${originalExt}`;
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: safeName,
    });
  } catch (error) {
    console.error("圖片上傳處理失敗:", error);
    return NextResponse.json(
      { error: "圖片上傳發生內部伺服器錯誤" },
      { status: 500 }
    );
  }
}

