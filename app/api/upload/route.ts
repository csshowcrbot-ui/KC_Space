import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    // 檔案大小上限 3MB（直接轉為 Data URL 存入資料庫，確保雲端容器重啟不遺失）
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "圖片檔案過大，請壓縮至 3MB 以內再上傳" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
    });
  } catch (error) {
    console.error("圖片上傳處理失敗:", error);
    return NextResponse.json(
      { error: "圖片上傳發生內部伺服器錯誤" },
      { status: 500 }
    );
  }
}
