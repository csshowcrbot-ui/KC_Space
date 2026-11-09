import { NextRequest, NextResponse } from "next/server";
import { dataService } from "@/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "請輸入有效的電子郵件地址" }, { status: 400 });
    }

    const result = await dataService.subscribeNewsletter(email);

    if (result.alreadySubscribed) {
      return NextResponse.json({
        message: "您已經在訂閱名單中了，感謝您的持續關注！",
      });
    }

    return NextResponse.json(
      { message: "恭喜訂閱成功！最新思維與文章發布時將發送至您的信箱。" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "訂閱處理失敗，請稍候重試" }, { status: 500 });
  }
}

