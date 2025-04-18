import { NextResponse } from "next/server";
import { getAllMembers, MemberWithDisplayStatus } from "@/lib/db";

export async function GET() {
  try {
    const members: MemberWithDisplayStatus[] = await getAllMembers();
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch members:", error);
    // 向客户端返回更通用的错误消息，避免泄露服务器细节
    return NextResponse.json(
      { message: "无法获取成员列表，请稍后重试。" },
      { status: 500 }, // Internal Server Error
    );
  }
}
