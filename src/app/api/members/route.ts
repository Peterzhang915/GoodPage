import { NextResponse } from "next/server";
import { getAllMembersForManager } from "@/lib/members";

export async function GET() {
  try {
    const members = await getAllMembersForManager();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error("API Error fetching members:", error);
    // Extract error message safely
    const message = error instanceof Error ? error.message : "Internal Server Error";
    // Return a standard error response
    return NextResponse.json(
      { success: false, error: { code: 'MEMBER_FETCH_FAILED', message } },
      { status: 500 }
    );
  }
}
